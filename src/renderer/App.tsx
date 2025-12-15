import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationToast } from './components/molecules/NotificationToast/NotificationToast';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import EditPatient from './pages/EditPatient/EditPatient';
import PatientInfo from './pages/PatientInfo/PatientInfo';
import PatientDetails from './pages/PatientDetails/PatientDetails';
import NoteEditor from './pages/NoteEditor/NoteEditor';
import NoteDetails from './pages/NoteDetails/NoteDetails';

/**
 * App Component (Refactored)
 *
 * Main application component with:
 * - Context providers for global state
 * - Error boundaries for error handling
 * - Routing configuration
 * - Notification system
 *
 * This is the fully migrated version using all new architectural patterns
 */

const AppContent: React.FC = () => {
  const { notifications, hideNotification } = useNotification();

  return (
    <>
      <NotificationToast notifications={notifications} onClose={hideNotification} />
      <Router>
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/patient/new" element={<EditPatient />} />
            <Route path="/patient/edit/:patientId" element={<EditPatient />} />
            <Route path="/patient/:patientId" element={<PatientInfo />} />
            <Route path="/patient/:patientId/notes" element={<PatientDetails />} />
            <Route path="/patient/:patientId/note/new" element={<NoteEditor />} />
            <Route path="/patient/:patientId/note/edit/:noteId" element={<NoteEditor />} />
            <Route path="/patient/:patientId/note/:noteId" element={<NoteDetails />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;
