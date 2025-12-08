import { contextBridge, ipcRenderer } from 'electron';
import { Patient, PatientCreateInput, PatientUpdateInput } from '../types/patient';
import { Note, NoteCreateInput, NoteUpdateInput } from '../types/note';

// API response type
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  patient: {
    create: (patientData: PatientCreateInput): Promise<ApiResponse<Patient>> =>
      ipcRenderer.invoke('patient:create', patientData),

    getAll: (): Promise<ApiResponse<Patient[]>> => ipcRenderer.invoke('patient:getAll'),

    getById: (id: number): Promise<ApiResponse<Patient>> =>
      ipcRenderer.invoke('patient:getById', id),

    update: (patientData: PatientUpdateInput): Promise<ApiResponse<Patient>> =>
      ipcRenderer.invoke('patient:update', patientData),

    delete: (id: number): Promise<ApiResponse> => ipcRenderer.invoke('patient:delete', id),

    search: (searchTerm: string): Promise<ApiResponse<Patient[]>> =>
      ipcRenderer.invoke('patient:search', searchTerm),
  },

  note: {
    create: (noteData: NoteCreateInput): Promise<ApiResponse<Note>> =>
      ipcRenderer.invoke('note:create', noteData),

    getByPatientId: (patientId: number): Promise<ApiResponse<Note[]>> =>
      ipcRenderer.invoke('note:getByPatientId', patientId),

    getById: (id: number): Promise<ApiResponse<Note>> => ipcRenderer.invoke('note:getById', id),

    update: (noteData: NoteUpdateInput): Promise<ApiResponse<Note>> =>
      ipcRenderer.invoke('note:update', noteData),

    delete: (id: number): Promise<ApiResponse> => ipcRenderer.invoke('note:delete', id),
  },
});
