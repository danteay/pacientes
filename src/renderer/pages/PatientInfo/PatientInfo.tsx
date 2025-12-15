import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';
import { Button } from '../../components/atoms/Button/Button';
import { useNotification } from '../../context/NotificationContext';
import { ipcClient } from '../../api';
import { unwrapApiResponse } from '../../api/types';
import type { Patient } from '../../../types/patient';
import {
  genderToString,
  sexualOrientationToString,
  maritalStatusToString,
  patientStatusToString,
  PatientStatus,
} from '../../../types/patient';
import './PatientInfo.styles.scss';

/**
 * Patient Info Page
 *
 * Displays comprehensive patient information in read-only mode
 * Provides navigation to edit patient or view notes
 */

const PatientInfo: React.FC = () => {
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

  const handleEdit = () => {
    navigate(`/patient/edit/${patientId}`);
  };

  const handleViewNotes = () => {
    navigate(`/patient/${patientId}/notes`);
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

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
    <section className="section">
      <div className="container">
        {/* Header */}
        <div className="box">
          <div className="level">
            <div className="level-left">
              <Button variant="light" onClick={handleBack} title="Back to patient list">
                ← Back
              </Button>
            </div>
            <div className="level-item">
              <h2 className="title is-4">Patient Information</h2>
            </div>
            <div className="level-right">
              <Button variant="info" onClick={handleViewNotes}>
                View Notes
              </Button>
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="box">
          <div className="patient-info-header">
            <h3 className="title is-3">{patient.name}</h3>
            <span className={`tag is-large ${getStatusBadgeClass(patient.status)}`}>
              {patientStatusToString(patient.status)}
            </span>
          </div>

          <div className="content patient-info-content">
            {/* Basic Information */}
            <div className="patient-info-section">
              <h4 className="title is-5">Basic Information</h4>
              <div className="columns is-multiline">
                <div className="column is-half">
                  <div className="field-display">
                    <label className="label">Age</label>
                    <p>{patient.age} years old</p>
                  </div>
                </div>
                <div className="column is-half">
                  <div className="field-display">
                    <label className="label">Birth Date</label>
                    <p>{formatDate(patient.birthDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="patient-info-section">
              <h4 className="title is-5">Contact Information</h4>
              <div className="columns is-multiline">
                <div className="column is-half">
                  <div className="field-display">
                    <label className="label">Email</label>
                    <p>{patient.email}</p>
                  </div>
                </div>
                <div className="column is-half">
                  <div className="field-display">
                    <label className="label">Phone Number</label>
                    <p>{patient.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="patient-info-section">
              <h4 className="title is-5">Personal Information</h4>
              <div className="columns is-multiline">
                <div className="column is-one-third">
                  <div className="field-display">
                    <label className="label">Gender</label>
                    <p>{genderToString(patient.gender)}</p>
                  </div>
                </div>
                <div className="column is-one-third">
                  <div className="field-display">
                    <label className="label">Sexual Orientation</label>
                    <p>{sexualOrientationToString(patient.sexualOrientation)}</p>
                  </div>
                </div>
                <div className="column is-one-third">
                  <div className="field-display">
                    <label className="label">Marital Status</label>
                    <p>{maritalStatusToString(patient.maritalStatus)}</p>
                  </div>
                </div>
                <div className="column is-one-third">
                  <div className="field-display">
                    <label className="label">Number of Children</label>
                    <p>{patient.children}</p>
                  </div>
                </div>
                <div className="column is-one-third">
                  <div className="field-display">
                    <label className="label">Lives With</label>
                    <p>{patient.livesWith}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="patient-info-section">
              <h4 className="title is-5">Professional & Educational Background</h4>
              <div className="columns is-multiline">
                <div className="column is-half">
                  <div className="field-display">
                    <label className="label">Educational Level</label>
                    <p>{patient.educationalLevel}</p>
                  </div>
                </div>
                <div className="column is-half">
                  <div className="field-display">
                    <label className="label">Profession</label>
                    <p>{patient.profession}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Information */}
            <div className="patient-info-section">
              <h4 className="title is-5">Treatment Information</h4>
              <div className="columns is-multiline">
                <div className="column is-full">
                  <div className="field-display">
                    <label className="label">First Appointment Date</label>
                    <p>{formatDate(patient.firstAppointmentDate)}</p>
                  </div>
                </div>
                <div className="column is-full">
                  <div className="field-display">
                    <label className="label">Previous Psychological Experience</label>
                    <p className="preserve-whitespace">
                      {patient.previousPsychologicalExperience || 'None reported'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="patient-info-section">
              <h4 className="title is-5">Record Information</h4>
              <div className="columns is-multiline">
                <div className="column is-half">
                  <div className="field-display">
                    <label className="label">Created At</label>
                    <p>{formatDate(patient.createdAt)}</p>
                  </div>
                </div>
                <div className="column is-half">
                  <div className="field-display">
                    <label className="label">Last Updated</label>
                    <p>{formatDate(patient.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="has-text-right" style={{ marginTop: '1rem' }}>
            <Button variant="primary" onClick={handleEdit}>
              Edit Patient
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientInfo;
