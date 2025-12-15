import { ipcMain } from 'electron';
import { DatabaseService } from '../../database/database-service';
import { PatientCreateInput, PatientUpdateInput, PatientStatus } from '../../../types/patient';

/**
 * Patient IPC Handlers
 *
 * Handles all IPC communication for patient operations:
 * - Create patient
 * - Get all patients
 * - Get patient by ID
 * - Update patient
 * - Delete patient
 * - Search patients
 */
export function setupPatientHandlers(dbService: DatabaseService): void {
  const patientService = dbService.getPatientService();

  // Create patient
  ipcMain.handle('patient:create', async (_event, patientData: PatientCreateInput) => {
    try {
      return { success: true, data: patientService.createPatient(patientData) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get all patients
  ipcMain.handle('patient:getAll', async () => {
    try {
      return { success: true, data: patientService.getAllPatients() };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get patient by ID
  ipcMain.handle('patient:getById', async (_event, id: number) => {
    try {
      const patient = patientService.getPatientById(id);
      if (!patient) {
        return { success: false, error: 'Patient not found' };
      }
      return { success: true, data: patient };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Update patient
  ipcMain.handle('patient:update', async (_event, patientData: PatientUpdateInput) => {
    try {
      const patient = patientService.updatePatient(patientData);
      if (!patient) {
        return { success: false, error: 'Patient not found' };
      }
      return { success: true, data: patient };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Delete patient
  ipcMain.handle('patient:delete', async (_event, id: number) => {
    try {
      const success = patientService.deletePatient(id);
      if (!success) {
        return { success: false, error: 'Patient not found' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Search patients
  ipcMain.handle('patient:search', async (_event, searchTerm: string, status?: PatientStatus) => {
    try {
      return { success: true, data: patientService.searchPatients(searchTerm, status) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
