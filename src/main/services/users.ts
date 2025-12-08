import Database from 'better-sqlite3';
import {
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
  MaritalStatus,
  Gender,
} from '../../types/patient';

export class Users {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  create(patientData: PatientCreateInput): Patient {
    const stmt = this.db.prepare(`
      INSERT INTO patients (
        name, age, email, phoneNumber, birthDate, maritalStatus,
        gender, educationalLevel, profession, livesWith, children,
        previousPsychologicalExperience, firstAppointmentDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      patientData.name,
      patientData.age,
      patientData.email,
      patientData.phoneNumber,
      patientData.birthDate,
      patientData.maritalStatus,
      patientData.gender,
      patientData.educationalLevel,
      patientData.profession,
      patientData.livesWith,
      patientData.children,
      patientData.previousPsychologicalExperience || null,
      patientData.firstAppointmentDate || null
    );

    // Get the last inserted patient using the returned lastInsertRowid
    const patient = this.getById(info.lastInsertRowid as number);
    if (!patient) throw new Error('Failed to create patient');

    return patient;
  }

  getById(id: number): Patient | undefined {
    const stmt = this.db.prepare('SELECT * FROM patients WHERE id = ?');
    const row = stmt.get(id);

    if (!row) {
      return undefined;
    }

    return this.rowToPatient(row as Record<string, unknown>);
  }

  getAll(): Patient[] {
    const stmt = this.db.prepare('SELECT * FROM patients ORDER BY createdAt DESC, id DESC');
    const rows = stmt.all();

    return rows.map((row) => this.rowToPatient(row as Record<string, unknown>));
  }

  update(patientData: PatientUpdateInput): Patient | undefined {
    const { id, ...updateFields } = patientData;
    const fields = Object.keys(updateFields);

    if (fields.length === 0) {
      return this.getById(id);
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map(
      (field) => updateFields[field as keyof Omit<PatientUpdateInput, 'id'>]
    );

    const query = `
      UPDATE patients
      SET ${setClause}, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `;

    const stmt = this.db.prepare(query);
    stmt.run(...values, id);

    return this.getById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM patients WHERE id = ?');
    const info = stmt.run(id);

    // Check if any rows were deleted
    return info.changes > 0;
  }

  search(searchTerm: string): Patient[] {
    const likeTerm = `%${searchTerm}%`;
    const stmt = this.db.prepare(`
      SELECT * FROM patients
      WHERE name LIKE ? OR email LIKE ? OR phoneNumber LIKE ?
      ORDER BY createdAt DESC
    `);

    const rows = stmt.all(likeTerm, likeTerm, likeTerm);

    return rows.map((row) => this.rowToPatient(row as Record<string, unknown>));
  }

  updateFirstAppointmentDate(patientId: number, date: string): void {
    const updateStmt = this.db.prepare(`
      UPDATE patients
      SET firstAppointmentDate = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `);
    updateStmt.run(date, patientId);
    console.log(`Set first appointment date for patient ${patientId}: ${date}`);
  }

  private rowToPatient(row: Record<string, unknown>): Patient {
    return {
      id: row.id as number | undefined,
      name: row.name as string,
      age: row.age as number,
      email: row.email as string,
      phoneNumber: row.phoneNumber as string,
      birthDate: row.birthDate as string,
      maritalStatus: row.maritalStatus as MaritalStatus,
      gender: row.gender as Gender,
      educationalLevel: row.educationalLevel as string,
      profession: row.profession as string,
      livesWith: row.livesWith as string,
      children: row.children as number,
      previousPsychologicalExperience: row.previousPsychologicalExperience as string | undefined,
      firstAppointmentDate: row.firstAppointmentDate as string | undefined,
      createdAt: row.createdAt as string | undefined,
      updatedAt: row.updatedAt as string | undefined,
    };
  }
}
