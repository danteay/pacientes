import React, { Component } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientForm from '../../components/PatientForm/PatientForm';
import type { Patient } from '../../../types/patient';

interface EditPatientProps {
  patientId?: string;
}

interface EditPatientState {
  patient: Patient | null;
  isLoading: boolean;
}

class EditPatientBase extends Component<
  EditPatientProps & { navigate: ReturnType<typeof useNavigate> },
  EditPatientState
> {
  constructor(props: EditPatientProps & { navigate: ReturnType<typeof useNavigate> }) {
    super(props);
    this.state = {
      patient: null,
      isLoading: true,
    };
  }

  async componentDidMount() {
    const { patientId } = this.props;

    if (patientId && patientId !== 'new') {
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
    } else {
      this.setState({ isLoading: false });
    }
  }

  handleSave = () => {
    this.props.navigate('/');
  };

  handleCancel = () => {
    this.props.navigate('/');
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

    return <PatientForm patient={patient} onSave={this.handleSave} onCancel={this.handleCancel} />;
  }
}

const EditPatient: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  return <EditPatientBase patientId={patientId} navigate={navigate} />;
};

export default EditPatient;
