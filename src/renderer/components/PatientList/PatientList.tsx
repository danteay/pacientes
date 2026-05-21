import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Patient, PatientStatus } from '../../../types/patient';
import { usePatients } from '../../hooks/usePatients';
import { useNotification } from '../../context/NotificationContext';
import { SearchBar } from '../molecules/SearchBar/SearchBar';
import { Button } from '../atoms/Button/Button';
import { LoadingSpinner } from '../atoms/LoadingSpinner/LoadingSpinner';
import './PatientList.styles.scss';

interface PatientListProps {
  onAddPatient: () => void;
  onViewPatient: (patient: Patient) => void;
  onViewNotes: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  onAddPatient,
  onViewPatient,
  onViewNotes,
}) => {
  const { t } = useTranslation();
  const { patients, loading, error, loadPatients, searchPatients } = usePatients();
  const { showError } = useNotification();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (error) {
      showError(error.message);
    }
  }, [error, showError]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const status = statusFilter !== 'all' ? statusFilter : undefined;
    searchPatients(term, status);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    const status = newStatus !== 'all' ? newStatus : undefined;
    searchPatients(searchTerm, status);
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

  if (loading && patients.length === 0) {
    return (
      <section className="section">
        <div className="container">
          <LoadingSpinner message={t('patient.list.loadingPatients')} />
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="box">
          <div className="columns">
            <div className="column is-one-quarter">
              <div className="field">
                <label className="label" htmlFor="statusFilter">
                  {t('patient.list.filterByStatus')}
                </label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                    >
                      <option value="all">{t('patient.list.allStatuses')}</option>
                      <option value={PatientStatus.ACTIVE}>
                        {t('enums.patientStatus.active')}
                      </option>
                      <option value={PatientStatus.PAUSED}>
                        {t('enums.patientStatus.paused')}
                      </option>
                      <option value={PatientStatus.MEDICAL_DISCHARGE}>
                        {t('enums.patientStatus.medical_discharge')}
                      </option>
                      <option value={PatientStatus.ABANDONED}>
                        {t('enums.patientStatus.abandoned')}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="column is-half">
              <div className="field">
                <label className="label" htmlFor="search">
                  {t('patient.list.searchPatients')}
                </label>
                <div className="control">
                  <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onSearch={handleSearch}
                    placeholder={t('patient.list.searchPlaceholder')}
                  />
                </div>
              </div>
            </div>
            <div className="column">
              <div className="field">
                <label className="label" style={{ visibility: 'hidden' }}>
                  {t('common.actions')}
                </label>
                <div className="control">
                  <Button variant="primary" onClick={onAddPatient} isFullWidth>
                    {t('patient.list.addPatient')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {patients.length === 0 ? (
          <div className="notification is-warning is-light">
            <p>
              {statusFilter === 'all' && !searchTerm
                ? t('patient.list.noPatients')
                : t('patient.list.noPatientsFiltered')}
            </p>
          </div>
        ) : (
          <div className="box">
            <table className="table is-fullwidth is-striped is-hoverable">
              <thead>
                <tr>
                  <th>{t('patient.list.name')}</th>
                  <th>{t('patient.list.age')}</th>
                  <th>{t('patient.list.phoneNumber')}</th>
                  <th>{t('patient.list.email')}</th>
                  <th>{t('patient.list.status')}</th>
                  <th>{t('patient.list.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.phoneNumber}</td>
                    <td>{patient.email}</td>
                    <td>
                      <span className={`tag ${getStatusBadgeClass(patient.status)}`}>
                        {t(`enums.patientStatus.${patient.status}`)}
                      </span>
                    </td>
                    <td>
                      <div className="buttons">
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => onViewPatient(patient)}
                          title={t('patient.list.infoTitle')}
                        >
                          {t('patient.list.info')}
                        </Button>
                        <Button
                          variant="info"
                          size="small"
                          onClick={() => onViewNotes(patient)}
                          title={t('patient.list.notesTitle')}
                        >
                          {t('patient.list.notes')}
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
