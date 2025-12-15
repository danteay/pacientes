import Database from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';
import { configureContainer, getContainer } from '../infrastructure/ioc/container';
import { PatientService } from '../domains/patient/service/patient-service';
import { NoteService } from '../domains/note/service/note-service';
import { EmergencyContactService } from '../domains/emergency-contact/service/emergency-contact-service';
import { LegalTutorService } from '../domains/legal-tutor/service/legal-tutor-service';
import { CreateNoteUseCase } from '../domains/note/usecases/create-note-usecase';
import { GetNotesStatisticsUseCase } from '../domains/note/usecases/get-notes-statistics-usecase';
import { runMigrations } from './migrations/umzug';

/**
 * Database Service (Service Factory with IoC)
 *
 * Responsibilities:
 * - Initialize the database connection
 * - Run database migrations
 * - Configure IoC container with database instance
 * - Provide access to domain services via getter methods (resolved from IoC container)
 * - Manage database lifecycle (initialization, closing)
 *
 * This is NOT a facade - it doesn't expose domain operations.
 * Instead, it's a factory that provides access to domain services resolved from the IoC container.
 *
 * Usage:
 *   const patientService = dbService.getPatientService();
 *   patientService.createPatient(data);
 */
export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;
  private initialized: boolean = false;

  // Services resolved from IoC container
  private patientService: PatientService | null = null;
  private noteService: NoteService | null = null;
  private emergencyContactService: EmergencyContactService | null = null;
  private legalTutorService: LegalTutorService | null = null;

  // Use Cases resolved from IoC container
  private createNoteUseCase: CreateNoteUseCase | null = null;
  private getNotesStatisticsUseCase: GetNotesStatisticsUseCase | null = null;

  constructor() {
    // Use user's home directory for the database file
    const homeDir = os.homedir();
    this.dbPath = path.join(homeDir, 'pacientes_app.db');
    console.log(`Database path: ${this.dbPath}`);
  }

  /**
   * Initialize database and all layers using IoC container
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('Initializing database with better-sqlite3...');
    this.db = new Database(this.dbPath, { verbose: console.log });

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Run migrations
    await this.runMigrations();

    // Configure IoC container with database instance
    console.log('Configuring IoC container...');
    configureContainer(this.db);
    const container = getContainer();

    // Resolve services from IoC container
    this.patientService = container.resolve(PatientService);
    this.noteService = container.resolve(NoteService);
    this.emergencyContactService = container.resolve(EmergencyContactService);
    this.legalTutorService = container.resolve(LegalTutorService);

    // Resolve use cases from IoC container
    this.createNoteUseCase = container.resolve(CreateNoteUseCase);
    this.getNotesStatisticsUseCase = container.resolve(GetNotesStatisticsUseCase);

    this.initialized = true;
    console.log('Database initialized successfully with IoC container');
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

  // ==================== Service Getters ====================

  /**
   * Get patient service
   */
  getPatientService(): PatientService {
    this.ensureInitialized();
    return this.patientService!;
  }

  /**
   * Get note service
   */
  getNoteService(): NoteService {
    this.ensureInitialized();
    return this.noteService!;
  }

  /**
   * Get emergency contact service
   */
  getEmergencyContactService(): EmergencyContactService {
    this.ensureInitialized();
    return this.emergencyContactService!;
  }

  /**
   * Get legal tutor service
   */
  getLegalTutorService(): LegalTutorService {
    this.ensureInitialized();
    return this.legalTutorService!;
  }

  // ==================== Use Case Getters ====================

  /**
   * Get create note use case
   */
  getCreateNoteUseCase(): CreateNoteUseCase {
    this.ensureInitialized();
    return this.createNoteUseCase!;
  }

  /**
   * Get notes statistics use case
   */
  getGetNotesStatisticsUseCase(): GetNotesStatisticsUseCase {
    this.ensureInitialized();
    return this.getNotesStatisticsUseCase!;
  }

  // ==================== Utility Methods ====================

  /**
   * Get the underlying database instance
   * Used by infrastructure services like BackupService
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Close database connection and clear IoC container
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.patientService = null;
      this.noteService = null;
      this.emergencyContactService = null;
      this.legalTutorService = null;
      this.createNoteUseCase = null;
      this.getNotesStatisticsUseCase = null;
      this.initialized = false;

      // Clear IoC container instances
      const container = getContainer();
      container.clearInstances();

      console.log('Database closed successfully and IoC container cleared');
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
      !this.legalTutorService ||
      !this.createNoteUseCase ||
      !this.getNotesStatisticsUseCase
    ) {
      throw new Error('Database service not initialized. Call initialize() first.');
    }
  }
}
