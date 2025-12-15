export interface LegalTutor {
  id?: number;
  patientId: number;
  fullName: string;
  phoneNumber: string;
  relation: string;
  email: string;
  birthDate: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LegalTutorCreateInput extends Omit<LegalTutor, 'id' | 'createdAt' | 'updatedAt'> {}

export interface LegalTutorUpdateInput extends Partial<LegalTutorCreateInput> {
  id: number;
}
