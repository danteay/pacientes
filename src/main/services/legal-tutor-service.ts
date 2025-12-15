import { LegalTutorRepository } from '../database/repositories/legal-tutor-repository';
import { LegalTutor, LegalTutorCreateInput, LegalTutorUpdateInput } from '../../types/legal-tutor';

/**
 * Legal Tutor Service
 *
 * Responsible for:
 * - Business logic related to legal tutors
 * - Validation rules
 * - Coordination between repositories
 * - Business-level error handling
 */
export class LegalTutorService {
  private legalTutorRepository: LegalTutorRepository;

  constructor(legalTutorRepository: LegalTutorRepository) {
    this.legalTutorRepository = legalTutorRepository;
  }

  /**
   * Create a new legal tutor with validation
   */
  createLegalTutor(tutorData: LegalTutorCreateInput): LegalTutor {
    // Business logic: Validate tutor data
    this.validateTutorData(tutorData);

    // Business logic: Normalize data
    const normalizedData: LegalTutorCreateInput = {
      ...tutorData,
      fullName: tutorData.fullName.trim(),
      email: tutorData.email.toLowerCase().trim(),
      phoneNumber: tutorData.phoneNumber.trim(),
      relation: tutorData.relation.trim(),
      birthDate: tutorData.birthDate.trim(),
      address: tutorData.address?.trim(),
    };

    return this.legalTutorRepository.create(normalizedData);
  }

  /**
   * Get legal tutor by ID
   */
  getLegalTutorById(id: number): LegalTutor | undefined {
    if (id <= 0) {
      throw new Error('Invalid legal tutor ID');
    }

    return this.legalTutorRepository.findById(id);
  }

  /**
   * Get all legal tutors for a patient
   */
  getLegalTutorsByPatientId(patientId: number): LegalTutor[] {
    if (patientId <= 0) {
      throw new Error('Invalid patient ID');
    }

    return this.legalTutorRepository.findByPatientId(patientId);
  }

  /**
   * Update a legal tutor
   */
  updateLegalTutor(tutorData: LegalTutorUpdateInput): LegalTutor {
    const existingTutor = this.legalTutorRepository.findById(tutorData.id);

    if (!existingTutor) {
      throw new Error('Legal tutor not found');
    }

    // Validate updated data
    if (tutorData.fullName !== undefined || tutorData.email !== undefined) {
      this.validateTutorData({
        patientId: existingTutor.patientId,
        fullName: tutorData.fullName ?? existingTutor.fullName,
        phoneNumber: tutorData.phoneNumber ?? existingTutor.phoneNumber,
        relation: tutorData.relation ?? existingTutor.relation,
        email: tutorData.email ?? existingTutor.email,
        birthDate: tutorData.birthDate ?? existingTutor.birthDate,
        address: tutorData.address,
      });
    }

    // Normalize data if provided
    const normalizedData: LegalTutorUpdateInput = {
      ...tutorData,
      fullName: tutorData.fullName?.trim(),
      email: tutorData.email?.toLowerCase().trim(),
      phoneNumber: tutorData.phoneNumber?.trim(),
      relation: tutorData.relation?.trim(),
      birthDate: tutorData.birthDate?.trim(),
      address: tutorData.address?.trim(),
    };

    const updated = this.legalTutorRepository.update(normalizedData);

    if (!updated) {
      throw new Error('Failed to update legal tutor');
    }

    return updated;
  }

  /**
   * Delete a legal tutor
   */
  deleteLegalTutor(id: number): boolean {
    if (id <= 0) {
      throw new Error('Invalid legal tutor ID');
    }

    const exists = this.legalTutorRepository.findById(id);
    if (!exists) {
      throw new Error('Legal tutor not found');
    }

    return this.legalTutorRepository.delete(id);
  }

  /**
   * Delete all legal tutors for a patient
   */
  deleteLegalTutorsByPatientId(patientId: number): boolean {
    if (patientId <= 0) {
      throw new Error('Invalid patient ID');
    }

    const deletedCount = this.legalTutorRepository.deleteByPatientId(patientId);
    return deletedCount > 0;
  }

  /**
   * Validate legal tutor data
   */
  private validateTutorData(data: LegalTutorCreateInput): void {
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

    // Validate birthDate (required field)
    if (!data.birthDate || data.birthDate.trim().length === 0) {
      throw new Error('Birth date is required');
    }

    // Validate birthDate format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.birthDate.trim())) {
      throw new Error('Invalid birth date format. Expected YYYY-MM-DD');
    }

    // Validate birthDate is a valid date
    const birthDateObj = new Date(data.birthDate.trim());
    if (isNaN(birthDateObj.getTime())) {
      throw new Error('Invalid birth date');
    }

    // Validate birthDate is not in the future
    if (birthDateObj > new Date()) {
      throw new Error('Birth date cannot be in the future');
    }
  }
}
