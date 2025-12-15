export interface Patient {
  id?: number;
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
  birthDate: string; // ISO date string
  maritalStatus: MaritalStatus;
  gender: Gender;
  sexualOrientation: SexualOrientation;
  educationalLevel: string;
  profession: string;
  livesWith: string;
  children: number;
  previousPsychologicalExperience?: string;
  firstAppointmentDate?: string; // ISO date string, can be null
  status: PatientStatus;
  createdAt?: string;
  updatedAt?: string;
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
  NOT_SPECIFIED = 'not_specified',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
  NOT_SPECIFIED = 'not_specified',
}

export enum SexualOrientation {
  HETEROSEXUAL = 'heterosexual',
  HOMOSEXUAL = 'homosexual',
  BISEXUAL = 'bisexual',
  PANSEXUAL = 'pansexual',
  ASEXUAL = 'asexual',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum PatientStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  MEDICAL_DISCHARGE = 'medical_discharge',
}

export interface PatientCreateInput extends Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> {}

export interface PatientUpdateInput extends Partial<PatientCreateInput> {
  id: number;
}

/**
 * Utility functions to convert enum values to human-readable strings
 */

export function maritalStatusToString(status: MaritalStatus): string {
  switch (status) {
    case MaritalStatus.SINGLE:
      return 'Single';
    case MaritalStatus.MARRIED:
      return 'Married';
    case MaritalStatus.DIVORCED:
      return 'Divorced';
    case MaritalStatus.WIDOWED:
      return 'Widowed';
    case MaritalStatus.SEPARATED:
      return 'Separated';
    case MaritalStatus.NOT_SPECIFIED:
      return 'Not specified';
    default:
      return status;
  }
}

export function genderToString(gender: Gender): string {
  switch (gender) {
    case Gender.MALE:
      return 'Male';
    case Gender.FEMALE:
      return 'Female';
    case Gender.OTHER:
      return 'Other';
    case Gender.PREFER_NOT_TO_SAY:
      return 'Prefer not to say';
    case Gender.NOT_SPECIFIED:
      return 'Not specified';
    default:
      return gender;
  }
}

export function sexualOrientationToString(orientation: SexualOrientation): string {
  switch (orientation) {
    case SexualOrientation.HETEROSEXUAL:
      return 'Heterosexual';
    case SexualOrientation.HOMOSEXUAL:
      return 'Homosexual';
    case SexualOrientation.BISEXUAL:
      return 'Bisexual';
    case SexualOrientation.PANSEXUAL:
      return 'Pansexual';
    case SexualOrientation.ASEXUAL:
      return 'Asexual';
    case SexualOrientation.OTHER:
      return 'Other';
    case SexualOrientation.PREFER_NOT_TO_SAY:
      return 'Prefer not to say';
    default:
      return orientation;
  }
}

export function patientStatusToString(status: PatientStatus): string {
  switch (status) {
    case PatientStatus.ACTIVE:
      return 'Active';
    case PatientStatus.PAUSED:
      return 'Paused';
    case PatientStatus.MEDICAL_DISCHARGE:
      return 'Medical Discharge';
    default:
      return status;
  }
}
