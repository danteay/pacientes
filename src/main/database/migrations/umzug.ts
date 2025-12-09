import { Umzug, JSONStorage, memoryStorage, MigrationParams } from 'umzug';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

/**
 * Migration file interface
 */
interface MigrationModule {
  up: (params: MigrationParams<Database.Database>) => Promise<void>;
  down: (params: MigrationParams<Database.Database>) => Promise<void>;
}

/**
 * Dynamically loads all migration files from the migrations directory
 * @returns Array of migration configurations
 */
async function loadMigrations(): Promise<
  Array<{
    name: string;
    up: (params: MigrationParams<Database.Database>) => Promise<void>;
    down: (params: MigrationParams<Database.Database>) => Promise<void>;
  }>
> {
  const migrationsDir = __dirname;
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => {
      // Only include .ts or .js files that match migration pattern (###-*.ts/js)
      const isMigrationFile = /^\d{3}-.*\.(ts|js)$/.test(file);
      // Exclude umzug.ts/js itself
      const isNotUmzug = !file.startsWith('umzug.');
      return isMigrationFile && isNotUmzug;
    })
    .sort(); // Sort alphabetically to ensure correct order

  const migrations = await Promise.all(
    files.map(async (file) => {
      const migrationPath = path.join(migrationsDir, file);
      const migrationName = file.replace(/\.(ts|js)$/, '');

      try {
        // Dynamic import of migration module
        const migrationModule = (await import(migrationPath)) as MigrationModule;

        if (!migrationModule.up || !migrationModule.down) {
          throw new Error(`Migration ${migrationName} must export both 'up' and 'down' functions`);
        }

        return {
          name: migrationName,
          up: migrationModule.up,
          down: migrationModule.down,
        };
      } catch (error) {
        console.error(`Failed to load migration ${migrationName}:`, error);
        throw error;
      }
    })
  );

  return migrations;
}

/**
 * Creates and configures an Umzug instance for database migrations
 * @param db - better-sqlite3 database instance
 * @param useMemoryStorage - If true, uses in-memory storage (for testing)
 * @param storagePath - Optional custom path for migration storage file
 * @returns Configured Umzug instance
 */
export async function createUmzug(
  db: Database.Database,
  useMemoryStorage: boolean = false,
  storagePath?: string
): Promise<Umzug<Database.Database>> {
  // Use home directory for migration tracking by default
  const defaultStoragePath = path.join(os.homedir(), '.pacientes_migrations.json');
  const finalStoragePath = storagePath || defaultStoragePath;

  // Load all migrations dynamically
  const migrations = await loadMigrations();

  console.log(`Loaded ${migrations.length} migration(s):`);
  migrations.forEach((m) => console.log(`  - ${m.name}`));

  return new Umzug({
    migrations,
    context: db,
    storage: useMemoryStorage
      ? memoryStorage()
      : new JSONStorage({
          path: finalStoragePath,
        }),
    logger: console,
  });
}

/**
 * Runs all pending migrations
 * @param db - better-sqlite3 database instance
 * @param useMemoryStorage - If true, uses in-memory storage (for testing)
 * @param storagePath - Optional custom path for migration storage file
 */
export async function runMigrations(
  db: Database.Database,
  useMemoryStorage: boolean = false,
  storagePath?: string
): Promise<void> {
  const umzug = await createUmzug(db, useMemoryStorage, storagePath);

  try {
    const pending = await umzug.pending();
    console.log(`Found ${pending.length} pending migration(s)`);
    pending.forEach((m) => console.log(`  - ${m.name}`));

    if (pending.length > 0) {
      console.log(`Running ${pending.length} pending migration(s)...`);
      await umzug.up();
      console.log('All migrations completed successfully');
    } else {
      console.log('No pending migrations');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Reverts the last migration
 * @param db - better-sqlite3 database instance
 */
export async function revertMigration(db: Database.Database): Promise<void> {
  const umzug = await createUmzug(db);

  try {
    await umzug.down();
    console.log('Successfully reverted last migration');
  } catch (error) {
    console.error('Migration revert failed:', error);
    throw error;
  }
}

/**
 * Gets the list of executed migrations
 * @param db - better-sqlite3 database instance
 * @returns Array of executed migration names
 */
export async function getExecutedMigrations(db: Database.Database): Promise<string[]> {
  const umzug = await createUmzug(db);
  const executed = await umzug.executed();
  return executed.map((m) => m.name);
}

/**
 * Gets the list of pending migrations
 * @param db - better-sqlite3 database instance
 * @returns Array of pending migration names
 */
export async function getPendingMigrations(db: Database.Database): Promise<string[]> {
  const umzug = await createUmzug(db);
  const pending = await umzug.pending();
  return pending.map((m) => m.name);
}
