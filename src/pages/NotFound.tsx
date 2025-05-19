import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col items-center justify-center text-center">
      <div className="mb-4 text-6xl font-bold text-gray-300">404</div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mb-6 text-gray-500">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} className="mr-2" />
        Back to Home
      </Link>
    </div>
  );
}