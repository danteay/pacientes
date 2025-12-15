import { injectable } from 'tsyringe';
import { NoteService } from '../service/note-service';
import { PatientService } from '../../patient/service/patient-service';
import { Note, NoteCreateInput } from '../../../../types/note';

/**
 * Create Note Use Case
 *
 * Responsible for:
 * - Complex domain operations that involve multiple services
 * - Coordinating between Note and Patient domains
 * - Business rule: Update patient's first appointment date when creating first note
 */
@injectable()
export class CreateNoteUseCase {
  private noteService: NoteService;
  private patientService: PatientService;

  constructor(noteService: NoteService, patientService: PatientService) {
    this.noteService = noteService;
    this.patientService = patientService;
  }

  /**
   * Execute the use case: Create a note and update patient's first appointment date if needed
   */
  execute(noteData: NoteCreateInput): Note {
    // Business rule: Check if patient exists
    const patient = this.patientService.getPatientById(noteData.patientId);
    if (!patient) {
      throw new Error(`Patient with ID ${noteData.patientId} not found`);
    }

    // Create the note using the note service
    const createdNote = this.noteService.createNote(noteData);

    // Business rule: Set first appointment date if not already set
    this.patientService.setFirstAppointmentDateIfNotSet(noteData.patientId);

    return createdNote;
  }
}
