import Database from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';
import { DatabaseDriver } from './driver/database-driver';
import { PatientRepository, NoteRepository, EmergencyContactRepository } from './repositories';
import { LegalTutorRepository } from './repositories/legal-tutor-repository';
import { PatientService } from '../services/patient-service';
import { NoteService } from '../services/note-service';
import { EmergencyContactService } from '../services/emergency-contact-service';
import { LegalTutorService } from '../services/legal-tutor-service';
import { runMigrations } from './migrations/umzug';
import {
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
  PatientStatus,
} from '../../types/patient';
import { Note, NoteCreateInput, NoteUpdateInput } from '../../types/note';
import {
  EmergencyContact,
  EmergencyContactCreateInput,
  EmergencyContactUpdateInput,
} from '../../types/emergency-contact';
import { LegalTutor, LegalTutorCreateInput, LegalTutorUpdateInput } from '../../types/legal-tutor';

/**
 * Database Service
 *
 * This is the main orchestrator that:
 * - Initializes the database connection
 * - Creates and manages the Driver, Repository, and Service layers
 * - Provides a unified interface for the main process
 * - Manages database lifecycle (initialization, migrations, closing)
 *
 * Layer Architecture:
 * DatabaseService → Service Layer → Repository Layer → Driver Layer → Database
 */
