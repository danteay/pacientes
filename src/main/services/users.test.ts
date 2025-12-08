import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';
import { Users } from './users';
import { runMigrations } from '../database/migrations/umzug';
import { PatientCreateInput, PatientUpdateInput, MaritalStatus, Gender } from '../../types/patient';

describe('Users Service Integration Tests', () => {
  let db: Database.Database;
  let usersService: Users;

  beforeEach(async () => {
    // Create an in-memory database for testing
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');

    // Run migrations to set up the schema (use memory storage for testing)
    await runMigrations(db, true);

    // Initialize the Users service
    usersService = new Users(db);
  });

  afterEach(() => {
    // Clean up the database after each test
    if (db) {
      db.close();
    }
  });

  describe('create()', () => {
    it('should create a new patient with all fields', () => {
      const patientData: PatientCreateInput = {
        name: 'John Doe',
        age: 35,
        email: 'john.doe@example.com',
        phoneNumber: '555-1234',
        birthDate: '1988-05-15',
        maritalStatus: MaritalStatus.MARRIED,
        gender: Gender.MALE,
        educationalLevel: 'masters',
        profession: 'doctor',
        livesWith: 'family',
        children: 2,
        previousPsychologicalExperience: 'None',
        firstAppointmentDate: '2025-01-15',
      };

      const patient = usersService.create(patientData);

      expect(patient).toBeDefined();
      expect(patient.id).toBeDefined();
      expect(patient.name).toBe(patientData.name);
      expect(patient.age).toBe(patientData.age);
      expect(patient.email).toBe(patientData.email);
      expect(patient.phoneNumber).toBe(patientData.phoneNumber);
      expect(patient.birthDate).toBe(patientData.birthDate);
      expect(patient.maritalStatus).toBe(patientData.maritalStatus);
      expect(patient.gender).toBe(patientData.gender);
      expect(patient.educationalLevel).toBe(patientData.educationalLevel);
      expect(patient.profession).toBe(patientData.profession);
      expect(patient.livesWith).toBe(patientData.livesWith);
      expect(patient.children).toBe(patientData.children);
      expect(patient.previousPsychologicalExperience).toBe(patientData.previousPsychologicalExperience);
      expect(patient.firstAppointmentDate).toBe(patientData.firstAppointmentDate);
      expect(patient.createdAt).toBeDefined();
      expect(patient.updatedAt).toBeDefined();
    });

    it('should create a patient without optional fields', () => {
      const patientData: PatientCreateInput = {
        name: 'Jane Smith',
        age: 28,
        email: 'jane.smith@example.com',
        phoneNumber: '555-5678',
        birthDate: '1996-03-20',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.FEMALE,
        educationalLevel: 'bachelors',
        profession: 'teacher',
        livesWith: 'roommates',
        children: 0,
      };

      const patient = usersService.create(patientData);

      expect(patient).toBeDefined();
      expect(patient.id).toBeDefined();
      expect(patient.name).toBe(patientData.name);
      expect(patient.previousPsychologicalExperience).toBeNull();
      expect(patient.firstAppointmentDate).toBeNull();
    });

    it('should auto-increment patient IDs', () => {
      const patient1Data: PatientCreateInput = {
        name: 'Patient 1',
        age: 30,
        email: 'patient1@test.com',
        phoneNumber: '111-1111',
        birthDate: '1993-01-01',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'engineer',
        livesWith: 'alone',
        children: 0,
      };

      const patient2Data: PatientCreateInput = {
        name: 'Patient 2',
        age: 25,
        email: 'patient2@test.com',
        phoneNumber: '222-2222',
        birthDate: '1998-02-02',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.FEMALE,
        educationalLevel: 'masters',
        profession: 'scientist',
        livesWith: 'family',
        children: 0,
      };

      const patient1 = usersService.create(patient1Data);
      const patient2 = usersService.create(patient2Data);

      expect(patient2.id!).toBeGreaterThan(patient1.id!);
    });
  });

  describe('getById()', () => {
    it('should retrieve a patient by ID', () => {
      const patientData: PatientCreateInput = {
        name: 'Test Patient',
        age: 30,
        email: 'test@example.com',
        phoneNumber: '555-0000',
        birthDate: '1993-06-10',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'developer',
        livesWith: 'alone',
        children: 0,
      };

      const created = usersService.create(patientData);
      const retrieved = usersService.getById(created.id!);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe(patientData.name);
    });

    it('should return undefined for non-existent ID', () => {
      const patient = usersService.getById(99999);
      expect(patient).toBeUndefined();
    });
  });

  describe('getAll()', () => {
    it('should return empty array when no patients exist', () => {
      const patients = usersService.getAll();
      expect(patients).toEqual([]);
    });

    it('should return all patients ordered by creation date (newest first)', () => {
      const patient1Data: PatientCreateInput = {
        name: 'First Patient',
        age: 30,
        email: 'first@test.com',
        phoneNumber: '111-1111',
        birthDate: '1993-01-01',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'engineer',
        livesWith: 'alone',
        children: 0,
      };

      const patient2Data: PatientCreateInput = {
        name: 'Second Patient',
        age: 25,
        email: 'second@test.com',
        phoneNumber: '222-2222',
        birthDate: '1998-02-02',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.FEMALE,
        educationalLevel: 'masters',
        profession: 'scientist',
        livesWith: 'family',
        children: 0,
      };

      const patient1 = usersService.create(patient1Data);
      const patient2 = usersService.create(patient2Data);

      const patients = usersService.getAll();

      expect(patients).toHaveLength(2);
      // Newest first
      expect(patients[0].id).toBe(patient2.id);
      expect(patients[1].id).toBe(patient1.id);
    });
  });

  describe('update()', () => {
    it('should update patient fields', () => {
      const patientData: PatientCreateInput = {
        name: 'Original Name',
        age: 30,
        email: 'original@test.com',
        phoneNumber: '555-0000',
        birthDate: '1993-06-10',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'developer',
        livesWith: 'alone',
        children: 0,
      };

      const created = usersService.create(patientData);

      const updateData: PatientUpdateInput = {
        id: created.id!,
        name: 'Updated Name',
        age: 31,
        email: 'updated@test.com',
      };

      const updated = usersService.update(updateData);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.age).toBe(31);
      expect(updated?.email).toBe('updated@test.com');
      // Unchanged fields should remain the same
      expect(updated?.phoneNumber).toBe(patientData.phoneNumber);
      expect(updated?.profession).toBe(patientData.profession);
    });

    it('should update updatedAt timestamp', () => {
      const patientData: PatientCreateInput = {
        name: 'Test Patient',
        age: 30,
        email: 'test@test.com',
        phoneNumber: '555-0000',
        birthDate: '1993-06-10',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'developer',
        livesWith: 'alone',
        children: 0,
      };

      const created = usersService.create(patientData);
      const originalUpdatedAt = created.updatedAt;

      // Small delay to ensure timestamp difference
      const updateData: PatientUpdateInput = {
        id: created.id!,
        name: 'Updated Name',
      };

      const updated = usersService.update(updateData);

      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should return the same patient if no fields to update', () => {
      const patientData: PatientCreateInput = {
        name: 'Test Patient',
        age: 30,
        email: 'test@test.com',
        phoneNumber: '555-0000',
        birthDate: '1993-06-10',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'developer',
        livesWith: 'alone',
        children: 0,
      };

      const created = usersService.create(patientData);

      const updateData: PatientUpdateInput = {
        id: created.id!,
      };

      const updated = usersService.update(updateData);

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(created.id);
    });

    it('should return undefined for non-existent patient', () => {
      const updateData: PatientUpdateInput = {
        id: 99999,
        name: 'Non-existent',
      };

      const updated = usersService.update(updateData);
      expect(updated).toBeUndefined();
    });
  });

  describe('delete()', () => {
    it('should delete a patient', () => {
      const patientData: PatientCreateInput = {
        name: 'To Be Deleted',
        age: 30,
        email: 'delete@test.com',
        phoneNumber: '555-0000',
        birthDate: '1993-06-10',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'developer',
        livesWith: 'alone',
        children: 0,
      };

      const created = usersService.create(patientData);
      const deleted = usersService.delete(created.id!);

      expect(deleted).toBe(true);

      const retrieved = usersService.getById(created.id!);
      expect(retrieved).toBeUndefined();
    });

    it('should return false for non-existent patient', () => {
      const deleted = usersService.delete(99999);
      expect(deleted).toBe(false);
    });
  });

  describe('search()', () => {
    beforeEach(() => {
      // Create test patients
      usersService.create({
        name: 'John Smith',
        age: 30,
        email: 'john.smith@example.com',
        phoneNumber: '555-1111',
        birthDate: '1993-01-01',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'engineer',
        livesWith: 'alone',
        children: 0,
      });

      usersService.create({
        name: 'Jane Doe',
        age: 25,
        email: 'jane.doe@example.com',
        phoneNumber: '555-2222',
        birthDate: '1998-02-02',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.FEMALE,
        educationalLevel: 'masters',
        profession: 'scientist',
        livesWith: 'family',
        children: 0,
      });

      usersService.create({
        name: 'Bob Johnson',
        age: 40,
        email: 'bob.johnson@test.com',
        phoneNumber: '555-3333',
        birthDate: '1983-03-03',
        maritalStatus: MaritalStatus.MARRIED,
        gender: Gender.MALE,
        educationalLevel: 'phd',
        profession: 'professor',
        livesWith: 'family',
        children: 2,
      });
    });

    it('should search patients by name', () => {
      const results = usersService.search('John');
      expect(results).toHaveLength(2); // John Smith and Bob Johnson
      expect(results.some(p => p.name === 'John Smith')).toBe(true);
      expect(results.some(p => p.name === 'Bob Johnson')).toBe(true);
    });

    it('should search patients by email', () => {
      const results = usersService.search('example.com');
      expect(results).toHaveLength(2); // John and Jane with example.com
      expect(results.some(p => p.email.includes('example.com'))).toBe(true);
    });

    it('should search patients by phone number', () => {
      const results = usersService.search('555-2222');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Jane Doe');
    });

    it('should be case-insensitive', () => {
      const results = usersService.search('jane');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Jane Doe');
    });

    it('should return empty array for no matches', () => {
      const results = usersService.search('NonExistent');
      expect(results).toEqual([]);
    });

    it('should return all patients for empty search term', () => {
      const results = usersService.search('');
      expect(results).toHaveLength(3);
    });
  });

  describe('updateFirstAppointmentDate()', () => {
    it('should update the first appointment date', () => {
      const patientData: PatientCreateInput = {
        name: 'Test Patient',
        age: 30,
        email: 'test@test.com',
        phoneNumber: '555-0000',
        birthDate: '1993-06-10',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'developer',
        livesWith: 'alone',
        children: 0,
      };

      const created = usersService.create(patientData);
      expect(created.firstAppointmentDate).toBeNull();

      const appointmentDate = '2025-01-20';
      usersService.updateFirstAppointmentDate(created.id!, appointmentDate);

      const updated = usersService.getById(created.id!);
      expect(updated?.firstAppointmentDate).toBe(appointmentDate);
    });

    it('should update the updatedAt timestamp', () => {
      const patientData: PatientCreateInput = {
        name: 'Test Patient',
        age: 30,
        email: 'test@test.com',
        phoneNumber: '555-0000',
        birthDate: '1993-06-10',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'developer',
        livesWith: 'alone',
        children: 0,
      };

      const created = usersService.create(patientData);
      const originalUpdatedAt = created.updatedAt;

      const appointmentDate = '2025-01-20';
      usersService.updateFirstAppointmentDate(created.id!, appointmentDate);

      const updated = usersService.getById(created.id!);
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('database constraints', () => {
    it('should maintain data integrity after multiple operations', () => {
      // Create
      const created = usersService.create({
        name: 'Integrity Test',
        age: 30,
        email: 'integrity@test.com',
        phoneNumber: '555-0000',
        birthDate: '1993-06-10',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.MALE,
        educationalLevel: 'bachelors',
        profession: 'developer',
        livesWith: 'alone',
        children: 0,
      });

      // Update
      const updated = usersService.update({
        id: created.id!,
        age: 31,
      });

      // Retrieve
      const retrieved = usersService.getById(created.id!);

      // Verify all operations maintained integrity
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.age).toBe(31);
      expect(retrieved?.name).toBe('Integrity Test');
    });
  });
});
