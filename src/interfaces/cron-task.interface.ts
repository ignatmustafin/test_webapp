export interface ICronTask {
  name: string;
  state: "waiting" | "processing";
  addedToQueueTimestamp: number;
  startTimestamp?: number;
  instanceId?: string | null;
}

export interface ISchedulingTask {
  name: string;
  interval: number;
}
