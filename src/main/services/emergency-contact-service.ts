import { EmergencyContactRepository } from '../database/repositories/emergency-contact-repository';
import {
  EmergencyContact,
  EmergencyContactCreateInput,
  EmergencyContactUpdateInput,
} from '../../types/emergency-contact';

/**
 * Emergency Contact Service
 *
 * Responsible for:
 * - Business logic related to emergency contacts
 * - Validation rules
 * - Coordination between repositories
 * - Business-level error handling
 */
export class EmergencyContactService {
  private emergencyContactRepository: EmergencyContactRepository;

  constructor(emergencyContactRepository: EmergencyContactRepository) {
    this.emergencyContactRepository = emergencyContactRepository;
  }

  /**
   * Create a new emergency contact with validation
   */
  createEmergencyContact(contactData: EmergencyContactCreateInput): EmergencyContact {
    // Business logic: Validate contact data
    this.validateContactData(contactData);

    // Business logic: Normalize data
    const normalizedData: EmergencyContactCreateInput = {
      ...contactData,
      fullName: contactData.fullName.trim(),
      email: contactData.email.toLowerCase().trim(),
      phoneNumber: contactData.phoneNumber.trim(),
      relation: contactData.relation.trim(),
      address: contactData.address?.trim(),
    };

    return this.emergencyContactRepository.create(normalizedData);
  }

  /**
   * Get emergency contact by ID
   */
  getEmergencyContactById(id: number): EmergencyContact | undefined {
    if (id <= 0) {
      throw new Error('Invalid emergency contact ID');
    }

    return this.emergencyContactRepository.findById(id);
  }

  /**
   * Get all emergency contacts for a patient
   */
  getEmergencyContactsByPatientId(patientId: number): EmergencyContact[] {
    if (patientId <= 0) {
      throw new Error('Invalid patient ID');
    }

    return this.emergencyContactRepository.findByPatientId(patientId);
  }

  /**
   * Update an emergency contact
   */
  updateEmergencyContact(contactData: EmergencyContactUpdateInput): EmergencyContact {
    const existingContact = this.emergencyContactRepository.findById(contactData.id);

    if (!existingContact) {
      throw new Error('Emergency contact not found');
    }

    // Validate updated data
    if (contactData.fullName !== undefined || contactData.email !== undefined) {
      this.validateContactData({
        patientId: existingContact.patientId,
        fullName: contactData.fullName ?? existingContact.fullName,
        phoneNumber: contactData.phoneNumber ?? existingContact.phoneNumber,
        relation: contactData.relation ?? existingContact.relation,
        email: contactData.email ?? existingContact.email,
        address: contactData.address,
      });
    }

    // Normalize data if provided
    const normalizedData: EmergencyContactUpdateInput = {
      ...contactData,
      fullName: contactData.fullName?.trim(),
      email: contactData.email?.toLowerCase().trim(),
      phoneNumber: contactData.phoneNumber?.trim(),
      relation: contactData.relation?.trim(),
      address: contactData.address?.trim(),
    };

    const updated = this.emergencyContactRepository.update(normalizedData);

    if (!updated) {
      throw new Error('Failed to update emergency contact');
    }

    return updated;
  }

  /**
   * Delete an emergency contact
   */
  deleteEmergencyContact(id: number): boolean {
    if (id <= 0) {
      throw new Error('Invalid emergency contact ID');
    }

    const exists = this.emergencyContactRepository.findById(id);
    if (!exists) {
      throw new Error('Emergency contact not found');
    }

    return this.emergencyContactRepository.delete(id);
  }

  /**
   * Delete all emergency contacts for a patient
   */
  deleteEmergencyContactsByPatientId(patientId: number): boolean {
    if (patientId <= 0) {
      throw new Error('Invalid patient ID');
    }

    return this.emergencyContactRepository.deleteByPatientId(patientId);
  }

  /**
   * Validate emergency contact data
   */
  private validateContactData(data: EmergencyContactCreateInput): void {
    // Validate full name
    if (!data.fullName || data.fullName.trim().length === 0) {
      throw new Error('Full name is required');
    }

    if (data.fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }

    // Validate phone number
    if (!data.phoneNumber || data.phoneNumber.trim().length === 0) {
      throw new Error('Phone number is required');
    }

    // Validate relation
    if (!data.relation || data.relation.trim().length === 0) {
      throw new Error('Relation is required');
    }

    // Validate email
    if (!data.email || data.email.trim().length === 0) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      throw new Error('Invalid email format');
    }
  }
}
