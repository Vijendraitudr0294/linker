import { Component, type ErrorInfo, type ReactNode } from "react";

interface DashboardRouteErrorBoundaryProps {
  children: ReactNode;
}

interface DashboardRouteErrorBoundaryState {
  hasError: boolean;
}

class DashboardRouteErrorBoundary extends Component<
  DashboardRouteErrorBoundaryProps,
  DashboardRouteErrorBoundaryState
> {
  state: DashboardRouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): DashboardRouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dashboard render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-center p-8">
          <div className="space-y-3 max-w-md">
            <h1 className="text-2xl font-black text-foreground">Dashboard could not load</h1>
            <p className="text-sm text-muted-foreground">
              Please refresh. If the issue continues, reopen the dashboard from the sidebar.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardRouteErrorBoundary;
