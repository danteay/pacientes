import { Umzug, JSONStorage, memoryStorage } from 'umzug';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as migration001 from './001-create-main-tables';
import * as migration002 from './002-add-first-appointment-date';

/**
 * Creates and configures an Umzug instance for database migrations
 * @param db - better-sqlite3 database instance
 * @param useMemoryStorage - If true, uses in-memory storage (for testing)
 * @returns Configured Umzug instance
 */
export function createUmzug(
  db: Database.Database,
  useMemoryStorage: boolean = false
): Umzug<Database.Database> {
  return new Umzug({
    migrations: [
      {
        name: '001-create-main-tables',
        up: migration001.up,
        down: migration001.down,
      },
      {
        name: '002-add-first-appointment-date',
        up: migration002.up,
        down: migration002.down,
      },
    ],
    context: db,
    storage: useMemoryStorage
      ? memoryStorage()
      : new JSONStorage({
          path: path.join(process.cwd(), '.umzug.json'),
        }),
    logger: console,
  });
}

/**
 * Runs all pending migrations
 * @param db - better-sqlite3 database instance
 * @param useMemoryStorage - If true, uses in-memory storage (for testing)
 */
export async function runMigrations(
  db: Database.Database,
  useMemoryStorage: boolean = false
): Promise<void> {
  const umzug = createUmzug(db, useMemoryStorage);

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
  const umzug = createUmzug(db);

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
  const umzug = createUmzug(db);
  const executed = await umzug.executed();
  return executed.map((m) => m.name);
}

/**
 * Gets the list of pending migrations
 * @param db - better-sqlite3 database instance
 * @returns Array of pending migration names
 */
export async function getPendingMigrations(db: Database.Database): Promise<string[]> {
  const umzug = createUmzug(db);
  const pending = await umzug.pending();
  return pending.map((m) => m.name);
}
