import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ImportProgressModal from '../ImportProgressModal/ImportProgressModal';
import './styles.scss';

interface ImportProgress {
  stage: 'reading' | 'parsing' | 'importing_patients' | 'importing_notes' | 'complete';
  current: number;
  total: number;
  message: string;
}

interface NavbarState {
  isMenuActive: boolean;
  isActionsDropdownActive: boolean;
  isImportModalActive: boolean;
  importProgress: ImportProgress | null;
}

class Navbar extends Component<{}, NavbarState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isMenuActive: false,
      isActionsDropdownActive: false,
      isImportModalActive: false,
      importProgress: null,
    };
  }

  componentDidMount() {
    window.api.backup.onImportProgress((progress: unknown) => {
      this.setState({ importProgress: progress as ImportProgress });
    });
  }

  componentWillUnmount() {
    window.api.backup.removeImportProgressListener();
  }

  toggleMenu = () => {
    this.setState((prevState) => ({
      isMenuActive: !prevState.isMenuActive,
    }));
  };

  closeMenu = () => {
    this.setState({ isMenuActive: false, isActionsDropdownActive: false });
  };

  toggleActionsDropdown = () => {
    this.setState((prevState) => ({
      isActionsDropdownActive: !prevState.isActionsDropdownActive,
    }));
  };

  handleImport = async () => {
    this.setState({
      isActionsDropdownActive: false,
      isImportModalActive: true,
      importProgress: null,
    });

    try {
      const result = await window.api.backup.import();

      // Debug logging
      console.log('[DEBUG] Navbar: Import result received:', result);

      if (result.success) {
        console.log('Import successful:', result.data);
        // Keep modal open to show completion
        // Optionally show success message with stats
        if (result.data) {
          const { patients, notes, emergencyContacts } = result.data;
          console.log(
            `Imported ${patients} patients, ${notes} notes, ${emergencyContacts} emergency contacts`
          );
        }
      } else {
        console.error('Import failed:', result.error);
        alert(`Import failed: ${result.error || 'Unknown error'}`);
        this.setState({ isImportModalActive: false });
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.setState({ isImportModalActive: false });
    }
  };

  handleExport = async () => {
    this.setState({ isActionsDropdownActive: false });

    try {
      const result = await window.api.backup.export();

      if (result.success) {
        console.log('Export successful');
        alert('Database exported successfully!');
      } else {
        console.error('Export failed:', result.error);
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  closeImportModal = () => {
    const { importProgress } = this.state;

    // If import completed successfully, reload the page
    if (importProgress?.stage === 'complete') {
      window.location.reload();
    }

    this.setState({ isImportModalActive: false, importProgress: null });
  };

  render() {
    const { isMenuActive, isActionsDropdownActive, isImportModalActive, importProgress } =
      this.state;

    return (
      <>
        <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <Link to="/" className="navbar-item" onClick={this.closeMenu}>
              <strong>Pacientes</strong>
            </Link>

            <a
              role="button"
              className={`navbar-burger ${isMenuActive ? 'is-active' : ''}`}
              aria-label="menu"
              aria-expanded={isMenuActive}
              onClick={this.toggleMenu}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>

          <div className={`navbar-menu ${isMenuActive ? 'is-active' : ''}`}>
            <div className="navbar-end">
              <div
                className={`navbar-item has-dropdown ${isActionsDropdownActive ? 'is-active' : ''}`}
              >
                <a className="navbar-link" onClick={this.toggleActionsDropdown}>
                  Actions
                </a>

                <div className="navbar-dropdown is-right">
                  <a className="navbar-item" onClick={this.handleImport}>
                    Importar
                  </a>
                  <a className="navbar-item" onClick={this.handleExport}>
                    Exportar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <ImportProgressModal
          isActive={isImportModalActive}
          progress={importProgress}
          onClose={this.closeImportModal}
        />
      </>
    );
  }
}

export default Navbar;
