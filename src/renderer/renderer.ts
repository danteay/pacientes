import { Patient, PatientCreateInput, MaritalStatus, Gender } from '../types/patient';
import { Note, NoteCreateInput } from '../types/note';

// Type declaration for the API exposed by preload script
declare global {
  interface Window {
    api: {
      patient: {
        create: (patientData: PatientCreateInput) => Promise<ApiResponse<Patient>>;
        getAll: () => Promise<ApiResponse<Patient[]>>;
        getById: (id: number) => Promise<ApiResponse<Patient>>;
        update: (patientData: any) => Promise<ApiResponse<Patient>>;
        delete: (id: number) => Promise<ApiResponse>;
        search: (searchTerm: string) => Promise<ApiResponse<Patient[]>>;
      };
      note: {
        create: (noteData: NoteCreateInput) => Promise<ApiResponse<Note>>;
        getByPatientId: (patientId: number) => Promise<ApiResponse<Note[]>>;
        getById: (id: number) => Promise<ApiResponse<Note>>;
        update: (noteData: any) => Promise<ApiResponse<Note>>;
        delete: (id: number) => Promise<ApiResponse>;
      };
    };
  }
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

let currentPatients: Patient[] = [];
let editingPatientId: number | null = null;
let currentPatientIdForNotes: number | null = null;
let currentNotes: Note[] = [];
let editingNoteId: number | null = null;

// Application initialization
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Pacientes application loaded');

  setupEventListeners();
  await loadPatients();
});

function setupEventListeners(): void {
  const addButton = document.getElementById('add-patient-btn');
  const searchButton = document.getElementById('search-btn');
  const backButton = document.getElementById('back-btn');
  const cancelButton = document.getElementById('cancel-btn');
  const patientForm = document.getElementById('patient-form') as HTMLFormElement;
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const notesBackButton = document.getElementById('notes-back-btn');
  const addNoteButton = document.getElementById('add-note-btn');
  const noteBackButton = document.getElementById('note-back-btn');
  const noteCancelButton = document.getElementById('note-cancel-btn');
  const noteForm = document.getElementById('note-form') as HTMLFormElement;
  const noteViewBackButton = document.getElementById('note-view-back-btn');
  const editNoteButton = document.getElementById('edit-note-btn');

  console.log('Setting up event listeners...', { addButton, searchButton, backButton });

  addButton?.addEventListener('click', () => {
    console.log('Add patient button clicked');
    showPatientForm();
  });
  searchButton?.addEventListener('click', handleSearchClick);
  backButton?.addEventListener('click', hidePatientForm);
  cancelButton?.addEventListener('click', hidePatientForm);
  patientForm?.addEventListener('submit', handleFormSubmit);
  notesBackButton?.addEventListener('click', hideNotesSection);
  addNoteButton?.addEventListener('click', () => showNoteForm());
  noteBackButton?.addEventListener('click', hideNoteForm);
  noteCancelButton?.addEventListener('click', hideNoteForm);
  noteForm?.addEventListener('submit', handleNoteFormSubmit);
  noteViewBackButton?.addEventListener('click', hideNoteView);
  editNoteButton?.addEventListener('click', handleEditNote);

  // Setup rich text editor toolbar
  setupRichTextEditor();

  // Also trigger search on Enter key
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  });
}

function setupRichTextEditor(): void {
  const toolbar = document.querySelector('.editor-toolbar');
  if (!toolbar) return;

  toolbar.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('.editor-btn') as HTMLButtonElement;

    if (!button) return;

    e.preventDefault();

    const command = button.dataset.command;
    const value = button.dataset.value;

    if (command) {
      document.execCommand(command, false, value);
      // Refocus on the editor
      const editor = document.getElementById('note-content');
      editor?.focus();
    }
  });
}

async function loadPatients(): Promise<void> {
  const response = await window.api.patient.getAll();

  if (response.success && response.data) {
    currentPatients = response.data;
    renderPatientList(currentPatients);
  } else {
    showError(response.error || 'Failed to load patients');
  }
}

