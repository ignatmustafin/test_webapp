import * as amqp from "amqplib";
import { ERabbitMqQueueName } from "../enums";

export class RabbitMqService {
  private static _instance: RabbitMqService;
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  public static getInstance(): RabbitMqService {
    if (!RabbitMqService._instance) {
      RabbitMqService._instance = new RabbitMqService();
    }
    return RabbitMqService._instance;
  }

  public async init(): Promise<void> {
    this.connection = await amqp.connect(
      `amqp://${process.env.RABBITMQ_HOST || "localhost"}`,
    );
    this.channel = await this.connection.createChannel();
  }

  public async createQueue(
    queueName: ERabbitMqQueueName,
    options: amqp.Options.AssertQueue = {},
  ) {
    return this.channel!.assertQueue(queueName, { durable: true, ...options });
  }

  public sendToQueue(
    queueName: ERabbitMqQueueName,
    message: string,
    options: amqp.Options.Publish = {},
  ) {
    this.channel!.sendToQueue(queueName, Buffer.from(message), options);
  }

  public async consume(
    queueName: ERabbitMqQueueName,
    callback: (msg: amqp.ConsumeMessage | null) => void,
    options: amqp.Options.Consume = {},
  ): Promise<void> {
    await this.channel!.consume(queueName, callback, options);
  }

  public ack(msg: amqp.ConsumeMessage) {
    this.channel!.ack(msg);
  }
}
