import { injectable } from 'tsyringe';
import { NoteService } from '../service/note-service';
import { PatientService } from '../../patient/service/patient-service';

/**
 * Get Notes Statistics Use Case
 *
 * Responsible for:
 * - Calculating statistics that involve multiple domains
 * - Coordinating between Note and Patient services
 */
@injectable()
export class GetNotesStatisticsUseCase {
  private noteService: NoteService;
  private patientService: PatientService;

  constructor(noteService: NoteService, patientService: PatientService) {
    this.noteService = noteService;
    this.patientService = patientService;
  }

  /**
   * Execute the use case: Get notes statistics including cross-domain calculations
   */
  execute(): {
    totalNotes: number;
    averageNotesPerPatient: number;
  } {
    const allPatients = this.patientService.getAllPatients();
    return this.noteService.getNotesStatistics(allPatients.length);
  }
}
