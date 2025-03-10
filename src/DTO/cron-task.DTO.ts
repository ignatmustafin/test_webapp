import { ICronTask } from "../interfaces";

export class CronTaskDTO {
  name: string;
  instanceId?: string | null;
  timeFromStart: number | null;
  state: "waiting" | "processing";

  constructor(task: ICronTask) {
    this.name = task.name;
    this.instanceId = task.instanceId;
    this.timeFromStart = task.startTimestamp
      ? (Date.now() - task.startTimestamp) / 1000
      : null;
    this.state = task.state;
  }
}
