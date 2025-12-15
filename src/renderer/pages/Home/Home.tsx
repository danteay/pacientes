import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientList } from '../../components/PatientList/PatientList';
import type { Patient } from '../../../types/patient';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleAddPatient = () => {
    navigate('/patient/new');
  };

  const handleViewPatient = (patient: Patient) => {
    navigate(`/patient/${patient.id}`);
  };

  const handleViewNotes = (patient: Patient) => {
    navigate(`/patient/${patient.id}/notes`);
  };

  return (
    <PatientList
      onAddPatient={handleAddPatient}
      onViewPatient={handleViewPatient}
      onViewNotes={handleViewNotes}
    />
  );
};

export default Home;
