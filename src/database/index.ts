import {Sequelize} from "sequelize-typescript";
import {dbModels} from "./models";
import {SequelizeStorage, Umzug} from "umzug";
import dbConfig from './config'
import path from "path";


// Singleton
export class DatabaseService {
    private static instance: DatabaseService;
    private readonly db: Sequelize;

    constructor() {
        this.db = new Sequelize({
            ...dbConfig,
            models: dbModels
        })
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
            console.log('dDB instance is created');
        }
        return DatabaseService.instance;
    }

    public getDb() {
        return this.db;
    }

    public async runMigrations() {
        const umzug = new Umzug({
            migrations: { glob: path.resolve(__dirname, 'migrations/*.js') },
            context: this.db.getQueryInterface(),
            storage: new SequelizeStorage({ sequelize: this.db }),
            logger: console,
        });

        await umzug.up();
        console.log('Transactions are completed')
    }
}