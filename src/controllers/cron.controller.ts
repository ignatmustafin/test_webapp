import { Request, Response } from "express";
import { CronService } from "../services/cron.service";
import { CronTaskDTO } from "../DTO/cron-task.DTO";

export class CronController {
  getAllCronJobs = async (req: Request, res: Response) => {
    const cronService = CronService.getInstance();
    const data = await cronService.getAllMessages();
    const tasksDTOList = data.map((t) => new CronTaskDTO(t));
    res.status(200).json({ data: tasksDTOList });
  };
}
