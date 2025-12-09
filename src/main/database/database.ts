import Database from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';
import { Patient, PatientCreateInput, PatientUpdateInput } from '../../types/patient';
import { Note, NoteCreateInput, NoteUpdateInput } from '../../types/note';
import { runMigrations } from './migrations/umzug';
import { Users } from '../services/users';
import { Appointments } from '../services/appointments';

export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;
  private initialized: boolean = false;

  public users!: Users;
  public appointments!: Appointments;

  constructor() {
    // Use user's home directory for the database file
    const homeDir = os.homedir();
    this.dbPath = path.join(homeDir, 'pacientes_app.db');
    console.log(`Database path: ${this.dbPath}`);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // better-sqlite3 creates the database file automatically if it doesn't exist
    console.log('Initializing database with better-sqlite3...');
    this.db = new Database(this.dbPath, { verbose: console.log });

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    await this.runMigrations();

    // Initialize services with the database instance
    this.users = new Users(this.db);
    this.appointments = new Appointments(this.db);

    this.initialized = true;
    console.log('Database initialized successfully');
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('Running database migrations...');

    await runMigrations(this.db);

    console.log('Database migrations completed');
  }

  // Patient operations - delegate to Users service
  createPatient(patientData: PatientCreateInput): Patient {
    return this.users.create(patientData);
  }

  getPatientById(id: number): Patient | undefined {
    return this.users.getById(id);
  }

  getAllPatients(): Patient[] {
    return this.users.getAll();
  }

  updatePatient(patientData: PatientUpdateInput): Patient | undefined {
    return this.users.update(patientData);
  }

  deletePatient(id: number): boolean {
    return this.users.delete(id);
  }

  searchPatients(searchTerm: string): Patient[] {
    return this.users.search(searchTerm);
  }

  // Note operations - delegate to Appointments service with firstAppointmentDate logic
  createNote(noteData: NoteCreateInput): Note {
    // Check if patient has firstAppointmentDate set
    const patient = this.users.getById(noteData.patientId);
    if (patient && !patient.firstAppointmentDate) {
      // Set firstAppointmentDate to current date
      const today = new Date().toISOString().split('T')[0];
      this.users.updateFirstAppointmentDate(noteData.patientId, today);
    }

    return this.appointments.create(noteData);
  }

  getNotesByPatientId(patientId: number): Note[] {
    return this.appointments.getByPatientId(patientId);
  }

  getNoteById(id: number): Note | undefined {
    return this.appointments.getById(id);
  }

  updateNote(noteData: NoteUpdateInput): Note | undefined {
    return this.appointments.update(noteData);
  }

  deleteNote(id: number): boolean {
    return this.appointments.delete(id);
  }

  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
