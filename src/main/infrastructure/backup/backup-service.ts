import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { Patient } from '../../../types/patient';
import { Note } from '../../../types/note';
import { EmergencyContact } from '../../../types/emergency-contact';
import { LegalTutor } from '../../../types/legal-tutor';
import { Attachment } from '../../../types/attachment';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Types
type ExportedPatient = Omit<Patient, 'id'> & {
  notes: Array<Omit<Note, 'id'>>;
  emergencyContacts: Array<Omit<EmergencyContact, 'id' | 'patientId'>>;
  legalTutors: Array<Omit<LegalTutor, 'id' | 'patientId'>>;
  attachments: Array<Omit<Attachment, 'id' | 'patientId'>>;
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

interface ImportStats {
  patientsInserted: number;
  notesInserted: number;
  emergencyContactsInserted: number;
  legalTutorsInserted: number;
  attachmentsInserted: number;
}

interface EntityWithPatientEmail extends Record<string, unknown> {
  patientEmail: string;
}

/**
 * BackupService - Handles database export and import operations
 *
 * Responsibilities:
 * - Export patient data with related entities to compressed JSON
 * - Import patient data with proper duplicate handling
 * - Maintain data integrity during backup/restore operations
 */
export class BackupService {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // ==================== PUBLIC API ====================

  /**
   * Export entire database to compressed JSON file
   */
  async exportDatabase(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.validateExportPath(filePath);

      const patients = this.fetchPatients();
      const patientsWithRelations = await this.enrichPatientsWithRelations(patients);
      const exportData = this.createExportData(patientsWithRelations);

      await this.writeExportFile(filePath, exportData);

      return { success: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Import database from compressed JSON file
   */
  async importDatabase(
    filePath: string,
    progressCallback?: (progress: ImportProgress) => void
  ): Promise<{
    success: boolean;
    error?: string;
    stats?: ImportStats;
  }> {
    try {
      this.logDebug('Starting import from', filePath);

      const data = await this.readExportFile(filePath, progressCallback);
      const stats = await this.importPatients(data, progressCallback);

      this.notifyComplete(progressCallback);
      this.logDebug('Import complete:', stats);

      return { success: true, stats };
    } catch (error) {
      this.logDebug('Import failed with error:', error);
      return this.handleError(error);
    }
  }

  // ==================== EXPORT METHODS ====================

  /**
   * Validate export file path doesn't already exist
   */
  private validateExportPath(filePath: string): void {
    if (fs.existsSync(filePath)) {
      throw new Error('File already exists. Please choose a different location.');
    }
  }

  /**
   * Fetch all patients from database (excluding IDs)
   */
  private fetchPatients(): Array<Record<string, unknown>> {
    const stmt = this.db.prepare(`
      SELECT name, age, email, phoneNumber, birthDate, maritalStatus, gender,
             sexualOrientation, status, educationalLevel, profession, livesWith, children,
             previousPsychologicalExperience, firstAppointmentDate,
             createdAt, updatedAt
      FROM patients
    `);
    return stmt.all() as Array<Record<string, unknown>>;
  }

  /**
   * Enrich patients with all related entities
   */
  private async enrichPatientsWithRelations(
    patients: Array<Record<string, unknown>>
  ): Promise<ExportedPatient[]> {
    const notesByEmail = this.fetchAndGroupByEmail('notes', [
      'title',
      'content',
      'creationDate',
      'createdAt',
      'updatedAt',
    ]);

    const contactsByEmail = this.fetchAndGroupByEmail('emergency_contacts', [
      'fullName',
      'phoneNumber',
      'relation',
      'email',
      'address',
      'createdAt',
      'updatedAt',
    ]);

    const tutorsByEmail = this.fetchAndGroupByEmail('legal_tutors', [
      'fullName',
      'phoneNumber',
      'relation',
      'email',
      'birthDate',
      'address',
      'createdAt',
      'updatedAt',
    ]);

    const attachmentsByEmail = this.fetchAndGroupByEmail('attachments', [
      'name',
      'url',
      'createdAt',
      'updatedAt',
    ]);

    return patients.map((patient) => ({
      ...patient,
      notes: notesByEmail.get(patient.email as string) || [],
      emergencyContacts: contactsByEmail.get(patient.email as string) || [],
      legalTutors: tutorsByEmail.get(patient.email as string) || [],
      attachments: attachmentsByEmail.get(patient.email as string) || [],
    })) as ExportedPatient[];
  }

  /**
   * Generic method to fetch entities and group by patient email
   */
  private fetchAndGroupByEmail(
    tableName: string,
    fields: string[]
  ): Map<string, Array<Record<string, unknown>>> {
    const query = `
      SELECT ${fields.map((f) => `e.${f}`).join(', ')}, p.email as patientEmail
      FROM ${tableName} e
      JOIN patients p ON e.patientId = p.id
    `;

    const entities = this.db.prepare(query).all() as EntityWithPatientEmail[];
    return this.groupEntitiesByEmail(entities);
  }

  /**
   * Group entities by patient email and remove patientEmail field
   */
  private groupEntitiesByEmail(
    entities: EntityWithPatientEmail[]
  ): Map<string, Array<Record<string, unknown>>> {
    const grouped = new Map<string, Array<Record<string, unknown>>>();

    for (const entity of entities) {
      const email = entity.patientEmail;
      if (!grouped.has(email)) {
        grouped.set(email, []);
      }

      // Remove patientEmail field from entity
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { patientEmail, ...entityWithoutEmail } = entity;
      grouped.get(email)!.push(entityWithoutEmail);
    }

    return grouped;
  }

  /**
   * Create export data structure with metadata
   */
  private createExportData(patients: ExportedPatient[]): ExportData {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      patients,
    };
  }

  /**
   * Write export data to compressed file
   */
  private async writeExportFile(filePath: string, data: ExportData): Promise<void> {
    const jsonData = JSON.stringify(data, null, 2);
    const compressed = await gzip(Buffer.from(jsonData, 'utf-8'));
    fs.writeFileSync(filePath, compressed);
  }

  // ==================== IMPORT METHODS ====================

  /**
   * Read and decompress export file
   */
  private async readExportFile(
    filePath: string,
    progressCallback?: (progress: ImportProgress) => void
  ): Promise<ExportData> {
    this.notifyProgress(progressCallback, 'reading', 0, 'Reading backup file...');

    const compressed = fs.readFileSync(filePath);
    const decompressed = await gunzip(compressed);
    const jsonData = decompressed.toString('utf-8');
    const data = JSON.parse(jsonData) as ExportData;

    this.logDebug('Export data loaded, version:', data.version);
    this.logDebug('Total patients to import:', data.patients.length);

    return data;
  }

  /**
   * Import all patients with progress tracking
   */
  private async importPatients(
    data: ExportData,
    progressCallback?: (progress: ImportProgress) => void
  ): Promise<ImportStats> {
    const totalStats: ImportStats = {
      patientsInserted: 0,
      notesInserted: 0,
      emergencyContactsInserted: 0,
      legalTutorsInserted: 0,
      attachmentsInserted: 0,
    };

    const totalPatients = data.patients.length;
    this.notifyProgress(progressCallback, 'importing_patients', 0, 'Importing patients...');

    for (let i = 0; i < data.patients.length; i++) {
      const patientData = data.patients[i];
      this.logDebug(`Importing patient ${i + 1}/${totalPatients}:`, patientData.email);

      const stats = await this.importPatient(patientData);
      this.accumulateStats(totalStats, stats);

      const percent = this.calculatePercentage(i + 1, totalPatients);
      this.notifyProgress(
        progressCallback,
        'importing_patients',
        percent,
        `Importing patients... (${i + 1}/${totalPatients})`
      );
    }

    return totalStats;
  }

  /**
   * Import single patient with all related entities
   */
  private async importPatient(patientData: ExportedPatient): Promise<ImportStats> {
    const patientId = await this.getOrCreatePatient(patientData);

    const stats: ImportStats = {
      patientsInserted: patientId > 0 ? 1 : 0,
      notesInserted: await this.importNotes(patientId, patientData.notes),
      emergencyContactsInserted: await this.importEmergencyContacts(
        patientId,
        patientData.emergencyContacts
      ),
      legalTutorsInserted: await this.importLegalTutors(patientId, patientData.legalTutors),
      attachmentsInserted: await this.importAttachments(patientId, patientData.attachments),
    };

    this.logDebug('Patient import stats:', stats);
    return stats;
  }

  /**
   * Get existing patient ID or create new patient
   */
  private async getOrCreatePatient(patientData: ExportedPatient): Promise<number> {
    const existingId = await this.findPatientByEmail(patientData.email);

    if (existingId > 0) {
      return existingId;
    }

    return this.createPatient(patientData);
  }

  /**
   * Find patient by email
   */
  private async findPatientByEmail(email: string): Promise<number> {
    const stmt = this.db.prepare('SELECT id FROM patients WHERE email = ?');
    const row = stmt.get(email) as { id: number } | undefined;
    return row?.id || 0;
  }

  /**
   * Create new patient record
   */
  private createPatient(patientData: ExportedPatient): number {
    const patientFields = this.getPatientFields(patientData);
    const query = this.buildInsertQuery('patients', patientFields);
    const values = patientFields.map((field) => patientData[field as keyof ExportedPatient]);

    const result = this.db.prepare(query).run(...values);
    return result.lastInsertRowid as number;
  }

  /**
   * Get patient-specific fields (excluding related entities)
   */
  private getPatientFields(patientData: ExportedPatient): string[] {
    return Object.keys(patientData).filter(
      (key) =>
        key !== 'notes' &&
        key !== 'emergencyContacts' &&
        key !== 'legalTutors' &&
        key !== 'attachments'
    );
  }

  // ==================== ENTITY IMPORT METHODS ====================

  /**
   * Import notes for a patient
   */
  private async importNotes(
    patientId: number,
    notes: Array<Omit<Note, 'id'>> | undefined
  ): Promise<number> {
    if (!notes || !Array.isArray(notes)) return 0;

    let inserted = 0;
    for (const noteData of notes) {
      const success = await this.insertNote(patientId, noteData);
      if (success) inserted++;
    }
    return inserted;
  }

  /**
   * Import emergency contacts for a patient
   */
  private async importEmergencyContacts(
    patientId: number,
    contacts: Array<Omit<EmergencyContact, 'id' | 'patientId'>> | undefined
  ): Promise<number> {
    if (!contacts || !Array.isArray(contacts)) return 0;

    let inserted = 0;
    for (const contactData of contacts) {
      const success = await this.insertEmergencyContact(patientId, contactData);
      if (success) inserted++;
    }
    return inserted;
  }

  /**
   * Import legal tutors for a patient
   */
  private async importLegalTutors(
    patientId: number,
    tutors: Array<Omit<LegalTutor, 'id' | 'patientId'>> | undefined
  ): Promise<number> {
    if (!tutors || !Array.isArray(tutors)) return 0;

    let inserted = 0;
    for (const tutorData of tutors) {
      const success = await this.insertLegalTutor(patientId, tutorData);
      if (success) inserted++;
    }
    return inserted;
  }

  /**
   * Import attachments for a patient
   */
  private async importAttachments(
    patientId: number,
    attachments: Array<Omit<Attachment, 'id' | 'patientId'>> | undefined
  ): Promise<number> {
    if (!attachments || !Array.isArray(attachments)) return 0;

    let inserted = 0;
    for (const attachmentData of attachments) {
      const success = await this.insertAttachment(patientId, attachmentData);
      if (success) inserted++;
    }
    return inserted;
  }

  // ==================== ENTITY INSERTION METHODS ====================

  /**
   * Insert note with duplicate detection
   */
  private async insertNote(patientId: number, noteData: Omit<Note, 'id'>): Promise<boolean> {
    const isDuplicate = this.checkDuplicate('notes', {
      patientId,
      title: noteData.title,
      createdAt: noteData.createdAt,
    });

    if (isDuplicate) return false;

    return this.insertEntity('notes', { ...noteData });
  }

  /**
   * Insert emergency contact with duplicate detection
   */
  private async insertEmergencyContact(
    patientId: number,
    contactData: Omit<EmergencyContact, 'id' | 'patientId'>
  ): Promise<boolean> {
    const isDuplicate = this.checkDuplicate('emergency_contacts', {
      patientId,
      email: contactData.email,
      phoneNumber: contactData.phoneNumber,
    });

    if (isDuplicate) return false;

    return this.insertEntity('emergency_contacts', { patientId, ...contactData });
  }

  /**
   * Insert legal tutor with duplicate detection
   */
  private async insertLegalTutor(
    patientId: number,
    tutorData: Omit<LegalTutor, 'id' | 'patientId'>
  ): Promise<boolean> {
    const isDuplicate = this.checkDuplicate('legal_tutors', {
      patientId,
      email: tutorData.email,
      phoneNumber: tutorData.phoneNumber,
    });

    if (isDuplicate) return false;

    return this.insertEntity('legal_tutors', { patientId, ...tutorData });
  }

  /**
   * Insert attachment with smart duplicate handling
   */
  private async insertAttachment(
    patientId: number,
    attachmentData: Omit<Attachment, 'id' | 'patientId'>
  ): Promise<boolean> {
    const existingName = this.findAttachmentByUrl(patientId, attachmentData.url);

    if (existingName) {
      // Same URL found
      if (existingName === attachmentData.name) {
        return false; // Complete duplicate - skip
      }
      // Same URL, different name - rename and insert
      attachmentData.name = `${attachmentData.name} (dup. ${existingName})`;
    }

    return this.insertEntity('attachments', { patientId, ...attachmentData });
  }

  // ==================== GENERIC DATABASE METHODS ====================

  /**
   * Check if record exists based on criteria
   */
  private checkDuplicate(tableName: string, criteria: Record<string, unknown>): boolean {
    const conditions = Object.keys(criteria)
      .map((key) => `${key} = ?`)
      .join(' AND ');

    const query = `SELECT COUNT(*) as count FROM ${tableName} WHERE ${conditions}`;
    const values = Object.values(criteria);

    const result = this.db.prepare(query).get(...values) as { count: number };
    return result.count > 0;
  }

  /**
   * Find attachment by URL and return its name
   */
  private findAttachmentByUrl(patientId: number, url: string): string | null {
    const query = 'SELECT name FROM attachments WHERE patientId = ? AND url = ?';
    const result = this.db.prepare(query).get(patientId, url) as { name: string } | undefined;
    return result?.name || null;
  }

  /**
   * Generic entity insertion
   */
  private insertEntity(tableName: string, data: Record<string, unknown>): boolean {
    const query = this.buildInsertQuery(tableName, Object.keys(data));
    const values = Object.values(data);

    this.db.prepare(query).run(...values);
    return true;
  }

  /**
   * Build dynamic INSERT query
   */
  private buildInsertQuery(tableName: string, fields: string[]): string {
    const fieldsStr = fields.join(', ');
    const placeholders = fields.map(() => '?').join(', ');
    return `INSERT INTO ${tableName} (${fieldsStr}) VALUES (${placeholders})`;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Accumulate import statistics
   */
  private accumulateStats(total: ImportStats, addition: ImportStats): void {
    total.patientsInserted += addition.patientsInserted;
    total.notesInserted += addition.notesInserted;
    total.emergencyContactsInserted += addition.emergencyContactsInserted;
    total.legalTutorsInserted += addition.legalTutorsInserted;
    total.attachmentsInserted += addition.attachmentsInserted;
  }

  /**
   * Notify progress callback
   */
  private notifyProgress(
    callback: ((progress: ImportProgress) => void) | undefined,
    stage: ImportProgress['stage'],
    current: number,
    message: string
  ): void {
    callback?.({ stage, current, total: 100, message });
  }

  /**
   * Notify import completion
   */
  private notifyComplete(callback: ((progress: ImportProgress) => void) | undefined): void {
    this.notifyProgress(callback, 'complete', 100, 'Import complete!');
  }

  /**
   * Calculate percentage
   */
  private calculatePercentage(current: number, total: number): number {
    if (total === 0) return 100;
    return Math.floor((current / total) * 100);
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown): { success: false; error: string } {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }

  /**
   * Debug logging (only in debug mode)
   */
  private logDebug(...args: unknown[]): void {
    if (process.env.DEBUG === 'true') {
      console.log('[DEBUG] BackupService:', ...args);
    }
  }
}
