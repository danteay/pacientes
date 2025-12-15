import { ipcMain } from 'electron';
import { DatabaseService } from '../../database/database-service';
import { NoteCreateInput, NoteUpdateInput } from '../../../types/note';

/**
 * Note IPC Handlers
 *
 * Handles all IPC communication for note operations:
 * - Create note (via use case - includes patient first appointment logic)
 * - Get notes by patient ID
 * - Get note by ID
 * - Update note
 * - Delete note
 */
export function setupNoteHandlers(dbService: DatabaseService): void {
  const noteService = dbService.getNoteService();
  const createNoteUseCase = dbService.getCreateNoteUseCase();

  // Create note (uses use case for cross-domain logic)
  ipcMain.handle('note:create', async (_event, noteData: NoteCreateInput) => {
    try {
      return { success: true, data: createNoteUseCase.execute(noteData) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get notes by patient ID
  ipcMain.handle('note:getByPatientId', async (_event, patientId: number) => {
    try {
      return { success: true, data: noteService.getNotesByPatientId(patientId) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get note by ID
  ipcMain.handle('note:getById', async (_event, id: number) => {
    try {
      const note = noteService.getNoteById(id);
      if (!note) {
        return { success: false, error: 'Note not found' };
      }
      return { success: true, data: note };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Update note
  ipcMain.handle('note:update', async (_event, noteData: NoteUpdateInput) => {
    try {
      const note = noteService.updateNote(noteData);
      if (!note) {
        return { success: false, error: 'Note not found' };
      }
      return { success: true, data: note };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Delete note
  ipcMain.handle('note:delete', async (_event, id: number) => {
    try {
      const success = noteService.deleteNote(id);
      if (!success) {
        return { success: false, error: 'Note not found' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
