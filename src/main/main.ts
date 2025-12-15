import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { DatabaseService } from './database/database-service';
import { BackupService } from './infrastructure/backup/backup-service';
import { setupPatientHandlers } from './handlers/patient';
import { setupNoteHandlers } from './handlers/note';
import { setupEmergencyContactHandlers } from './handlers/emergency-contact';
import { setupLegalTutorHandlers } from './handlers/legal-tutor';
import { setupBackupHandlers } from './handlers/backup';

let mainWindow: BrowserWindow | null = null;
let dbService: DatabaseService;
let backupService: BackupService;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load from Vite dev server in development, or built files in production
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools only in development mode
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Open DevTools if DEBUG environment variable is set
  if (process.env.DEBUG === 'true') {
    mainWindow.webContents.openDevTools();
    console.log('[DEBUG] Debug mode enabled - DevTools opened');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Setup all IPC handlers by domain
 */
function setupIpcHandlers(): void {
  // Setup handlers for each domain
  setupPatientHandlers(dbService);
  setupNoteHandlers(dbService);
  setupEmergencyContactHandlers(dbService);
  setupLegalTutorHandlers(dbService);
  setupBackupHandlers(backupService, () => mainWindow);
}

app.on('ready', async () => {
  dbService = new DatabaseService();
  await dbService.initialize();
  backupService = new BackupService(dbService.getDatabase());
  setupIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (dbService) {
    dbService.close();
  }
});
