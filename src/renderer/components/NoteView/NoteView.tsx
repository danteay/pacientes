import React, { Component } from 'react';
import type { Note } from '../../App';
import './NoteView.styles.scss';

interface NoteViewProps {
  note: Note;
  onBack: () => void;
  onEdit: () => void;
}

class NoteView extends Component<NoteViewProps> {
  formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  render() {
    const { note, onBack, onEdit } = this.props;

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
                  title="Back to notes list"
                >
                  <span>← Back</span>
                </button>
              </div>
              <div className="level-item">
                <h2 className="title is-4">{note.title}</h2>
              </div>
              <div className="level-right">
                <button onClick={onEdit} className="button is-warning">
                  Edit
                </button>
              </div>
            </div>
          </div>

          <div className="box">
            <div className="content">
              <p className="has-text-grey">
                <strong>Created:</strong> {this.formatDate(note.createdAt!)}
                {note.updatedAt !== note.createdAt && (
                  <span>
                    {' '}
                    • <strong>Updated:</strong> {this.formatDate(note.updatedAt!)}
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
  }
}

export default NoteView;
