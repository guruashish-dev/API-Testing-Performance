import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unexpected UI error" };
  }

  componentDidCatch(error) {
    console.error("UI crash caught by ErrorBoundary:", error);
  }

  onReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6 text-text">
          <div className="w-full max-w-xl rounded-2xl border border-danger/30 bg-panelSoft/90 p-6 shadow-soft">
            <p className="text-xs uppercase tracking-wide text-danger">Application Error</p>
            <h1 className="mt-2 text-2xl font-semibold">Dashboard rendering failed</h1>
            <p className="mt-3 text-sm text-textMuted">{this.state.message}</p>
            <button
              type="button"
              onClick={this.onReload}
              className="mt-5 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent hover:bg-accent/20"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
