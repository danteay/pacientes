import { ipcMain } from 'electron';
import { DatabaseService } from '../../database/database-service';
import { LegalTutorCreateInput, LegalTutorUpdateInput } from '../../../types/legal-tutor';

/**
 * Legal Tutor IPC Handlers
 *
 * Handles all IPC communication for legal tutor operations:
 * - Create legal tutor
 * - Get legal tutors by patient ID
 * - Get legal tutor by ID
 * - Update legal tutor
 * - Delete legal tutor
 */
export function setupLegalTutorHandlers(dbService: DatabaseService): void {
  const legalTutorService = dbService.getLegalTutorService();

  // Create legal tutor
  ipcMain.handle('legalTutor:create', async (_event, tutorData: LegalTutorCreateInput) => {
    try {
      const tutor = legalTutorService.createLegalTutor(tutorData);
      return { success: true, data: tutor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get legal tutors by patient ID
  ipcMain.handle('legalTutor:getByPatientId', async (_event, patientId: number) => {
    try {
      const tutors = legalTutorService.getLegalTutorsByPatientId(patientId);
      return { success: true, data: tutors };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get legal tutor by ID
  ipcMain.handle('legalTutor:getById', async (_event, id: number) => {
    try {
      const tutor = legalTutorService.getLegalTutorById(id);
      if (!tutor) {
        return { success: false, error: 'Legal tutor not found' };
      }
      return { success: true, data: tutor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Update legal tutor
  ipcMain.handle('legalTutor:update', async (_event, tutorData: LegalTutorUpdateInput) => {
    try {
      const tutor = legalTutorService.updateLegalTutor(tutorData);
      return { success: true, data: tutor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Delete legal tutor
  ipcMain.handle('legalTutor:delete', async (_event, id: number) => {
    try {
      const success = legalTutorService.deleteLegalTutor(id);
      if (!success) {
        return { success: false, error: 'Legal tutor not found' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
