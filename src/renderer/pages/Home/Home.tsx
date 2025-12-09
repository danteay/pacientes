import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientList } from '../../components/PatientList/PatientList';
import type { Patient } from '../../../types/patient';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleAddPatient = () => {
    navigate('/patient/new');
  };

  const handleEditPatient = (patient: Patient) => {
    navigate(`/patient/edit/${patient.id}`);
  };

  const handleViewNotes = (patient: Patient) => {
    navigate(`/patient/${patient.id}/notes`);
  };

  return (
    <PatientList
      onAddPatient={handleAddPatient}
      onEditPatient={handleEditPatient}
      onViewNotes={handleViewNotes}
    />
  );
};

export default Home;
