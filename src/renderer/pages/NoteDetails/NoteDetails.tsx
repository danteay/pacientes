import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NoteView from '../../components/NoteView/NoteView';
import type { Note } from '../../../types/note';

const NoteDetails: React.FC = () => {
  const { patientId, noteId } = useParams<{ patientId: string; noteId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) return;
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
    };

    loadNote();
  }, [noteId]);

  const handleBack = () => navigate(`/patient/${patientId}/notes`);
  const handleEdit = () => navigate(`/patient/${patientId}/note/edit/${noteId}`);

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <div className="notification is-info is-light">
            <p>{t('note.view.loadingNote')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!note) {
    return (
      <section className="section">
        <div className="container">
          <div className="notification is-danger is-light">
            <p>{t('note.view.noteNotFound')}</p>
          </div>
        </div>
      </section>
    );
  }

  return <NoteView note={note} onBack={handleBack} onEdit={handleEdit} />;
};

export default NoteDetails;
