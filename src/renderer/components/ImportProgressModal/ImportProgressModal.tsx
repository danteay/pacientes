import React from 'react';
import './styles.scss';

interface ImportProgress {
  stage: 'reading' | 'parsing' | 'importing_patients' | 'importing_notes' | 'complete';
  current: number;
  total: number;
  message: string;
}

interface ImportProgressModalProps {
  isActive: boolean;
  progress: ImportProgress | null;
  onClose: () => void;
}

const ImportProgressModal: React.FC<ImportProgressModalProps> = ({
  isActive,
  progress,
  onClose,
}) => {
  if (!isActive || !progress) return null;

  const percentage = Math.round((progress.current / progress.total) * 100);
  const isComplete = progress.stage === 'complete';

  return (
    <div className={`modal ${isActive ? 'is-active' : ''}`}>
      <div className="modal-background" onClick={isComplete ? onClose : undefined}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Importing Database</p>
          {isComplete && <button className="delete" aria-label="close" onClick={onClose}></button>}
        </header>
        <section className="modal-card-body">
          <div className="import-progress-content">
            <p className="has-text-centered mb-4">{progress.message}</p>
            <progress className="progress is-primary" value={progress.current} max={progress.total}>
              {percentage}%
            </progress>
            <p className="has-text-centered has-text-grey">{percentage}% complete</p>
          </div>
        </section>
        <footer className="modal-card-foot">
          {isComplete && (
            <button className="button is-primary" onClick={onClose}>
              Close
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ImportProgressModal;
