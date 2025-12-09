import { useState, useCallback } from 'react';
import { ipcClient } from '../api';
import { unwrapApiResponse } from '../api/types';
import { Patient, PatientCreateInput, PatientUpdateInput } from '../../types/patient';

/**
 * usePatients Hook
 *
 * Custom hook for patient-related operations
 * Handles state management, loading states, and error handling
 */

export interface UsePatientsReturn {
  patients: Patient[];
  loading: boolean;
  error: Error | null;
  loadPatients: () => Promise<void>;
  searchPatients: (searchTerm: string, status?: string) => Promise<void>;
  createPatient: (patientData: PatientCreateInput) => Promise<Patient>;
  updatePatient: (patientData: PatientUpdateInput) => Promise<Patient>;
  deletePatient: (id: number) => Promise<void>;
  getPatientById: (id: number) => Promise<Patient | undefined>;
}

export function usePatients(): UsePatientsReturn {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load all patients
   */
  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcClient.getAllPatients();
      const data = unwrapApiResponse(response);
      setPatients(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load patients');
      setError(error);
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search patients with optional status filter
   */
  const searchPatients = useCallback(async (searchTerm: string, status?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = searchTerm
        ? await ipcClient.searchPatients(searchTerm, status)
        : await ipcClient.getAllPatients();

      const data = unwrapApiResponse(response);
      setPatients(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to search patients');
      setError(error);
      console.error('Error searching patients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new patient
   */
  const createPatient = useCallback(async (patientData: PatientCreateInput): Promise<Patient> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcClient.createPatient(patientData);
      const newPatient = unwrapApiResponse(response);

      // Add to local state
      setPatients((prev) => [newPatient, ...prev]);

      return newPatient;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create patient');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a patient
   */
  const updatePatient = useCallback(async (patientData: PatientUpdateInput): Promise<Patient> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcClient.updatePatient(patientData);
      const updatedPatient = unwrapApiResponse(response);

      // Update local state
      setPatients((prev) =>
        prev.map((patient) => (patient.id === updatedPatient.id ? updatedPatient : patient))
      );

      return updatedPatient;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update patient');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a patient
   */
  const deletePatient = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcClient.deletePatient(id);
      unwrapApiResponse(response);

      // Remove from local state
      setPatients((prev) => prev.filter((patient) => patient.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete patient');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get patient by ID
   */
  const getPatientById = useCallback(async (id: number): Promise<Patient | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcClient.getPatientById(id);
      return unwrapApiResponse(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get patient');
      setError(error);
      console.error('Error getting patient:', error);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    patients,
    loading,
    error,
    loadPatients,
    searchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById,
  };
}
