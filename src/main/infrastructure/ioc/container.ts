import 'reflect-metadata';
import { container } from 'tsyringe';
import Database from 'better-sqlite3';
import { DatabaseDriver } from '../../database/driver/database-driver';

/**
 * IoC Container Configuration
 *
 * Centralized dependency registration for the application.
 * Uses TSyringe for dependency injection.
 *
 * Registration happens in layers:
 * 1. Infrastructure (Database, Driver)
 * 2. Repositories
 * 3. Services
 * 4. Use Cases
 */

// Tokens for dependencies without @injectable decorator
export const DB_INSTANCE = 'DatabaseInstance';
export const DATABASE_DRIVER = 'DatabaseDriver';

/**
 * Configure the IoC container with all dependencies
 */
export function configureContainer(db: Database.Database): void {
  // Clear any existing registrations (useful for testing)
  container.clearInstances();

  // Register database instance
  container.registerInstance(DB_INSTANCE, db);

  // Register database driver (depends on DB_INSTANCE)
  container.register(DATABASE_DRIVER, {
    useFactory: (c) => {
      const dbInstance = c.resolve<Database.Database>(DB_INSTANCE);
      return new DatabaseDriver(dbInstance);
    },
  });

  // Repositories are auto-registered via @injectable decorators
  // They will be injected with DATABASE_DRIVER token

  // Services are auto-registered via @injectable decorators
  // They will be injected with their respective repositories

  // Use Cases are auto-registered via @injectable decorators
  // They will be injected with their respective services
}

/**
 * Get the configured container instance
 */
export function getContainer() {
  return container;
}

/**
 * Reset the container (useful for testing)
 */
export function resetContainer(): void {
  container.reset();
}
