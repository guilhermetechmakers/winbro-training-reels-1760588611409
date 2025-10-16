import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Download, 
  Trash2, 
  RefreshCw,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';
import ErrorLoggingService, { type ErrorMetrics } from '@/services/error-logging';

export default function ErrorDashboard() {
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMetrics = () => {
    setIsLoading(true);
    try {
      const errorMetrics = ErrorLoggingService.getErrorMetrics();
      setMetrics(errorMetrics);
    } catch (error) {
      console.error('Failed to load error metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all error logs?')) {
      ErrorLoggingService.clearAllLogs();
      loadMetrics();
    }
  };

  const handleExportLogs = () => {
    const logs = ErrorLoggingService.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load error metrics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Error Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage application errors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Errors */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Errors</p>
                <p className="text-3xl font-bold">{metrics.totalErrors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-3xl font-bold">{metrics.errorRate.toFixed(2)}/hr</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Average Retry Count */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Retries</p>
                <p className="text-3xl font-bold">{metrics.averageRetryCount.toFixed(1)}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Errors</p>
                <p className="text-3xl font-bold">{metrics.recentErrors.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Errors by Type</CardTitle>
            <CardDescription>Distribution of errors by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.errorsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Errors by Level</CardTitle>
            <CardDescription>Distribution of errors by severity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.errorsByLevel).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{level}</span>
                  <Badge 
                    variant={level === 'error' ? 'destructive' : level === 'warning' ? 'default' : 'secondary'}
                  >
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
          <CardDescription>Latest error occurrences</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.recentErrors.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent errors</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.recentErrors.map((error) => (
                <div key={error.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={error.level === 'error' ? 'destructive' : error.level === 'warning' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {error.level}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{error.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {error.timestamp.toLocaleString()}
                    </p>
                    {error.errorType && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {error.errorType}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
