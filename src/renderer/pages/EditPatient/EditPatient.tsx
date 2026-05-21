import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PatientForm from '../../components/PatientForm/PatientForm';
import type { Patient } from '../../../types/patient';

const EditPatient: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPatient = async () => {
      if (patientId && patientId !== 'new') {
        try {
          const result = await window.api.patient.getById(parseInt(patientId));
          if (result.success && result.data) {
            setPatient(result.data);
          } else {
            console.error('Failed to load patient:', result.error);
          }
        } catch (error) {
          console.error('Error loading patient:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  const handleSave = () => navigate('/');
  const handleCancel = () => navigate('/');

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <div className="notification is-info is-light">
            <p>{t('patient.form.loadingPatient')}</p>
          </div>
        </div>
      </section>
    );
  }

  return <PatientForm patient={patient} onSave={handleSave} onCancel={handleCancel} />;
};

export default EditPatient;
