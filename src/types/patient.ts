export interface Patient {
  id?: number;
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
  birthDate: string; // ISO date string
  maritalStatus: MaritalStatus;
  gender: Gender;
  educationalLevel: string;
  profession: string;
  livesWith: string;
  children: number;
  previousPsychologicalExperience?: string;
  firstAppointmentDate?: string; // ISO date string, can be null
  createdAt?: string;
  updatedAt?: string;
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export interface PatientCreateInput extends Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> {}

export interface PatientUpdateInput extends Partial<PatientCreateInput> {
  id: number;
}
