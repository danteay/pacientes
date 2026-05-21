import { injectable } from 'tsyringe';
import { AttachmentRepository } from '../repository/attachment-repository';
import {
  Attachment,
  AttachmentCreateInput,
  AttachmentUpdateInput,
} from '../../../../types/attachment';

/**
 * Attachment Service
 *
 * Responsible for:
 * - Business logic related to attachments domain only
 * - Validation rules for attachments
 * - Can only import its own domain repository (AttachmentRepository)
 */
@injectable()
export class AttachmentService {
  private attachmentRepository: AttachmentRepository;

  constructor(attachmentRepository: AttachmentRepository) {
    this.attachmentRepository = attachmentRepository;
  }

  /**
   * Create a new attachment with validation
   */
  createAttachment(attachmentData: AttachmentCreateInput): Attachment {
    // Business logic: Validate attachment data
    this.validateAttachmentData(attachmentData);

    // Business logic: Normalize data
    const normalizedData: AttachmentCreateInput = {
      ...attachmentData,
      name: attachmentData.name.trim(),
      url: attachmentData.url.trim(),
    };

    return this.attachmentRepository.create(normalizedData);
  }

  /**
   * Get attachment by ID
   */
  getAttachmentById(id: number): Attachment | undefined {
    if (id <= 0) {
      throw new Error('Invalid attachment ID');
    }

    return this.attachmentRepository.findById(id);
  }

  /**
   * Get all attachments for a patient
   */
  getAttachmentsByPatientId(patientId: number): Attachment[] {
    if (patientId <= 0) {
      throw new Error('Invalid patient ID');
    }

    return this.attachmentRepository.findByPatientId(patientId);
  }

  /**
   * Update an attachment
   */
  updateAttachment(attachmentData: AttachmentUpdateInput): Attachment {
    const existingAttachment = this.attachmentRepository.findById(attachmentData.id);

    if (!existingAttachment) {
      throw new Error('Attachment not found');
    }

    // Validate updated data
    if (attachmentData.name !== undefined || attachmentData.url !== undefined) {
      this.validateAttachmentData({
        patientId: existingAttachment.patientId,
        name: attachmentData.name ?? existingAttachment.name,
        url: attachmentData.url ?? existingAttachment.url,
      });
    }

    // Normalize data if provided
    const normalizedData: AttachmentUpdateInput = {
      ...attachmentData,
      name: attachmentData.name?.trim(),
      url: attachmentData.url?.trim(),
    };

    const updated = this.attachmentRepository.update(normalizedData);

    if (!updated) {
      throw new Error('Failed to update attachment');
    }

    return updated;
  }

  /**
   * Delete an attachment
   */
  deleteAttachment(id: number): boolean {
    if (id <= 0) {
      throw new Error('Invalid attachment ID');
    }

    const exists = this.attachmentRepository.findById(id);
    if (!exists) {
      throw new Error('Attachment not found');
    }

    return this.attachmentRepository.delete(id);
  }

  /**
   * Delete all attachments for a patient
   */
  deleteAttachmentsByPatientId(patientId: number): boolean {
    if (patientId <= 0) {
      throw new Error('Invalid patient ID');
    }

    const deletedCount = this.attachmentRepository.deleteByPatientId(patientId);
    return deletedCount > 0;
  }

  /**
   * Validate attachment data
   */
  private validateAttachmentData(data: AttachmentCreateInput): void {
    // Validate patient ID
    if (!data.patientId || data.patientId <= 0) {
      throw new Error('Valid patient ID is required');
    }

    // Validate name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Attachment name is required');
    }

    if (data.name.trim().length < 2) {
      throw new Error('Attachment name must be at least 2 characters');
    }

    // Validate URL
    if (!data.url || data.url.trim().length === 0) {
      throw new Error('Attachment URL is required');
    }

    // Validate URL format (must start with http:// or https://)
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(data.url.trim())) {
      throw new Error('Invalid URL format. Must start with http:// or https://');
    }
  }
}
