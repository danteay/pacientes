import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Attachment } from '../../../types/attachment';
import { Button } from '../atoms/Button/Button';
import './AttachmentsTable.styles.scss';

interface AttachmentsTableProps {
  patientId: number;
  attachments: Attachment[];
  onRefresh: () => void;
  readOnly?: boolean;
}

export const AttachmentsTable: React.FC<AttachmentsTableProps> = ({
  patientId,
  attachments,
  onRefresh,
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = editingAttachment !== null;

  const handleLinkClick = async (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    try {
      const response = await window.api.shell.openExternal(url);
      if (!response.success) {
        alert(t('attachment.openFailed', { error: response.error || t('errors.unknownError') }));
      }
    } catch (err) {
      console.error('Failed to open external URL:', err);
      alert(t('attachment.openFailedDescription'));
    }
  };

  const handleAddClick = () => {
    setEditingAttachment(null);
    setFormData({ name: '', url: '' });
    setError(null);
    setShowModal(true);
  };

  const handleEditClick = (attachment: Attachment) => {
    setEditingAttachment(attachment);
    setFormData({ name: attachment.name, url: attachment.url });
    setError(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAttachment(null);
    setFormData({ name: '', url: '' });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        const response = await window.api.attachment.update({
          id: editingAttachment.id!,
          name: formData.name.trim(),
          url: formData.url.trim(),
        });

        if (!response.success) {
          setError(response.error || t('attachment.updateFailed'));
          setIsSubmitting(false);
          return;
        }
      } else {
        const response = await window.api.attachment.create({
          patientId,
          name: formData.name.trim(),
          url: formData.url.trim(),
        });

        if (!response.success) {
          setError(response.error || t('attachment.createFailed'));
          setIsSubmitting(false);
          return;
        }
      }

      setShowModal(false);
      setEditingAttachment(null);
      setFormData({ name: '', url: '' });
      onRefresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? t('attachment.updateFailed')
            : t('attachment.createFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!confirm(t('attachment.confirmDelete'))) {
      return;
    }

    try {
      const response = await window.api.attachment.delete(attachmentId);
      if (!response.success) {
        alert(response.error || t('attachment.deleteFailed'));
        return;
      }
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('attachment.deleteFailed'));
    }
  };

  return (
    <>
      {attachments.length === 0 ? (
        <div>
          <div className="notification is-info is-light">
            <p>{t('attachment.noAttachments')}</p>
          </div>
          {!readOnly && (
            <div className="has-text-right" style={{ marginTop: '1rem' }}>
              <Button variant="success" onClick={handleAddClick} size="small">
                {t('attachment.addAttachment')}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="attachments-table">
          <div className="table-container">
            <table className="table is-fullwidth is-striped is-hoverable">
              <thead>
                <tr>
                  <th>{t('attachment.name')}</th>
                  <th>{t('attachment.created')}</th>
                  {!readOnly && <th>{t('attachment.actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {attachments.map((attachment) => (
                  <tr key={attachment.id}>
                    <td>
                      <a
                        href={attachment.url}
                        onClick={(e) => handleLinkClick(e, attachment.url)}
                        className="attachment-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={attachment.url}
                      >
                        {attachment.name}
                      </a>
                    </td>
                    <td>{new Date(attachment.createdAt!).toLocaleDateString()}</td>
                    {!readOnly && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button
                            variant="info"
                            size="small"
                            onClick={() => handleEditClick(attachment)}
                            title={t('attachment.editTitle')}
                          >
                            {t('attachment.edit')}
                          </Button>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => handleDelete(attachment.id!)}
                            title={t('attachment.deleteTitle')}
                          >
                            {t('attachment.delete')}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!readOnly && (
            <div className="has-text-right" style={{ marginTop: '1rem' }}>
              <Button variant="success" onClick={handleAddClick} size="small">
                {t('attachment.addAttachment')}
              </Button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal is-active">
          <div className="modal-background" onClick={handleModalClose}></div>
          <form onSubmit={handleSubmit}>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">
                  {isEditMode
                    ? t('attachment.editAttachmentTitle')
                    : t('attachment.addNewTitle')}
                </p>
                <button
                  type="button"
                  className="delete"
                  aria-label="close"
                  onClick={handleModalClose}
                ></button>
              </header>
              <section className="modal-card-body">
                {error && (
                  <div className="notification is-danger is-light">
                    <p>{error}</p>
                  </div>
                )}

                <div className="field">
                  <label className="label">{t('attachment.attachmentName')}</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder={t('attachment.attachmentNamePlaceholder')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">{t('attachment.url')}</label>
                  <div className="control">
                    <input
                      className="input"
                      type="url"
                      placeholder={t('attachment.urlPlaceholder')}
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="help">{t('attachment.urlHelp')}</p>
                </div>
              </section>
              <footer className="modal-card-foot">
                <button
                  type="submit"
                  className="button is-success"
                  disabled={isSubmitting || !formData.name.trim() || !formData.url.trim()}
                >
                  {isSubmitting
                    ? isEditMode
                      ? t('attachment.updating')
                      : t('attachment.adding')
                    : isEditMode
                      ? t('attachment.updateAttachment')
                      : t('attachment.addAttachmentButton')}
                </button>
                <button
                  type="button"
                  className="button is-light"
                  onClick={handleModalClose}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </button>
              </footer>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
