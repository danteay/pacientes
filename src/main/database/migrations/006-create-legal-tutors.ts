import Database from 'better-sqlite3';
import { MigrationParams } from 'umzug';

/**
 * Migration: Create legal_tutors table
 *
 * Creates a table to store legal tutor information for patients
 */
export async function up({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;
  console.log('Running migration: 006-create-legal-tutors (up)');

  db.exec(`
    CREATE TABLE IF NOT EXISTS legal_tutors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId INTEGER NOT NULL,
      fullName TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      relation TEXT NOT NULL,
      email TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      address TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  console.log('Migration 006-create-legal-tutors completed');
}

export async function down({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;
  console.log('Running migration: 006-create-legal-tutors (down)');

  db.exec('DROP TABLE IF EXISTS legal_tutors');

  console.log('Migration 006-create-legal-tutors rollback completed');
}
