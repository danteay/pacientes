import Database from 'better-sqlite3';
import { MigrationParams } from 'umzug';

/**
 * Migration: Add status field to patients table
 *
 * Adds a status column to track patient status:
 * - active: Currently in treatment
 * - paused: Treatment temporarily paused
 * - medical_discharge: Patient has been discharged
 */
export async function up({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;
  console.log('Running migration: 003-add-patient-status (up)');

  // Add status column with default value 'active'
  db.exec(`
    ALTER TABLE patients
    ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
  `);

  console.log('Migration 003-add-patient-status completed');
}

export async function down({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;
  console.log('Running migration: 003-add-patient-status (down)');

  // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
  db.exec(`
    -- Create backup table
    CREATE TABLE patients_backup AS SELECT * FROM patients;

    -- Drop original table
    DROP TABLE patients;

    -- Recreate table without status column
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
      children INTEGER NOT NULL DEFAULT 0,
      previousPsychologicalExperience TEXT,
      firstAppointmentDate TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Copy data back (excluding status column)
    INSERT INTO patients (
      id, name, age, email, phoneNumber, birthDate, maritalStatus,
      gender, educationalLevel, profession, livesWith, children,
      previousPsychologicalExperience, firstAppointmentDate, createdAt, updatedAt
    )
    SELECT
      id, name, age, email, phoneNumber, birthDate, maritalStatus,
      gender, educationalLevel, profession, livesWith, children,
      previousPsychologicalExperience, firstAppointmentDate, createdAt, updatedAt
    FROM patients_backup;

    -- Drop backup table
    DROP TABLE patients_backup;
  `);

  console.log('Migration 003-add-patient-status rollback completed');
}
