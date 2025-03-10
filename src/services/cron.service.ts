import { getInstanceId, getRandomIntervalValue } from "../utils/helpers";
import { ICronTask, ISchedulingTask } from "../interfaces";
import { InjectionService } from "./injection.service";
import { CronTask } from "../database/models/cron-task.model";
import { InferCreationAttributes } from "sequelize";
import { randomUUID } from "node:crypto";
import { ERabbitMqQueueName } from "../enums";
import { ConsumeMessage } from "amqplib";

// singleton
export class CronService extends InjectionService {
  private static instance: CronService;

  private intervals: NodeJS.Timeout[] = [];
  private instanceId: string | null = null;

  private CRON_TASK_CHECK_INTERVAL = 60000;
  private PROCESSING_TIME = 120000;
  private DELAYED_TIME = 5000;

  public static getInstance(): CronService {
    if (!CronService.instance) {
      CronService.instance = new CronService();
    }
    return CronService.instance;
  }

  /**
   * This method is creating queues and consumers
   * and starting cron task timer check as well (more info in method description)
   */
  public async init(): Promise<void> {
    this.instanceId = await getInstanceId();
    // creating queues
    await this.rabbitMqService.createQueue(
      ERabbitMqQueueName.SCHEDULING_TASKS_QUEUE,
    );
    await this.rabbitMqService.createQueue(ERabbitMqQueueName.TASKS_QUEUE);
    await this.rabbitMqService.createQueue(
      ERabbitMqQueueName.DELAYED_TASKS_QUEUE,
      {
        arguments: {
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": ERabbitMqQueueName.TASKS_QUEUE,
          "x-message-ttl": this.DELAYED_TIME,
        },
      },
    );

    // creating consumers
    await this.schedulingTaskConsumer();
    await this.taskConsumer();

    this.startCronTaskTimerCheck();
  }

