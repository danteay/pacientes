import { NoteRepository } from '../database/repositories/note-repository';
import { PatientRepository } from '../database/repositories/patient-repository';
import { Note, NoteCreateInput, NoteUpdateInput } from '../../types/note';

/**
 * Note Service (Appointment Service)
 *
 * Responsible for:
 * - Business logic related to notes/appointments
 * - Validation rules
 * - Coordination between note and patient repositories
 * - Business-level error handling
 */
export class NoteService {
  private noteRepository: NoteRepository;
  private patientRepository: PatientRepository;

  constructor(noteRepository: NoteRepository, patientRepository: PatientRepository) {
    this.noteRepository = noteRepository;
    this.patientRepository = patientRepository;
  }

  /**
   * Create a new note with validation
   * Business rule: Set patient's first appointment date if not set
   */
  createNote(noteData: NoteCreateInput): Note {
    // Validate note data
    this.validateNoteData(noteData);

    // Business rule: Check if patient exists
    const patient = this.patientRepository.findById(noteData.patientId);
    if (!patient) {
      throw new Error(`Patient with ID ${noteData.patientId} not found`);
    }

    // Create the note
    const createdNote = this.noteRepository.create({
      ...noteData,
      title: noteData.title.trim(),
      content: noteData.content.trim(),
    });

    // Business rule: Set first appointment date if not already set
    if (!patient.firstAppointmentDate) {
      const today = new Date().toISOString().split('T')[0];
      this.patientRepository.updateFirstAppointmentDate(noteData.patientId, today);
    }

    return createdNote;
  }

  /**
   * Get note by ID
   */
  getNoteById(id: number): Note | undefined {
    if (id <= 0) {
      throw new Error('Invalid note ID');
    }

    return this.noteRepository.findById(id);
  }

  /**
   * Get all notes for a patient
   */
  getNotesByPatientId(patientId: number): Note[] {
    if (patientId <= 0) {
      throw new Error('Invalid patient ID');
    }

    // Business rule: Check if patient exists
    const patient = this.patientRepository.findById(patientId);
    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }

    return this.noteRepository.findByPatientId(patientId);
  }

  /**
   * Get all notes
   */
  getAllNotes(): Note[] {
    return this.noteRepository.findAll();
  }

  /**
   * Update note with validation
   */
  updateNote(noteData: NoteUpdateInput): Note | undefined {
    if (noteData.id <= 0) {
      throw new Error('Invalid note ID');
    }

    // Check if note exists
    const existingNote = this.noteRepository.findById(noteData.id);
    if (!existingNote) {
      throw new Error(`Note with ID ${noteData.id} not found`);
    }

    // Validate updated fields
    if (noteData.title !== undefined) {
      if (!noteData.title || noteData.title.trim() === '') {
        throw new Error('Note title cannot be empty');
      }
      noteData.title = noteData.title.trim();
    }

    if (noteData.content !== undefined) {
      if (!noteData.content || noteData.content.trim() === '') {
        throw new Error('Note content cannot be empty');
      }
      noteData.content = noteData.content.trim();
    }

    return this.noteRepository.update(noteData);
  }

  /**
   * Delete note
   */
  deleteNote(id: number): boolean {
    if (id <= 0) {
      throw new Error('Invalid note ID');
    }

    const exists = this.noteRepository.exists(id);
    if (!exists) {
      throw new Error(`Note with ID ${id} not found`);
    }

    return this.noteRepository.delete(id);
  }

  /**
   * Delete all notes for a patient
   */
  deleteNotesByPatientId(patientId: number): number {
    if (patientId <= 0) {
      throw new Error('Invalid patient ID');
    }

    return this.noteRepository.deleteByPatientId(patientId);
  }

  /**
   * Search notes by title or content
   */
  searchNotes(searchTerm: string): Note[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return this.getAllNotes();
    }

    return this.noteRepository.search(searchTerm.trim());
  }

  /**
   * Get note count for a patient
   */
  getNoteCountForPatient(patientId: number): number {
    if (patientId <= 0) {
      throw new Error('Invalid patient ID');
    }

    return this.noteRepository.countByPatientId(patientId);
  }

  /**
   * Get notes statistics
   */
  getNotesStatistics(): {
    totalNotes: number;
    averageNotesPerPatient: number;
  } {
    const allNotes = this.noteRepository.findAll();
    const allPatients = this.patientRepository.findAll();

    const averageNotesPerPatient =
      allPatients.length > 0 ? allNotes.length / allPatients.length : 0;

    return {
      totalNotes: allNotes.length,
      averageNotesPerPatient: Math.round(averageNotesPerPatient * 100) / 100,
    };
  }

  /**
   * Validate note data (business rules)
   */
  private validateNoteData(noteData: NoteCreateInput): void {
    // Validate patient ID
    if (!noteData.patientId || noteData.patientId <= 0) {
      throw new Error('Valid patient ID is required');
    }

    // Validate title
    if (!noteData.title || noteData.title.trim() === '') {
      throw new Error('Note title is required');
    }

    if (noteData.title.length > 500) {
      throw new Error('Note title must be less than 500 characters');
    }

    // Validate content
    if (!noteData.content || noteData.content.trim() === '') {
      throw new Error('Note content is required');
    }

    if (noteData.content.length > 50000) {
      throw new Error('Note content must be less than 50,000 characters');
    }
  }
}
