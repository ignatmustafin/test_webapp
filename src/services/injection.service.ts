import {DatabaseService} from "../database";

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
    public db = DatabaseService.getInstance().getDb;
}