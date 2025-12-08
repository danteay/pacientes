import Database from 'better-sqlite3';
import { Note, NoteCreateInput, NoteUpdateInput } from '../../types/note';

export class Appointments {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  create(noteData: NoteCreateInput): Note {
    const stmt = this.db.prepare(`
      INSERT INTO notes (patientId, title, content)
      VALUES (?, ?, ?)
    `);

    const info = stmt.run(noteData.patientId, noteData.title, noteData.content);

    // Get the last inserted note using the returned lastInsertRowid
    const note = this.getById(info.lastInsertRowid as number);
    if (!note) throw new Error('Failed to create note');

    return note;
  }

  getByPatientId(patientId: number): Note[] {
    const stmt = this.db.prepare(
      'SELECT * FROM notes WHERE patientId = ? ORDER BY createdAt DESC, id DESC'
    );

    const rows = stmt.all(patientId);

    return rows.map((row) => this.rowToNote(row as Record<string, unknown>));
  }

  getById(id: number): Note | undefined {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ?');
    const row = stmt.get(id);

    if (!row) {
      return undefined;
    }

    return this.rowToNote(row as Record<string, unknown>);
  }

  update(noteData: NoteUpdateInput): Note | undefined {
    const { id, ...updateFields } = noteData;
    const fields = Object.keys(updateFields);

    if (fields.length === 0) {
      return this.getById(id);
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => updateFields[field as keyof Omit<NoteUpdateInput, 'id'>]);

    const query = `
      UPDATE notes
      SET ${setClause}, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `;

    const stmt = this.db.prepare(query);
    stmt.run(...values, id);

    return this.getById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    const info = stmt.run(id);

    // Check if any rows were deleted
    return info.changes > 0;
  }

  private rowToNote(row: Record<string, unknown>): Note {
    return {
      id: row.id as number | undefined,
      patientId: row.patientId as number,
      title: row.title as string,
      content: row.content as string,
      createdAt: row.createdAt as string | undefined,
      updatedAt: row.updatedAt as string | undefined,
    };
  }
}
