import React from 'react';

/**
 * Loading Spinner Atom
 *
 * Simple loading indicator
 */

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'normal' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'normal',
}) => {
  return (
    <div className="has-text-centered p-5">
      <div className={`loader is-${size}`}></div>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
};
