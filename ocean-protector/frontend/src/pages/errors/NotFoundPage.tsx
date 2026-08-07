import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/EmptyState';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg">
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="This page does not exist or has moved. Head back to the Kadalkavach home to keep exploring."
          action={
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                Go to home
              </Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
