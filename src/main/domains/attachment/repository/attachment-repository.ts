import { inject, injectable } from 'tsyringe';
import { DatabaseDriver } from '../../../database/driver/database-driver';
import { BaseRepository } from '../../../database/repositories/base-repository';
import { DATABASE_DRIVER } from '../../../infrastructure/ioc/container';
import {
  Attachment,
  AttachmentCreateInput,
  AttachmentUpdateInput,
} from '../../../../types/attachment';

/**
 * Attachment Repository
 *
 * Responsible for:
 * - Database queries related to attachments
 * - Data mapping between database rows and Attachment entities
 * - No business logic (that belongs in the service layer)
 */
@injectable()
export class AttachmentRepository extends BaseRepository<
  Attachment,
  AttachmentCreateInput,
  AttachmentUpdateInput
> {
  constructor(@inject(DATABASE_DRIVER) driver: DatabaseDriver) {
    super(driver, 'attachments');
  }

  /**
   * Find attachment by ID
   */
  findById(id: number): Attachment | undefined {
    const query = 'SELECT * FROM attachments WHERE id = ?';
    const row = this.driver.executeQuerySingle<Record<string, unknown>>(query, [id]);

    if (!row) {
      return undefined;
    }

    return this.mapRowToEntity(row);
  }

  /**
   * Find all attachments
   */
  findAll(): Attachment[] {
    const query = 'SELECT * FROM attachments ORDER BY createdAt DESC';
    const rows = this.driver.executeQuery<Record<string, unknown>>(query);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Find all attachments for a patient
   */
  findByPatientId(patientId: number): Attachment[] {
    const query = 'SELECT * FROM attachments WHERE patientId = ? ORDER BY createdAt DESC';
    const rows = this.driver.executeQuery<Record<string, unknown>>(query, [patientId]);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Create a new attachment
   */
  create(attachmentData: AttachmentCreateInput): Attachment {
    const query = `
      INSERT INTO attachments (patientId, name, url)
      VALUES (?, ?, ?)
    `;

    const params = [attachmentData.patientId, attachmentData.name, attachmentData.url];

    const result = this.driver.executeCommand(query, params);
    const createdAttachment = this.findById(Number(result.lastInsertRowid));

    if (!createdAttachment) {
      throw new Error('Failed to create attachment');
    }

    return createdAttachment;
  }

  /**
   * Update an attachment
   */
  update(attachmentData: AttachmentUpdateInput): Attachment | undefined {
    const { id, ...updateFields } = attachmentData;
    const fields = Object.keys(updateFields);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map(
      (field) => updateFields[field as keyof Omit<AttachmentUpdateInput, 'id'>]
    );

    const query = `
      UPDATE attachments
      SET ${setClause}, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `;

    this.driver.executeCommand(query, [...values, id]);

    return this.findById(id);
  }

  /**
   * Delete an attachment
   */
  delete(id: number): boolean {
    const query = 'DELETE FROM attachments WHERE id = ?';
    const result = this.driver.executeCommand(query, [id]);

    return result.changes > 0;
  }

  /**
   * Delete all attachments for a patient
   */
  deleteByPatientId(patientId: number): number {
    const query = 'DELETE FROM attachments WHERE patientId = ?';
    const result = this.driver.executeCommand(query, [patientId]);

    return result.changes;
  }

  /**
   * Count attachments for a patient
   */
  countByPatientId(patientId: number): number {
    const query = 'SELECT COUNT(*) as count FROM attachments WHERE patientId = ?';
    const result = this.driver.executeQuerySingle<{ count: number }>(query, [patientId]);
    return result?.count ?? 0;
  }

  /**
   * Map database row to Attachment entity
   */
  protected mapRowToEntity(row: Record<string, unknown>): Attachment {
    return {
      id: row.id as number,
      patientId: row.patientId as number,
      name: row.name as string,
      url: row.url as string,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    };
  }
}
