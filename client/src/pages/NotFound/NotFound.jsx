import { Link } from 'react-router-dom';
import EmptyState from '../../components/shared/EmptyState';

export default function NotFound() {
  return (
    <main style={{ padding: '32px' }}>
      <EmptyState title="Page not found" message="This PulsePoint view does not exist." />
      <p style={{ marginTop: 16 }}>
        <Link to="/">Return to datasets</Link>
      </p>
    </main>
  );
}
