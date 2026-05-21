import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Patient } from '../../../types/patient';
import { MaritalStatus, PatientStatus, Gender, SexualOrientation } from '../../../types/patient';
import type { EmergencyContact } from '../../../types/emergency-contact';
import type { LegalTutor } from '../../../types/legal-tutor';
import { EmergencyContactsTable } from '../EmergencyContactsTable/EmergencyContactsTable';
import { LegalTutorsTable } from '../LegalTutorsTable/LegalTutorsTable';
import './PatientForm.styles.scss';

interface PatientFormProps {
  patient: Patient | null;
  onSave: () => void;
  onCancel: () => void;
}

const INITIAL_FORM_DATA: Partial<Patient> = {
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
};

const PatientForm: React.FC<PatientFormProps> = ({ patient, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Patient>>(INITIAL_FORM_DATA);
  const [emergencyContacts, setEmergencyContacts] = useState<Partial<EmergencyContact>[]>([]);
  const [legalTutors, setLegalTutors] = useState<Partial<LegalTutor>[]>([]);

  useEffect(() => {
    const loadRelatedData = async () => {
      if (!patient?.id) {
        setEmergencyContacts([]);
        setLegalTutors([]);
        return;
      }

      try {
        const contactsResponse = await window.api.emergencyContact.getByPatientId(patient.id);
        if (contactsResponse.success && contactsResponse.data) {
          setEmergencyContacts(contactsResponse.data);
        }
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
      }

      try {
        const tutorsResponse = await window.api.legalTutor.getByPatientId(patient.id);
        if (tutorsResponse.success && tutorsResponse.data) {
          setLegalTutors(tutorsResponse.data);
        }
      } catch (error) {
        console.error('Error loading legal tutors:', error);
      }
    };

    if (patient) {
      setFormData(patient);
      loadRelatedData();
    }
  }, [patient]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'children' ? Number(value) : value,
    }));
  };

  const saveEmergencyContacts = async (patientId: number) => {
    const existingResponse = await window.api.emergencyContact.getByPatientId(patientId);
    const existingContacts = existingResponse.success ? existingResponse.data || [] : [];

    const contactsToDelete = existingContacts.filter(
      (existing) => !emergencyContacts.find((contact) => contact.id === existing.id)
    );

    for (const contact of contactsToDelete) {
      if (contact.id) {
        await window.api.emergencyContact.delete(contact.id);
      }
    }

    for (const contact of emergencyContacts) {
      if (!contact.fullName || !contact.phoneNumber || !contact.email || !contact.relation) {
        continue;
      }

      if (contact.id) {
        await window.api.emergencyContact.update({
          id: contact.id,
          ...contact,
          patientId,
        });
      } else {
        await window.api.emergencyContact.create({
          ...contact,
          patientId,
          fullName: contact.fullName,
          phoneNumber: contact.phoneNumber,
          email: contact.email,
          relation: contact.relation,
        });
      }
    }
  };

  const saveLegalTutors = async (patientId: number) => {
    const existingResponse = await window.api.legalTutor.getByPatientId(patientId);
    const existingTutors = existingResponse.success ? existingResponse.data || [] : [];

    const tutorsToDelete = existingTutors.filter(
      (existing) => !legalTutors.find((tutor) => tutor.id === existing.id)
    );

    for (const tutor of tutorsToDelete) {
      if (tutor.id) {
        await window.api.legalTutor.delete(tutor.id);
      }
    }

    for (const tutor of legalTutors) {
      if (
        !tutor.fullName ||
        !tutor.phoneNumber ||
        !tutor.email ||
        !tutor.relation ||
        !tutor.birthDate
      ) {
        continue;
      }

      if (tutor.id) {
        await window.api.legalTutor.update({
          id: tutor.id,
          ...tutor,
          patientId,
        });
      } else {
        await window.api.legalTutor.create({
          ...tutor,
          patientId,
          fullName: tutor.fullName,
          phoneNumber: tutor.phoneNumber,
          email: tutor.email,
          relation: tutor.relation,
          birthDate: tutor.birthDate,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result =
        patient && patient.id
          ? await window.api.patient.update({ id: patient.id, ...formData })
          : await window.api.patient.create(formData as Patient);

      if (!result.success) {
        alert(`${t('patient.form.savePatientFailed')}: ${result.error}`);
        return;
      }

      const patientId = result.data?.id;
      if (!patientId) {
        alert(t('patient.form.getPatientIdFailed'));
        return;
      }

      await saveEmergencyContacts(patientId);
      await saveLegalTutors(patientId);

      onSave();
    } catch (error) {
      console.error('Error saving patient:', error);
      alert(t('patient.form.savePatientFailed'));
    }
  };

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
                title={t('patient.form.backToList')}
              >
                <span>{t('common.back')}</span>
              </button>
            </div>
            <div className="level-item">
              <h2 className="title is-4">
                {patient ? t('patient.form.editTitle') : t('patient.form.addTitle')}
              </h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="box">
            <div className="columns">
              <div className="column">
                <div className="field">
                  <label className="label" htmlFor="name">
                    {t('patient.form.name')}
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="column">
                <div className="field">
                  <label className="label" htmlFor="age">
                    {t('patient.form.age')}
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
                      onChange={handleChange}
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
                    {t('patient.form.email')}
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="column">
                <div className="field">
                  <label className="label" htmlFor="phoneNumber">
                    {t('patient.form.phoneNumber')}
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
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
                    {t('patient.form.birthDate')}
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="column">
                <div className="field">
                  <label className="label" htmlFor="gender">
                    {t('patient.form.gender')}
                  </label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">{t('patient.form.selectGender')}</option>
                        <option value={Gender.MALE}>{t('enums.gender.male')}</option>
                        <option value={Gender.FEMALE}>{t('enums.gender.female')}</option>
                        <option value={Gender.OTHER}>{t('enums.gender.other')}</option>
                        <option value={Gender.PREFER_NOT_TO_SAY}>
                          {t('enums.gender.prefer_not_to_say')}
                        </option>
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
                    {t('patient.form.sexualOrientation')}
                  </label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        id="sexualOrientation"
                        name="sexualOrientation"
                        value={formData.sexualOrientation}
                        onChange={handleChange}
                        required
                      >
                        <option value={SexualOrientation.PREFER_NOT_TO_SAY}>
                          {t('enums.sexualOrientation.prefer_not_to_say')}
                        </option>
                        <option value={SexualOrientation.HETEROSEXUAL}>
                          {t('enums.sexualOrientation.heterosexual')}
                        </option>
                        <option value={SexualOrientation.HOMOSEXUAL}>
                          {t('enums.sexualOrientation.homosexual')}
                        </option>
                        <option value={SexualOrientation.BISEXUAL}>
                          {t('enums.sexualOrientation.bisexual')}
                        </option>
                        <option value={SexualOrientation.PANSEXUAL}>
                          {t('enums.sexualOrientation.pansexual')}
                        </option>
                        <option value={SexualOrientation.ASEXUAL}>
                          {t('enums.sexualOrientation.asexual')}
                        </option>
                        <option value={SexualOrientation.OTHER}>
                          {t('enums.sexualOrientation.other')}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="column">
                <div className="field">
                  <label className="label" htmlFor="maritalStatus">
                    {t('patient.form.maritalStatus')}
                  </label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        id="maritalStatus"
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleChange}
                        required
                      >
                        <option value="">{t('patient.form.selectMaritalStatus')}</option>
                        <option value={MaritalStatus.SINGLE}>
                          {t('enums.maritalStatus.single')}
                        </option>
                        <option value={MaritalStatus.MARRIED}>
                          {t('enums.maritalStatus.married')}
                        </option>
                        <option value={MaritalStatus.DIVORCED}>
                          {t('enums.maritalStatus.divorced')}
                        </option>
                        <option value={MaritalStatus.WIDOWED}>
                          {t('enums.maritalStatus.widowed')}
                        </option>
                        <option value={MaritalStatus.SEPARATED}>
                          {t('enums.maritalStatus.separated')}
                        </option>
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
                    {t('patient.form.patientStatus')}
                  </label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                      >
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

              <div className="column">
                <div className="field">
                  <label className="label" htmlFor="children">
                    {t('patient.form.numberOfChildren')}
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      type="number"
                      id="children"
                      name="children"
                      min="0"
                      value={formData.children}
                      onChange={handleChange}
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
                    {t('patient.form.educationalLevel')}
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      id="educationalLevel"
                      name="educationalLevel"
                      placeholder={t('patient.form.educationalLevelPlaceholder')}
                      value={formData.educationalLevel}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="column">
                <div className="field">
                  <label className="label" htmlFor="profession">
                    {t('patient.form.profession')}
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="livesWith">
                {t('patient.form.livesWith')}
              </label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  id="livesWith"
                  name="livesWith"
                  placeholder={t('patient.form.livesWithPlaceholder')}
                  value={formData.livesWith}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="firstAppointmentDate">
                {t('patient.form.firstAppointmentDate')}
              </label>
              <div className="control">
                <input
                  className="input"
                  type="date"
                  id="firstAppointmentDate"
                  name="firstAppointmentDate"
                  value={formData.firstAppointmentDate || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="previousPsychologicalExperience">
                {t('patient.form.previousExperience')}
              </label>
              <div className="control">
                <textarea
                  className="textarea"
                  id="previousPsychologicalExperience"
                  name="previousPsychologicalExperience"
                  rows={4}
                  placeholder={t('patient.form.previousExperiencePlaceholder')}
                  value={formData.previousPsychologicalExperience || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">{t('patient.form.emergencyContacts')}</label>
              <p className="help">{t('patient.form.emergencyContactsHelp')}</p>
              <EmergencyContactsTable
                contacts={emergencyContacts}
                onChange={setEmergencyContacts}
              />
            </div>

            <div className="field">
              <label className="label">{t('patient.form.legalTutors')}</label>
              <p className="help">{t('patient.form.legalTutorsHelp')}</p>
              <LegalTutorsTable tutors={legalTutors} onChange={setLegalTutors} />
            </div>

            <div className="field is-grouped">
              <div className="control">
                <button type="submit" className="button is-primary">
                  {t('patient.form.savePatient')}
                </button>
              </div>
              <div className="control">
                <button type="button" onClick={onCancel} className="button is-light">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default PatientForm;
