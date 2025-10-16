import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Play, 
  Clock, 
  Star,
  Download,
  Eye,
  Filter,
  Download as DownloadIcon,
  CheckCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

// Mock data for charts
const viewData = [
  { name: 'Jan', views: 400, completions: 240 },
  { name: 'Feb', views: 300, completions: 139 },
  { name: 'Mar', views: 200, completions: 980 },
  { name: 'Apr', views: 278, completions: 390 },
  { name: 'May', views: 189, completions: 480 },
  { name: 'Jun', views: 239, completions: 380 },
  { name: 'Jul', views: 349, completions: 430 },
];

const topVideos = [
  { name: 'CNC Mill Setup - Part 1', views: 245, completion: 87 },
  { name: 'Safety Procedures Overview', views: 189, completion: 92 },
  { name: 'Tool Change Process', views: 156, completion: 78 },
  { name: 'Quality Control Check', views: 134, completion: 85 },
  { name: 'Emergency Stop Procedures', views: 98, completion: 95 },
];

const categoryData = [
  { name: 'Setup', value: 35, color: '#6B7AFF' },
  { name: 'Safety', value: 25, color: '#10B981' },
  { name: 'Maintenance', value: 20, color: '#F59E0B' },
  { name: 'Quality Control', value: 15, color: '#EF4444' },
  { name: 'Other', value: 5, color: '#6B7280' },
];

const userEngagement = [
  { name: 'Week 1', activeUsers: 45, newUsers: 12 },
  { name: 'Week 2', activeUsers: 52, newUsers: 8 },
  { name: 'Week 3', activeUsers: 48, newUsers: 15 },
  { name: 'Week 4', activeUsers: 61, newUsers: 18 },
];

export default function AnalyticsPage() {
  const metrics = [
    {
      title: 'Total Views',
      value: '12,345',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Eye,
      description: 'vs last month'
    },
    {
      title: 'Completion Rate',
      value: '87%',
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: 'vs last month'
    },
    {
      title: 'Active Users',
      value: '234',
      change: '+18.3%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'this month'
    },
    {
      title: 'Avg. Watch Time',
      value: '2:34',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: Clock,
      description: 'vs last month'
    },
    {
      title: 'Content Rating',
      value: '4.8',
      change: '+0.3',
      changeType: 'positive' as const,
      icon: Star,
      description: 'out of 5.0'
    },
    {
      title: 'Downloads',
      value: '1,456',
      change: '+8.7%',
      changeType: 'positive' as const,
      icon: Download,
      description: 'offline content'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground">
                Track performance and engagement metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.title} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <metric.icon className="h-8 w-8 text-primary mb-2" />
                    <div className="flex items-center">
                      {metric.changeType === 'positive' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Views & Completions</CardTitle>
              <CardDescription>Monthly view and completion trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={viewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1" 
                    stroke="#6B7AFF" 
                    fill="#6B7AFF" 
                    fillOpacity={0.6}
                    name="Views"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completions" 
                    stackId="2" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Completions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Content Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Content Distribution</CardTitle>
              <CardDescription>Videos by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Videos */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Videos</CardTitle>
              <CardDescription>Most viewed content this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topVideos} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#6B7AFF" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Weekly active and new users</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#6B7AFF" 
                    strokeWidth={2}
                    name="Active Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="newUsers" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="New Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Videos Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Videos</CardTitle>
              <CardDescription>Most popular content by views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVideos.map((video, index) => (
                  <div key={video.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{video.name}</p>
                        <p className="text-sm text-muted-foreground">{video.completion}% completion</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{video.views}</p>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm">"CNC Mill Setup - Part 1" completed by 5 users</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm">New video "Advanced Techniques" uploaded</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm">"Safety Procedures" rated 4.9/5.0</p>
                    <p className="text-xs text-muted-foreground">6 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm">12 users downloaded offline content</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm">New course "Quality Control" published</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
