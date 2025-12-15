import React from 'react';

/**
 * Button Atom
 *
 * Reusable button component following Bulma CSS conventions
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light';
  size?: 'small' | 'normal' | 'medium' | 'large';
  isLoading?: boolean;
  isFullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'normal',
  isLoading = false,
  isFullWidth = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}) => {
  const variantClass = `is-${variant}`;
  const sizeClass = size !== 'normal' ? `is-${size}` : '';
  const loadingClass = isLoading ? 'is-loading' : '';
  const fullWidthClass = isFullWidth ? 'is-fullwidth' : '';

  const classes = ['button', variantClass, sizeClass, loadingClass, fullWidthClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || isLoading} {...props}>
      {children}
    </button>
  );
};
