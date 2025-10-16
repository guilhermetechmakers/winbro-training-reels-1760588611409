import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Video, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from API
  const stats = [
    { name: 'Total Videos', value: '24', change: '+12%', changeType: 'positive' },
    { name: 'Active Courses', value: '8', change: '+2', changeType: 'positive' },
    { name: 'Total Views', value: '1,234', change: '+18%', changeType: 'positive' },
    { name: 'Completion Rate', value: '87%', change: '+5%', changeType: 'positive' },
  ];

  const recentVideos = [
    { id: '1', title: 'CNC Mill Setup - Part 1', status: 'published', views: 45, duration: '2:30' },
    { id: '2', title: 'Safety Procedures Overview', status: 'published', views: 23, duration: '1:45' },
    { id: '3', title: 'Tool Change Process', status: 'processing', views: 0, duration: '3:15' },
  ];

  const quickActions = [
    {
      title: 'Upload New Video',
      description: 'Create a new training video',
      icon: Upload,
      href: '/dashboard/upload',
      color: 'bg-primary text-primary-foreground hover:bg-primary/90'
    },
    {
      title: 'Browse Library',
      description: 'View all training content',
      icon: Video,
      href: '/dashboard/library',
      color: 'bg-blue-500 text-white hover:bg-blue-600'
    },
    {
      title: 'Create Course',
      description: 'Build a structured course',
      icon: BookOpen,
      href: '/dashboard/course-builder',
      color: 'bg-green-500 text-white hover:bg-green-600'
    },
    {
      title: 'View Analytics',
      description: 'Track performance metrics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-purple-500 text-white hover:bg-purple-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your training content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="ghost"
                className={`h-auto p-4 flex flex-col items-start ${action.color}`}
                onClick={() => navigate(action.href)}
              >
                <action.icon className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Videos */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
            <CardDescription>
              Your latest training content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVideos.map((video) => (
                <div key={video.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        {video.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {video.views} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {video.status === 'published' ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Processing
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/library')}>
                View All Videos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates from your training content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
              <div>
                <p className="text-sm">Video "CNC Mill Setup - Part 1" was published</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <p className="text-sm">New course "Advanced Machining Techniques" created</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2" />
              <div>
                <p className="text-sm">Video "Safety Procedures Overview" needs review</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
