import Database from 'better-sqlite3';
import { MigrationParams } from 'umzug';

export async function up({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;

  // Create patients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      email TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      maritalStatus TEXT NOT NULL,
      gender TEXT NOT NULL,
      educationalLevel TEXT NOT NULL,
      profession TEXT NOT NULL,
      livesWith TEXT NOT NULL,
      children INTEGER NOT NULL,
      previousPsychologicalExperience TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);
}

export async function down({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;

  db.exec('DROP TABLE IF EXISTS notes');
  db.exec('DROP TABLE IF EXISTS patients');
}
