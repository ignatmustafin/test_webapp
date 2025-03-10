import { DatabaseService } from "../database";
import { RedisService } from "./redis.service";
import {RabbitMqService} from "./rabbitmq.service";

/**
 * Base service for injecting common dependencies.
 *
 * `InjectionService` is designed to avoid code duplication by
 * providing a single access point to shared resources used in
 * the majority of services.
 *
 * Currently, it provides access to the database instance (`db`).
 * In the future, additional dependencies can be added, such as:
 * - Caching (`Redis`)
 * - Logging (`Logger`)
 * - Queues (`RabbitMQ`, `BullMQ`)
 * - Metrics (`Prometheus`)
 * - Other services commonly required in business logic
 */
export class InjectionService {
    // db
  public db = DatabaseService.getInstance().getDb;

  // redis
  public redisService = RedisService.getInstance();
  public redisConnection = this.redisService.getRedisConnection;

  // rabbitmq
  public rabbitMqService = RabbitMqService.getInstance();
}
