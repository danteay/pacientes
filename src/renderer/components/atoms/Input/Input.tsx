import React from 'react';

/**
 * Input Atom
 *
 * Reusable input component
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  isFullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  isFullWidth = true,
  className = '',
  ...props
}) => {
  const inputClass = ['input', error ? 'is-danger' : '', className].filter(Boolean).join(' ');

  const controlClass = ['control', isFullWidth ? 'is-expanded' : ''].filter(Boolean).join(' ');

  return (
    <div className="field">
      {label && <label className="label">{label}</label>}
      <div className={controlClass}>
        <input className={inputClass} {...props} />
      </div>
      {error && <p className="help is-danger">{error}</p>}
      {!error && helpText && <p className="help">{helpText}</p>}
    </div>
  );
};
