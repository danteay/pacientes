import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { Patient } from '../../types/patient';
import { Note } from '../../types/note';
import { EmergencyContact } from '../../types/emergency-contact';
import { LegalTutor } from '../../types/legal-tutor';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Type for exported patient (without id, with notes, emergency contacts, and legal tutors arrays)
type ExportedPatient = Omit<Patient, 'id'> & {
  notes: Array<Omit<Note, 'id'>>;
  emergencyContacts: Array<Omit<EmergencyContact, 'id' | 'patientId'>>;
  legalTutors: Array<Omit<LegalTutor, 'id' | 'patientId'>>;
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
               sexualOrientation, status, educationalLevel, profession, livesWith, children,
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

      // Get all emergency contacts (excluding id and patientId)
      const emergencyContactsStmt = this.db.prepare(`
        SELECT ec.fullName, ec.phoneNumber, ec.relation, ec.email, ec.address,
               ec.createdAt, ec.updatedAt, p.email as patientEmail
        FROM emergency_contacts ec
        JOIN patients p ON ec.patientId = p.id
      `);
      const emergencyContacts = emergencyContactsStmt.all() as Array<Record<string, unknown>>;

      // Group emergency contacts by patient email
      const contactsByEmail = new Map<string, Array<Record<string, unknown>>>();
      for (const contact of emergencyContacts) {
        const email = contact.patientEmail as string;
        if (!contactsByEmail.has(email)) {
          contactsByEmail.set(email, []);
        }
        // Remove patientEmail field from contact before adding
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { patientEmail, ...contactWithoutEmail } = contact;
        contactsByEmail.get(email)!.push(contactWithoutEmail);
      }

      // Get all legal tutors (excluding id and patientId)
      const legalTutorsStmt = this.db.prepare(`
        SELECT lt.fullName, lt.phoneNumber, lt.relation, lt.email, lt.birthDate, lt.address,
               lt.createdAt, lt.updatedAt, p.email as patientEmail
        FROM legal_tutors lt
        JOIN patients p ON lt.patientId = p.id
      `);
      const legalTutors = legalTutorsStmt.all() as Array<Record<string, unknown>>;

      // Group legal tutors by patient email
      const tutorsByEmail = new Map<string, Array<Record<string, unknown>>>();
      for (const tutor of legalTutors) {
        const email = tutor.patientEmail as string;
        if (!tutorsByEmail.has(email)) {
          tutorsByEmail.set(email, []);
        }
        // Remove patientEmail field from tutor before adding
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { patientEmail, ...tutorWithoutEmail } = tutor;
        tutorsByEmail.get(email)!.push(tutorWithoutEmail);
      }

      // Add notes, emergency contacts, and legal tutors arrays to each patient
      const patientsWithNotes = patients.map((patient) => ({
        ...patient,
        notes: notesByEmail.get(patient.email as string) || [],
        emergencyContacts: contactsByEmail.get(patient.email as string) || [],
        legalTutors: tutorsByEmail.get(patient.email as string) || [],
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
  ): Promise<{
    success: boolean;
    error?: string;
    stats?: { patients: number; notes: number; emergencyContacts: number; legalTutors: number };
  }> {
    try {
      if (process.env.DEBUG === 'true') {
        console.log('[DEBUG] BackupService: Starting import from', filePath);
      }

      progressCallback?.({
        stage: 'reading',
        current: 0,
        total: 100,
        message: 'Reading backup file...',
      });
      // Stage 1: Reading file
      const data = await this.getExportData(filePath);

      if (process.env.DEBUG === 'true') {
        console.log('[DEBUG] BackupService: Export data loaded, version:', data.version);
        console.log('[DEBUG] BackupService: Total patients to import:', data.patients.length);
      }

      const totalPatients = data.patients.length;

      progressCallback?.({
        stage: 'importing_patients',
        current: 0,
        total: 100,
        message: 'Importing patients...',
      });

      let patientsImported = 0;
      let notesImported = 0;
      let emergencyContactsImported = 0;
      let legalTutorsImported = 0;

      // Stage 2: Importing patients
      for (let i = 0; i < data.patients.length; i++) {
        const patientData = data.patients[i];

        if (process.env.DEBUG === 'true') {
          console.log(
            `[DEBUG] BackupService: Importing patient ${i + 1}/${totalPatients}:`,
            patientData.email
          );
        }

        try {
          const stats = await this.insertPatient(patientData);
          patientsImported += stats.patientsInserted;
          notesImported += stats.notesInserted;
          emergencyContactsImported += stats.emergencyContactsInserted;
          legalTutorsImported += stats.legalTutorsInserted;

          if (process.env.DEBUG === 'true') {
            console.log(`[DEBUG] BackupService: Patient import stats:`, stats);
          }
        } catch (error) {
          if (process.env.DEBUG === 'true') {
            console.error(`[DEBUG] BackupService: Error importing patient ${i + 1}:`, error);
          }
          throw error;
        }

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

      const result = {
        success: true,
        stats: {
          patients: patientsImported,
          notes: notesImported,
          emergencyContacts: emergencyContactsImported,
          legalTutors: legalTutorsImported,
        },
      };

      if (process.env.DEBUG === 'true') {
        console.log('[DEBUG] BackupService: Import complete:', result);
      }

      return result;
    } catch (error) {
      if (process.env.DEBUG === 'true') {
        console.error('[DEBUG] BackupService: Import failed with error:', error);
      }
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

  async insertPatient(patientData: ExportedPatient): Promise<{
    patientsInserted: number;
    notesInserted: number;
    emergencyContactsInserted: number;
    legalTutorsInserted: number;
  }> {
    let patientId = await this.patientExists(patientData.email);
    let patientsInserted = 0;
    let notesInserted = 0;
    let emergencyContactsInserted = 0;
    let legalTutorsInserted = 0;

    if (patientId === 0) {
      const patientFields = Object.keys(patientData).filter(
        (key) => key !== 'notes' && key !== 'emergencyContacts' && key !== 'legalTutors'
      );

      const patientPlaceholders = patientFields.map(() => '?');

      const fieldsStr = patientFields.join(', ');
      const placeholdersStr = patientPlaceholders.join(', ');

      const values = patientFields.map(
        (field) =>
          patientData[
            field as keyof Omit<ExportedPatient, 'notes' | 'emergencyContacts' | 'legalTutors'>
          ]
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

    // If there are emergency contacts, insert them
    if (patientData.emergencyContacts && Array.isArray(patientData.emergencyContacts)) {
      for (const contactData of patientData.emergencyContacts as Array<
        Omit<EmergencyContact, 'id' | 'patientId'>
      >) {
        const inserted = await this.insertEmergencyContact(patientId, contactData);
        if (inserted) {
          emergencyContactsInserted++;
        }
      }
    }

    // If there are legal tutors, insert them
    if (patientData.legalTutors && Array.isArray(patientData.legalTutors)) {
      for (const tutorData of patientData.legalTutors as Array<
        Omit<LegalTutor, 'id' | 'patientId'>
      >) {
        const inserted = await this.insertLegalTutor(patientId, tutorData);
        if (inserted) {
          legalTutorsInserted++;
        }
      }
    }

    return { patientsInserted, notesInserted, emergencyContactsInserted, legalTutorsInserted };
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

  async insertEmergencyContact(
    patientId: number,
    contactData: Omit<EmergencyContact, 'id' | 'patientId'>
  ): Promise<boolean> {
    // Check for duplicate emergency contact (same patient, email, and phone number)
    const checkDuplicateStmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM emergency_contacts
      WHERE patientId = ? AND email = ? AND phoneNumber = ?
    `);

    const duplicate = checkDuplicateStmt.get(
      patientId,
      contactData.email,
      contactData.phoneNumber
    ) as {
      count: number;
    };

    if (duplicate.count > 0) {
      // Emergency contact already exists, skip insertion
      return false;
    }

    const contactFields = Object.keys(contactData);

    // Always ensure patientId is first
    const allFields = ['patientId', ...contactFields];
    const contactPlaceholders = allFields.map(() => '?');

    const fieldsStr = allFields.join(', ');
    const placeholdersStr = contactPlaceholders.join(', ');

    const values = [
      patientId,
      ...contactFields.map(
        (field) => contactData[field as keyof Omit<EmergencyContact, 'id' | 'patientId'>]
      ),
    ];

    const stmt = this.db.prepare(`
      INSERT INTO emergency_contacts (${fieldsStr})
      VALUES (${placeholdersStr})
    `);

    stmt.run(...values);
    return true;
  }

  async insertLegalTutor(
    patientId: number,
    tutorData: Omit<LegalTutor, 'id' | 'patientId'>
  ): Promise<boolean> {
    // Check for duplicate legal tutor (same patient, email, and phone number)
    const checkDuplicateStmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM legal_tutors
      WHERE patientId = ? AND email = ? AND phoneNumber = ?
    `);

    const duplicate = checkDuplicateStmt.get(patientId, tutorData.email, tutorData.phoneNumber) as {
      count: number;
    };

    if (duplicate.count > 0) {
      // Legal tutor already exists, skip insertion
      return false;
    }

    const tutorFields = Object.keys(tutorData);

    // Always ensure patientId is first
    const allFields = ['patientId', ...tutorFields];
    const tutorPlaceholders = allFields.map(() => '?');

    const fieldsStr = allFields.join(', ');
    const placeholdersStr = tutorPlaceholders.join(', ');

    const values = [
      patientId,
      ...tutorFields.map((field) => tutorData[field as keyof Omit<LegalTutor, 'id' | 'patientId'>]),
    ];

    const stmt = this.db.prepare(`
      INSERT INTO legal_tutors (${fieldsStr})
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
