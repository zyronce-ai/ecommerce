'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[Vendor Error]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-lg font-bold text-destructive">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mt-1">{this.state.error?.message}</p>
          <Button className="mt-4" onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}>
            Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
