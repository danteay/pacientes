import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to load patient';
        showError(errorMessage);
        console.error('Error loading patient:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [patientId, showError]);

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

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <LoadingSpinner message="Loading patient information..." />
        </div>
      </section>
    );
  }

  if (!patient) {
    return (
      <section className="section">
        <div className="container">
          <div className="notification is-danger is-light">
            <p>Patient not found.</p>
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
    />
  );
};

export default PatientDetails;
