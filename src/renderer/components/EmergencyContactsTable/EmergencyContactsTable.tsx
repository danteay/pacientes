import React, { useState, useEffect } from 'react';
import type { EmergencyContact } from '../../../types/emergency-contact';
import { Button } from '../atoms/Button/Button';
import './EmergencyContactsTable.styles.scss';

interface EmergencyContactsTableProps {
  contacts: Partial<EmergencyContact>[];
  onChange: (contacts: Partial<EmergencyContact>[]) => void;
  readOnly?: boolean;
}

export const EmergencyContactsTable: React.FC<EmergencyContactsTableProps> = ({
  contacts,
  onChange,
  readOnly = false,
}) => {
  const [localContacts, setLocalContacts] = useState<Partial<EmergencyContact>[]>(contacts);

  useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  const handleAdd = () => {
    const newContact: Partial<EmergencyContact> = {
      fullName: '',
      phoneNumber: '',
      relation: '',
      email: '',
      address: '',
    };
    const updated = [...localContacts, newContact];
    setLocalContacts(updated);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = localContacts.filter((_, i) => i !== index);
    setLocalContacts(updated);
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...localContacts];
    updated[index] = { ...updated[index], [field]: value };
    setLocalContacts(updated);
    onChange(updated);
  };

  if (readOnly && localContacts.length === 0) {
    return (
      <div className="notification is-info is-light">
        <p>No emergency contacts registered.</p>
      </div>
    );
  }

  return (
    <div className="emergency-contacts-table">
      <div className="table-container">
        <table className="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Full Name *</th>
              <th>Phone Number *</th>
              <th>Relation *</th>
              <th>Email *</th>
              <th>Address</th>
              {!readOnly && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {localContacts.length === 0 && !readOnly ? (
              <tr>
                <td colSpan={6} className="has-text-centered has-text-grey">
                  No emergency contacts added. Click "Add Contact" to add one.
                </td>
              </tr>
            ) : (
              localContacts.map((contact, index) => (
                <tr key={index}>
                  <td>
                    {readOnly ? (
                      contact.fullName || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="text"
                        value={contact.fullName || ''}
                        onChange={(e) => handleChange(index, 'fullName', e.target.value)}
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      contact.phoneNumber || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="tel"
                        value={contact.phoneNumber || ''}
                        onChange={(e) => handleChange(index, 'phoneNumber', e.target.value)}
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      contact.relation || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="text"
                        value={contact.relation || ''}
                        onChange={(e) => handleChange(index, 'relation', e.target.value)}
                        placeholder="e.g., Mother, Brother, Friend"
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      contact.email || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="email"
                        value={contact.email || ''}
                        onChange={(e) => handleChange(index, 'email', e.target.value)}
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      contact.address || '-'
                    ) : (
                      <input
                        className="input is-small"
                        type="text"
                        value={contact.address || ''}
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
                        title="Remove contact"
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
            + Add Contact
          </Button>
        </div>
      )}
    </div>
  );
};
