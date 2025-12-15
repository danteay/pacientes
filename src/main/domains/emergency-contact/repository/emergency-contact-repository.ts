import { inject, injectable } from 'tsyringe';
import { DatabaseDriver } from '../../../database/driver/database-driver';
import { BaseRepository } from '../../../database/repositories/base-repository';
import { DATABASE_DRIVER } from '../../../infrastructure/ioc/container';
import {
  EmergencyContact,
  EmergencyContactCreateInput,
  EmergencyContactUpdateInput,
} from '../../../../types/emergency-contact';

/**
 * Emergency Contact Repository
 *
 * Responsible for:
 * - Database queries related to emergency contacts
 * - Data mapping between database rows and EmergencyContact entities
 * - No business logic (that belongs in the service layer)
 */
@injectable()
export class EmergencyContactRepository extends BaseRepository<
  EmergencyContact,
  EmergencyContactCreateInput,
  EmergencyContactUpdateInput
> {
  constructor(@inject(DATABASE_DRIVER) driver: DatabaseDriver) {
    super(driver, 'emergency_contacts');
  }

  /**
   * Find emergency contact by ID
   */
  findById(id: number): EmergencyContact | undefined {
    const query = 'SELECT * FROM emergency_contacts WHERE id = ?';
    const row = this.driver.executeQuerySingle<Record<string, unknown>>(query, [id]);

    if (!row) {
      return undefined;
    }

    return this.mapRowToEntity(row);
  }

  /**
   * Find all emergency contacts
   */
  findAll(): EmergencyContact[] {
    const query = 'SELECT * FROM emergency_contacts ORDER BY createdAt DESC';
    const rows = this.driver.executeQuery<Record<string, unknown>>(query);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Find all emergency contacts for a patient
   */
  findByPatientId(patientId: number): EmergencyContact[] {
    const query = 'SELECT * FROM emergency_contacts WHERE patientId = ? ORDER BY createdAt DESC';
    const rows = this.driver.executeQuery<Record<string, unknown>>(query, [patientId]);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Create a new emergency contact
   */
  create(contactData: EmergencyContactCreateInput): EmergencyContact {
    const query = `
      INSERT INTO emergency_contacts (
        patientId, fullName, phoneNumber, relation, email, address
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      contactData.patientId,
      contactData.fullName,
      contactData.phoneNumber,
      contactData.relation,
      contactData.email,
      contactData.address ?? null,
    ];

    const result = this.driver.executeCommand(query, params);
    const createdContact = this.findById(result.lastInsertRowid as number);

    if (!createdContact) {
      throw new Error('Failed to create emergency contact');
    }

    return createdContact;
  }

  /**
   * Update an emergency contact
   */
  update(contactData: EmergencyContactUpdateInput): EmergencyContact | undefined {
    const { id, ...updateFields } = contactData;
    const fields = Object.keys(updateFields);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map(
      (field) => updateFields[field as keyof Omit<EmergencyContactUpdateInput, 'id'>]
    );

    const query = `
      UPDATE emergency_contacts
      SET ${setClause}, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `;

    this.driver.executeCommand(query, [...values, id]);

    return this.findById(id);
  }

  /**
   * Delete an emergency contact
   */
  delete(id: number): boolean {
    const query = 'DELETE FROM emergency_contacts WHERE id = ?';
    const result = this.driver.executeCommand(query, [id]);

    return result.changes > 0;
  }

  /**
   * Delete all emergency contacts for a patient
   */
  deleteByPatientId(patientId: number): boolean {
    const query = 'DELETE FROM emergency_contacts WHERE patientId = ?';
    const result = this.driver.executeCommand(query, [patientId]);

    return result.changes > 0;
  }

  /**
   * Map database row to EmergencyContact entity
   */
  protected mapRowToEntity(row: Record<string, unknown>): EmergencyContact {
    return {
      id: row.id as number | undefined,
      patientId: row.patientId as number,
      fullName: row.fullName as string,
      phoneNumber: row.phoneNumber as string,
      relation: row.relation as string,
      email: row.email as string,
      address: (row.address as string) ?? undefined,
      createdAt: (row.createdAt as string) ?? undefined,
      updatedAt: (row.updatedAt as string) ?? undefined,
    };
  }
}
