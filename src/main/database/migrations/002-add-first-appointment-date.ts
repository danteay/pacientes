import Database from 'better-sqlite3';
import { MigrationParams } from 'umzug';

export async function up({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;

  // Check if column already exists
  const columns = db.prepare('PRAGMA table_info(patients)').all() as any[];
  const hasColumn = columns.some((col) => col.name === 'firstAppointmentDate');

  if (!hasColumn) {
    db.exec(`
      ALTER TABLE patients
      ADD COLUMN firstAppointmentDate TEXT
    `);
  }
}

export async function down({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;

  // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
  db.exec(`
    CREATE TABLE patients_backup AS SELECT
      id, name, age, email, phoneNumber, birthDate, maritalStatus,
      gender, educationalLevel, profession, livesWith, children,
      previousPsychologicalExperience, createdAt, updatedAt
    FROM patients
  `);

  db.exec('DROP TABLE patients');

  db.exec(`
    CREATE TABLE patients (
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

  db.exec(`
    INSERT INTO patients SELECT * FROM patients_backup
  `);

  db.exec('DROP TABLE patients_backup');
}
