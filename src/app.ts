import "reflect-metadata";
import "dotenv/config";
import express from "express";
import "express-async-errors";
import { DatabaseService } from "./database";
import { MainRouter } from "./routers";
import { errorMiddleware } from "./middlewares";

const PORT = parseInt(process.env.PORT || "3000", 10);

const startServer = async () => {
  try {
    await DatabaseService.getInstance().runMigrations();

    const app = express();

    app.use(express.json());
    app.use("/api", MainRouter);
    app.use(errorMiddleware);

    app.listen(PORT, async () => {
      console.log(`Server is running. PORT ${PORT}`);
    });
  } catch (e) {
    console.error("Error starting the server:", e);
    process.exit(1);
  }
};

startServer();
