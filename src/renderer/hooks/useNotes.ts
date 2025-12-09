import { useState, useCallback } from 'react';
import { ipcClient } from '../api';
import { unwrapApiResponse } from '../api/types';
import { Note, NoteCreateInput, NoteUpdateInput } from '../../types/note';

/**
 * useNotes Hook
 *
 * Custom hook for note-related operations
 * Handles state management, loading states, and error handling
 */

export interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: Error | null;
  loadNotesByPatientId: (patientId: number) => Promise<void>;
  createNote: (noteData: NoteCreateInput) => Promise<Note>;
  updateNote: (noteData: NoteUpdateInput) => Promise<Note>;
  deleteNote: (id: number) => Promise<void>;
  getNoteById: (id: number) => Promise<Note | undefined>;
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load notes for a specific patient
   */
  const loadNotesByPatientId = useCallback(async (patientId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcClient.getNotesByPatientId(patientId);
      const data = unwrapApiResponse(response);
      setNotes(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load notes');
      setError(error);
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new note
   */
  const createNote = useCallback(async (noteData: NoteCreateInput): Promise<Note> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcClient.createNote(noteData);
      const newNote = unwrapApiResponse(response);

      // Add to local state
      setNotes((prev) => [newNote, ...prev]);

      return newNote;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create note');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a note
   */
  const updateNote = useCallback(async (noteData: NoteUpdateInput): Promise<Note> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcClient.updateNote(noteData);
      const updatedNote = unwrapApiResponse(response);

      // Update local state
      setNotes((prev) => prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)));

      return updatedNote;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update note');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a note
   */
  const deleteNote = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcClient.deleteNote(id);
      unwrapApiResponse(response);

      // Remove from local state
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete note');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get note by ID
   */
  const getNoteById = useCallback(async (id: number): Promise<Note | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ipcClient.getNoteById(id);
      return unwrapApiResponse(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get note');
      setError(error);
      console.error('Error getting note:', error);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notes,
    loading,
    error,
    loadNotesByPatientId,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
  };
}
