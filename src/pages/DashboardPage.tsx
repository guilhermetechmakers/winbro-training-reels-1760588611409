import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Video, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Play,
  Eye,
  Star,
  Calendar,
  ArrowRight,
  Zap,
  Award,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from API
  const stats = [
    { 
      name: 'Total Videos', 
      value: '24', 
      change: '+12%', 
      changeType: 'positive',
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Training videos created'
    },
    { 
      name: 'Active Courses', 
      value: '8', 
      change: '+2', 
      changeType: 'positive',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Structured learning paths'
    },
    { 
      name: 'Total Views', 
      value: '1,234', 
      change: '+18%', 
      changeType: 'positive',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Content engagement'
    },
    { 
      name: 'Completion Rate', 
      value: '87%', 
      change: '+5%', 
      changeType: 'positive',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Learning success rate'
    },
  ];

  const recentVideos = [
    { 
      id: '1', 
      title: 'CNC Mill Setup - Part 1', 
      status: 'published', 
      views: 45, 
      duration: '2:30',
      rating: 4.8,
      thumbnail: '/api/placeholder/300/200',
      createdAt: '2024-01-15',
      tags: ['CNC', 'Setup']
    },
    { 
      id: '2', 
      title: 'Safety Procedures Overview', 
      status: 'published', 
      views: 23, 
      duration: '1:45',
      rating: 4.9,
      thumbnail: '/api/placeholder/300/200',
      createdAt: '2024-01-14',
      tags: ['Safety', 'Protocols']
    },
    { 
      id: '3', 
      title: 'Tool Change Process', 
      status: 'processing', 
      views: 0, 
      duration: '3:15',
      rating: 0,
      thumbnail: '/api/placeholder/300/200',
      createdAt: '2024-01-13',
      tags: ['Tool Change', 'Maintenance']
    },
  ];

  const quickActions = [
    {
      title: 'Upload New Video',
      description: 'Create a new training video',
      icon: Upload,
      href: '/dashboard/upload',
      color: 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70',
      gradient: true
    },
    {
      title: 'Browse Library',
      description: 'View all training content',
      icon: Video,
      href: '/dashboard/library',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700',
      gradient: true
    },
    {
      title: 'Create Course',
      description: 'Build a structured course',
      icon: BookOpen,
      href: '/dashboard/course-builder',
      color: 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700',
      gradient: true
    },
    {
      title: 'View Analytics',
      description: 'Track performance metrics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700',
      gradient: true
    },
  ];

  const achievements = [
    { name: 'First Video', description: 'Created your first training video', icon: Video, earned: true },
    { name: 'Course Creator', description: 'Built your first course', icon: BookOpen, earned: true },
    { name: 'Top Performer', description: 'Video with 100+ views', icon: TrendingUp, earned: true },
    { name: 'Quality Expert', description: 'Average rating above 4.5', icon: Star, earned: true },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.name} className="group card-hover animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.name}</p>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={action.title}
                variant="ghost"
                className={`h-auto p-6 flex flex-col items-start group hover:scale-105 transition-all duration-200 ${action.color}`}
                onClick={() => navigate(action.href)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <action.icon className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-left">
                  <div className="font-semibold text-lg mb-1">{action.title}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto mt-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Achievements
            </CardTitle>
            <CardDescription>
              Your recent accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={achievement.name}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <achievement.icon className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Videos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
            <CardDescription>
              Your latest training content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVideos.map((video, index) => (
                <div 
                  key={video.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative w-16 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">{video.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {video.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {video.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
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
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/library')}>
                View All Videos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest updates from your training content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2 animate-pulse" />
              <div>
                <p className="text-sm font-medium">Video "CNC Mill Setup - Part 1" was published</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-medium">New course "Advanced Machining Techniques" created</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-medium">Video "Safety Procedures Overview" needs review</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-2 w-2 bg-purple-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-medium">Achievement unlocked: "Quality Expert"</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
