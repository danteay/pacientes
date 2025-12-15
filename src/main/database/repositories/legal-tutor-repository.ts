import { DatabaseDriver } from '../driver/database-driver';
import { BaseRepository } from './base-repository';
import {
  LegalTutor,
  LegalTutorCreateInput,
  LegalTutorUpdateInput,
} from '../../../types/legal-tutor';

/**
 * Legal Tutor Repository
 *
 * Responsible for:
 * - Database queries related to legal tutors
 * - Data mapping between database rows and LegalTutor entities
 * - No business logic (that belongs in the service layer)
 */
export class LegalTutorRepository extends BaseRepository<
  LegalTutor,
  LegalTutorCreateInput,
  LegalTutorUpdateInput
> {
  constructor(driver: DatabaseDriver) {
    super(driver, 'legal_tutors');
  }

  /**
   * Find legal tutor by ID
   */
  findById(id: number): LegalTutor | undefined {
    const query = 'SELECT * FROM legal_tutors WHERE id = ?';
    const row = this.driver.executeQuerySingle<Record<string, unknown>>(query, [id]);

    if (!row) {
      return undefined;
    }

    return this.mapRowToEntity(row);
  }

  /**
   * Find all legal tutors
   */
  findAll(): LegalTutor[] {
    const query = 'SELECT * FROM legal_tutors ORDER BY createdAt DESC';
    const rows = this.driver.executeQuery<Record<string, unknown>>(query);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Find all legal tutors for a patient
   */
  findByPatientId(patientId: number): LegalTutor[] {
    const query = 'SELECT * FROM legal_tutors WHERE patientId = ? ORDER BY createdAt DESC';
    const rows = this.driver.executeQuery<Record<string, unknown>>(query, [patientId]);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Create a new legal tutor
   */
  create(tutorData: LegalTutorCreateInput): LegalTutor {
    const query = `
      INSERT INTO legal_tutors (patientId, fullName, phoneNumber, relation, email, birthDate, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      tutorData.patientId,
      tutorData.fullName,
      tutorData.phoneNumber,
      tutorData.relation,
      tutorData.email,
      tutorData.birthDate,
      tutorData.address || null,
    ];

    const result = this.driver.executeCommand(query, params);
    const createdTutor = this.findById(Number(result.lastInsertRowid));

    if (!createdTutor) {
      throw new Error('Failed to create legal tutor');
    }

    return createdTutor;
  }

  /**
   * Update a legal tutor
   */
  update(tutorData: LegalTutorUpdateInput): LegalTutor | undefined {
    const { id, ...updateFields } = tutorData;
    const fields = Object.keys(updateFields);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map(
      (field) => updateFields[field as keyof Omit<LegalTutorUpdateInput, 'id'>]
    );

    const query = `
      UPDATE legal_tutors
      SET ${setClause}, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `;

    this.driver.executeCommand(query, [...values, id]);

    return this.findById(id);
  }

  /**
   * Delete a legal tutor
   */
  delete(id: number): boolean {
    const query = 'DELETE FROM legal_tutors WHERE id = ?';
    const result = this.driver.executeCommand(query, [id]);

    return result.changes > 0;
  }

  /**
   * Delete all legal tutors for a patient
   */
  deleteByPatientId(patientId: number): number {
    const query = 'DELETE FROM legal_tutors WHERE patientId = ?';
    const result = this.driver.executeCommand(query, [patientId]);

    return result.changes;
  }

  /**
   * Count legal tutors for a patient
   */
  countByPatientId(patientId: number): number {
    const query = 'SELECT COUNT(*) as count FROM legal_tutors WHERE patientId = ?';
    const result = this.driver.executeQuerySingle<{ count: number }>(query, [patientId]);
    return result?.count ?? 0;
  }

  /**
   * Map database row to LegalTutor entity
   */
  protected mapRowToEntity(row: Record<string, unknown>): LegalTutor {
    return {
      id: row.id as number,
      patientId: row.patientId as number,
      fullName: row.fullName as string,
      phoneNumber: row.phoneNumber as string,
      relation: row.relation as string,
      email: row.email as string,
      birthDate: row.birthDate as string,
      address: row.address as string | undefined,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    };
  }
}
