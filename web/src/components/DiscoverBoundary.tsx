import { Component } from 'react';
import type { ReactNode } from 'react';
import { Button } from './Button';
export class DiscoverBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return <section className="card deck-empty" role="alert">
        <p>Could not load meals. Your plan still works.</p>
        <Button onClick={() => this.setState({ failed: false })}>Retry</Button>
      </section>;
    }
    return this.props.children;
  }
}
