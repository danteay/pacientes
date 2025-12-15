import React, { useEffect, useState } from 'react';
import { Patient, PatientStatus } from '../../../types/patient';
import { usePatients } from '../../hooks/usePatients';
import { useNotification } from '../../context/NotificationContext';
import { SearchBar } from '../molecules/SearchBar/SearchBar';
import { Button } from '../atoms/Button/Button';
import { LoadingSpinner } from '../atoms/LoadingSpinner/LoadingSpinner';
import './PatientList.styles.scss';

/**
 * Patient List Component
 *
 * Functional component using hooks for state management
 * Follows React best practices and composition patterns
 */

interface PatientListProps {
  onAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onViewNotes: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  onAddPatient,
  onEditPatient,
  onViewNotes,
}) => {
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

    // Re-run search with new status filter
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

  const getStatusLabel = (status: PatientStatus): string => {
    switch (status) {
      case PatientStatus.ACTIVE:
        return 'Active';
      case PatientStatus.PAUSED:
        return 'Paused';
      case PatientStatus.MEDICAL_DISCHARGE:
        return 'Medical Discharge';
      case PatientStatus.ABANDONED:
        return 'Abandoned';
      default:
        return status;
    }
  };

  if (loading && patients.length === 0) {
    return (
      <section className="section">
        <div className="container">
          <LoadingSpinner message="Loading patients..." />
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
                  Filter by Status
                </label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                    >
                      <option value="all">All Statuses</option>
                      <option value={PatientStatus.ACTIVE}>Active</option>
                      <option value={PatientStatus.PAUSED}>Paused</option>
                      <option value={PatientStatus.MEDICAL_DISCHARGE}>Medical Discharge</option>
                      <option value={PatientStatus.ABANDONED}>Abandoned</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="column is-half">
              <div className="field">
                <label className="label" htmlFor="search">
                  Search Patients
                </label>
                <div className="control">
                  <SearchBar
                    onSearch={handleSearch}
                    placeholder="Search by name, email, or phone..."
                  />
                </div>
              </div>
            </div>
            <div className="column">
              <div className="field">
                <label className="label" style={{ visibility: 'hidden' }}>
                  Action
                </label>
                <div className="control">
                  <Button variant="primary" onClick={onAddPatient} isFullWidth>
                    + Add Patient
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
                ? 'No patients found. Click the "Add Patient" button to add a new patient.'
                : 'No patients match the selected filters.'}
            </p>
          </div>
        ) : (
          <div className="box">
            <table className="table is-fullwidth is-striped is-hoverable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Phone Number</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                        {getStatusLabel(patient.status)}
                      </span>
                    </td>
                    <td>
                      <div className="buttons">
                        <Button
                          variant="info"
                          size="small"
                          onClick={() => onViewNotes(patient)}
                          title="View notes"
                        >
                          Notes
                        </Button>
                        <Button
                          variant="warning"
                          size="small"
                          onClick={() => onEditPatient(patient)}
                          title="Edit patient"
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
