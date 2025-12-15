import React, { useState, useEffect } from 'react';
import type { LegalTutor } from '../../../types/legal-tutor';
import { Button } from '../atoms/Button/Button';
import './LegalTutorsTable.styles.scss';

interface LegalTutorsTableProps {
  tutors: Partial<LegalTutor>[];
  onChange: (tutors: Partial<LegalTutor>[]) => void;
  readOnly?: boolean;
}

export const LegalTutorsTable: React.FC<LegalTutorsTableProps> = ({
  tutors,
  onChange,
  readOnly = false,
}) => {
  const [localTutors, setLocalTutors] = useState<Partial<LegalTutor>[]>(tutors);

  useEffect(() => {
    setLocalTutors(tutors);
  }, [tutors]);

  const handleAdd = () => {
    const newTutor: Partial<LegalTutor> = {
      fullName: '',
      phoneNumber: '',
      relation: '',
      email: '',
      birthDate: '',
      address: '',
    };
    const updated = [...localTutors, newTutor];
    setLocalTutors(updated);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = localTutors.filter((_, i) => i !== index);
    setLocalTutors(updated);
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof LegalTutor, value: string) => {
    const updated = [...localTutors];
    updated[index] = { ...updated[index], [field]: value };
    setLocalTutors(updated);
    onChange(updated);
  };

  if (readOnly && localTutors.length === 0) {
    return (
      <div className="notification is-info is-light">
        <p>No legal tutors registered.</p>
      </div>
    );
  }

  return (
    <div className="legal-tutors-table">
      <div className="table-container">
        <table className="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Full Name *</th>
              <th>Phone Number *</th>
              <th>Relation *</th>
              <th>Email *</th>
              <th>Birth Date *</th>
              <th>Address</th>
              {!readOnly && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {localTutors.length === 0 && !readOnly ? (
              <tr>
                <td colSpan={7} className="has-text-centered has-text-grey">
                  No legal tutors added. Click "Add Tutor" to add one.
                </td>
              </tr>
            ) : (
              localTutors.map((tutor, index) => (
                <tr key={index}>
                  <td>
                    {readOnly ? (
                      tutor.fullName || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="text"
                        value={tutor.fullName || ''}
                        onChange={(e) => handleChange(index, 'fullName', e.target.value)}
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      tutor.phoneNumber || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="tel"
                        value={tutor.phoneNumber || ''}
                        onChange={(e) => handleChange(index, 'phoneNumber', e.target.value)}
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      tutor.relation || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="text"
                        value={tutor.relation || ''}
                        onChange={(e) => handleChange(index, 'relation', e.target.value)}
                        placeholder="e.g., Parent, Guardian"
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      tutor.email || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="email"
                        value={tutor.email || ''}
                        onChange={(e) => handleChange(index, 'email', e.target.value)}
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      tutor.birthDate || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="date"
                        value={tutor.birthDate || ''}
                        onChange={(e) => handleChange(index, 'birthDate', e.target.value)}
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      tutor.address || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="text"
                        value={tutor.address || ''}
                        onChange={(e) => handleChange(index, 'address', e.target.value)}
                      />
                    )}
                  </td>
                  {!readOnly && (
                    <td>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleRemove(index)}
                        title="Remove tutor"
                      >
                        Remove
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <div className="has-text-right" style={{ marginTop: '1rem' }}>
          <Button variant="success" onClick={handleAdd} size="small">
            + Add Tutor
          </Button>
        </div>
      )}
    </div>
  );
};
