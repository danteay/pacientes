import React, { Component } from 'react';
import type { Patient } from '../../App';
import './PatientList.styles.scss';

interface PatientListProps {
  onAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onViewNotes: (patient: Patient) => void;
}

interface PatientListState {
  patients: Patient[];
  searchTerm: string;
  isLoading: boolean;
}

class PatientList extends Component<PatientListProps, PatientListState> {
  constructor(props: PatientListProps) {
    super(props);
    this.state = {
      patients: [],
      searchTerm: '',
      isLoading: true,
    };
  }

  componentDidMount() {
    this.loadPatients();
  }

  loadPatients = async () => {
    this.setState({ isLoading: true });
    try {
      const result = this.state.searchTerm
        ? await window.api.patient.search(this.state.searchTerm)
        : await window.api.patient.getAll();

      if (result.success) {
        this.setState({ patients: result.data });
      } else {
        console.error('Failed to load patients:', result.error);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleSearch = () => {
    this.loadPatients();
  };


  handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.handleSearch();
    }
  };

  render() {
    const { onAddPatient, onEditPatient, onViewNotes } = this.props;
    const { patients, searchTerm, isLoading } = this.state;

    return (
      <section className="section">
        <div className="container">
          <div className="box">
            <div className="field is-grouped">
              <div className="control is-expanded">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className="input"
                  value={searchTerm}
                  onChange={this.handleSearchInputChange}
                  onKeyDown={this.handleSearchKeyDown}
                />
              </div>
              <div className="control">
                <button onClick={this.handleSearch} className="button is-info">
                  Search
                </button>
              </div>
              <div className="control">
                <button onClick={onAddPatient} className="button is-primary">
                  + Add Patient
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="notification is-info is-light">
              <p>Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="notification is-warning is-light">
              <p>No patients found. Click the "Add Patient" button to add a new patient.</p>
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
                        <div className="buttons">
                          <button
                            onClick={() => onViewNotes(patient)}
                            className="button is-small is-info"
                            title="View notes"
                          >
                            Notes
                          </button>
                          <button
                            onClick={() => onEditPatient(patient)}
                            className="button is-small is-warning"
                            title="Edit patient"
                          >
                            Edit
                          </button>
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
  }
}

export default PatientList;
