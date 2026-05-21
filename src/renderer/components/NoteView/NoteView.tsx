import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Note } from '../../../types/note';
import './styles.scss';

interface NoteViewProps {
  note: Note;
  onBack: () => void;
  onEdit: () => void;
}

const NoteView: React.FC<NoteViewProps> = ({ note, onBack, onEdit }) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string): string => new Date(dateString).toLocaleString();

  return (
    <section className="section">
      <div className="container">
        <div className="box">
          <div className="level">
            <div className="level-left">
              <button
                type="button"
                onClick={onBack}
                className="button is-light"
                title={t('note.view.backToList')}
              >
                <span>{t('common.back')}</span>
              </button>
            </div>
            <div className="level-item">
              <h2 className="title is-4">{note.title}</h2>
            </div>
            <div className="level-right">
              <button onClick={onEdit} className="button is-warning">
                {t('note.view.edit')}
              </button>
            </div>
          </div>
        </div>

        <div className="box">
          <div className="content">
            <p className="has-text-grey">
              <strong>{t('note.view.createdLabel')}</strong> {formatDate(note.createdAt!)}
              {note.updatedAt !== note.createdAt && (
                <span>
                  {' '}
                  • <strong>{t('note.view.updatedLabel')}</strong> {formatDate(note.updatedAt!)}
                </span>
              )}
            </p>
            <hr />
            <div dangerouslySetInnerHTML={{ __html: note.content }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoteView;
