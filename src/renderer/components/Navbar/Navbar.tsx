import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImportProgressModal from '../ImportProgressModal/ImportProgressModal';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n';
import './styles.scss';

interface ImportProgress {
  stage: 'reading' | 'parsing' | 'importing_patients' | 'importing_notes' | 'complete';
  current: number;
  total: number;
  message: string;
}

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isActionsDropdownActive, setIsActionsDropdownActive] = useState(false);
  const [isLanguageDropdownActive, setIsLanguageDropdownActive] = useState(false);
  const [isImportModalActive, setIsImportModalActive] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);

  useEffect(() => {
    window.api.backup.onImportProgress((progress: unknown) => {
      setImportProgress(progress as ImportProgress);
    });

    return () => {
      window.api.backup.removeImportProgressListener();
    };
  }, []);

  const toggleMenu = () => setIsMenuActive((prev) => !prev);

  const closeMenu = () => {
    setIsMenuActive(false);
    setIsActionsDropdownActive(false);
    setIsLanguageDropdownActive(false);
  };

  const toggleActionsDropdown = () => setIsActionsDropdownActive((prev) => !prev);

  const toggleLanguageDropdown = () => setIsLanguageDropdownActive((prev) => !prev);

  const handleLanguageChange = (language: SupportedLanguage) => {
    i18n.changeLanguage(language);
    setIsLanguageDropdownActive(false);
  };

  const handleImport = async () => {
    setIsActionsDropdownActive(false);
    setIsImportModalActive(true);
    setImportProgress(null);

    try {
      const result = await window.api.backup.import();

      if (result.success) {
        if (result.data) {
          const { patients, notes, emergencyContacts } = result.data;
          console.log(
            `Imported ${patients} patients, ${notes} notes, ${emergencyContacts} emergency contacts`
          );
        }
      } else {
        const errorMsg = result.error || t('errors.unknownError');
        alert(t('import.importFailed', { error: errorMsg }));
        setIsImportModalActive(false);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('errors.unknownError');
      alert(t('import.importError', { error: errorMsg }));
      setIsImportModalActive(false);
    }
  };

  const handleExport = async () => {
    setIsActionsDropdownActive(false);

    try {
      const result = await window.api.backup.export();

      if (result.success) {
        alert(t('import.exportSuccess'));
      } else {
        alert(t('import.exportFailed', { error: result.error || '' }));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('errors.unknownError');
      alert(t('import.exportError', { error: errorMsg }));
    }
  };

  const closeImportModal = () => {
    if (importProgress?.stage === 'complete') {
      window.location.reload();
    }

    setIsImportModalActive(false);
    setImportProgress(null);
  };

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'es').split('-')[0];

  return (
    <>
      <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item" onClick={closeMenu}>
            <strong>{t('navbar.brand')}</strong>
          </Link>

          <a
            role="button"
            className={`navbar-burger ${isMenuActive ? 'is-active' : ''}`}
            aria-label="menu"
            aria-expanded={isMenuActive}
            onClick={toggleMenu}
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
              className={`navbar-item has-dropdown ${isLanguageDropdownActive ? 'is-active' : ''}`}
            >
              <a className="navbar-link" onClick={toggleLanguageDropdown}>
                {t('common.language')}: {t(`languages.${currentLanguage}`)}
              </a>

              <div className="navbar-dropdown is-right">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <a
                    key={lang}
                    className={`navbar-item ${currentLanguage === lang ? 'is-active' : ''}`}
                    onClick={() => handleLanguageChange(lang)}
                  >
                    {t(`languages.${lang}`)}
                  </a>
                ))}
              </div>
            </div>

            <div
              className={`navbar-item has-dropdown ${isActionsDropdownActive ? 'is-active' : ''}`}
            >
              <a className="navbar-link" onClick={toggleActionsDropdown}>
                {t('navbar.actions')}
              </a>

              <div className="navbar-dropdown is-right">
                <a className="navbar-item" onClick={handleImport}>
                  {t('navbar.import')}
                </a>
                <a className="navbar-item" onClick={handleExport}>
                  {t('navbar.export')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <ImportProgressModal
        isActive={isImportModalActive}
        progress={importProgress}
        onClose={closeImportModal}
      />
    </>
  );
};

export default Navbar;
