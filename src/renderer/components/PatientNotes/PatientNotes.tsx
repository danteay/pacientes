import React, { useEffect } from 'react';
import {
  Patient,
  PatientStatus,
  genderToString,
  sexualOrientationToString,
  maritalStatusToString,
} from '../../../types/patient';
import { Note } from '../../../types/note';
import { useNotes } from '../../hooks/useNotes';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../atoms/Button/Button';
import { LoadingSpinner } from '../atoms/LoadingSpinner/LoadingSpinner';
import './PatientNotes.styles.scss';

/**
 * Patient Notes Component
 *
 * Functional component using hooks for state management
 * Follows React best practices and composition patterns
 */

interface PatientNotesProps {
  patient: Patient;
  onBack: () => void;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onViewNote: (note: Note) => void;
}

export const PatientNotes: React.FC<PatientNotesProps> = ({
  patient,
  onBack,
  onAddNote,
  onEditNote,
  onViewNote,
}) => {
  const { notes, loading, error, loadNotesByPatientId } = useNotes();
  const { showError } = useNotification();

  useEffect(() => {
    if (patient.id) {
      loadNotesByPatientId(patient.id);
    }
  }, [patient.id, loadNotesByPatientId]);

  useEffect(() => {
    if (error) {
      showError(error.message);
    }
  }, [error, showError]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: PatientStatus): string => {
    switch (status) {
      case PatientStatus.ACTIVE:
        return 'is-success';
      case PatientStatus.PAUSED:
        return 'is-warning';
      case PatientStatus.MEDICAL_DISCHARGE:
        return 'is-info';
      default:
        return 'is-light';
    }
  };

  const getStatusLabel = (status: PatientStatus): string => {
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
  };

  if (loading && notes.length === 0) {
    return (
      <section className="section">
        <div className="container">
          <LoadingSpinner message="Loading notes..." />
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="box">
          <div className="level">
            <div className="level-left">
              <Button variant="light" onClick={onBack} title="Back to patient list">
                ← Back
              </Button>
            </div>
            <div className="level-item">
              <h2 className="title is-4">Patient Notes</h2>
            </div>
            <div className="level-right">
              <Button variant="primary" onClick={onAddNote}>
                + Add New Note
              </Button>
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
                <strong>Gender:</strong> {genderToString(patient.gender)}
              </div>
              <div className="column is-one-third">
                <strong>Sexual Orientation:</strong>{' '}
                {sexualOrientationToString(patient.sexualOrientation)}
              </div>
              <div className="column is-one-third">
                <strong>Marital Status:</strong> {maritalStatusToString(patient.maritalStatus)}
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
              <div className="column is-one-third">
                <strong>Status:</strong>{' '}
                <span className={`tag ${getStatusBadgeClass(patient.status)}`}>
                  {getStatusLabel(patient.status)}
                </span>
              </div>
              <div className="column is-full">
                <strong>Previous Psychological Experience:</strong>{' '}
                {patient.previousPsychologicalExperience || 'None'}
              </div>
            </div>
          </div>
        </div>

        {notes.length === 0 ? (
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
                    <td>{formatDate(note.createdAt!)}</td>
                    <td>{note.title}</td>
                    <td>
                      <div className="buttons">
                        <Button
                          variant="info"
                          size="small"
                          onClick={() => onViewNote(note)}
                          title="View note"
                        >
                          View
                        </Button>
                        <Button
                          variant="warning"
                          size="small"
                          onClick={() => onEditNote(note)}
                          title="Edit note"
                        >
                          Edit
                        </Button>
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
};
