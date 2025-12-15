import React, { Component } from 'react';
import type { Patient } from '../../../types/patient';
import { MaritalStatus, PatientStatus, Gender, SexualOrientation } from '../../../types/patient';
import './PatientForm.styles.scss';

interface PatientFormProps {
  patient: Patient | null;
  onSave: () => void;
  onCancel: () => void;
}

interface PatientFormState {
  formData: Partial<Patient>;
}

class PatientForm extends Component<PatientFormProps, PatientFormState> {
  constructor(props: PatientFormProps) {
    super(props);
    this.state = {
      formData: {
        name: '',
        age: 0,
        email: '',
        phoneNumber: '',
        birthDate: '',
        maritalStatus: MaritalStatus.NOT_SPECIFIED,
        gender: Gender.NOT_SPECIFIED,
        sexualOrientation: SexualOrientation.PREFER_NOT_TO_SAY,
        educationalLevel: '',
        profession: '',
        livesWith: '',
        children: 0,
        previousPsychologicalExperience: '',
        firstAppointmentDate: '',
        status: PatientStatus.ACTIVE,
      },
    };
  }

  componentDidMount() {
    if (this.props.patient) {
      this.setState({ formData: this.props.patient });
    }
  }

  componentDidUpdate(prevProps: PatientFormProps) {
    if (this.props.patient !== prevProps.patient && this.props.patient) {
      this.setState({ formData: this.props.patient });
    }
  }

  handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: name === 'age' || name === 'children' ? Number(value) : value,
      },
    }));
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result =
        this.props.patient && this.props.patient.id
          ? await window.api.patient.update({ id: this.props.patient.id, ...this.state.formData })
          : await window.api.patient.create(this.state.formData as Patient);

      if (result.success) {
        this.props.onSave();
      } else {
        alert('Failed to save patient: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Failed to save patient');
    }
  };

  render() {
    const { patient, onCancel } = this.props;
    const { formData } = this.state;

    return (
      <section className="section">
        <div className="container">
          <div className="box">
            <div className="level">
              <div className="level-left">
                <button
                  type="button"
                  onClick={onCancel}
                  className="button is-light"
                  title="Back to patient list"
                >
                  <span>← Back</span>
                </button>
              </div>
              <div className="level-item">
                <h2 className="title is-4">{patient ? 'Edit Patient' : 'Add New Patient'}</h2>
              </div>
            </div>
          </div>

          <form onSubmit={this.handleSubmit}>
            <div className="box">
              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="name">
                      Name *
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={this.handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="age">
                      Age *
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="number"
                        id="age"
                        name="age"
                        min="1"
                        max="150"
                        value={formData.age}
                        onChange={this.handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="email">
                      Email *
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={this.handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="phoneNumber">
                      Phone Number *
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={this.handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="birthDate">
                      Birth Date *
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={this.handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="gender">
                      Gender *
                    </label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={this.handleChange}
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="sexualOrientation">
                      Sexual Orientation *
                    </label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select
                          id="sexualOrientation"
                          name="sexualOrientation"
                          value={formData.sexualOrientation}
                          onChange={this.handleChange}
                          required
                        >
                          <option value="prefer_not_to_say">Prefer not to say</option>
                          <option value="heterosexual">Heterosexual</option>
                          <option value="homosexual">Homosexual</option>
                          <option value="bisexual">Bisexual</option>
                          <option value="pansexual">Pansexual</option>
                          <option value="asexual">Asexual</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="maritalStatus">
                      Marital Status *
                    </label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select
                          id="maritalStatus"
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={this.handleChange}
                          required
                        >
                          <option value="">Select status</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                          <option value="widowed">Widowed</option>
                          <option value="separated">Separated</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="status">
                      Patient Status *
                    </label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={this.handleChange}
                          required
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="medical_discharge">Medical Discharge</option>
                          <option value="abandoned">Abandoned</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="children">
                      Number of Children *
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="number"
                        id="children"
                        name="children"
                        min="0"
                        value={formData.children}
                        onChange={this.handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="educationalLevel">
                      Educational Level *
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        id="educationalLevel"
                        name="educationalLevel"
                        placeholder="e.g., High School, Bachelor's, Master's"
                        value={formData.educationalLevel}
                        onChange={this.handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="column">
                  <div className="field">
                    <label className="label" htmlFor="profession">
                      Profession *
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        id="profession"
                        name="profession"
                        value={formData.profession}
                        onChange={this.handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="livesWith">
                  Lives With *
                </label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    id="livesWith"
                    name="livesWith"
                    placeholder="e.g., Alone, Parents, Spouse, Roommates"
                    value={formData.livesWith}
                    onChange={this.handleChange}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="firstAppointmentDate">
                  First Appointment Date
                </label>
                <div className="control">
                  <input
                    className="input"
                    type="date"
                    id="firstAppointmentDate"
                    name="firstAppointmentDate"
                    value={formData.firstAppointmentDate || ''}
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="previousPsychologicalExperience">
                  Previous Psychological Experience
                </label>
                <div className="control">
                  <textarea
                    className="textarea"
                    id="previousPsychologicalExperience"
                    name="previousPsychologicalExperience"
                    rows={4}
                    placeholder="Describe any previous therapy, treatments, or psychological services..."
                    value={formData.previousPsychologicalExperience || ''}
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div className="field is-grouped">
                <div className="control">
                  <button type="submit" className="button is-primary">
                    Save Patient
                  </button>
                </div>
                <div className="control">
                  <button type="button" onClick={onCancel} className="button is-light">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    );
  }
}

export default PatientForm;
