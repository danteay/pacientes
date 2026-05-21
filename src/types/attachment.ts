export interface Attachment {
  id?: number;
  patientId: number;
  name: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttachmentCreateInput extends Omit<Attachment, 'id' | 'createdAt' | 'updatedAt'> {}

export interface AttachmentUpdateInput extends Partial<AttachmentCreateInput> {
  id: number;
}
