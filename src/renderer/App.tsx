import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import EditPatient from './pages/EditPatient/EditPatient';
import PatientDetails from './pages/PatientDetails/PatientDetails';
import NoteEditor from './pages/NoteEditor/NoteEditor';
import NoteDetails from './pages/NoteDetails/NoteDetails';

export interface Patient {
  id?: number;
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
  birthDate: string;
  maritalStatus: string;
  gender: string;
  educationalLevel: string;
  profession: string;
  livesWith: string;
  children: number;
  previousPsychologicalExperience?: string | null;
  firstAppointmentDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  id?: number;
  patientId: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

class App extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/patient/new" element={<EditPatient />} />
            <Route path="/patient/edit/:patientId" element={<EditPatient />} />
            <Route path="/patient/:patientId/notes" element={<PatientDetails />} />
            <Route path="/patient/:patientId/note/new" element={<NoteEditor />} />
            <Route path="/patient/:patientId/note/edit/:noteId" element={<NoteEditor />} />
            <Route path="/patient/:patientId/note/:noteId" element={<NoteDetails />} />
          </Routes>
        </div>
      </Router>
    );
  }
}

export default App;
