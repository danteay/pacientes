import { PatientService } from './patient-service';
import { PatientRepository } from '../database/repositories/patient-repository';
import {
  Patient,
  PatientCreateInput,
  PatientStatus,
  Gender,
  MaritalStatus,
} from '../../types/patient';

describe('PatientService', () => {
  let service: PatientService;
  let mockRepository: jest.Mocked<PatientRepository>;

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
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      search: jest.fn(),
      findByStatus: jest.fn(),
      updateFirstAppointmentDate: jest.fn(),
      findPatientsWithoutFirstAppointment: jest.fn(),
    } as jest.Mocked<PatientRepository>;

    service = new PatientService(mockRepository);
  });

  describe('createPatient', () => {
    const validPatientData: PatientCreateInput = {
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
    };

    it('should create patient with normalized data', () => {
      mockRepository.create.mockReturnValue(mockPatient);

      const result = service.createPatient(validPatientData);

      expect(result).toEqual(mockPatient);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
          phoneNumber: '1234567890',
          name: 'John Doe',
        })
      );
    });

    it('should normalize email to lowercase', () => {
      const dataWithUpperCaseEmail = { ...validPatientData, email: 'JOHN@EXAMPLE.COM' };
      mockRepository.create.mockReturnValue(mockPatient);

      service.createPatient(dataWithUpperCaseEmail);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
        })
      );
    });

    it('should trim whitespace from name and phone', () => {
      const dataWithWhitespace = {
        ...validPatientData,
        name: '  John Doe  ',
        phoneNumber: '  1234567890  ',
      };
      mockRepository.create.mockReturnValue(mockPatient);

      service.createPatient(dataWithWhitespace);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          phoneNumber: '1234567890',
        })
      );
    });

    it('should throw error for empty name', () => {
      const invalidData = { ...validPatientData, name: '' };

      expect(() => service.createPatient(invalidData)).toThrow('Patient name is required');
    });

    it('should throw error for invalid age', () => {
      const invalidData = { ...validPatientData, age: -1 };

      expect(() => service.createPatient(invalidData)).toThrow('Age must be between 0 and 150');
    });

    it('should throw error for age over 150', () => {
      const invalidData = { ...validPatientData, age: 151 };

      expect(() => service.createPatient(invalidData)).toThrow('Age must be between 0 and 150');
    });

    it('should throw error for invalid email format', () => {
      const invalidData = { ...validPatientData, email: 'not-an-email' };

      expect(() => service.createPatient(invalidData)).toThrow('Invalid email format');
    });

    it('should throw error for empty email', () => {
      const invalidData = { ...validPatientData, email: '' };

      expect(() => service.createPatient(invalidData)).toThrow('Email is required');
    });

    it('should throw error for empty phone number', () => {
      const invalidData = { ...validPatientData, phoneNumber: '' };

      expect(() => service.createPatient(invalidData)).toThrow('Phone number is required');
    });

    it('should throw error for negative children count', () => {
      const invalidData = { ...validPatientData, children: -1 };

      expect(() => service.createPatient(invalidData)).toThrow(
        'Number of children must be a positive number'
      );
    });

    it('should throw error for future birth date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const invalidData = {
        ...validPatientData,
        birthDate: futureDate.toISOString().split('T')[0],
      };

      expect(() => service.createPatient(invalidData)).toThrow(
        'Birth date cannot be in the future'
      );
    });

    it('should throw error for invalid birth date format', () => {
      const invalidData = { ...validPatientData, birthDate: 'invalid-date' };

      expect(() => service.createPatient(invalidData)).toThrow('Invalid birth date format');
    });

    it('should throw error for name over 255 characters', () => {
      const longName = 'a'.repeat(256);
      const invalidData = { ...validPatientData, name: longName };

      expect(() => service.createPatient(invalidData)).toThrow(
        'Patient name must be less than 255 characters'
      );
    });
  });

  describe('getPatientById', () => {
    it('should return patient by id', () => {
      mockRepository.findById.mockReturnValue(mockPatient);

      const result = service.getPatientById(1);

      expect(result).toEqual(mockPatient);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error for invalid id', () => {
      expect(() => service.getPatientById(0)).toThrow('Invalid patient ID');
      expect(() => service.getPatientById(-1)).toThrow('Invalid patient ID');
    });

    it('should return undefined when patient not found', () => {
      mockRepository.findById.mockReturnValue(undefined);

      const result = service.getPatientById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('getAllPatients', () => {
    it('should return all patients', () => {
      const patients = [mockPatient];
      mockRepository.findAll.mockReturnValue(patients);

      const result = service.getAllPatients();

      expect(result).toEqual(patients);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no patients exist', () => {
      mockRepository.findAll.mockReturnValue([]);

      const result = service.getAllPatients();

      expect(result).toEqual([]);
    });
  });

  describe('updatePatient', () => {
    it('should update patient with normalized data', () => {
      const updateData = { id: 1, name: 'John Updated', email: 'JOHN@EXAMPLE.COM' };
      const updatedPatient = { ...mockPatient, ...updateData, email: 'john@example.com' };

      mockRepository.findById.mockReturnValue(mockPatient);
      mockRepository.update.mockReturnValue(updatedPatient);

      const result = service.updatePatient(updateData);

      expect(result).toBeDefined();
      expect(result?.name).toBe('John Updated');
      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
          name: 'John Updated',
        })
      );
    });

    it('should throw error for invalid patient id', () => {
      expect(() => service.updatePatient({ id: 0, name: 'Test' })).toThrow('Invalid patient ID');
    });

    it('should throw error when patient does not exist', () => {
      mockRepository.findById.mockReturnValue(undefined);

      expect(() => service.updatePatient({ id: 999, name: 'Test' })).toThrow(
        'Patient with ID 999 not found'
      );
    });

    it('should throw error for invalid email format in update', () => {
      mockRepository.findById.mockReturnValue(mockPatient);

      expect(() => service.updatePatient({ id: 1, email: 'invalid-email' })).toThrow(
        'Invalid email format'
      );
    });

    it('should throw error for negative age in update', () => {
      mockRepository.findById.mockReturnValue(mockPatient);

      expect(() => service.updatePatient({ id: 1, age: -1 })).toThrow(
        'Age must be a positive number'
      );
    });

    it('should throw error for negative children count in update', () => {
      mockRepository.findById.mockReturnValue(mockPatient);

      expect(() => service.updatePatient({ id: 1, children: -1 })).toThrow(
        'Number of children must be a positive number'
      );
    });
  });

  describe('deletePatient', () => {
    it('should delete patient and return true', () => {
      mockRepository.exists.mockReturnValue(true);
      mockRepository.delete.mockReturnValue(true);

      const result = service.deletePatient(1);

      expect(result).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error for invalid id', () => {
      expect(() => service.deletePatient(0)).toThrow('Invalid patient ID');
    });

    it('should throw error when patient does not exist', () => {
      mockRepository.exists.mockReturnValue(false);

      expect(() => service.deletePatient(999)).toThrow('Patient with ID 999 not found');
    });
  });

  describe('searchPatients', () => {
    it('should search patients with term', () => {
      const patients = [mockPatient];
      mockRepository.search.mockReturnValue(patients);

      const result = service.searchPatients('john');

      expect(result).toEqual(patients);
      expect(mockRepository.search).toHaveBeenCalledWith('john', undefined);
    });

    it('should search patients with term and status', () => {
      const patients = [mockPatient];
      mockRepository.search.mockReturnValue(patients);

      const result = service.searchPatients('john', PatientStatus.ACTIVE);

      expect(result).toEqual(patients);
      expect(mockRepository.search).toHaveBeenCalledWith('john', PatientStatus.ACTIVE);
    });

    it('should return all patients when search term is empty', () => {
      const patients = [mockPatient];
      mockRepository.findAll.mockReturnValue(patients);

      const result = service.searchPatients('');

      expect(result).toEqual(patients);
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.search).not.toHaveBeenCalled();
    });

    it('should filter by status when search term is empty and status is provided', () => {
      const patients = [mockPatient];
      mockRepository.findByStatus.mockReturnValue(patients);

      const result = service.searchPatients('', PatientStatus.ACTIVE);

      expect(result).toEqual(patients);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith(PatientStatus.ACTIVE);
    });

    it('should trim search term', () => {
      const patients = [mockPatient];
      mockRepository.search.mockReturnValue(patients);

      service.searchPatients('  john  ');

      expect(mockRepository.search).toHaveBeenCalledWith('john', undefined);
    });
  });

  describe('getPatientsByStatus', () => {
    it('should return patients by status', () => {
      const patients = [mockPatient];
      mockRepository.findByStatus.mockReturnValue(patients);

      const result = service.getPatientsByStatus(PatientStatus.ACTIVE);

      expect(result).toEqual(patients);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith(PatientStatus.ACTIVE);
    });
  });

  describe('setFirstAppointmentDateIfNotSet', () => {
    it('should set first appointment date when not set', () => {
      const patientWithoutDate = { ...mockPatient, firstAppointmentDate: undefined };
      mockRepository.findById.mockReturnValue(patientWithoutDate);

      service.setFirstAppointmentDateIfNotSet(1);

      expect(mockRepository.updateFirstAppointmentDate).toHaveBeenCalledWith(
        1,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
      );
    });

    it('should not set first appointment date when already set', () => {
      const patientWithDate = { ...mockPatient, firstAppointmentDate: '2023-01-01' };
      mockRepository.findById.mockReturnValue(patientWithDate);

      service.setFirstAppointmentDateIfNotSet(1);

      expect(mockRepository.updateFirstAppointmentDate).not.toHaveBeenCalled();
    });

    it('should throw error when patient not found', () => {
      mockRepository.findById.mockReturnValue(undefined);

      expect(() => service.setFirstAppointmentDateIfNotSet(999)).toThrow(
        'Patient with ID 999 not found'
      );
    });
  });

  describe('getPatientStatistics', () => {
    it('should calculate statistics correctly', () => {
      const patients = [
        { ...mockPatient, age: 30, firstAppointmentDate: '2023-01-01' },
        { ...mockPatient, id: 2, age: 40, firstAppointmentDate: undefined },
        { ...mockPatient, id: 3, age: 50, firstAppointmentDate: undefined },
      ];

      mockRepository.findAll.mockReturnValue(patients);
      mockRepository.findPatientsWithoutFirstAppointment.mockReturnValue([
        patients[1],
        patients[2],
      ]);

      const result = service.getPatientStatistics();

      expect(result.total).toBe(3);
      expect(result.withoutFirstAppointment).toBe(2);
      expect(result.averageAge).toBe(40);
    });

    it('should return zero average age when no patients exist', () => {
      mockRepository.findAll.mockReturnValue([]);
      mockRepository.findPatientsWithoutFirstAppointment.mockReturnValue([]);

      const result = service.getPatientStatistics();

      expect(result.total).toBe(0);
      expect(result.withoutFirstAppointment).toBe(0);
      expect(result.averageAge).toBe(0);
    });
  });
});
