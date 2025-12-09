import React, { Component } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NoteView from '../../components/NoteView/NoteView';
import type { Note } from '../../../types/note';

interface NoteDetailsProps {
  patientId?: string;
  noteId?: string;
}

interface NoteDetailsState {
  note: Note | null;
  isLoading: boolean;
}

class NoteDetailsBase extends Component<
  NoteDetailsProps & { navigate: ReturnType<typeof useNavigate> },
  NoteDetailsState
> {
  constructor(props: NoteDetailsProps & { navigate: ReturnType<typeof useNavigate> }) {
    super(props);
    this.state = {
      note: null,
      isLoading: true,
    };
  }

  async componentDidMount() {
    const { noteId } = this.props;

    if (noteId) {
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
    }
  }

  handleBack = () => {
    const { patientId } = this.props;
    this.props.navigate(`/patient/${patientId}/notes`);
  };

  handleEdit = () => {
    const { patientId, noteId } = this.props;
    this.props.navigate(`/patient/${patientId}/note/edit/${noteId}`);
  };

  render() {
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

    if (!note) {
      return (
        <section className="section">
          <div className="container">
            <div className="notification is-danger is-light">
              <p>Note not found.</p>
            </div>
          </div>
        </section>
      );
    }

    return <NoteView note={note} onBack={this.handleBack} onEdit={this.handleEdit} />;
  }
}

const NoteDetails: React.FC = () => {
  const { patientId, noteId } = useParams<{ patientId: string; noteId: string }>();
  const navigate = useNavigate();

  return <NoteDetailsBase patientId={patientId} noteId={noteId} navigate={navigate} />;
};

export default NoteDetails;
