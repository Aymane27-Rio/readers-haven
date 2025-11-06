import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Optionally send to logging service
    // console.error('ErrorBoundary', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="wrap" style={{ padding: '1rem' }}>
          <div className="vintage-card">
            <h2 className="brand-title" style={{ marginBottom: '.35rem' }}>Something went wrong</h2>
            <p className="tagline">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
