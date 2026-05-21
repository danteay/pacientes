import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';
import { Button } from '../../components/atoms/Button/Button';
import { useNotification } from '../../context/NotificationContext';
import { ipcClient } from '../../api';
import { unwrapApiResponse } from '../../api/types';
import type { Patient } from '../../../types/patient';
import type { EmergencyContact } from '../../../types/emergency-contact';
import type { LegalTutor } from '../../../types/legal-tutor';
import type { Attachment } from '../../../types/attachment';
import { PatientStatus } from '../../../types/patient';
import { EmergencyContactsTable } from '../../components/EmergencyContactsTable/EmergencyContactsTable';
import { LegalTutorsTable } from '../../components/LegalTutorsTable/LegalTutorsTable';
import { AttachmentsTable } from '../../components/AttachmentsTable/AttachmentsTable';
import './PatientInfo.styles.scss';

const PatientInfo: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { showError } = useNotification();
  const { t } = useTranslation();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [legalTutors, setLegalTutors] = useState<LegalTutor[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'contacts' | 'tutors' | 'attachments'>(
    'info'
  );

  const loadAttachments = async () => {
    if (!patientId) return;
    try {
      const attachmentsResponse = await window.api.attachment.getByPatientId(parseInt(patientId));
      if (attachmentsResponse.success && attachmentsResponse.data) {
        setAttachments(attachmentsResponse.data);
      }
    } catch (error) {
      console.error('Error loading attachments:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await ipcClient.getPatientById(parseInt(patientId));
        const data = unwrapApiResponse(response);
        setPatient(data);

        const contactsResponse = await window.api.emergencyContact.getByPatientId(
          parseInt(patientId)
        );
        if (contactsResponse.success && contactsResponse.data) {
          setEmergencyContacts(contactsResponse.data);
        }

        const tutorsResponse = await window.api.legalTutor.getByPatientId(parseInt(patientId));
        if (tutorsResponse.success && tutorsResponse.data) {
          setLegalTutors(tutorsResponse.data);
        }

        await loadAttachments();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('errors.failedToLoadPatient');
        showError(errorMessage);
        console.error('Error loading patient:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [patientId, showError, t]);

  const handleBack = () => navigate('/');
  const handleEdit = () => navigate(`/patient/edit/${patientId}`);
  const handleViewNotes = () => navigate(`/patient/${patientId}/notes`);

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
    if (!dateString) return t('common.notAvailable');
    return new Date(dateString).toLocaleDateString();
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
    <section className="section">
      <div className="container">
        <div className="box">
          <div className="level">
            <div className="level-left">
              <Button variant="light" onClick={handleBack} title={t('patient.info.backToList')}>
                {t('common.back')}
              </Button>
            </div>
            <div className="level-item">
              <h2 className="title is-4">{t('patient.info.headerTitle')}</h2>
            </div>
            <div className="level-right">
              <Button variant="info" onClick={handleViewNotes}>
                {t('patient.info.viewNotes')}
              </Button>
            </div>
          </div>
        </div>

        <div className="box">
          <div className="patient-info-header">
            <h3 className="title is-3">{patient.name}</h3>
            <div className="patient-info-header-actions">
              <span className={`tag is-large ${getStatusBadgeClass(patient.status)}`}>
                {t(`enums.patientStatus.${patient.status}`)}
              </span>
              <Button variant="primary" onClick={handleEdit}>
                {t('patient.info.editPatient')}
              </Button>
            </div>
          </div>

          <div className="tabs is-boxed">
            <ul>
              <li className={activeTab === 'info' ? 'is-active' : ''}>
                <a onClick={() => setActiveTab('info')}>
                  <span>{t('patient.info.tabInfo')}</span>
                </a>
              </li>
              <li className={activeTab === 'contacts' ? 'is-active' : ''}>
                <a onClick={() => setActiveTab('contacts')}>
                  <span>{t('patient.info.tabContacts')}</span>
                </a>
              </li>
              <li className={activeTab === 'tutors' ? 'is-active' : ''}>
                <a onClick={() => setActiveTab('tutors')}>
                  <span>{t('patient.info.tabTutors')}</span>
                </a>
              </li>
              <li className={activeTab === 'attachments' ? 'is-active' : ''}>
                <a onClick={() => setActiveTab('attachments')}>
                  <span>{t('patient.info.tabAttachments')}</span>
                </a>
              </li>
            </ul>
          </div>

          {activeTab === 'info' && (
            <div className="content patient-info-content">
              <div className="patient-info-section">
                <h4 className="title is-5">{t('patient.info.basicInfo')}</h4>
                <div className="columns is-multiline">
                  <div className="column is-half">
                    <div className="field-display">
                      <label className="label">{t('patient.info.age')}</label>
                      <p>{t('patient.info.yearsOld', { age: patient.age })}</p>
                    </div>
                  </div>
                  <div className="column is-half">
                    <div className="field-display">
                      <label className="label">{t('patient.info.birthDate')}</label>
                      <p>{formatDate(patient.birthDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="patient-info-section">
                <h4 className="title is-5">{t('patient.info.contactInfo')}</h4>
                <div className="columns is-multiline">
                  <div className="column is-half">
                    <div className="field-display">
                      <label className="label">{t('patient.info.email')}</label>
                      <p>{patient.email}</p>
                    </div>
                  </div>
                  <div className="column is-half">
                    <div className="field-display">
                      <label className="label">{t('patient.info.phoneNumber')}</label>
                      <p>{patient.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="patient-info-section">
                <h4 className="title is-5">{t('patient.info.personalInfo')}</h4>
                <div className="columns is-multiline">
                  <div className="column is-one-third">
                    <div className="field-display">
                      <label className="label">{t('patient.info.gender')}</label>
                      <p>{t(`enums.gender.${patient.gender}`)}</p>
                    </div>
                  </div>
                  <div className="column is-one-third">
                    <div className="field-display">
                      <label className="label">{t('patient.info.sexualOrientation')}</label>
                      <p>{t(`enums.sexualOrientation.${patient.sexualOrientation}`)}</p>
                    </div>
                  </div>
                  <div className="column is-one-third">
                    <div className="field-display">
                      <label className="label">{t('patient.info.maritalStatus')}</label>
                      <p>{t(`enums.maritalStatus.${patient.maritalStatus}`)}</p>
                    </div>
                  </div>
                  <div className="column is-one-third">
                    <div className="field-display">
                      <label className="label">{t('patient.info.numberOfChildren')}</label>
                      <p>{patient.children}</p>
                    </div>
                  </div>
                  <div className="column is-one-third">
                    <div className="field-display">
                      <label className="label">{t('patient.info.livesWith')}</label>
                      <p>{patient.livesWith}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="patient-info-section">
                <h4 className="title is-5">{t('patient.info.professionalInfo')}</h4>
                <div className="columns is-multiline">
                  <div className="column is-half">
                    <div className="field-display">
                      <label className="label">{t('patient.info.educationalLevel')}</label>
                      <p>{patient.educationalLevel}</p>
                    </div>
                  </div>
                  <div className="column is-half">
                    <div className="field-display">
                      <label className="label">{t('patient.info.profession')}</label>
                      <p>{patient.profession}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="patient-info-section">
                <h4 className="title is-5">{t('patient.info.treatmentInfo')}</h4>
                <div className="columns is-multiline">
                  <div className="column is-full">
                    <div className="field-display">
                      <label className="label">{t('patient.info.firstAppointmentDate')}</label>
                      <p>{formatDate(patient.firstAppointmentDate)}</p>
                    </div>
                  </div>
                  <div className="column is-full">
                    <div className="field-display">
                      <label className="label">{t('patient.info.previousExperience')}</label>
                      <p className="preserve-whitespace">
                        {patient.previousPsychologicalExperience || t('patient.info.noneReported')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="patient-info-section">
                <h4 className="title is-5">{t('patient.info.recordInfo')}</h4>
                <div className="columns is-multiline">
                  <div className="column is-half">
                    <div className="field-display">
                      <label className="label">{t('patient.info.createdAt')}</label>
                      <p>{formatDate(patient.createdAt)}</p>
                    </div>
                  </div>
                  <div className="column is-half">
                    <div className="field-display">
                      <label className="label">{t('patient.info.lastUpdated')}</label>
                      <p>{formatDate(patient.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="content" style={{ marginTop: '1rem' }}>
              <EmergencyContactsTable contacts={emergencyContacts} onChange={() => {}} readOnly />
            </div>
          )}

          {activeTab === 'tutors' && (
            <div className="content" style={{ marginTop: '1rem' }}>
              <LegalTutorsTable tutors={legalTutors} onChange={() => {}} readOnly />
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="content" style={{ marginTop: '1rem' }}>
              <AttachmentsTable
                patientId={parseInt(patientId!)}
                attachments={attachments}
                onRefresh={loadAttachments}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PatientInfo;
