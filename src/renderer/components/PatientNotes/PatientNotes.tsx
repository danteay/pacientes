import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Patient, PatientStatus } from '../../../types/patient';
import { Note } from '../../../types/note';
import { useNotes } from '../../hooks/useNotes';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../atoms/Button/Button';
import { LoadingSpinner } from '../atoms/LoadingSpinner/LoadingSpinner';
import './PatientNotes.styles.scss';

interface PatientNotesProps {
  patient: Patient;
  onBack: () => void;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onViewNote: (note: Note) => void;
  onViewFullInfo: () => void;
}

export const PatientNotes: React.FC<PatientNotesProps> = ({
  patient,
  onBack,
  onAddNote,
  onEditNote,
  onViewNote,
  onViewFullInfo,
}) => {
  const { t } = useTranslation();
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
      case PatientStatus.ABANDONED:
        return 'is-danger';
      default:
        return 'is-light';
    }
  };

  if (loading && notes.length === 0) {
    return (
      <section className="section">
        <div className="container">
          <LoadingSpinner message={t('patient.notes.loadingNotes')} />
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
              <Button variant="light" onClick={onBack} title={t('patient.info.backToList')}>
                {t('common.back')}
              </Button>
            </div>
            <div className="level-item">
              <h2 className="title is-4">{t('patient.notes.patientNotes')}</h2>
            </div>
            <div className="level-right">
              <Button variant="primary" onClick={onAddNote}>
                {t('patient.notes.addNote')}
              </Button>
            </div>
          </div>
        </div>

        <div className="box">
          <h3 className="title is-5">{t('patient.notes.patientInfo')}</h3>
          <div className="content">
            <div className="columns is-multiline">
              <div className="column is-one-third">
                <strong>{t('patient.notes.name')}:</strong> {patient.name}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.age')}:</strong> {patient.age}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.birthDate')}:</strong> {patient.birthDate}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.email')}:</strong> {patient.email}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.phone')}:</strong> {patient.phoneNumber}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.gender')}:</strong>{' '}
                {t(`enums.gender.${patient.gender}`)}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.sexualOrientation')}:</strong>{' '}
                {t(`enums.sexualOrientation.${patient.sexualOrientation}`)}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.maritalStatus')}:</strong>{' '}
                {t(`enums.maritalStatus.${patient.maritalStatus}`)}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.children')}:</strong> {patient.children}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.educationalLevel')}:</strong> {patient.educationalLevel}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.profession')}:</strong> {patient.profession}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.livesWith')}:</strong> {patient.livesWith}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.firstAppointment')}:</strong>{' '}
                {patient.firstAppointmentDate || t('common.notAvailable')}
              </div>
              <div className="column is-one-third">
                <strong>{t('patient.notes.status')}:</strong>{' '}
                <span className={`tag ${getStatusBadgeClass(patient.status)}`}>
                  {t(`enums.patientStatus.${patient.status}`)}
                </span>
              </div>
              <div className="column is-full">
                <strong>{t('patient.notes.previousExperience')}:</strong>{' '}
                {patient.previousPsychologicalExperience || t('patient.notes.none')}
              </div>
            </div>
          </div>
          <div className="has-text-right" style={{ marginTop: '1rem' }}>
            <Button variant="primary" onClick={onViewFullInfo} size="small">
              {t('patient.notes.viewFullInfo')}
            </Button>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="notification is-warning is-light">
            <p>{t('patient.notes.noNotes')}</p>
          </div>
        ) : (
          <div className="box">
            <table className="table is-fullwidth is-striped is-hoverable">
              <thead>
                <tr>
                  <th>{t('patient.notes.createdDate')}</th>
                  <th>{t('patient.notes.title')}</th>
                  <th>{t('patient.notes.actions')}</th>
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
                          title={t('patient.notes.viewNote')}
                        >
                          {t('patient.notes.view')}
                        </Button>
                        <Button
                          variant="warning"
                          size="small"
                          onClick={() => onEditNote(note)}
                          title={t('patient.notes.editNote')}
                        >
                          {t('patient.notes.edit')}
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
