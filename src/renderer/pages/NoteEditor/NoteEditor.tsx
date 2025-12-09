import React, { Component } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NoteForm from '../../components/NoteForm/NoteForm';
import type { Note } from '../../App';

interface NoteEditorProps {
  patientId?: string;
  noteId?: string;
}

interface NoteEditorState {
  note: Note | null;
  isLoading: boolean;
}

class NoteEditorBase extends Component<
  NoteEditorProps & { navigate: ReturnType<typeof useNavigate> },
  NoteEditorState
> {
  constructor(props: NoteEditorProps & { navigate: ReturnType<typeof useNavigate> }) {
    super(props);
    this.state = {
      note: null,
      isLoading: true,
    };
  }

  async componentDidMount() {
    const { noteId, patientId } = this.props;

    if (noteId && noteId !== 'new') {
      try {
        const result = await window.api.note.getById(parseInt(noteId));
        if (result.success && result.data) {
          this.setState({ note: result.data, isLoading: false });
        } else {
          console.error('Failed to load note:', result.error);
          this.setState({ isLoading: false });
        }
      } catch (error) {
        console.error('Error loading note:', error);
        this.setState({ isLoading: false });
      }
    } else if (patientId) {
      // New note - just set loading to false
      this.setState({ isLoading: false });
    }
  }

  handleSave = () => {
    const { patientId } = this.props;
    this.props.navigate(`/patient/${patientId}/notes`);
  };

  handleCancel = () => {
    const { patientId } = this.props;
    this.props.navigate(`/patient/${patientId}/notes`);
  };

  render() {
    const { patientId } = this.props;
    const { note, isLoading } = this.state;

    if (isLoading) {
      return (
        <section className="section">
          <div className="container">
            <div className="notification is-info is-light">
              <p>Loading note...</p>
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
              <p>Patient ID is required.</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <NoteForm
        patientId={parseInt(patientId)}
        note={note}
        onSave={this.handleSave}
        onCancel={this.handleCancel}
      />
    );
  }
}

const NoteEditor: React.FC = () => {
  const { patientId, noteId } = useParams<{ patientId: string; noteId: string }>();
  const navigate = useNavigate();

  return <NoteEditorBase patientId={patientId} noteId={noteId} navigate={navigate} />;
};

export default NoteEditor;
