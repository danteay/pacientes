import Database from 'better-sqlite3';
import { MigrationParams } from 'umzug';

/**
 * Migration: Add sexualOrientation field to patients table
 *
 * Adds a sexualOrientation column to store patient's sexual orientation:
 * - heterosexual
 * - homosexual
 * - bisexual
 * - pansexual
 * - asexual
 * - other
 * - prefer_not_to_say (default)
 */
export async function up({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;
  console.log('Running migration: 004-add-sexual-orientation (up)');

  // Add sexualOrientation column with default value 'prefer_not_to_say'
  db.exec(`
    ALTER TABLE patients
    ADD COLUMN sexualOrientation TEXT NOT NULL DEFAULT 'prefer_not_to_say'
  `);

  console.log('Migration 004-add-sexual-orientation completed');
}

export async function down({ context }: MigrationParams<Database.Database>): Promise<void> {
  const db = context;
  console.log('Running migration: 004-add-sexual-orientation (down)');

  // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
  db.exec(`
    -- Create backup table
    CREATE TABLE patients_backup AS SELECT * FROM patients;

    -- Drop original table
    DROP TABLE patients;

    -- Recreate table without sexualOrientation column
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
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Copy data back (excluding sexualOrientation column)
    INSERT INTO patients (
      id, name, age, email, phoneNumber, birthDate, maritalStatus,
      gender, educationalLevel, profession, livesWith, children,
      previousPsychologicalExperience, firstAppointmentDate, status, createdAt, updatedAt
    )
    SELECT
      id, name, age, email, phoneNumber, birthDate, maritalStatus,
      gender, educationalLevel, profession, livesWith, children,
      previousPsychologicalExperience, firstAppointmentDate, status, createdAt, updatedAt
    FROM patients_backup;

    -- Drop backup table
    DROP TABLE patients_backup;
  `);

  console.log('Migration 004-add-sexual-orientation rollback completed');
}
