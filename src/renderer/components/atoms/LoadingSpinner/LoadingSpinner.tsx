import React from 'react';
import { useTranslation } from 'react-i18next';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'normal' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, size = 'normal' }) => {
  const { t } = useTranslation();
  const displayMessage = message ?? t('common.loading');

  return (
    <div className="has-text-centered p-5">
      <div className={`loader is-${size}`}></div>
      {displayMessage && <p className="mt-3">{displayMessage}</p>}
    </div>
  );
};
