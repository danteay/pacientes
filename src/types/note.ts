export interface Note {
  id?: number;
  patientId: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoteCreateInput extends Omit<Note, 'id' | 'createdAt' | 'updatedAt'> {}

export interface NoteUpdateInput extends Partial<Omit<Note, 'id' | 'patientId'>> {
  id: number;
}
