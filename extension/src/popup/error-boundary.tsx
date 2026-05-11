import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class PopupErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[VintedFlow popup crash]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="popup-shell">
          <section className="hero-card">
            <div className="brand-row">
              <div className="brand-mark">VF</div>
              <div>
                <p className="eyebrow">VintedFlow</p>
                <h1>Tryb awaryjny popupu</h1>
              </div>
            </div>
            <div className="status-pill">Crash recovery</div>
          </section>
          <section className="panel error">
            Popup nie mógł wyrenderować pełnego interfejsu, ale rozszerzenie nie pokazuje pustego ekranu.
            <br />
            {this.state.error.message}
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
