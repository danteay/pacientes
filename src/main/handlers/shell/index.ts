import { ipcMain, shell } from 'electron';

/**
 * Shell IPC Handlers
 *
 * Handles system shell operations like opening external URLs
 */
export function setupShellHandlers(): void {
  // Open external URL in system's default browser
  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
