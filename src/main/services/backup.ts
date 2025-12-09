import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { Patient } from '../../types/patient';
import { Note } from '../../types/note';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Type for exported patient (without id, with notes array)
type ExportedPatient = Omit<Patient, 'id'> & {
  notes: Array<Omit<Note, 'id'>>;
};

export interface ExportData {
  version: string;
  exportDate: string;
  patients: ExportedPatient[];
}

export interface ImportProgress {
  stage: 'reading' | 'parsing' | 'importing_patients' | 'importing_notes' | 'complete';
  current: number;
  total: number;
  message: string;
}

export class BackupService {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async exportDatabase(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if file already exists
      if (fs.existsSync(filePath)) {
        return {
          success: false,
          error: 'File already exists. Please choose a different location.',
        };
      }

      // Get all patients (excluding id)
      const patientsStmt = this.db.prepare(`
        SELECT name, age, email, phoneNumber, birthDate, maritalStatus, gender,
               educationalLevel, profession, livesWith, children,
               previousPsychologicalExperience, firstAppointmentDate,
               createdAt, updatedAt
        FROM patients
      `);
      const patients = patientsStmt.all() as Array<Record<string, unknown>>;

      // Get all notes (excluding id)
      const notesStmt = this.db.prepare(`
        SELECT n.title, n.content, n.createdAt, n.updatedAt, p.email as patientEmail
        FROM notes n
        JOIN patients p ON n.patientId = p.id
      `);
      const notes = notesStmt.all() as Array<Record<string, unknown>>;

      // Group notes by patient email
      const notesByEmail = new Map<string, Array<Record<string, unknown>>>();
      for (const note of notes) {
        const email = note.patientEmail as string;
        if (!notesByEmail.has(email)) {
          notesByEmail.set(email, []);
        }
        // Remove patientEmail field from note before adding
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { patientEmail, ...noteWithoutEmail } = note;
        notesByEmail.get(email)!.push(noteWithoutEmail);
      }

      // Add notes array to each patient
      const patientsWithNotes = patients.map((patient) => ({
        ...patient,
        notes: notesByEmail.get(patient.email as string) || [],
      })) as ExportedPatient[];

      // Create export data structure
      const exportData: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        patients: patientsWithNotes,
      };

      // Convert to JSON and compress
      const jsonData = JSON.stringify(exportData, null, 2);
      const compressed = await gzip(Buffer.from(jsonData, 'utf-8'));

      // Write to file
      fs.writeFileSync(filePath, compressed);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async importDatabase(
    filePath: string,
    progressCallback?: (progress: ImportProgress) => void
  ): Promise<{ success: boolean; error?: string; stats?: { patients: number; notes: number } }> {
    try {
      progressCallback?.({
        stage: 'reading',
        current: 0,
        total: 100,
        message: 'Reading backup file...',
      });
      // Stage 1: Reading file
      const data = await this.getExportData(filePath);

      const totalPatients = data.patients.length;

      progressCallback?.({
        stage: 'importing_patients',
        current: 0,
        total: 100,
        message: 'Importing patients...',
      });

      let patientsImported = 0;
      let notesImported = 0;

      // Stage 2: Importing patients
      for (let i = 0; i < data.patients.length; i++) {
        const patientData = data.patients[i];
        const stats = await this.insertPatient(patientData);
        patientsImported += stats.patientsInserted;
        notesImported += stats.notesInserted;

        const percent = this.calculatePercentage(i + 1, totalPatients);
        progressCallback?.({
          stage: 'importing_patients',
          current: percent,
          total: 100,
          message: `Importing patients... (${i + 1}/${totalPatients})`,
        });
      }

      // Stage 5: Complete
      progressCallback?.({
        stage: 'complete',
        current: 100,
        total: 100,
        message: 'Import complete!',
      });

      return {
        success: true,
        stats: {
          patients: patientsImported,
          notes: notesImported,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async patientExists(email: string): Promise<number> {
    const stmt = this.db.prepare('SELECT id FROM patients WHERE email = ?');
    const row = stmt.get(email) as { id: number } | undefined;

    if (row) {
      return row.id;
    }

    return 0;
  }

  async insertPatient(
    patientData: ExportedPatient
  ): Promise<{ patientsInserted: number; notesInserted: number }> {
    let patientId = await this.patientExists(patientData.email);
    let patientsInserted = 0;
    let notesInserted = 0;

    if (patientId === 0) {
      const patientFields = Object.keys(patientData).filter((key) => key !== 'notes');

      const patientPlaceholders = patientFields.map(() => '?');

      const fieldsStr = patientFields.join(', ');
      const placeholdersStr = patientPlaceholders.join(', ');

      const values = patientFields.map(
        (field) => patientData[field as keyof Omit<ExportedPatient, 'notes'>]
      );

      const stmt = this.db.prepare(`
      INSERT INTO patients (${fieldsStr})
      VALUES (${placeholdersStr})
    `);

      const result = stmt.run(...values);
      patientId = result.lastInsertRowid as number;
      patientsInserted = 1;
    }

    // If there are notes, insert them
    if (patientData.notes && Array.isArray(patientData.notes)) {
      for (const noteData of patientData.notes as Array<Omit<Note, 'id'>>) {
        const inserted = await this.insertNote(patientId, noteData);
        if (inserted) {
          notesInserted++;
        }
      }
    }

    return { patientsInserted, notesInserted };
  }

  async insertNote(patientId: number, noteData: Omit<Note, 'id'>): Promise<boolean> {
    // Check for duplicate note (same patient, title, and createdAt)
    const checkDuplicateStmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM notes
      WHERE patientId = ? AND title = ? AND createdAt = ?
    `);

    const duplicate = checkDuplicateStmt.get(patientId, noteData.title, noteData.createdAt) as {
      count: number;
    };

    if (duplicate.count > 0) {
      // Note already exists, skip insertion
      return false;
    }

    const noteFields = Object.keys(noteData);

    // Always ensure patientId is first
    const allFields = ['patientId', ...noteFields];
    const notePlaceholders = allFields.map(() => '?');

    const fieldsStr = allFields.join(', ');
    const placeholdersStr = notePlaceholders.join(', ');

    const values = [
      patientId,
      ...noteFields.map((field) => noteData[field as keyof Omit<Note, 'id'>]),
    ];

    const stmt = this.db.prepare(`
      INSERT INTO notes (${fieldsStr})
      VALUES (${placeholdersStr})
    `);

    stmt.run(...values);
    return true;
  }

  async getExportData(filePath: string): Promise<ExportData> {
    const compressed = fs.readFileSync(filePath);
    const decompressed = await gunzip(compressed);
    const jsonData = decompressed.toString('utf-8');

    return JSON.parse(jsonData) as ExportData;
  }

  calculatePercentage(current: number, total: number): number {
    if (total === 0) return 100;
    return Math.floor((current / total) * 100);
  }
}
