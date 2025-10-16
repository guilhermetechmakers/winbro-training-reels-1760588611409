import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ErrorDashboard from '@/components/error/ErrorDashboard';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function ErrorDashboardPage() {
  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Error Dashboard</h1>
                <p className="text-muted-foreground">
                  Monitor and manage application errors
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <ErrorDashboard />
        </div>
      </div>
    </ErrorBoundary>
  );
}
