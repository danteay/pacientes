import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { DatabaseService } from './database/database-service';
import { PatientCreateInput, PatientUpdateInput, PatientStatus } from '../types/patient';
import { NoteCreateInput, NoteUpdateInput } from '../types/note';
import {
  EmergencyContactCreateInput,
  EmergencyContactUpdateInput,
} from '../types/emergency-contact';
import { BackupService, ImportProgress } from './services/backup';

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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIpcHandlers(): void {
  // Create patient
  ipcMain.handle('patient:create', async (_event, patientData: PatientCreateInput) => {
    try {
      return { success: true, data: dbService.createPatient(patientData) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get all patients
  ipcMain.handle('patient:getAll', async () => {
    try {
      return { success: true, data: dbService.getAllPatients() };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get patient by ID
  ipcMain.handle('patient:getById', async (_event, id: number) => {
    try {
      const patient = dbService.getPatientById(id);
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
      const patient = dbService.updatePatient(patientData);
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
      const success = dbService.deletePatient(id);
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
      return { success: true, data: dbService.searchPatients(searchTerm, status) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Note handlers
  // Create note
  ipcMain.handle('note:create', async (_event, noteData: NoteCreateInput) => {
    try {
      return { success: true, data: dbService.createNote(noteData) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get notes by patient ID
  ipcMain.handle('note:getByPatientId', async (_event, patientId: number) => {
    try {
      return { success: true, data: dbService.getNotesByPatientId(patientId) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get note by ID
  ipcMain.handle('note:getById', async (_event, id: number) => {
    try {
      const note = dbService.getNoteById(id);
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
      const note = dbService.updateNote(noteData);
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
      const success = dbService.deleteNote(id);
      if (!success) {
        return { success: false, error: 'Note not found' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Emergency Contact handlers
  // Create emergency contact
  ipcMain.handle(
    'emergencyContact:create',
    async (_event, contactData: EmergencyContactCreateInput) => {
      try {
        const contact = dbService.createEmergencyContact(contactData);
        return { success: true, data: contact };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }
  );

  // Get emergency contacts by patient ID
  ipcMain.handle('emergencyContact:getByPatientId', async (_event, patientId: number) => {
    try {
      const contacts = dbService.getEmergencyContactsByPatientId(patientId);
      return { success: true, data: contacts };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get emergency contact by ID
  ipcMain.handle('emergencyContact:getById', async (_event, id: number) => {
    try {
      const contact = dbService.getEmergencyContactById(id);
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
        const contact = dbService.updateEmergencyContact(contactData);
        return { success: true, data: contact };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }
  );

  // Delete emergency contact
  ipcMain.handle('emergencyContact:delete', async (_event, id: number) => {
    try {
      const success = dbService.deleteEmergencyContact(id);
      if (!success) {
        return { success: false, error: 'Emergency contact not found' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Export database
  ipcMain.handle('backup:export', async () => {
    try {
      const result = await dialog.showSaveDialog(mainWindow!, {
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
      const result = await dialog.showOpenDialog(mainWindow!, {
        title: 'Import Database',
        filters: [
          { name: 'Compressed JSON', extensions: ['json.gz', 'gz'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return { success: false, error: 'Import cancelled' };
      }

      return await backupService.importDatabase(result.filePaths[0], (progress: ImportProgress) => {
        // Send progress updates to renderer
        mainWindow?.webContents.send('backup:import-progress', progress);
      });
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
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
