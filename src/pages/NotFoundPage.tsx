import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  ArrowLeft, 
  AlertTriangle,
  Video,
  BookOpen,
  BarChart3,
  Settings
} from 'lucide-react';

export default function NotFoundPage() {
  const quickLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Go back to your dashboard' },
    { name: 'Content Library', href: '/dashboard/library', icon: Video, description: 'Browse training videos' },
    { name: 'Course Builder', href: '/dashboard/course-builder', icon: BookOpen, description: 'Create new courses' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'View performance metrics' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, description: 'Manage your account' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-primary/20 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle className="h-16 w-16 text-primary animate-bounce" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg">
            <Link to="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <Card className="text-left">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="group p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <link.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        {link.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            If you believe this is an error, please{' '}
            <Link to="/contact" className="text-primary hover:underline">
              contact support
            </Link>
            {' '}or try searching for what you need.
          </p>
        </div>
      </div>
    </div>
  );
}
