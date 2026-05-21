import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import type { Note } from '../../../types/note';
import './styles.scss';

interface NoteFormProps {
  patientId: number;
  note: Note | null;
  onSave: () => void;
  onCancel: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ patientId, note, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  const [originalCreatedAt, setOriginalCreatedAt] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const stateRef = useRef({ title, editorState, isDirty, isSaving });
  stateRef.current = { title, editorState, isDirty, isSaving };

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      const contentBlock = htmlToDraft(note.content);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        setEditorState(EditorState.createWithContent(contentState));
      }
      if (note.createdAt) {
        const formattedDate = note.createdAt.split('T')[0];
        setCreatedAt(formattedDate);
        setOriginalCreatedAt(formattedDate);
      }
    }
  }, [note]);

  const autoSaveNote = useCallback(async () => {
    const current = stateRef.current;
    if (!current.isDirty || current.isSaving) {
      return;
    }

    const content = draftToHtml(convertToRaw(current.editorState.getCurrentContent()));

    if (!current.title.trim() && (!content.trim() || content === '<p></p>\n')) {
      return;
    }

    if (!current.title.trim() || !content.trim() || content === '<p></p>\n') {
      return;
    }

    try {
      const noteData = {
        patientId,
        title: current.title,
        content,
      };

      if (note && note.id) {
        await window.api.note.update({ id: note.id, ...noteData });
      } else {
        await window.api.note.create(noteData);
      }
    } catch (error) {
      console.error('Error during auto-save:', error);
    }
  }, [patientId, note]);

  useEffect(() => {
    return () => {
      autoSaveNote();
    };
  }, [autoSaveNote]);

  const onEditorStateChange = (newState: EditorState) => {
    setEditorState(newState);
    setIsDirty(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleCreatedAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatedAt(e.target.value);
    setIsDirty(true);
  };

  const handleCancelDateChange = () => {
    setCreatedAt(originalCreatedAt);
    setShowConfirmModal(false);
  };

  const saveNote = async () => {
    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    if (!title.trim() || !content.trim() || content === '<p></p>\n') {
      alert(t('note.form.fillRequired'));
      return;
    }

    try {
      setIsSaving(true);
      const isCreatedAtModified = note && createdAt && createdAt !== originalCreatedAt;

      let noteData: { patientId: number; title: string; content: string; createdAt?: string } = {
        patientId,
        title,
        content,
      };

      if (isCreatedAtModified) {
        const isoString = `${createdAt}T12:00:00.000Z`;
        noteData = { ...noteData, createdAt: isoString };
      }

      const result =
        note && note.id
          ? await window.api.note.update({ id: note.id, ...noteData })
          : await window.api.note.create(noteData);

      if (result.success) {
        setIsDirty(false);
        onSave();
      } else {
        alert(`${t('note.form.saveFailed')}: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert(t('note.form.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDateChange = async () => {
    setShowConfirmModal(false);
    await saveNote();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCreatedAtModified = note && createdAt && createdAt !== originalCreatedAt;

    if (isCreatedAtModified) {
      setShowConfirmModal(true);
      return;
    }

    await saveNote();
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
                title={t('note.form.backToList')}
              >
                <span>{t('common.back')}</span>
              </button>
            </div>
            <div className="level-item">
              <div style={{ textAlign: 'center' }}>
                <h2 className="title is-4">
                  {note ? t('note.form.editTitle') : t('note.form.addTitle')}
                </h2>
                {isSaving && (
                  <p className="help is-info">
                    <span className="icon is-small">
                      <i className="fas fa-spinner fa-pulse"></i>
                    </span>
                    <span>{t('note.form.saving')}</span>
                  </p>
                )}
                {isDirty && !isSaving && (
                  <p className="help is-warning">{t('note.form.unsavedChanges')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="box">
            <div className="field">
              <label className="label" htmlFor="note-title">
                {t('note.form.title')}
              </label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  id="note-title"
                  name="title"
                  required
                  placeholder={t('note.form.titlePlaceholder')}
                  value={title}
                  onChange={handleTitleChange}
                />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="note-content">
                {t('note.form.content')}
              </label>
              <div className="control">
                <Editor
                  editorState={editorState}
                  onEditorStateChange={onEditorStateChange}
                  wrapperClassName="draft-wrapper"
                  editorClassName="draft-editor"
                  toolbarClassName="draft-toolbar"
                  placeholder={t('note.form.contentPlaceholder')}
                />
              </div>
            </div>

            {note && note.id && (
              <div className="field">
                <label className="label" htmlFor="note-created-at">
                  {t('note.form.creationDate')}
                </label>
                <div className="control">
                  <input
                    className="input"
                    type="date"
                    id="note-created-at"
                    name="createdAt"
                    value={createdAt}
                    onChange={handleCreatedAtChange}
                  />
                </div>
                <p className="help">{t('note.form.creationDateHelp')}</p>
              </div>
            )}

            <div className="field is-grouped">
              <div className="control">
                <button type="submit" className="button is-primary">
                  {t('note.form.saveNote')}
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

        <div className={`modal ${showConfirmModal ? 'is-active' : ''}`}>
          <div className="modal-background" onClick={handleCancelDateChange}></div>
          <div className="modal-card">
            <header className="modal-card-head has-background-warning">
              <p className="modal-card-title has-text-dark">
                <span className="icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </span>
                <span>{t('note.form.confirmDateChange')}</span>
              </p>
              <button
                className="delete"
                aria-label="close"
                onClick={handleCancelDateChange}
              ></button>
            </header>
            <section className="modal-card-body">
              <div className="content">
                <p className="has-text-weight-semibold has-text-dark">
                  {t('note.form.confirmDateChangeMessage')}
                </p>
                <p className="has-text-grey-dark">
                  {t('note.form.confirmDateChangeDescription')}
                </p>
                <div className="notification is-warning is-light">
                  <p>
                    <strong>{t('note.form.confirmDateChangeWarningLabel')}</strong>{' '}
                    {t('note.form.confirmDateChangeWarning')}
                  </p>
                </div>
              </div>
            </section>
            <footer className="modal-card-foot" style={{ justifyContent: 'flex-end' }}>
              <button
                className="button is-light"
                onClick={handleCancelDateChange}
                type="button"
                style={{ marginRight: '0.5rem' }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="button is-warning"
                onClick={handleConfirmDateChange}
                type="button"
              >
                {t('note.form.yesChangeDate')}
              </button>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoteForm;
