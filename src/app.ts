import "reflect-metadata";
import "dotenv/config";
import express from "express";
import "express-async-errors";
import { DatabaseService } from "./database";
import { MainRouter } from "./routers";
import { errorMiddleware } from "./middlewares";
import { RedisService } from "./services/redis.service";
import { CronService } from "./services/cron.service";
import { getInstanceId } from "./utils/helpers";
import { RabbitMqService } from "./services/rabbitmq.service";

const PORT = parseInt(process.env.PORT || "3000", 10);

const startServer = async () => {
  try {
    await DatabaseService.getInstance().runMigrations();

    const app = express();

    app.use(express.json());
    app.use("/api", MainRouter);
    app.use(errorMiddleware);

    RedisService.getInstance();

    const rabbitmqService = RabbitMqService.getInstance();
    await rabbitmqService.init();

    try {
      const cronService = CronService.getInstance();
      await cronService.init();
      // waiting for all instances are ready, then scheduling cron tasks
      setTimeout(async () => {
        await cronService.startAllTasks();
      }, 15000);
    } catch (e) {
      console.error(`Cron task service initialization failed. `, e);
    }

    const containerId = await getInstanceId();

    app.listen(PORT, async () => {
      console.log(
        `Server is running. PORT ${PORT}. Container ID: ${containerId}`,
      );
    });
  } catch (e) {
    console.error("Error starting the server:", e);
    process.exit(1);
  }
};

startServer();
