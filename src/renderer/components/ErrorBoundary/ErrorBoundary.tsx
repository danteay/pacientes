import React, { Component, ErrorInfo, ReactNode } from 'react';
import i18n from '../../i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="section">
          <div className="container">
            <div className="notification is-danger">
              <h2 className="title is-4">{i18n.t('errors.somethingWrong')}</h2>
              <p className="mb-4">
                {this.state.error?.message || i18n.t('errors.unexpectedError')}
              </p>
              <button className="button is-primary" onClick={this.handleReset}>
                {i18n.t('common.tryAgain')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
