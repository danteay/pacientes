import React from 'react';
import PatientList from './components/PatientList/PatientList';
import PatientForm from './components/PatientForm/PatientForm';
import PatientNotes from './components/PatientNotes/PatientNotes';
import NoteForm from './components/NoteForm/NoteForm';
import NoteView from './components/NoteView/NoteView';

type View = 'list' | 'form' | 'notes' | 'note-form' | 'note-view';

export interface Patient {
  id?: number;
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
  birthDate: string;
  maritalStatus: string;
  gender: string;
  educationalLevel: string;
  profession: string;
  livesWith: string;
  children: number;
  previousPsychologicalExperience?: string | null;
  firstAppointmentDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  id?: number;
  patientId: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AppState {
  currentView: View;
  selectedPatient: Patient | null;
  selectedNote: Note | null;
  editingPatient: Patient | null;
  editingNote: Note | null;
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      currentView: 'list',
      selectedPatient: null,
      selectedNote: null,
      editingPatient: null,
      editingNote: null,
    };
  }

  handleAddPatient = () => {
    this.setState({
      editingPatient: null,
      currentView: 'form',
    });
  };

  handleEditPatient = (patient: Patient) => {
    this.setState({
      editingPatient: patient,
      currentView: 'form',
    });
  };

  handleViewNotes = (patient: Patient) => {
    this.setState({
      selectedPatient: patient,
      currentView: 'notes',
    });
  };

  handleAddNote = () => {
    this.setState({
      editingNote: null,
      currentView: 'note-form',
    });
  };

  handleEditNote = (note: Note) => {
    this.setState({
      editingNote: note,
      currentView: 'note-form',
    });
  };

  handleViewNote = (note: Note) => {
    this.setState({
      selectedNote: note,
      currentView: 'note-view',
    });
  };

  handleBackToList = () => {
    this.setState({
      currentView: 'list',
      selectedPatient: null,
      editingPatient: null,
    });
  };

  handleBackToNotes = () => {
    this.setState({
      currentView: 'notes',
      selectedNote: null,
      editingNote: null,
    });
  };

  handlePatientSaved = () => {
    this.setState({
      currentView: 'list',
      editingPatient: null,
    });
  };

  handleNoteSaved = () => {
    this.setState({
      currentView: 'notes',
      editingNote: null,
    });
  };

  render() {
    const { currentView, selectedPatient, selectedNote, editingPatient, editingNote } = this.state;

    return (
      <div>
        <section className="hero is-primary">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">Pacientes</h1>
              <p className="subtitle">Psychological Patient Management System</p>
            </div>
          </div>
        </section>

        {currentView === 'list' && (
          <PatientList
            onAddPatient={this.handleAddPatient}
            onEditPatient={this.handleEditPatient}
            onViewNotes={this.handleViewNotes}
          />
        )}

        {currentView === 'form' && (
          <PatientForm
            patient={editingPatient}
            onSave={this.handlePatientSaved}
            onCancel={this.handleBackToList}
          />
        )}

        {currentView === 'notes' && selectedPatient && (
          <PatientNotes
            patient={selectedPatient}
            onBack={this.handleBackToList}
            onAddNote={this.handleAddNote}
            onEditNote={this.handleEditNote}
            onViewNote={this.handleViewNote}
          />
        )}

        {currentView === 'note-form' && selectedPatient && (
          <NoteForm
            patientId={selectedPatient.id!}
            note={editingNote}
            onSave={this.handleNoteSaved}
            onCancel={this.handleBackToNotes}
          />
        )}

        {currentView === 'note-view' && selectedNote && (
          <NoteView
            note={selectedNote}
            onBack={this.handleBackToNotes}
            onEdit={() => this.handleEditNote(selectedNote)}
          />
        )}
      </div>
    );
  }
}

export default App;