  /**
   * This method retrieves all method names from the current instance that start with "cronTask"
   * (e.g., `cronTask1`, `cronTask2`, etc.). It then schedules each task by adding it to the
   * scheduling queue with a random interval.
   */
  public async startAllTasks() {
    const cronTaskNames = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this),
    ).filter((method) => method.startsWith("cronTask"));

    for (const taskName of cronTaskNames) {
      await this.addTaskToSchedulingQueue(taskName, getRandomIntervalValue());
    }
  }

  /**
   * add task info to scheduling queue so then instances are able to add tasks evenly
   * lockTTL 10 sec to not have duplicates
   */
  private async addTaskToSchedulingQueue(taskName: string, interval: number) {
    const lockKey = `lock:schedule:${taskName}`;
    const lockTTL = 10000;
    const lock = await this.redisService.lock(lockKey, lockTTL);

    if (lock) {
      this.rabbitMqService.sendToQueue(
        ERabbitMqQueueName.SCHEDULING_TASKS_QUEUE,
        JSON.stringify({ name: taskName, interval }),
        { persistent: true },
      );
    }
  }

  /**
   * This method is calling from schedulingTaskConsumer
   * Setting interval that adding tasks to TaskQueue every {interval} sec
   * Set lock:timer:* It means that this instance has interval that adding tasks in TaskQueue
   * Each {interval} period the lock is renewing,  which indicates that the instance is still alive
   * Otherwise lock will be deleted and another instance will take the responsibility for this task
   */
  private async scheduleTask(
    taskName: string,
    interval: number,
  ): Promise<void> {
    const lockKey = `lock:timer:${taskName}`;
    const lockTTL = interval + this.CRON_TASK_CHECK_INTERVAL;
    const lock = await this.redisService.lock(lockKey, lockTTL);

    if (lock) {
      this.publishTask(taskName, interval);

      const timer = setInterval(() => {
        this.publishTask(taskName, interval);
        this.redisService.renewLock(lockKey, lockTTL);
      }, interval);

      this.intervals.push(timer);
    }
  }

  /**
   * Just sending a task to TaskQueue
   */
  private publishTask(taskName: string, interval: number): void {
    const task: ICronTask = {
      name: taskName,
      addedToQueueTimestamp: Date.now(),
      state: "waiting",
    };
    this.rabbitMqService.sendToQueue(
      ERabbitMqQueueName.TASKS_QUEUE,
      JSON.stringify(task),
      {
        persistent: true,
      },
    );
    console.log(
      `[${this.instanceId}] -- Scheduled task ${taskName} with interval ${interval}.`,
    );
  }

  /**
   * If instance is dead, intervals are also dead, so another instance will take the responsibility
   * for tasks dead instance had
   */
  private startCronTaskTimerCheck() {
    const timer = setInterval(() => {
      this.startAllTasks();
    }, this.CRON_TASK_CHECK_INTERVAL);

    this.intervals.push(timer);
  }

  /**
   * Consumer for scheduling tasks queue
   */
  private async schedulingTaskConsumer() {
    await this.rabbitMqService.consume(
      ERabbitMqQueueName.SCHEDULING_TASKS_QUEUE,
      async (msg) => {
        if (!msg) return;
        const task: ISchedulingTask = JSON.parse(msg.content.toString());

        await this.scheduleTask(task.name, task.interval);
        this.rabbitMqService.ack(msg);
      },
      { noAck: false },
    );
  }

  /**
   * Consumer for tasks queue
   * Set lock to restrict processing 1 task simultaneously
   * If locked -- sends task to delayed queue, then the task will move to TaskQueue and the logic
   * will be repeated
   * If not locked, saves data about processing task in redis
   * Promise imitation of task execution (2 minutes)
   * After that clear data key in redis and save completed task info in db
   * Unlock lock:task
   */
  private async taskConsumer(): Promise<void> {
    await this.rabbitMqService.consume(
      ERabbitMqQueueName.TASKS_QUEUE,
      async (msg) => {
        if (!msg) return;
        try {
          const task: ICronTask = JSON.parse(msg.content.toString());
          const taskName = task.name;
          const lockKey = `lock:task:${taskName}`;

          const lock = await this.redisService.lock(
            lockKey,
            this.PROCESSING_TIME + this.DELAYED_TIME,
          );

          if (!lock) {
            this.saveDelayedTaskDataToRedis(task).catch((err) => {
              console.error(
                `Error while saving delayed data ${task.name} to redis. `,
                err,
              );
            });
            this.sendTaskToDelayedQueue(msg);
            return;
          }

          console.log(`[${this.instanceId}] -- Started ${taskName}`);

          const startTimestamp = Date.now();
          const redisDataKey = `task:data:${taskName}`;

          this.saveProcessingTaskDataToRedis(
            redisDataKey,
            task,
            startTimestamp,
          ).catch((err) => {
            console.error(
              `Error while saving data ${task.name} to redis. `,
              err,
            );
          });

          await new Promise<void>((resolve) =>
            setTimeout(() => {
              resolve();
              console.log(
                `[${this.instanceId}] -- Completed ${taskName} in ${Date.now() - startTimestamp}ms`,
              );
            }, this.PROCESSING_TIME),
          );

          await this.redisConnection.del(redisDataKey);
          await this.saveCompletedTaskToDb(task, startTimestamp);

          await this.redisService.unlock(lockKey);
        } catch (e) {
          console.error(
            `Error while processing msg ${msg}. INSTANCE ID: ${this.instanceId}`,
          );
        } finally {
          this.rabbitMqService.ack(msg);
        }
      },
      { noAck: false },
    );
  }

  private sendTaskToDelayedQueue(msg: ConsumeMessage) {
    this.rabbitMqService.sendToQueue(
      ERabbitMqQueueName.DELAYED_TASKS_QUEUE,
      msg.content.toString(),
      {
        persistent: true,
      },
    );
  }

  private saveDelayedTaskDataToRedis(task: ICronTask) {
    const redisDelayedTaskKey = `task:delayed:${task.name}-${randomUUID()}`;
    return this.redisConnection.set(
      redisDelayedTaskKey,
      JSON.stringify(task),
      "EX",
      this.DELAYED_TIME / 1000,
    );
  }

  private saveProcessingTaskDataToRedis(
    key: string,
    task: ICronTask,
    startTime: number,
  ) {
    task.startTimestamp = startTime;
    task.state = "processing";
    task.instanceId = this.instanceId;

    return this.redisConnection.set(key, JSON.stringify(task));
  }

  private async saveCompletedTaskToDb(task: ICronTask, startTimeStamp: number) {
    try {
      const dataForDb: InferCreationAttributes<Omit<CronTask, "id">> = {
        name: task.name,
        addedToQueueDate: new Date(task.addedToQueueTimestamp),
        startedDate: new Date(startTimeStamp),
        completedDate: new Date(),
        instanceId: this.instanceId,
      };
      const cronTaskRepository = this.db.getRepository(CronTask);
      await cronTaskRepository.create(dataForDb);
    } catch (e) {
      console.error(
        `Error while saving completed task to db ${task.name}. INSTANCE ID: ${this.instanceId}`,
      );
    }
  }

  /**
   * Method to get all processing and waiting tasks
   */
  public async getAllMessages(): Promise<ICronTask[]> {
    const messages: ICronTask[] = [];

    const taskKeys = await this.redisConnection.keys("task:data:*");
    for (const key of taskKeys) {
      const taskData = await this.redisConnection.get(key);
      if (taskData) {
        messages.push(JSON.parse(taskData));
      }
    }

    const delayedTasksKeys = await this.redisConnection.keys("task:delayed:*");
    for (const key of delayedTasksKeys) {
      const taskData = await this.redisConnection.get(key);
      if (taskData) {
        messages.push(JSON.parse(taskData));
      }
    }

    return messages;
  }

  /**
   * Tasks described in the technical specifications
   */
  public cronTask1(interval: number): Promise<void> {
    return this.scheduleTask("cronTask1", interval);
  }

  public cronTask2(interval: number): Promise<void> {
    return this.scheduleTask("cronTask2", interval);
  }

  public cronTask3(interval: number): Promise<void> {
    return this.scheduleTask("cronTask3", interval);
  }

  public cronTask4(interval: number): Promise<void> {
    return this.scheduleTask("cronTask4", interval);
  }

  public cronTask5(interval: number): Promise<void> {
    return this.scheduleTask("cronTask5", interval);
  }

  public cronTask6(interval: number): Promise<void> {
    return this.scheduleTask("cronTask6", interval);
  }

  public cronTask7(interval: number): Promise<void> {
    return this.scheduleTask("cronTask7", interval);
  }

  public cronTask8(interval: number): Promise<void> {
    return this.scheduleTask("cronTask8", interval);
  }

  public cronTask9(interval: number): Promise<void> {
    return this.scheduleTask("cronTask9", interval);
  }

  public cronTask10(interval: number): Promise<void> {
    return this.scheduleTask("cronTask10", interval);
  }
}
