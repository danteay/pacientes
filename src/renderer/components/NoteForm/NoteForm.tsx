import React, { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import type { Note } from '../../App';
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
}

class NoteForm extends Component<NoteFormProps, NoteFormState> {
  constructor(props: NoteFormProps) {
    super(props);
    this.state = {
      title: '',
      editorState: EditorState.createEmpty(),
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
    this.setState({ editorState });
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

      const result = note
        ? await window.api.note.update({ id: note.id, ...noteData })
        : await window.api.note.create(noteData);

      if (result.success) {
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
    const { title, editorState } = this.state;

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
                <h2 className="title is-4">{note ? 'Edit Note' : 'Add New Note'}</h2>
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
                    onChange={(e) => this.setState({ title: e.target.value })}
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
