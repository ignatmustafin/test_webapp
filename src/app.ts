import "reflect-metadata";
import "dotenv/config";
import express from 'express'
import "express-async-errors";
import {DatabaseService} from "./database";
import {MainRouter} from "./routers";
import {errorMiddleware} from "./middlewares/error.mddw";

const app = express();
app.use(express.json());

app.use('/api', MainRouter)
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    const dbService = DatabaseService.getInstance();
    await dbService.runMigrations();
    console.log(`Server is running. PORT ${PORT}`)
})