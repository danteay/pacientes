export interface EmergencyContact {
  id?: number;
  patientId: number;
  fullName: string;
  phoneNumber: string;
  relation: string;
  email: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmergencyContactCreateInput extends Omit<
  EmergencyContact,
  'id' | 'createdAt' | 'updatedAt'
> {}

export interface EmergencyContactUpdateInput extends Partial<EmergencyContactCreateInput> {
  id: number;
}
