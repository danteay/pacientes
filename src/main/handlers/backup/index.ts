import { ipcMain, dialog, BrowserWindow } from 'electron';
import { BackupService, ImportProgress } from '../../infrastructure/backup/backup-service';

/**
 * Backup IPC Handlers
 *
 * Handles all IPC communication for backup operations:
 * - Export database
 * - Import database
 */
export function setupBackupHandlers(
  backupService: BackupService,
  getMainWindow: () => BrowserWindow | null
): void {
  // Export database
  ipcMain.handle('backup:export', async () => {
    try {
      const mainWindow = getMainWindow();
      if (!mainWindow) {
        return { success: false, error: 'Main window not available' };
      }

      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Database',
        defaultPath: `pacientes-backup-${new Date().toISOString().split('T')[0]}.json.gz`,
        filters: [{ name: 'Compressed JSON', extensions: ['json.gz', 'gz'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation'],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export cancelled' };
      }

      return await backupService.exportDatabase(result.filePath);
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Import database
  ipcMain.handle('backup:import', async () => {
    try {
      const mainWindow = getMainWindow();
      if (!mainWindow) {
        return { success: false, error: 'Main window not available' };
      }

      if (process.env.DEBUG === 'true') {
        console.log('[DEBUG] Starting backup import dialog');
      }

      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Database',
        filters: [
          { name: 'Compressed JSON', extensions: ['json.gz', 'gz'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        if (process.env.DEBUG === 'true') {
          console.log('[DEBUG] Import cancelled by user');
        }
        return { success: false, error: 'Import cancelled' };
      }

      if (process.env.DEBUG === 'true') {
        console.log('[DEBUG] Importing from:', result.filePaths[0]);
      }

      const importResult = await backupService.importDatabase(
        result.filePaths[0],
        (progress: ImportProgress) => {
          // Send progress updates to renderer
          mainWindow?.webContents.send('backup:import-progress', progress);
          if (process.env.DEBUG === 'true') {
            console.log('[DEBUG] Import progress:', progress);
          }
        }
      );

      if (process.env.DEBUG === 'true') {
        console.log('[DEBUG] Import result:', importResult);
      }

      // Map stats to data to match ApiResponse structure
      if (importResult.success && importResult.stats) {
        return { success: true, data: importResult.stats };
      }

      return importResult;
    } catch (error) {
      if (process.env.DEBUG === 'true') {
        console.error('[DEBUG] Import error:', error);
      }
      return { success: false, error: (error as Error).message };
    }
  });
}
