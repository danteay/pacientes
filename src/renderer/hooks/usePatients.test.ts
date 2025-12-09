import { renderHook, act } from '@testing-library/react';
import { usePatients } from './usePatients';
import { ipcClient } from '../api';
import { Patient, PatientStatus, Gender, MaritalStatus } from '../../types/patient';

jest.mock('../api', () => ({
  ipcClient: {
    getAllPatients: jest.fn(),
    searchPatients: jest.fn(),
    createPatient: jest.fn(),
    updatePatient: jest.fn(),
    deletePatient: jest.fn(),
    getPatientById: jest.fn(),
  },
}));

describe('usePatients Hook', () => {
  const mockPatient: Patient = {
    id: 1,
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    phoneNumber: '1234567890',
    birthDate: '1993-01-01',
    maritalStatus: 'single' as MaritalStatus,
    gender: 'male' as Gender,
    educationalLevel: 'Bachelor',
    profession: 'Engineer',
    livesWith: 'Alone',
    children: 0,
    status: PatientStatus.ACTIVE,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadPatients', () => {
    it('should load all patients successfully', async () => {
      const patients = [mockPatient];
      (ipcClient.getAllPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: patients,
      });

      const { result } = renderHook(() => usePatients());

      expect(result.current.loading).toBe(false);
      expect(result.current.patients).toEqual([]);

      await act(async () => {
        await result.current.loadPatients();
      });

      expect(result.current.patients).toEqual(patients);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      (ipcClient.getAllPatients as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: [] }), 100))
      );

      const { result } = renderHook(() => usePatients());

      let promise: Promise<void>;
      act(() => {
        promise = result.current.loadPatients();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await promise!;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle error when loading fails', async () => {
      const errorMessage = 'Failed to load patients';
      (ipcClient.getAllPatients as jest.Mock).mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.loadPatients();
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.patients).toEqual([]);
    });
  });

  describe('searchPatients', () => {
    it('should search patients with search term', async () => {
      const patients = [mockPatient];
      (ipcClient.searchPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: patients,
      });

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.searchPatients('john');
      });

      expect(ipcClient.searchPatients).toHaveBeenCalledWith('john', undefined);
      expect(result.current.patients).toEqual(patients);
    });

    it('should search patients with status filter', async () => {
      const patients = [mockPatient];
      (ipcClient.searchPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: patients,
      });

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.searchPatients('john', 'active');
      });

      expect(ipcClient.searchPatients).toHaveBeenCalledWith('john', 'active');
      expect(result.current.patients).toEqual(patients);
    });

    it('should get all patients when search term is empty', async () => {
      const patients = [mockPatient];
      (ipcClient.getAllPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: patients,
      });

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.searchPatients('');
      });

      expect(ipcClient.getAllPatients).toHaveBeenCalled();
      expect(ipcClient.searchPatients).not.toHaveBeenCalled();
      expect(result.current.patients).toEqual(patients);
    });

    it('should handle search error', async () => {
      const errorMessage = 'Search failed';
      (ipcClient.searchPatients as jest.Mock).mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.searchPatients('john');
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe(errorMessage);
    });
  });

  describe('createPatient', () => {
    it('should create patient and add to list', async () => {
      const newPatient = { ...mockPatient, id: 2, name: 'Jane Doe' };
      (ipcClient.createPatient as jest.Mock).mockResolvedValue({
        success: true,
        data: newPatient,
      });

      const { result } = renderHook(() => usePatients());

      // Set initial patients
      (ipcClient.getAllPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockPatient],
      });

      await act(async () => {
        await result.current.loadPatients();
      });

      expect(result.current.patients).toHaveLength(1);

      // Create new patient
      await act(async () => {
        await result.current.createPatient({
          name: 'Jane Doe',
          age: 28,
          email: 'jane@example.com',
          phoneNumber: '0987654321',
          birthDate: '1995-05-15',
          maritalStatus: MaritalStatus.MARRIED,
          gender: Gender.FEMALE,
          educationalLevel: 'Master',
          profession: 'Doctor',
          livesWith: 'Spouse',
          children: 1,
          status: PatientStatus.ACTIVE,
        });
      });

      expect(result.current.patients).toHaveLength(2);
      expect(result.current.patients[0]).toEqual(newPatient);
    });

    it('should handle create error', async () => {
      const errorMessage = 'Failed to create patient';
      (ipcClient.createPatient as jest.Mock).mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => usePatients());

      await expect(
        act(async () => {
          await result.current.createPatient({
            name: 'Jane Doe',
            age: 28,
            email: 'jane@example.com',
            phoneNumber: '0987654321',
            birthDate: '1995-05-15',
            maritalStatus: MaritalStatus.MARRIED,
            gender: Gender.FEMALE,
            educationalLevel: 'Master',
            profession: 'Doctor',
            livesWith: 'Spouse',
            children: 1,
            status: PatientStatus.ACTIVE,
          });
        })
      ).rejects.toThrow(errorMessage);

      expect(result.current.error).toBeDefined();
    });
  });

  describe('updatePatient', () => {
    it('should update patient in list', async () => {
      const updatedPatient = { ...mockPatient, name: 'John Updated' };
      (ipcClient.updatePatient as jest.Mock).mockResolvedValue({
        success: true,
        data: updatedPatient,
      });

      (ipcClient.getAllPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockPatient],
      });

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.loadPatients();
      });

      expect(result.current.patients[0].name).toBe('John Doe');

      await act(async () => {
        await result.current.updatePatient({
          id: 1,
          name: 'John Updated',
        });
      });

      expect(result.current.patients[0].name).toBe('John Updated');
    });

    it('should handle update error', async () => {
      const errorMessage = 'Failed to update patient';
      (ipcClient.updatePatient as jest.Mock).mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => usePatients());

      await expect(
        act(async () => {
          await result.current.updatePatient({
            id: 1,
            name: 'John Updated',
          });
        })
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('deletePatient', () => {
    it('should remove patient from list', async () => {
      (ipcClient.deletePatient as jest.Mock).mockResolvedValue({
        success: true,
        data: true,
      });

      (ipcClient.getAllPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockPatient, { ...mockPatient, id: 2 }],
      });

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.loadPatients();
      });

      expect(result.current.patients).toHaveLength(2);

      await act(async () => {
        await result.current.deletePatient(1);
      });

      expect(result.current.patients).toHaveLength(1);
      expect(result.current.patients[0].id).toBe(2);
    });

    it('should handle delete error', async () => {
      const errorMessage = 'Failed to delete patient';
      (ipcClient.deletePatient as jest.Mock).mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => usePatients());

      await expect(
        act(async () => {
          await result.current.deletePatient(1);
        })
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('getPatientById', () => {
    it('should get patient by id', async () => {
      (ipcClient.getPatientById as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPatient,
      });

      const { result } = renderHook(() => usePatients());

      let patient: Patient | undefined;
      await act(async () => {
        patient = await result.current.getPatientById(1);
      });

      expect(patient).toEqual(mockPatient);
    });

    it('should return undefined when patient not found', async () => {
      (ipcClient.getPatientById as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Patient not found',
      });

      const { result } = renderHook(() => usePatients());

      let patient: Patient | undefined;
      await act(async () => {
        patient = await result.current.getPatientById(999);
      });

      expect(patient).toBeUndefined();
      expect(result.current.error).toBeDefined();
    });
  });
});
