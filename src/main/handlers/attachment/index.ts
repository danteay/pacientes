import { ipcMain } from 'electron';
import { DatabaseService } from '../../database/database-service';
import { AttachmentCreateInput, AttachmentUpdateInput } from '../../../types/attachment';

/**
 * Attachment IPC Handlers
 *
 * Handles all IPC communication for attachment operations:
 * - Create attachment
 * - Get attachments by patient ID
 * - Get attachment by ID
 * - Update attachment
 * - Delete attachment
 */
export function setupAttachmentHandlers(dbService: DatabaseService): void {
  const attachmentService = dbService.getAttachmentService();

  // Create attachment
  ipcMain.handle('attachment:create', async (_event, attachmentData: AttachmentCreateInput) => {
    try {
      const attachment = attachmentService.createAttachment(attachmentData);
      return { success: true, data: attachment };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get attachments by patient ID
  ipcMain.handle('attachment:getByPatientId', async (_event, patientId: number) => {
    try {
      const attachments = attachmentService.getAttachmentsByPatientId(patientId);
      return { success: true, data: attachments };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get attachment by ID
  ipcMain.handle('attachment:getById', async (_event, id: number) => {
    try {
      const attachment = attachmentService.getAttachmentById(id);
      if (!attachment) {
        return { success: false, error: 'Attachment not found' };
      }
      return { success: true, data: attachment };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Update attachment
  ipcMain.handle('attachment:update', async (_event, attachmentData: AttachmentUpdateInput) => {
    try {
      const attachment = attachmentService.updateAttachment(attachmentData);
      return { success: true, data: attachment };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Delete attachment
  ipcMain.handle('attachment:delete', async (_event, id: number) => {
    try {
      const success = attachmentService.deleteAttachment(id);
      if (!success) {
        return { success: false, error: 'Attachment not found' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
