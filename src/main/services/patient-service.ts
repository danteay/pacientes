import { PatientRepository } from '../database/repositories/patient-repository';
import {
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
  PatientStatus,
} from '../../types/patient';

/**
 * Patient Service
 *
 * Responsible for:
 * - Business logic related to patients
 * - Validation rules
 * - Coordination between multiple repositories
 * - Business-level error handling
 */
export class PatientService {
  private patientRepository: PatientRepository;

  constructor(patientRepository: PatientRepository) {
    this.patientRepository = patientRepository;
  }

  /**
   * Create a new patient with validation
   */
  createPatient(patientData: PatientCreateInput): Patient {
    // Business logic: Validate patient data
    this.validatePatientData(patientData);

    // Business logic: Normalize email to lowercase
    const normalizedData: PatientCreateInput = {
      ...patientData,
      email: patientData.email.toLowerCase().trim(),
      phoneNumber: patientData.phoneNumber.trim(),
      name: patientData.name.trim(),
    };

    return this.patientRepository.create(normalizedData);
  }

  /**
   * Get patient by ID
   */
  getPatientById(id: number): Patient | undefined {
    if (id <= 0) {
      throw new Error('Invalid patient ID');
    }

    return this.patientRepository.findById(id);
  }

  /**
   * Get all patients
   */
  getAllPatients(): Patient[] {
    return this.patientRepository.findAll();
  }

  /**
   * Update patient with validation
   */
  updatePatient(patientData: PatientUpdateInput): Patient | undefined {
    if (patientData.id <= 0) {
      throw new Error('Invalid patient ID');
    }

    // Check if patient exists
    const existingPatient = this.patientRepository.findById(patientData.id);
    if (!existingPatient) {
      throw new Error(`Patient with ID ${patientData.id} not found`);
    }

    // Business logic: Validate updated fields
    if (patientData.email) {
      this.validateEmail(patientData.email);
      patientData.email = patientData.email.toLowerCase().trim();
    }

    if (patientData.name) {
      patientData.name = patientData.name.trim();
    }

    if (patientData.phoneNumber) {
      patientData.phoneNumber = patientData.phoneNumber.trim();
    }

    if (patientData.age !== undefined && patientData.age < 0) {
      throw new Error('Age must be a positive number');
    }

    if (patientData.children !== undefined && patientData.children < 0) {
      throw new Error('Number of children must be a positive number');
    }

    return this.patientRepository.update(patientData);
  }

  /**
   * Delete patient
   */
  deletePatient(id: number): boolean {
    if (id <= 0) {
      throw new Error('Invalid patient ID');
    }

    const exists = this.patientRepository.exists(id);
    if (!exists) {
      throw new Error(`Patient with ID ${id} not found`);
    }

    return this.patientRepository.delete(id);
  }

  /**
   * Search patients with optional status filter
   */
  searchPatients(searchTerm: string, status?: PatientStatus): Patient[] {
    if (!searchTerm || searchTerm.trim() === '') {
      // If no search term, return all patients or filter by status
      if (status) {
        return this.patientRepository.findByStatus(status);
      }
      return this.getAllPatients();
    }

    return this.patientRepository.search(searchTerm.trim(), status);
  }

  /**
   * Get patients by status
   */
  getPatientsByStatus(status: PatientStatus): Patient[] {
    return this.patientRepository.findByStatus(status);
  }

  /**
   * Set first appointment date for a patient
   * Business rule: Only set if not already set
   */
  setFirstAppointmentDateIfNotSet(patientId: number): void {
    const patient = this.patientRepository.findById(patientId);

    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }

    // Business rule: Only set if not already set
    if (!patient.firstAppointmentDate) {
      const today = new Date().toISOString().split('T')[0];
      this.patientRepository.updateFirstAppointmentDate(patientId, today);
    }
  }

  /**
   * Get patients statistics
   */
  getPatientStatistics(): {
    total: number;
    withoutFirstAppointment: number;
    averageAge: number;
  } {
    const allPatients = this.patientRepository.findAll();
    const patientsWithoutAppointment = this.patientRepository.findPatientsWithoutFirstAppointment();

    const averageAge =
      allPatients.length > 0
        ? allPatients.reduce((sum, patient) => sum + patient.age, 0) / allPatients.length
        : 0;

    return {
      total: allPatients.length,
      withoutFirstAppointment: patientsWithoutAppointment.length,
      averageAge: Math.round(averageAge * 100) / 100,
    };
  }

  /**
   * Validate patient data (business rules)
   */
  private validatePatientData(patientData: PatientCreateInput): void {
    // Validate name
    if (!patientData.name || patientData.name.trim() === '') {
      throw new Error('Patient name is required');
    }

    if (patientData.name.length > 255) {
      throw new Error('Patient name must be less than 255 characters');
    }

    // Validate age
    if (patientData.age < 0 || patientData.age > 150) {
      throw new Error('Age must be between 0 and 150');
    }

    // Validate email
    this.validateEmail(patientData.email);

    // Validate phone number
    if (!patientData.phoneNumber || patientData.phoneNumber.trim() === '') {
      throw new Error('Phone number is required');
    }

    // Validate children count
    if (patientData.children < 0) {
      throw new Error('Number of children must be a positive number');
    }

    // Validate birth date
    if (!patientData.birthDate) {
      throw new Error('Birth date is required');
    }

    const birthDate = new Date(patientData.birthDate);
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid birth date format');
    }

    if (birthDate > new Date()) {
      throw new Error('Birth date cannot be in the future');
    }
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    if (!email || email.trim() === '') {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }
}
