import { Component, type ErrorInfo, type ReactNode } from "react";

interface PublicRouteErrorBoundaryProps {
  children: ReactNode;
}

interface PublicRouteErrorBoundaryState {
  hasError: boolean;
}

class PublicRouteErrorBoundary extends Component<
  PublicRouteErrorBoundaryProps,
  PublicRouteErrorBoundaryState
> {
  state: PublicRouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PublicRouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Public profile render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-center p-8">
          <div className="space-y-3 max-w-md">
            <h1 className="text-2xl font-black text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              We could not render this public page. Please refresh or try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PublicRouteErrorBoundary;
