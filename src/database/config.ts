import {Dialect} from "sequelize";

export default {
  username: process.env.DB_USER || "admin",
  password: process.env.DB_PASS || "admin",
  database: process.env.DB_NAME || "test_webapp",
  host: process.env.DB_HOST || "localhost",
  dialect: "postgres" as Dialect,
}