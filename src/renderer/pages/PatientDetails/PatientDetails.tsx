import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PatientNotes } from '../../components/PatientNotes/PatientNotes';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { ipcClient } from '../../api';
import { unwrapApiResponse } from '../../api/types';
import type { Patient } from '../../../types/patient';
import type { Note } from '../../../types/note';

/**
 * Patient Details Page (Refactored)
 *
 * Displays patient information and notes
 * Uses hooks for state management and data fetching
 */

const PatientDetails: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { showError } = useNotification();
  const { t } = useTranslation();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await ipcClient.getPatientById(parseInt(patientId));
        const data = unwrapApiResponse(response);
        setPatient(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('errors.failedToLoadPatient');
        showError(errorMessage);
        console.error('Error loading patient:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [patientId, showError, t]);

  const handleBack = () => {
    navigate('/');
  };

  const handleAddNote = () => {
    navigate(`/patient/${patientId}/note/new`);
  };

  const handleEditNote = (note: Note) => {
    navigate(`/patient/${patientId}/note/edit/${note.id}`);
  };

  const handleViewNote = (note: Note) => {
    navigate(`/patient/${patientId}/note/${note.id}`);
  };

  const handleViewFullInfo = () => {
    navigate(`/patient/${patientId}`);
  };

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <LoadingSpinner message={t('patient.info.loadingInfo')} />
        </div>
      </section>
    );
  }

  if (!patient) {
    return (
      <section className="section">
        <div className="container">
          <div className="notification is-danger is-light">
            <p>{t('patient.info.patientNotFound')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <PatientNotes
      patient={patient}
      onBack={handleBack}
      onAddNote={handleAddNote}
      onEditNote={handleEditNote}
      onViewNote={handleViewNote}
      onViewFullInfo={handleViewFullInfo}
    />
  );
};

export default PatientDetails;