export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;
  private initialized: boolean = false;

  // Layers
  private driver: DatabaseDriver | null = null;
  private patientRepository: PatientRepository | null = null;
  private noteRepository: NoteRepository | null = null;
  private emergencyContactRepository: EmergencyContactRepository | null = null;
  private legalTutorRepository: LegalTutorRepository | null = null;
  private patientService: PatientService | null = null;
  private noteService: NoteService | null = null;
  private emergencyContactService: EmergencyContactService | null = null;
  private legalTutorService: LegalTutorService | null = null;

  constructor() {
    // Use user's home directory for the database file
    const homeDir = os.homedir();
    this.dbPath = path.join(homeDir, 'pacientes_app.db');
    console.log(`Database path: ${this.dbPath}`);
  }

  /**
   * Initialize database and all layers
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('Initializing database with better-sqlite3...');
    this.db = new Database(this.dbPath, { verbose: console.log });

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Run migrations
    await this.runMigrations();

    // Initialize layers from bottom to top
    this.driver = new DatabaseDriver(this.db);
    this.patientRepository = new PatientRepository(this.driver);
    this.noteRepository = new NoteRepository(this.driver);
    this.emergencyContactRepository = new EmergencyContactRepository(this.driver);
    this.legalTutorRepository = new LegalTutorRepository(this.driver);
    this.patientService = new PatientService(this.patientRepository);
    this.noteService = new NoteService(this.noteRepository, this.patientRepository);
    this.emergencyContactService = new EmergencyContactService(this.emergencyContactRepository);
    this.legalTutorService = new LegalTutorService(this.legalTutorRepository);

    this.initialized = true;
    console.log('Database initialized successfully with all layers');
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('Running database migrations...');
    await runMigrations(this.db);
    console.log('Database migrations completed');
  }

  // ==================== Patient Operations ====================

  /**
   * Create a new patient
   */
  createPatient(patientData: PatientCreateInput): Patient {
    this.ensureInitialized();
    return this.patientService!.createPatient(patientData);
  }

  /**
   * Get patient by ID
   */
  getPatientById(id: number): Patient | undefined {
    this.ensureInitialized();
    return this.patientService!.getPatientById(id);
  }

  /**
   * Get all patients
   */
  getAllPatients(): Patient[] {
    this.ensureInitialized();
    return this.patientService!.getAllPatients();
  }

  /**
   * Update patient
   */
  updatePatient(patientData: PatientUpdateInput): Patient | undefined {
    this.ensureInitialized();
    return this.patientService!.updatePatient(patientData);
  }

  /**
   * Delete patient
   */
  deletePatient(id: number): boolean {
    this.ensureInitialized();
    return this.patientService!.deletePatient(id);
  }

  /**
   * Search patients with optional status filter
   */
  searchPatients(searchTerm: string, status?: PatientStatus): Patient[] {
    this.ensureInitialized();
    return this.patientService!.searchPatients(searchTerm, status);
  }

  /**
   * Get patient statistics
   */
  getPatientStatistics(): {
    total: number;
    withoutFirstAppointment: number;
    averageAge: number;
  } {
    this.ensureInitialized();
    return this.patientService!.getPatientStatistics();
  }

  // ==================== Note Operations ====================

  /**
   * Create a new note
   * Automatically sets first appointment date if not set
   */
  createNote(noteData: NoteCreateInput): Note {
    this.ensureInitialized();
    return this.noteService!.createNote(noteData);
  }

  /**
   * Get note by ID
   */
  getNoteById(id: number): Note | undefined {
    this.ensureInitialized();
    return this.noteService!.getNoteById(id);
  }

  /**
   * Get all notes for a patient
   */
  getNotesByPatientId(patientId: number): Note[] {
    this.ensureInitialized();
    return this.noteService!.getNotesByPatientId(patientId);
  }

  /**
   * Get all notes
   */
  getAllNotes(): Note[] {
    this.ensureInitialized();
    return this.noteService!.getAllNotes();
  }

  /**
   * Update note
   */
  updateNote(noteData: NoteUpdateInput): Note | undefined {
    this.ensureInitialized();
    return this.noteService!.updateNote(noteData);
  }

  /**
   * Delete note
   */
  deleteNote(id: number): boolean {
    this.ensureInitialized();
    return this.noteService!.deleteNote(id);
  }

  /**
   * Search notes
   */
  searchNotes(searchTerm: string): Note[] {
    this.ensureInitialized();
    return this.noteService!.searchNotes(searchTerm);
  }

  /**
   * Get notes statistics
   */
  getNotesStatistics(): {
    totalNotes: number;
    averageNotesPerPatient: number;
  } {
    this.ensureInitialized();
    return this.noteService!.getNotesStatistics();
  }

  // ==================== Emergency Contact Operations ====================

  /**
   * Create a new emergency contact
   */
  createEmergencyContact(contactData: EmergencyContactCreateInput): EmergencyContact {
    this.ensureInitialized();
    return this.emergencyContactService!.createEmergencyContact(contactData);
  }

  /**
   * Get emergency contact by ID
   */
  getEmergencyContactById(id: number): EmergencyContact | undefined {
    this.ensureInitialized();
    return this.emergencyContactService!.getEmergencyContactById(id);
  }

  /**
   * Get all emergency contacts for a patient
   */
  getEmergencyContactsByPatientId(patientId: number): EmergencyContact[] {
    this.ensureInitialized();
    return this.emergencyContactService!.getEmergencyContactsByPatientId(patientId);
  }

  /**
   * Update emergency contact
   */
  updateEmergencyContact(contactData: EmergencyContactUpdateInput): EmergencyContact {
    this.ensureInitialized();
    return this.emergencyContactService!.updateEmergencyContact(contactData);
  }

  /**
   * Delete emergency contact
   */
  deleteEmergencyContact(id: number): boolean {
    this.ensureInitialized();
    return this.emergencyContactService!.deleteEmergencyContact(id);
  }

  /**
   * Delete all emergency contacts for a patient
   */
  deleteEmergencyContactsByPatientId(patientId: number): boolean {
    this.ensureInitialized();
    return this.emergencyContactService!.deleteEmergencyContactsByPatientId(patientId);
  }

  // ==================== Legal Tutor Operations ====================

  /**
   * Create a new legal tutor
   */
  createLegalTutor(tutorData: LegalTutorCreateInput): LegalTutor {
    this.ensureInitialized();
    return this.legalTutorService!.createLegalTutor(tutorData);
  }

  /**
   * Get legal tutor by ID
   */
  getLegalTutorById(id: number): LegalTutor | undefined {
    this.ensureInitialized();
    return this.legalTutorService!.getLegalTutorById(id);
  }

  /**
   * Get all legal tutors for a patient
   */
  getLegalTutorsByPatientId(patientId: number): LegalTutor[] {
    this.ensureInitialized();
    return this.legalTutorService!.getLegalTutorsByPatientId(patientId);
  }

  /**
   * Update legal tutor
   */
  updateLegalTutor(tutorData: LegalTutorUpdateInput): LegalTutor {
    this.ensureInitialized();
    return this.legalTutorService!.updateLegalTutor(tutorData);
  }

  /**
   * Delete legal tutor
   */
  deleteLegalTutor(id: number): boolean {
    this.ensureInitialized();
    return this.legalTutorService!.deleteLegalTutor(id);
  }

  /**
   * Delete all legal tutors for a patient
   */
  deleteLegalTutorsByPatientId(patientId: number): boolean {
    this.ensureInitialized();
    return this.legalTutorService!.deleteLegalTutorsByPatientId(patientId);
  }

  // ==================== Utility Methods ====================

  /**
   * Get the underlying database instance
   * Use sparingly - prefer using service methods
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.driver = null;
      this.patientRepository = null;
      this.noteRepository = null;
      this.emergencyContactRepository = null;
      this.legalTutorRepository = null;
      this.patientService = null;
      this.noteService = null;
      this.emergencyContactService = null;
      this.legalTutorService = null;
      this.initialized = false;
      console.log('Database closed successfully');
    }
  }

  /**
   * Ensure database is initialized before operations
   */
  private ensureInitialized(): void {
    if (
      !this.initialized ||
      !this.patientService ||
      !this.noteService ||
      !this.emergencyContactService ||
      !this.legalTutorService
    ) {
      throw new Error('Database service not initialized. Call initialize() first.');
    }
  }
}
