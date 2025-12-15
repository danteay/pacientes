import { ipcMain } from 'electron';
import { DatabaseService } from '../../database/database-service';
import {
  EmergencyContactCreateInput,
  EmergencyContactUpdateInput,
} from '../../../types/emergency-contact';

/**
 * Emergency Contact IPC Handlers
 *
 * Handles all IPC communication for emergency contact operations:
 * - Create emergency contact
 * - Get emergency contacts by patient ID
 * - Get emergency contact by ID
 * - Update emergency contact
 * - Delete emergency contact
 */
export function setupEmergencyContactHandlers(dbService: DatabaseService): void {
  const emergencyContactService = dbService.getEmergencyContactService();

  // Create emergency contact
  ipcMain.handle(
    'emergencyContact:create',
    async (_event, contactData: EmergencyContactCreateInput) => {
      try {
        const contact = emergencyContactService.createEmergencyContact(contactData);
        return { success: true, data: contact };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }
  );

  // Get emergency contacts by patient ID
  ipcMain.handle('emergencyContact:getByPatientId', async (_event, patientId: number) => {
    try {
      const contacts = emergencyContactService.getEmergencyContactsByPatientId(patientId);
      return { success: true, data: contacts };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get emergency contact by ID
  ipcMain.handle('emergencyContact:getById', async (_event, id: number) => {
    try {
      const contact = emergencyContactService.getEmergencyContactById(id);
      if (!contact) {
        return { success: false, error: 'Emergency contact not found' };
      }
      return { success: true, data: contact };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Update emergency contact
  ipcMain.handle(
    'emergencyContact:update',
    async (_event, contactData: EmergencyContactUpdateInput) => {
      try {
        const contact = emergencyContactService.updateEmergencyContact(contactData);
        return { success: true, data: contact };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }
  );

  // Delete emergency contact
  ipcMain.handle('emergencyContact:delete', async (_event, id: number) => {
    try {
      const success = emergencyContactService.deleteEmergencyContact(id);
      if (!success) {
        return { success: false, error: 'Emergency contact not found' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
