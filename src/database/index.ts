import { Sequelize } from "sequelize-typescript";
import { dbModels } from "./models";
import { SequelizeStorage, Umzug } from "umzug";
import dbConfig from "./config";
import path from "path";
import { RedisService } from "../services/redis.service";

// Singleton
export class DatabaseService {
  private static instance: DatabaseService;
  private readonly db: Sequelize;

  constructor() {
    this.db = new Sequelize({
      ...dbConfig,
      models: dbModels,
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public get getDb() {
    return this.db;
  }

  public async runMigrations() {
    try {
      const lock = await RedisService.getInstance().lock(
        `lock:db:migrations`,
        30000,
      );

      if (lock) {
        const umzug = new Umzug({
          migrations: { glob: path.resolve(__dirname, "migrations/*.js") },
          context: this.db.getQueryInterface(),
          storage: new SequelizeStorage({ sequelize: this.db }),
          logger: console,
        });

        await umzug.up();
        console.log("Migrations are completed");
      }
    } catch (e) {
      console.error("Migration failed:", e);
      process.exit(1);
    }
  }
}
