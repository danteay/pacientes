import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NoteForm from '../../components/NoteForm/NoteForm';
import type { Note } from '../../../types/note';

const NoteEditor: React.FC = () => {
  const { patientId, noteId } = useParams<{ patientId: string; noteId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNote = async () => {
      if (noteId && noteId !== 'new') {
        try {
          const result = await window.api.note.getById(parseInt(noteId));
          if (result.success && result.data) {
            setNote(result.data);
          } else {
            console.error('Failed to load note:', result.error);
          }
        } catch (error) {
          console.error('Error loading note:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (patientId) {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [noteId, patientId]);

  const handleSave = () => navigate(`/patient/${patientId}/notes`);
  const handleCancel = () => navigate(`/patient/${patientId}/notes`);

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <div className="notification is-info is-light">
            <p>{t('note.form.loadingNote')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!patientId) {
    return (
      <section className="section">
        <div className="container">
          <div className="notification is-danger is-light">
            <p>{t('note.form.patientIdRequired')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <NoteForm
      patientId={parseInt(patientId)}
      note={note}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default NoteEditor;
