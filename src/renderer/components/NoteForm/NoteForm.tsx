import React, { Component } from 'react';
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

interface NoteFormState {
  title: string;
  editorState: EditorState;
  isDirty: boolean;
  isSaving: boolean;
}

class NoteForm extends Component<NoteFormProps, NoteFormState> {
  constructor(props: NoteFormProps) {
    super(props);
    this.state = {
      title: '',
      editorState: EditorState.createEmpty(),
      isDirty: false,
      isSaving: false,
    };
  }

  componentDidMount() {
    this.loadNoteContent();
  }

  componentDidUpdate(prevProps: NoteFormProps) {
    if (prevProps.note !== this.props.note) {
      this.loadNoteContent();
    }
  }

  loadNoteContent = () => {
    const { note } = this.props;
    if (note) {
      this.setState({ title: note.title });
      // Convert HTML content to Draft.js EditorState
      const contentBlock = htmlToDraft(note.content);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        this.setState({ editorState: EditorState.createWithContent(contentState) });
      }
    }
  };

  onEditorStateChange = (editorState: EditorState) => {
    this.setState({ editorState, isDirty: true });
  };

  handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: e.target.value, isDirty: true });
  };

  componentWillUnmount() {
    // Auto-save if there's unsaved content when navigating away
    this.autoSaveNote();
  }

  autoSaveNote = async () => {
    const { patientId, note } = this.props;
    const { title, editorState, isDirty, isSaving } = this.state;

    // Don't auto-save if already saving or no changes made
    if (!isDirty || isSaving) {
      return;
    }

    // Convert Draft.js state to HTML
    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    // Don't save if both title and content are empty
    if (!title.trim() && (!content.trim() || content === '<p></p>\n')) {
      return;
    }

    // Don't save if either title or content is missing (incomplete note)
    if (!title.trim() || !content.trim() || content === '<p></p>\n') {
      console.log('Auto-save skipped: incomplete note');
      return;
    }

    this.setState({ isSaving: true });

    try {
      const noteData = {
        patientId,
        title,
        content,
      };

      // Save or update the note
      const result =
        note && note.id
          ? await window.api.note.update({ id: note.id, ...noteData })
          : await window.api.note.create(noteData);

      if (result.success) {
        console.log('Note auto-saved successfully');
      } else {
        console.error('Auto-save failed:', result.error);
      }
    } catch (error) {
      console.error('Error during auto-save:', error);
    } finally {
      // Note: setState may not complete if component is unmounted
      // but that's okay since we're leaving the page anyway
      this.setState({ isSaving: false });
    }
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { patientId, note, onSave } = this.props;
    const { title, editorState } = this.state;

    // Convert Draft.js state to HTML
    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    if (!title.trim() || !content.trim() || content === '<p></p>\n') {
      alert('Please fill in both title and content');
      return;
    }

    try {
      const noteData = {
        patientId,
        title,
        content,
      };

      const result =
        note && note.id
          ? await window.api.note.update({ id: note.id, ...noteData })
          : await window.api.note.create(noteData);

      if (result.success) {
        this.setState({ isDirty: false });
        onSave();
      } else {
        alert('Failed to save note: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  render() {
    const { note, onCancel } = this.props;
    const { title, editorState, isDirty, isSaving } = this.state;

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
                  title="Back to notes list"
                >
                  <span>← Back</span>
                </button>
              </div>
              <div className="level-item">
                <div style={{ textAlign: 'center' }}>
                  <h2 className="title is-4">{note ? 'Edit Note' : 'Add New Note'}</h2>
                  {isSaving && (
                    <p className="help is-info">
                      <span className="icon is-small">
                        <i className="fas fa-spinner fa-pulse"></i>
                      </span>
                      <span>Saving...</span>
                    </p>
                  )}
                  {isDirty && !isSaving && <p className="help is-warning">Unsaved changes</p>}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={this.handleSubmit}>
            <div className="box">
              <div className="field">
                <label className="label" htmlFor="note-title">
                  Title *
                </label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    id="note-title"
                    name="title"
                    required
                    placeholder="Enter note title..."
                    value={title}
                    onChange={this.handleTitleChange}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="note-content">
                  Content *
                </label>
                <div className="control">
                  <Editor
                    editorState={editorState}
                    onEditorStateChange={this.onEditorStateChange}
                    wrapperClassName="draft-wrapper"
                    editorClassName="draft-editor"
                    toolbarClassName="draft-toolbar"
                    placeholder="Write your note here..."
                  />
                </div>
              </div>

              <div className="field is-grouped">
                <div className="control">
                  <button type="submit" className="button is-primary">
                    Save Note
                  </button>
                </div>
                <div className="control">
                  <button type="button" onClick={onCancel} className="button is-light">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    );
  }
}

export default NoteForm;
