import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { DatabaseService } from './database/database';
import { PatientCreateInput, PatientUpdateInput } from '../types/patient';
import { NoteCreateInput, NoteUpdateInput } from '../types/note';

let mainWindow: BrowserWindow | null = null;
let dbService: DatabaseService;

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

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools - always open for debugging
  mainWindow.webContents.openDevTools();

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
  ipcMain.handle('patient:search', async (_event, searchTerm: string) => {
    try {
      return { success: true, data: dbService.searchPatients(searchTerm) };
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
}

app.on('ready', async () => {
  dbService = new DatabaseService();
  await dbService.initialize();
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
