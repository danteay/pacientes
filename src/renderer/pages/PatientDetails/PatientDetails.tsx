import React, { Component } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientNotes from '../../components/PatientNotes/PatientNotes';
import type { Patient, Note } from '../../App';

interface PatientDetailsProps {
  patientId?: string;
}

interface PatientDetailsState {
  patient: Patient | null;
  isLoading: boolean;
}

class PatientDetailsBase extends Component<
  PatientDetailsProps & { navigate: ReturnType<typeof useNavigate> },
  PatientDetailsState
> {
  constructor(props: PatientDetailsProps & { navigate: ReturnType<typeof useNavigate> }) {
    super(props);
    this.state = {
      patient: null,
      isLoading: true,
    };
  }

  async componentDidMount() {
    const { patientId } = this.props;

    if (patientId) {
      try {
        const result = await window.api.patient.getById(parseInt(patientId));
        if (result.success && result.data) {
          this.setState({ patient: result.data, isLoading: false });
        } else {
          console.error('Failed to load patient:', result.error);
          this.setState({ isLoading: false });
        }
      } catch (error) {
        console.error('Error loading patient:', error);
        this.setState({ isLoading: false });
      }
    }
  }

  handleBack = () => {
    this.props.navigate('/');
  };

  handleAddNote = () => {
    const { patientId } = this.props;
    this.props.navigate(`/patient/${patientId}/note/new`);
  };

  handleEditNote = (note: Note) => {
    const { patientId } = this.props;
    this.props.navigate(`/patient/${patientId}/note/edit/${note.id}`);
  };

  handleViewNote = (note: Note) => {
    const { patientId } = this.props;
    this.props.navigate(`/patient/${patientId}/note/${note.id}`);
  };

  render() {
    const { patient, isLoading } = this.state;

    if (isLoading) {
      return (
        <section className="section">
          <div className="container">
            <div className="notification is-info is-light">
              <p>Loading patient information...</p>
            </div>
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
        onBack={this.handleBack}
        onAddNote={this.handleAddNote}
        onEditNote={this.handleEditNote}
        onViewNote={this.handleViewNote}
      />
    );
  }
}

const PatientDetails: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  return <PatientDetailsBase patientId={patientId} navigate={navigate} />;
};

export default PatientDetails;
