import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Last line of defence against blank white screens. If any page throws during
 * render, this boundary shows a branded, recoverable error card instead of
 * unmounting the whole app. A reload restarts the session cleanly.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected application error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface the failure in the console for debugging while keeping the UI usable.
    console.error('Kadalkavach page error:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 dark:bg-amber-500/10">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            This page hit an unexpected error
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            The rest of Kadalkavach is unaffected. Reloading usually clears this
            in a moment. If it keeps happening, the details below help our team.
          </p>
          {this.state.message && (
            <p className="mt-3 truncate rounded-md bg-slate-100 px-3 py-2 font-mono text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {this.state.message}
            </p>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-ocean-600 px-5 text-sm font-medium text-white transition-colors hover:bg-ocean-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
