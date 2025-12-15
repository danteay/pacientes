import { inject, injectable } from 'tsyringe';
import { DatabaseDriver } from '../../../database/driver/database-driver';
import { BaseRepository } from '../../../database/repositories/base-repository';
import { DATABASE_DRIVER } from '../../../infrastructure/ioc/container';
import { Note, NoteCreateInput, NoteUpdateInput } from '../../../../types/note';

/**
 * Note Repository (Appointments Repository)
 *
 * Responsible for:
 * - Database queries related to notes/appointments
 * - Data mapping between database rows and Note entities
 * - No business logic (that belongs in the service layer)
 */
@injectable()
export class NoteRepository extends BaseRepository<Note, NoteCreateInput, NoteUpdateInput> {
  constructor(@inject(DATABASE_DRIVER) driver: DatabaseDriver) {
    super(driver, 'notes');
  }

  /**
   * Find note by ID
   */
  findById(id: number): Note | undefined {
    const query = 'SELECT * FROM notes WHERE id = ?';
    const row = this.driver.executeQuerySingle<Record<string, unknown>>(query, [id]);

    if (!row) {
      return undefined;
    }

    return this.mapRowToEntity(row);
  }

  /**
   * Find all notes
   */
  findAll(): Note[] {
    const query = 'SELECT * FROM notes ORDER BY createdAt DESC, id DESC';
    const rows = this.driver.executeQuery<Record<string, unknown>>(query);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Find all notes for a specific patient
   */
  findByPatientId(patientId: number): Note[] {
    const query = `
      SELECT * FROM notes
      WHERE patientId = ?
      ORDER BY createdAt DESC, id DESC
    `;

    const rows = this.driver.executeQuery<Record<string, unknown>>(query, [patientId]);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Create a new note
   */
  create(noteData: NoteCreateInput): Note {
    const query = `
      INSERT INTO notes (patientId, title, content)
      VALUES (?, ?, ?)
    `;

    const params = [noteData.patientId, noteData.title, noteData.content];

    const result = this.driver.executeCommand(query, params);
    const createdNote = this.findById(result.lastInsertRowid as number);

    if (!createdNote) {
      throw new Error('Failed to create note');
    }

    return createdNote;
  }

  /**
   * Update a note
   */
  update(noteData: NoteUpdateInput): Note | undefined {
    const { id, ...updateFields } = noteData;
    const fields = Object.keys(updateFields);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => updateFields[field as keyof Omit<NoteUpdateInput, 'id'>]);

    const query = `
      UPDATE notes
      SET ${setClause}, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `;

    this.driver.executeCommand(query, [...values, id]);

    return this.findById(id);
  }

  /**
   * Delete a note
   */
  delete(id: number): boolean {
    const query = 'DELETE FROM notes WHERE id = ?';
    const result = this.driver.executeCommand(query, [id]);

    return result.changes > 0;
  }

  /**
   * Delete all notes for a patient (cascade delete)
   */
  deleteByPatientId(patientId: number): number {
    const query = 'DELETE FROM notes WHERE patientId = ?';
    const result = this.driver.executeCommand(query, [patientId]);

    return result.changes;
  }

  /**
   * Count notes for a specific patient
   */
  countByPatientId(patientId: number): number {
    const query = 'SELECT COUNT(*) as count FROM notes WHERE patientId = ?';
    const result = this.driver.executeQuerySingle<{ count: number }>(query, [patientId]);

    return result?.count ?? 0;
  }

  /**
   * Search notes by title or content
   */
  search(searchTerm: string): Note[] {
    const likeTerm = `%${searchTerm}%`;
    const query = `
      SELECT * FROM notes
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY createdAt DESC
    `;

    const rows = this.driver.executeQuery<Record<string, unknown>>(query, [likeTerm, likeTerm]);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Map database row to Note entity
   */
  protected mapRowToEntity(row: Record<string, unknown>): Note {
    return {
      id: row.id as number | undefined,
      patientId: row.patientId as number,
      title: row.title as string,
      content: row.content as string,
      createdAt: (row.createdAt as string) ?? undefined,
      updatedAt: (row.updatedAt as string) ?? undefined,
    };
  }
}
