import { Component } from 'react';
import EmptyState from './EmptyState';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <EmptyState title="Something went wrong" message={this.state.error.message} />;
    }
    return this.props.children;
  }
}
