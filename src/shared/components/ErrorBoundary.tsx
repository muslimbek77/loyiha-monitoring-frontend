import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell flex min-h-screen items-center justify-center p-6">
          <div className="page-surface max-w-xl p-8 text-center">
            <p className="page-kicker mb-3">Application Error</p>
            <h2 className="mb-3 text-2xl font-semibold text-slate-900">
              Kutilmagan xatolik yuz berdi
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-slate-500">
              Sahifani qayta yuklash orqali ishni davom ettirishingiz mumkin. Agar muammo takrorlansa, API javoblarini tekshiring.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Sahifani qayta yuklash
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
