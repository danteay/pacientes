import { DatabaseDriver } from '../driver/database-driver';
import { BaseRepository } from './base-repository';
import {
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
  MaritalStatus,
  Gender,
  PatientStatus,
} from '../../../types/patient';

/**
 * Patient Repository
 *
 * Responsible for:
 * - Database queries related to patients
 * - Data mapping between database rows and Patient entities
 * - No business logic (that belongs in the service layer)
 */
export class PatientRepository extends BaseRepository<
  Patient,
  PatientCreateInput,
  PatientUpdateInput
> {
  constructor(driver: DatabaseDriver) {
    super(driver, 'patients');
  }

  /**
   * Find patient by ID
   */
  findById(id: number): Patient | undefined {
    const query = 'SELECT * FROM patients WHERE id = ?';
    const row = this.driver.executeQuerySingle<Record<string, unknown>>(query, [id]);

    if (!row) {
      return undefined;
    }

    return this.mapRowToEntity(row);
  }

  /**
   * Find all patients, ordered by creation date
   */
  findAll(): Patient[] {
    const query = 'SELECT * FROM patients ORDER BY createdAt DESC, id DESC';
    const rows = this.driver.executeQuery<Record<string, unknown>>(query);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Create a new patient
   */
  create(patientData: PatientCreateInput): Patient {
    const query = `
      INSERT INTO patients (
        name, age, email, phoneNumber, birthDate, maritalStatus,
        gender, educationalLevel, profession, livesWith, children,
        previousPsychologicalExperience, firstAppointmentDate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
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
      patientData.previousPsychologicalExperience ?? null,
      patientData.firstAppointmentDate ?? null,
      patientData.status,
    ];

    const result = this.driver.executeCommand(query, params);
    const createdPatient = this.findById(result.lastInsertRowid as number);

    if (!createdPatient) {
      throw new Error('Failed to create patient');
    }

    return createdPatient;
  }

  /**
   * Update a patient
   */
  update(patientData: PatientUpdateInput): Patient | undefined {
    const { id, ...updateFields } = patientData;
    const fields = Object.keys(updateFields);

    if (fields.length === 0) {
      return this.findById(id);
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

    this.driver.executeCommand(query, [...values, id]);

    return this.findById(id);
  }

  /**
   * Delete a patient
   */
  delete(id: number): boolean {
    const query = 'DELETE FROM patients WHERE id = ?';
    const result = this.driver.executeCommand(query, [id]);

    return result.changes > 0;
  }

  /**
   * Search patients by name, email, or phone with optional status filter
   */
  search(searchTerm: string, status?: PatientStatus): Patient[] {
    const likeTerm = `%${searchTerm}%`;
    let query = `
      SELECT * FROM patients
      WHERE (name LIKE ? OR email LIKE ? OR phoneNumber LIKE ?)
    `;
    const params: unknown[] = [likeTerm, likeTerm, likeTerm];

    // Add status filter if provided
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY createdAt DESC`;

    const rows = this.driver.executeQuery<Record<string, unknown>>(query, params);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Find patients by status
   */
  findByStatus(status: PatientStatus): Patient[] {
    const query = `
      SELECT * FROM patients
      WHERE status = ?
      ORDER BY createdAt DESC
    `;

    const rows = this.driver.executeQuery<Record<string, unknown>>(query, [status]);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Update only the first appointment date
   */
  updateFirstAppointmentDate(patientId: number, date: string): void {
    const query = `
      UPDATE patients
      SET firstAppointmentDate = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `;

    this.driver.executeCommand(query, [date, patientId]);
  }

  /**
   * Find patients with no first appointment date
   */
  findPatientsWithoutFirstAppointment(): Patient[] {
    const query = `
      SELECT * FROM patients
      WHERE firstAppointmentDate IS NULL
      ORDER BY createdAt DESC
    `;

    const rows = this.driver.executeQuery<Record<string, unknown>>(query);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Map database row to Patient entity
   */
  protected mapRowToEntity(row: Record<string, unknown>): Patient {
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
      previousPsychologicalExperience: (row.previousPsychologicalExperience as string) ?? undefined,
      firstAppointmentDate: (row.firstAppointmentDate as string) ?? undefined,
      status: (row.status as PatientStatus) || PatientStatus.ACTIVE,
      createdAt: (row.createdAt as string) ?? undefined,
      updatedAt: (row.updatedAt as string) ?? undefined,
    };
  }
}
