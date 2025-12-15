import { ApiResponse } from './types';
import { Patient, PatientCreateInput, PatientUpdateInput } from '../../types/patient';
import { Note, NoteCreateInput, NoteUpdateInput } from '../../types/note';
import {
  EmergencyContact,
  EmergencyContactCreateInput,
  EmergencyContactUpdateInput,
} from '../../types/emergency-contact';

/**
 * IPC Client
 *
 * Abstraction layer over window.api for type-safe IPC communication
 * This layer handles:
 * - Type safety for all IPC calls
 * - Centralized error handling
 * - Request/response transformation
 */

declare global {
  interface Window {
    api: {
      patient: {
        create: (patientData: PatientCreateInput) => Promise<ApiResponse<Patient>>;
        getAll: () => Promise<ApiResponse<Patient[]>>;
        getById: (id: number) => Promise<ApiResponse<Patient>>;
        update: (patientData: PatientUpdateInput) => Promise<ApiResponse<Patient>>;
        delete: (id: number) => Promise<ApiResponse>;
        search: (searchTerm: string, status?: string) => Promise<ApiResponse<Patient[]>>;
      };
      note: {
        create: (noteData: NoteCreateInput) => Promise<ApiResponse<Note>>;
        getByPatientId: (patientId: number) => Promise<ApiResponse<Note[]>>;
        getById: (id: number) => Promise<ApiResponse<Note>>;
        update: (noteData: NoteUpdateInput) => Promise<ApiResponse<Note>>;
        delete: (id: number) => Promise<ApiResponse>;
      };
      emergencyContact: {
        create: (
          contactData: EmergencyContactCreateInput
        ) => Promise<ApiResponse<EmergencyContact>>;
        getByPatientId: (patientId: number) => Promise<ApiResponse<EmergencyContact[]>>;
        getById: (id: number) => Promise<ApiResponse<EmergencyContact>>;
        update: (
          contactData: EmergencyContactUpdateInput
        ) => Promise<ApiResponse<EmergencyContact>>;
        delete: (id: number) => Promise<ApiResponse>;
      };
      backup: {
        export: () => Promise<ApiResponse>;
        import: () => Promise<
          ApiResponse<{ patients: number; notes: number; emergencyContacts: number }>
        >;
        onImportProgress: (callback: (progress: unknown) => void) => void;
        removeImportProgressListener: () => void;
      };
    };
  }
}

/**
 * IPC Client class for centralized API communication
 */
export class IpcClient {
  // ==================== Patient API ====================

  async createPatient(patientData: PatientCreateInput): Promise<ApiResponse<Patient>> {
    return window.api.patient.create(patientData);
  }

  async getAllPatients(): Promise<ApiResponse<Patient[]>> {
    return window.api.patient.getAll();
  }

  async getPatientById(id: number): Promise<ApiResponse<Patient>> {
    return window.api.patient.getById(id);
  }

  async updatePatient(patientData: PatientUpdateInput): Promise<ApiResponse<Patient>> {
    return window.api.patient.update(patientData);
  }

  async deletePatient(id: number): Promise<ApiResponse> {
    return window.api.patient.delete(id);
  }

  async searchPatients(searchTerm: string, status?: string): Promise<ApiResponse<Patient[]>> {
    return window.api.patient.search(searchTerm, status);
  }

  // ==================== Note API ====================

  async createNote(noteData: NoteCreateInput): Promise<ApiResponse<Note>> {
    return window.api.note.create(noteData);
  }

  async getNotesByPatientId(patientId: number): Promise<ApiResponse<Note[]>> {
    return window.api.note.getByPatientId(patientId);
  }

  async getNoteById(id: number): Promise<ApiResponse<Note>> {
    return window.api.note.getById(id);
  }

  async updateNote(noteData: NoteUpdateInput): Promise<ApiResponse<Note>> {
    return window.api.note.update(noteData);
  }

  async deleteNote(id: number): Promise<ApiResponse> {
    return window.api.note.delete(id);
  }

  // ==================== Emergency Contact API ====================

  async createEmergencyContact(
    contactData: EmergencyContactCreateInput
  ): Promise<ApiResponse<EmergencyContact>> {
    return window.api.emergencyContact.create(contactData);
  }

  async getEmergencyContactsByPatientId(
    patientId: number
  ): Promise<ApiResponse<EmergencyContact[]>> {
    return window.api.emergencyContact.getByPatientId(patientId);
  }

  async getEmergencyContactById(id: number): Promise<ApiResponse<EmergencyContact>> {
    return window.api.emergencyContact.getById(id);
  }

  async updateEmergencyContact(
    contactData: EmergencyContactUpdateInput
  ): Promise<ApiResponse<EmergencyContact>> {
    return window.api.emergencyContact.update(contactData);
  }

  async deleteEmergencyContact(id: number): Promise<ApiResponse> {
    return window.api.emergencyContact.delete(id);
  }

  // ==================== Backup API ====================

  async exportBackup(): Promise<ApiResponse> {
    return window.api.backup.export();
  }

  async importBackup(): Promise<
    ApiResponse<{ patients: number; notes: number; emergencyContacts: number }>
  > {
    return window.api.backup.import();
  }

  onImportProgress(callback: (progress: unknown) => void): void {
    window.api.backup.onImportProgress(callback);
  }

  removeImportProgressListener(): void {
    window.api.backup.removeImportProgressListener();
  }
}

// Export singleton instance
export const ipcClient = new IpcClient();
