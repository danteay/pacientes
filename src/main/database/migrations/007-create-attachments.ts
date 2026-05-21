import Database from 'better-sqlite3';
import { MigrationParams } from 'umzug';

/**
 * Migration: Create attachments table
 *
 * Creates a table to store file attachment information for patients
 */
export async function up({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;
  console.log('Running migration: 007-create-attachments (up)');

  db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId INTEGER NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  console.log('Migration 007-create-attachments completed');
}

export async function down({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;
  console.log('Running migration: 007-create-attachments (down)');

  db.exec('DROP TABLE IF EXISTS attachments');

  console.log('Migration 007-create-attachments rollback completed');
}
