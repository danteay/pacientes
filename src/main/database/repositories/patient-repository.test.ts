import { PatientRepository } from './patient-repository';
import { DatabaseDriver } from '../driver/database-driver';
import { PatientStatus, Gender, MaritalStatus } from '../../../types/patient';

describe('PatientRepository', () => {
  let repository: PatientRepository;
  let mockDriver: jest.Mocked<DatabaseDriver>;

  beforeEach(() => {
    mockDriver = {
      executeQuery: jest.fn(),
      executeQuerySingle: jest.fn(),
      executeCommand: jest.fn(),
      executeTransaction: jest.fn(),
    } as any;

    repository = new PatientRepository(mockDriver);
  });

  describe('findById', () => {
    it('should return patient when found', () => {
      const mockRow = {
        id: 1,
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        phoneNumber: '1234567890',
        birthDate: '1993-01-01',
        maritalStatus: 'single',
        gender: 'male',
        educationalLevel: 'Bachelor',
        profession: 'Engineer',
        livesWith: 'Alone',
        children: 0,
        previousPsychologicalExperience: null,
        firstAppointmentDate: null,
        status: 'active',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };

      mockDriver.executeQuerySingle.mockReturnValue(mockRow);

      const result = repository.findById(1);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('John Doe');
      expect(result?.status).toBe(PatientStatus.ACTIVE);
      expect(mockDriver.executeQuerySingle).toHaveBeenCalledWith('SELECT * FROM patients WHERE id = ?', [1]);
    });

    it('should return undefined when patient not found', () => {
      mockDriver.executeQuerySingle.mockReturnValue(undefined);

      const result = repository.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all patients ordered by creation date', () => {
      const mockRows = [
        {
          id: 1,
          name: 'John Doe',
          age: 30,
          email: 'john@example.com',
          phoneNumber: '1234567890',
          birthDate: '1993-01-01',
          maritalStatus: 'single',
          gender: 'male',
          educationalLevel: 'Bachelor',
          profession: 'Engineer',
          livesWith: 'Alone',
          children: 0,
          previousPsychologicalExperience: null,
          firstAppointmentDate: null,
          status: 'active',
          createdAt: '2023-01-02',
          updatedAt: '2023-01-02',
        },
        {
          id: 2,
          name: 'Jane Smith',
          age: 28,
          email: 'jane@example.com',
          phoneNumber: '0987654321',
          birthDate: '1995-05-15',
          maritalStatus: 'married',
          gender: 'female',
          educationalLevel: 'Master',
          profession: 'Doctor',
          livesWith: 'Spouse',
          children: 1,
          previousPsychologicalExperience: 'Some experience',
          firstAppointmentDate: '2023-01-01',
          status: 'paused',
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01',
        },
      ];

      mockDriver.executeQuery.mockReturnValue(mockRows);

      const result = repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Jane Smith');
      expect(mockDriver.executeQuery).toHaveBeenCalledWith('SELECT * FROM patients ORDER BY createdAt DESC, id DESC');
    });

    it('should return empty array when no patients exist', () => {
      mockDriver.executeQuery.mockReturnValue([]);

      const result = repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new patient and return it', () => {
      const patientData = {
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

      const mockCommandResult = { lastInsertRowid: 1, changes: 1 };
      const mockCreatedPatient = { ...patientData, id: 1, createdAt: '2023-01-01', updatedAt: '2023-01-01' };

      mockDriver.executeCommand.mockReturnValue(mockCommandResult);
      mockDriver.executeQuerySingle.mockReturnValue(mockCreatedPatient);

      const result = repository.create(patientData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('John Doe');
      expect(mockDriver.executeCommand).toHaveBeenCalled();
    });

    it('should throw error if patient creation fails', () => {
      const patientData = {
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

      const mockCommandResult = { lastInsertRowid: 1, changes: 1 };
      mockDriver.executeCommand.mockReturnValue(mockCommandResult);
      mockDriver.executeQuerySingle.mockReturnValue(undefined);

      expect(() => repository.create(patientData)).toThrow('Failed to create patient');
    });
  });

  describe('update', () => {
    it('should update patient and return updated data', () => {
      const updateData = {
        id: 1,
        name: 'John Updated',
        age: 31,
      };

      const mockUpdatedPatient = {
        id: 1,
        name: 'John Updated',
        age: 31,
        email: 'john@example.com',
        phoneNumber: '1234567890',
        birthDate: '1993-01-01',
        maritalStatus: 'single',
        gender: 'male',
        educationalLevel: 'Bachelor',
        profession: 'Engineer',
        livesWith: 'Alone',
        children: 0,
        status: 'active',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
      };

      mockDriver.executeCommand.mockReturnValue({ changes: 1, lastInsertRowid: 1 });
      mockDriver.executeQuerySingle.mockReturnValue(mockUpdatedPatient);

      const result = repository.update(updateData);

      expect(result).toBeDefined();
      expect(result?.name).toBe('John Updated');
      expect(result?.age).toBe(31);
      expect(mockDriver.executeCommand).toHaveBeenCalled();
    });

    it('should return existing patient if no fields to update', () => {
      const updateData = { id: 1 };

      const mockPatient = {
        id: 1,
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        phoneNumber: '1234567890',
        birthDate: '1993-01-01',
        maritalStatus: 'single',
        gender: 'male',
        educationalLevel: 'Bachelor',
        profession: 'Engineer',
        livesWith: 'Alone',
        children: 0,
        status: 'active',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };

      mockDriver.executeQuerySingle.mockReturnValue(mockPatient);

      const result = repository.update(updateData);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(mockDriver.executeCommand).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete patient and return true', () => {
      mockDriver.executeCommand.mockReturnValue({ changes: 1, lastInsertRowid: 0 });

      const result = repository.delete(1);

      expect(result).toBe(true);
      expect(mockDriver.executeCommand).toHaveBeenCalledWith('DELETE FROM patients WHERE id = ?', [1]);
    });

    it('should return false if patient does not exist', () => {
      mockDriver.executeCommand.mockReturnValue({ changes: 0, lastInsertRowid: 0 });

      const result = repository.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('search', () => {
    it('should search patients by name, email, or phone', () => {
      const mockRows = [
        {
          id: 1,
          name: 'John Doe',
          age: 30,
          email: 'john@example.com',
          phoneNumber: '1234567890',
          birthDate: '1993-01-01',
          maritalStatus: 'single',
          gender: 'male',
          educationalLevel: 'Bachelor',
          profession: 'Engineer',
          livesWith: 'Alone',
          children: 0,
          status: 'active',
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01',
        },
      ];

      mockDriver.executeQuery.mockReturnValue(mockRows);

      const result = repository.search('john');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
      expect(mockDriver.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE (name LIKE ? OR email LIKE ? OR phoneNumber LIKE ?)'),
        ['%john%', '%john%', '%john%']
      );
    });

    it('should search patients with status filter', () => {
      const mockRows = [
        {
          id: 1,
          name: 'John Doe',
          age: 30,
          email: 'john@example.com',
          phoneNumber: '1234567890',
          birthDate: '1993-01-01',
          maritalStatus: 'single',
          gender: 'male',
          educationalLevel: 'Bachelor',
          profession: 'Engineer',
          livesWith: 'Alone',
          children: 0,
          status: 'active',
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01',
        },
      ];

      mockDriver.executeQuery.mockReturnValue(mockRows);

      const result = repository.search('john', PatientStatus.ACTIVE);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(PatientStatus.ACTIVE);
      expect(mockDriver.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND status = ?'),
        ['%john%', '%john%', '%john%', PatientStatus.ACTIVE]
      );
    });
  });

  describe('findByStatus', () => {
    it('should find patients by status', () => {
      const mockRows = [
        {
          id: 1,
          name: 'John Doe',
          age: 30,
          email: 'john@example.com',
          phoneNumber: '1234567890',
          birthDate: '1993-01-01',
          maritalStatus: 'single',
          gender: 'male',
          educationalLevel: 'Bachelor',
          profession: 'Engineer',
          livesWith: 'Alone',
          children: 0,
          status: 'active',
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01',
        },
      ];

      mockDriver.executeQuery.mockReturnValue(mockRows);

      const result = repository.findByStatus(PatientStatus.ACTIVE);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(PatientStatus.ACTIVE);
      expect(mockDriver.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = ?'),
        [PatientStatus.ACTIVE]
      );
    });
  });
});