function renderPatientList(patients: Patient[]): void {
  const listContainer = document.getElementById('patients-list');
  const emptyState = document.getElementById('empty-state');
  const table = document.getElementById('patients-table');

  if (!listContainer || !emptyState || !table) return;

  if (patients.length === 0) {
    table.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  table.style.display = 'table';
  emptyState.style.display = 'none';

  listContainer.innerHTML = patients
    .map(
      (patient) => `
        <tr data-id="${patient.id}">
          <td>${escapeHtml(patient.name)}</td>
          <td>${patient.age}</td>
          <td>${escapeHtml(patient.phoneNumber)}</td>
          <td>${escapeHtml(patient.email)}</td>
          <td class="actions">
            <button class="btn-edit" onclick="editPatient(${patient.id})">Edit</button>
            <button class="btn-notes" onclick="viewAppointmentNotes(${patient.id})">View Notes</button>
          </td>
        </tr>
      `
    )
    .join('');
}

function showPatientForm(patient?: Patient): void {
  console.log('showPatientForm called', { patient });
  editingPatientId = patient?.id || null;

  const formSection = document.getElementById('form-section');
  const listSection = document.getElementById('list-section');
  const formTitle = document.getElementById('form-title');

  console.log('Form elements:', { formSection, listSection, formTitle });

  if (formSection && listSection && formTitle) {
    formSection.style.display = 'block';
    listSection.style.display = 'none';
    formTitle.textContent = patient ? 'Edit Patient' : 'Add New Patient';

    if (patient) {
      fillForm(patient);
    } else {
      (document.getElementById('patient-form') as HTMLFormElement)?.reset();
    }
    console.log('Form displayed successfully');
  } else {
    console.error('Form elements not found!');
  }
}

function hidePatientForm(): void {
  const formSection = document.getElementById('form-section');
  const listSection = document.getElementById('list-section');

  if (formSection && listSection) {
    formSection.style.display = 'none';
    listSection.style.display = 'block';
    editingPatientId = null;
    (document.getElementById('patient-form') as HTMLFormElement)?.reset();
  }
}

function fillForm(patient: Patient): void {
  (document.getElementById('name') as HTMLInputElement).value = patient.name;
  (document.getElementById('age') as HTMLInputElement).value = patient.age.toString();
  (document.getElementById('email') as HTMLInputElement).value = patient.email;
  (document.getElementById('phoneNumber') as HTMLInputElement).value = patient.phoneNumber;
  (document.getElementById('birthDate') as HTMLInputElement).value = patient.birthDate;
  (document.getElementById('firstAppointmentDate') as HTMLInputElement).value = patient.firstAppointmentDate || '';
  (document.getElementById('maritalStatus') as HTMLSelectElement).value = patient.maritalStatus;
  (document.getElementById('gender') as HTMLSelectElement).value = patient.gender;
  (document.getElementById('educationalLevel') as HTMLInputElement).value = patient.educationalLevel;
  (document.getElementById('profession') as HTMLInputElement).value = patient.profession;
  (document.getElementById('livesWith') as HTMLInputElement).value = patient.livesWith;
  (document.getElementById('children') as HTMLInputElement).value = patient.children.toString();
  (document.getElementById('previousPsychologicalExperience') as HTMLTextAreaElement).value =
    patient.previousPsychologicalExperience || '';
}

async function handleFormSubmit(event: Event): Promise<void> {
  event.preventDefault();

  const formData = getFormData();

  if (editingPatientId) {
    await updatePatient({ ...formData, id: editingPatientId });
  } else {
    await createPatient(formData);
  }
}

function getFormData(): PatientCreateInput {
  const firstAppointmentDateInput = (document.getElementById('firstAppointmentDate') as HTMLInputElement).value;

  return {
    name: (document.getElementById('name') as HTMLInputElement).value,
    age: parseInt((document.getElementById('age') as HTMLInputElement).value),
    email: (document.getElementById('email') as HTMLInputElement).value,
    phoneNumber: (document.getElementById('phoneNumber') as HTMLInputElement).value,
    birthDate: (document.getElementById('birthDate') as HTMLInputElement).value,
    maritalStatus: (document.getElementById('maritalStatus') as HTMLSelectElement).value as MaritalStatus,
    gender: (document.getElementById('gender') as HTMLSelectElement).value as Gender,
    educationalLevel: (document.getElementById('educationalLevel') as HTMLInputElement).value,
    profession: (document.getElementById('profession') as HTMLInputElement).value,
    livesWith: (document.getElementById('livesWith') as HTMLInputElement).value,
    children: parseInt((document.getElementById('children') as HTMLInputElement).value),
    previousPsychologicalExperience: (document.getElementById('previousPsychologicalExperience') as HTMLTextAreaElement).value,
    firstAppointmentDate: firstAppointmentDateInput && firstAppointmentDateInput.trim() !== '' ? firstAppointmentDateInput : undefined,
  };
}

async function createPatient(patientData: PatientCreateInput): Promise<void> {
  const response = await window.api.patient.create(patientData);

  if (response.success) {
    showSuccess('Patient created successfully');
    hidePatientForm();
    await loadPatients();
  } else {
    showError(response.error || 'Failed to create patient');
  }
}

async function updatePatient(patientData: any): Promise<void> {
  const response = await window.api.patient.update(patientData);

  if (response.success) {
    showSuccess('Patient updated successfully');
    hidePatientForm();
    await loadPatients();
  } else {
    showError(response.error || 'Failed to update patient');
  }
}

// Global functions for inline event handlers
(window as any).editPatient = async (id: number) => {
  const response = await window.api.patient.getById(id);

  if (response.success && response.data) {
    showPatientForm(response.data);
  } else {
    showError(response.error || 'Failed to load patient');
  }
};

(window as any).deletePatient = async (id: number) => {
  if (confirm('Are you sure you want to delete this patient?')) {
    const response = await window.api.patient.delete(id);

    if (response.success) {
      showSuccess('Patient deleted successfully');
      await loadPatients();
    } else {
      showError(response.error || 'Failed to delete patient');
    }
  }
};

(window as any).viewAppointmentNotes = async (id: number) => {
  currentPatientIdForNotes = id;

  // Load patient info
  const patientResponse = await window.api.patient.getById(id);
  if (patientResponse.success && patientResponse.data) {
    displayPatientInfo(patientResponse.data);
  }

  await loadNotes(id);
  showNotesSection();
};

function displayPatientInfo(patient: Patient): void {
  const nameEl = document.getElementById('patient-info-name');
  const ageEl = document.getElementById('patient-info-age');
  const birthDateEl = document.getElementById('patient-info-birthdate');
  const emailEl = document.getElementById('patient-info-email');
  const phoneEl = document.getElementById('patient-info-phone');
  const genderEl = document.getElementById('patient-info-gender');
  const maritalEl = document.getElementById('patient-info-marital');
  const childrenEl = document.getElementById('patient-info-children');
  const educationEl = document.getElementById('patient-info-education');
  const professionEl = document.getElementById('patient-info-profession');
  const livesWithEl = document.getElementById('patient-info-liveswith');
  const firstAppointmentEl = document.getElementById('patient-info-first-appointment');
  const psychExpEl = document.getElementById('patient-info-psych-exp');

  if (nameEl) nameEl.textContent = patient.name;
  if (ageEl) ageEl.textContent = patient.age.toString();
  if (birthDateEl) birthDateEl.textContent = formatBirthDate(patient.birthDate);
  if (emailEl) emailEl.textContent = patient.email;
  if (phoneEl) phoneEl.textContent = patient.phoneNumber;
  if (genderEl) genderEl.textContent = capitalizeFirst(patient.gender);
  if (maritalEl) maritalEl.textContent = capitalizeFirst(patient.maritalStatus.replace('_', ' '));
  if (childrenEl) childrenEl.textContent = patient.children.toString();
  if (educationEl) educationEl.textContent = patient.educationalLevel;
  if (professionEl) professionEl.textContent = patient.profession;
  if (livesWithEl) livesWithEl.textContent = patient.livesWith;
  if (firstAppointmentEl) {
    firstAppointmentEl.textContent = patient.firstAppointmentDate
      ? formatBirthDate(patient.firstAppointmentDate)
      : 'Not scheduled yet';
  }
  if (psychExpEl) psychExpEl.textContent = patient.previousPsychologicalExperience || 'None';
}

function formatBirthDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function loadNotes(patientId: number): Promise<void> {
  const response = await window.api.note.getByPatientId(patientId);

  if (response.success && response.data) {
    currentNotes = response.data;
    renderNotesList(currentNotes);
  } else {
    showError(response.error || 'Failed to load notes');
  }
}

function renderNotesList(notes: Note[]): void {
  const listContainer = document.getElementById('notes-list');
  const emptyState = document.getElementById('notes-empty-state');
  const table = document.getElementById('notes-table');

  if (!listContainer || !emptyState || !table) return;

  if (notes.length === 0) {
    table.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  table.style.display = 'table';
  emptyState.style.display = 'none';

  listContainer.innerHTML = notes
    .map(
      (note) => `
        <tr data-id="${note.id}">
          <td class="note-date">${formatDate(note.createdAt || '')}</td>
          <td>${escapeHtml(note.title)}</td>
          <td class="actions">
            <button class="btn-view" onclick="viewNoteDetails(${note.id})">View</button>
          </td>
        </tr>
      `
    )
    .join('');
}

function showNotesSection(): void {
  const notesSection = document.getElementById('notes-section');
  const listSection = document.getElementById('list-section');

  if (notesSection && listSection) {
    notesSection.style.display = 'block';
    listSection.style.display = 'none';
  }
}

function hideNotesSection(): void {
  const notesSection = document.getElementById('notes-section');
  const listSection = document.getElementById('list-section');

  if (notesSection && listSection) {
    notesSection.style.display = 'none';
    listSection.style.display = 'block';
    currentPatientIdForNotes = null;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

(window as any).viewNoteDetails = async (id: number) => {
  const response = await window.api.note.getById(id);

  if (response.success && response.data) {
    showNoteView(response.data);
  } else {
    showError(response.error || 'Failed to load note');
  }
};

function showNoteForm(note?: Note): void {
  editingNoteId = note?.id || null;

  const noteFormSection = document.getElementById('note-form-section');
  const notesSection = document.getElementById('notes-section');
  const formTitle = document.getElementById('note-form-title');

  if (noteFormSection && notesSection && formTitle) {
    noteFormSection.style.display = 'block';
    notesSection.style.display = 'none';
    formTitle.textContent = note ? 'Edit Note' : 'Add New Note';

    if (note) {
      (document.getElementById('note-title') as HTMLInputElement).value = note.title;
      (document.getElementById('note-content') as HTMLDivElement).innerHTML = note.content;
    } else {
      (document.getElementById('note-form') as HTMLFormElement)?.reset();
      (document.getElementById('note-content') as HTMLDivElement).innerHTML = '';
    }
  }
}

function hideNoteForm(): void {
  const noteFormSection = document.getElementById('note-form-section');
  const notesSection = document.getElementById('notes-section');

  if (noteFormSection && notesSection) {
    noteFormSection.style.display = 'none';
    notesSection.style.display = 'block';
    editingNoteId = null;
    (document.getElementById('note-form') as HTMLFormElement)?.reset();
    (document.getElementById('note-content') as HTMLDivElement).innerHTML = '';
  }
}

async function handleNoteFormSubmit(event: Event): Promise<void> {
  event.preventDefault();

  if (!currentPatientIdForNotes) {
    showError('No patient selected');
    return;
  }

  const title = (document.getElementById('note-title') as HTMLInputElement).value;
  const content = (document.getElementById('note-content') as HTMLDivElement).innerHTML;

  if (!content.trim()) {
    showError('Note content cannot be empty');
    return;
  }

  if (editingNoteId) {
    await updateNote({ id: editingNoteId, title, content });
  } else {
    await createNote({ patientId: currentPatientIdForNotes, title, content });
  }
}

async function createNote(noteData: NoteCreateInput): Promise<void> {
  const response = await window.api.note.create(noteData);

  if (response.success) {
    showSuccess('Note created successfully');
    hideNoteForm();
    if (currentPatientIdForNotes) {
      await loadNotes(currentPatientIdForNotes);
    }
  } else {
    showError(response.error || 'Failed to create note');
  }
}

async function updateNote(noteData: { id: number; title?: string; content?: string }): Promise<void> {
  const response = await window.api.note.update(noteData);

  if (response.success) {
    showSuccess('Note updated successfully');
    hideNoteForm();
    if (currentPatientIdForNotes) {
      await loadNotes(currentPatientIdForNotes);
    }
  } else {
    showError(response.error || 'Failed to update note');
  }
}

function showNoteView(note: Note): void {
  const noteViewSection = document.getElementById('note-view-section');
  const notesSection = document.getElementById('notes-section');
  const noteViewTitle = document.getElementById('note-view-title');
  const noteViewDate = document.getElementById('note-view-date');
  const noteViewBody = document.getElementById('note-view-content-body');

  if (noteViewSection && notesSection && noteViewTitle && noteViewDate && noteViewBody) {
    editingNoteId = note.id || null;
    noteViewSection.style.display = 'block';
    notesSection.style.display = 'none';

    noteViewTitle.textContent = note.title;
    noteViewDate.textContent = `Created: ${formatDate(note.createdAt || '')}`;
    noteViewBody.innerHTML = note.content;
  }
}

function hideNoteView(): void {
  const noteViewSection = document.getElementById('note-view-section');
  const notesSection = document.getElementById('notes-section');

  if (noteViewSection && notesSection) {
    noteViewSection.style.display = 'none';
    notesSection.style.display = 'block';
    editingNoteId = null;
  }
}

async function handleEditNote(): Promise<void> {
  if (!editingNoteId) return;

  const response = await window.api.note.getById(editingNoteId);

  if (response.success && response.data) {
    hideNoteView();
    showNoteForm(response.data);
  } else {
    showError(response.error || 'Failed to load note');
  }
}

async function handleSearchClick(): Promise<void> {
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  if (!searchInput) return;

  const searchTerm = searchInput.value.trim();

  if (searchTerm.length === 0) {
    await loadPatients();
    return;
  }

  const response = await window.api.patient.search(searchTerm);

  if (response.success && response.data) {
    renderPatientList(response.data);
    if (response.data.length === 0) {
      showError('No patients found matching your search');
    }
  } else {
    showError(response.error || 'Search failed');
  }
}

function showSuccess(message: string): void {
  showNotification(message, 'success');
}

function showError(message: string): void {
  showNotification(message, 'error');
}

function showNotification(message: string, type: 'success' | 'error'): void {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export to make this file a module
export {};
