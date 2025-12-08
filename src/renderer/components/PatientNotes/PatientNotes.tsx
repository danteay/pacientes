import React, { Component } from 'react';
import type { Patient, Note } from '../../App';
import './PatientNotes.styles.scss';

interface PatientNotesProps {
  patient: Patient;
  onBack: () => void;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onViewNote: (note: Note) => void;
}

interface PatientNotesState {
  notes: Note[];
  isLoading: boolean;
}

class PatientNotes extends Component<PatientNotesProps, PatientNotesState> {
  constructor(props: PatientNotesProps) {
    super(props);
    this.state = {
      notes: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    this.loadNotes();
  }

  componentDidUpdate(prevProps: PatientNotesProps) {
    if (prevProps.patient.id !== this.props.patient.id) {
      this.loadNotes();
    }
  }

  loadNotes = async () => {
    this.setState({ isLoading: true });
    try {
      const result = await window.api.note.getByPatientId(this.props.patient.id!);
      if (result.success) {
        this.setState({ notes: result.data });
      } else {
        console.error('Failed to load notes:', result.error);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const result = await window.api.note.delete(id);
      if (result.success) {
        this.loadNotes();
      } else {
        alert('Failed to delete note: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  render() {
    const { patient, onBack, onAddNote, onEditNote, onViewNote } = this.props;
    const { notes, isLoading } = this.state;

    return (
      <section className="section">
        <div className="container">
          <div className="box">
            <div className="level">
              <div className="level-left">
                <button
                  type="button"
                  onClick={onBack}
                  className="button is-light"
                  title="Back to patient list"
                >
                  <span>← Back</span>
                </button>
              </div>
              <div className="level-item">
                <h2 className="title is-4">Patient Notes</h2>
              </div>
              <div className="level-right">
                <button onClick={onAddNote} className="button is-primary">
                  + Add New Note
                </button>
              </div>
            </div>
          </div>

          <div className="box">
            <h3 className="title is-5">Patient Information</h3>
            <div className="content">
              <div className="columns is-multiline">
                <div className="column is-one-third">
                  <strong>Name:</strong> {patient.name}
                </div>
                <div className="column is-one-third">
                  <strong>Age:</strong> {patient.age}
                </div>
                <div className="column is-one-third">
                  <strong>Birth Date:</strong> {patient.birthDate}
                </div>
                <div className="column is-one-third">
                  <strong>Email:</strong> {patient.email}
                </div>
                <div className="column is-one-third">
                  <strong>Phone:</strong> {patient.phoneNumber}
                </div>
                <div className="column is-one-third">
                  <strong>Gender:</strong> {patient.gender}
                </div>
                <div className="column is-one-third">
                  <strong>Marital Status:</strong> {patient.maritalStatus}
                </div>
                <div className="column is-one-third">
                  <strong>Children:</strong> {patient.children}
                </div>
                <div className="column is-one-third">
                  <strong>Educational Level:</strong> {patient.educationalLevel}
                </div>
                <div className="column is-one-third">
                  <strong>Profession:</strong> {patient.profession}
                </div>
                <div className="column is-one-third">
                  <strong>Lives With:</strong> {patient.livesWith}
                </div>
                <div className="column is-one-third">
                  <strong>First Appointment:</strong> {patient.firstAppointmentDate || 'N/A'}
                </div>
                <div className="column is-full">
                  <strong>Previous Psychological Experience:</strong>{' '}
                  {patient.previousPsychologicalExperience || 'None'}
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="notification is-info is-light">
              <p>Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="notification is-warning is-light">
              <p>No notes found for this patient. Click "Add New Note" to create one.</p>
            </div>
          ) : (
            <div className="box">
              <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th>Created Date</th>
                    <th>Title</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => (
                    <tr key={note.id}>
                      <td>{this.formatDate(note.createdAt!)}</td>
                      <td>{note.title}</td>
                      <td>
                        <div className="buttons">
                          <button
                            onClick={() => onViewNote(note)}
                            className="button is-small is-info"
                            title="View note"
                          >
                            View
                          </button>
                          <button
                            onClick={() => onEditNote(note)}
                            className="button is-small is-warning"
                            title="Edit note"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => this.handleDelete(note.id!)}
                            className="button is-small is-danger"
                            title="Delete note"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    );
  }
}

export default PatientNotes;
