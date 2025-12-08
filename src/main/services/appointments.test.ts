import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';
import { Appointments } from './appointments';
import { Users } from './users';
import { runMigrations } from '../database/migrations/umzug';
import { NoteCreateInput, NoteUpdateInput } from '../../types/note';
import { PatientCreateInput, MaritalStatus, Gender } from '../../types/patient';

describe('Appointments Service Integration Tests', () => {
  let db: Database.Database;
  let appointmentsService: Appointments;
  let usersService: Users;
  let testPatientId: number;

  beforeEach(async () => {
    // Create an in-memory database for testing
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');

    // Run migrations to set up the schema (use memory storage for testing)
    await runMigrations(db, true);

    // Initialize services
    appointmentsService = new Appointments(db);
    usersService = new Users(db);

    // Create a test patient for appointments
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

    const patient = usersService.create(patientData);
    testPatientId = patient.id!;
  });

  afterEach(() => {
    // Clean up the database after each test
    if (db) {
      db.close();
    }
  });

  describe('create()', () => {
    it('should create a new note', () => {
      const noteData: NoteCreateInput = {
        patientId: testPatientId,
        title: 'First Session',
        content: 'Patient showed great progress in understanding their emotions.',
      };

      const note = appointmentsService.create(noteData);

      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
      expect(note.patientId).toBe(testPatientId);
      expect(note.title).toBe(noteData.title);
      expect(note.content).toBe(noteData.content);
      expect(note.createdAt).toBeDefined();
      expect(note.updatedAt).toBeDefined();
    });

    it('should auto-increment note IDs', () => {
      const note1Data: NoteCreateInput = {
        patientId: testPatientId,
        title: 'Session 1',
        content: 'First session notes.',
      };

      const note2Data: NoteCreateInput = {
        patientId: testPatientId,
        title: 'Session 2',
        content: 'Second session notes.',
      };

      const note1 = appointmentsService.create(note1Data);
      const note2 = appointmentsService.create(note2Data);

      expect(note2.id!).toBeGreaterThan(note1.id!);
    });

    it('should allow multiple notes for the same patient', () => {
      appointmentsService.create({
        patientId: testPatientId,
        title: 'Session 1',
        content: 'First session.',
      });

      appointmentsService.create({
        patientId: testPatientId,
        title: 'Session 2',
        content: 'Second session.',
      });

      appointmentsService.create({
        patientId: testPatientId,
        title: 'Session 3',
        content: 'Third session.',
      });

      const allNotes = appointmentsService.getByPatientId(testPatientId);
      expect(allNotes).toHaveLength(3);
    });

    it('should enforce foreign key constraint', () => {
      const noteData: NoteCreateInput = {
        patientId: 99999, // Non-existent patient
        title: 'Invalid Note',
        content: 'This should fail.',
      };

      expect(() => {
        appointmentsService.create(noteData);
      }).toThrow();
    });
  });

  describe('getById()', () => {
    it('should retrieve a note by ID', () => {
      const noteData: NoteCreateInput = {
        patientId: testPatientId,
        title: 'Test Note',
        content: 'Test content.',
      };

      const created = appointmentsService.create(noteData);
      const retrieved = appointmentsService.getById(created.id!);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe(noteData.title);
      expect(retrieved?.content).toBe(noteData.content);
    });

    it('should return undefined for non-existent ID', () => {
      const note = appointmentsService.getById(99999);
      expect(note).toBeUndefined();
    });
  });

  describe('getByPatientId()', () => {
    it('should return empty array when patient has no notes', () => {
      const notes = appointmentsService.getByPatientId(testPatientId);
      expect(notes).toEqual([]);
    });

    it('should return all notes for a patient ordered by creation date (newest first)', () => {
      const note1 = appointmentsService.create({
        patientId: testPatientId,
        title: 'First Note',
        content: 'First content.',
      });

      const note2 = appointmentsService.create({
        patientId: testPatientId,
        title: 'Second Note',
        content: 'Second content.',
      });

      const note3 = appointmentsService.create({
        patientId: testPatientId,
        title: 'Third Note',
        content: 'Third content.',
      });

      const notes = appointmentsService.getByPatientId(testPatientId);

      expect(notes).toHaveLength(3);
      // Newest first
      expect(notes[0].id).toBe(note3.id);
      expect(notes[1].id).toBe(note2.id);
      expect(notes[2].id).toBe(note1.id);
    });

    it('should only return notes for the specified patient', () => {
      // Create another patient
      const patient2 = usersService.create({
        name: 'Patient 2',
        age: 25,
        email: 'patient2@test.com',
        phoneNumber: '555-1111',
        birthDate: '1998-01-01',
        maritalStatus: MaritalStatus.SINGLE,
        gender: Gender.FEMALE,
        educationalLevel: 'masters',
        profession: 'scientist',
        livesWith: 'family',
        children: 0,
      });

      // Create notes for both patients
      appointmentsService.create({
        patientId: testPatientId,
        title: 'Patient 1 Note',
        content: 'Content for patient 1.',
      });

      appointmentsService.create({
        patientId: patient2.id!,
        title: 'Patient 2 Note',
        content: 'Content for patient 2.',
      });

      const patient1Notes = appointmentsService.getByPatientId(testPatientId);
      const patient2Notes = appointmentsService.getByPatientId(patient2.id!);

      expect(patient1Notes).toHaveLength(1);
      expect(patient2Notes).toHaveLength(1);
      expect(patient1Notes[0].title).toBe('Patient 1 Note');
      expect(patient2Notes[0].title).toBe('Patient 2 Note');
    });
  });

  describe('update()', () => {
    it('should update note fields', () => {
      const noteData: NoteCreateInput = {
        patientId: testPatientId,
        title: 'Original Title',
        content: 'Original content.',
      };

      const created = appointmentsService.create(noteData);

      const updateData: NoteUpdateInput = {
        id: created.id!,
        title: 'Updated Title',
        content: 'Updated content.',
      };

      const updated = appointmentsService.update(updateData);

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.content).toBe('Updated content.');
      expect(updated?.patientId).toBe(testPatientId); // Should remain unchanged
    });

    it('should update only specified fields', () => {
      const noteData: NoteCreateInput = {
        patientId: testPatientId,
        title: 'Original Title',
        content: 'Original content.',
      };

      const created = appointmentsService.create(noteData);

      const updateData: NoteUpdateInput = {
        id: created.id!,
        title: 'Updated Title Only',
      };

      const updated = appointmentsService.update(updateData);

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title Only');
      expect(updated?.content).toBe('Original content.'); // Unchanged
    });

    it('should update updatedAt timestamp', () => {
      const noteData: NoteCreateInput = {
        patientId: testPatientId,
        title: 'Test Note',
        content: 'Test content.',
      };

      const created = appointmentsService.create(noteData);
      const originalUpdatedAt = created.updatedAt;

      const updateData: NoteUpdateInput = {
        id: created.id!,
        title: 'Updated Title',
      };

      const updated = appointmentsService.update(updateData);

      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should return the same note if no fields to update', () => {
      const noteData: NoteCreateInput = {
        patientId: testPatientId,
        title: 'Test Note',
        content: 'Test content.',
      };

      const created = appointmentsService.create(noteData);

      const updateData: NoteUpdateInput = {
        id: created.id!,
      };

      const updated = appointmentsService.update(updateData);

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(created.id);
    });

    it('should return undefined for non-existent note', () => {
      const updateData: NoteUpdateInput = {
        id: 99999,
        title: 'Non-existent',
      };

      const updated = appointmentsService.update(updateData);
      expect(updated).toBeUndefined();
    });
  });

  describe('delete()', () => {
    it('should delete a note', () => {
      const noteData: NoteCreateInput = {
        patientId: testPatientId,
        title: 'To Be Deleted',
        content: 'This note will be deleted.',
      };

      const created = appointmentsService.create(noteData);
      const deleted = appointmentsService.delete(created.id!);

      expect(deleted).toBe(true);

      const retrieved = appointmentsService.getById(created.id!);
      expect(retrieved).toBeUndefined();
    });

    it('should return false for non-existent note', () => {
      const deleted = appointmentsService.delete(99999);
      expect(deleted).toBe(false);
    });

    it('should not affect other notes when deleting', () => {
      const note1 = appointmentsService.create({
        patientId: testPatientId,
        title: 'Note 1',
        content: 'Content 1.',
      });

      const note2 = appointmentsService.create({
        patientId: testPatientId,
        title: 'Note 2',
        content: 'Content 2.',
      });

      appointmentsService.delete(note1.id!);

      const remainingNotes = appointmentsService.getByPatientId(testPatientId);
      expect(remainingNotes).toHaveLength(1);
      expect(remainingNotes[0].id).toBe(note2.id);
    });
  });

  describe('cascade delete with patient', () => {
    it('should delete notes when patient is deleted', () => {
      // Create notes for the patient
      const note1 = appointmentsService.create({
        patientId: testPatientId,
        title: 'Note 1',
        content: 'Content 1.',
      });

      const note2 = appointmentsService.create({
        patientId: testPatientId,
        title: 'Note 2',
        content: 'Content 2.',
      });

      // Verify notes exist
      let notes = appointmentsService.getByPatientId(testPatientId);
      expect(notes).toHaveLength(2);

      // Delete the patient
      usersService.delete(testPatientId);

      // Verify notes were cascade deleted
      notes = appointmentsService.getByPatientId(testPatientId);
      expect(notes).toHaveLength(0);

      const retrievedNote1 = appointmentsService.getById(note1.id!);
      const retrievedNote2 = appointmentsService.getById(note2.id!);

      expect(retrievedNote1).toBeUndefined();
      expect(retrievedNote2).toBeUndefined();
    });
  });

  describe('database constraints', () => {
    it('should maintain data integrity after multiple operations', () => {
      // Create
      const created = appointmentsService.create({
        patientId: testPatientId,
        title: 'Integrity Test',
        content: 'Testing data integrity.',
      });

      // Update
      appointmentsService.update({
        id: created.id!,
        title: 'Updated Integrity Test',
      });

      // Retrieve
      const retrieved = appointmentsService.getById(created.id!);

      // Verify all operations maintained integrity
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe('Updated Integrity Test');
      expect(retrieved?.content).toBe('Testing data integrity.');
      expect(retrieved?.patientId).toBe(testPatientId);
    });

    it('should handle concurrent notes for same patient', () => {
      const notes = [];

      for (let i = 1; i <= 5; i++) {
        const note = appointmentsService.create({
          patientId: testPatientId,
          title: `Session ${i}`,
          content: `Content for session ${i}`,
        });
        notes.push(note);
      }

      const allNotes = appointmentsService.getByPatientId(testPatientId);
      expect(allNotes).toHaveLength(5);

      // All notes should have unique IDs
      const ids = allNotes.map((n) => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings in title and content', () => {
      const noteData: NoteCreateInput = {
        patientId: testPatientId,
        title: '',
        content: '',
      };

      const note = appointmentsService.create(noteData);

      expect(note).toBeDefined();
      expect(note.title).toBe('');
      expect(note.content).toBe('');
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(10000);

      const noteData: NoteCreateInput = {
        patientId: testPatientId,
        title: 'Long Content Note',
        content: longContent,
      };

      const note = appointmentsService.create(noteData);

      expect(note).toBeDefined();
      expect(note.content.length).toBe(10000);

      const retrieved = appointmentsService.getById(note.id!);
      expect(retrieved?.content).toBe(longContent);
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Test with \'quotes\', "double quotes", and special chars: <>&';

      const noteData: NoteCreateInput = {
        patientId: testPatientId,
        title: 'Special Characters',
        content: specialContent,
      };

      const note = appointmentsService.create(noteData);

      expect(note).toBeDefined();
      expect(note.content).toBe(specialContent);

      const retrieved = appointmentsService.getById(note.id!);
      expect(retrieved?.content).toBe(specialContent);
    });
  });
});
