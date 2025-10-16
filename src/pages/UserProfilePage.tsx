import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  MapPin, 
  Calendar,
  Award,
  Video,
  BookOpen,
  BarChart3,
  Camera,
  Edit,
  Save,
  X,
  Star,
  Eye,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Curator',
    department: 'Manufacturing',
    location: 'Detroit, MI',
    joinDate: '2023-01-15',
    avatar: '/api/placeholder/avatar.jpg',
    bio: 'Experienced manufacturing professional with expertise in CNC operations and training. Passionate about creating effective learning content for the modern workforce.',
    stats: {
      videosCreated: 24,
      coursesBuilt: 8,
      totalViews: 1234,
      completionRate: 87,
      rating: 4.8,
      followers: 156,
      following: 89
    },
    recentVideos: [
      { id: '1', title: 'CNC Mill Setup - Part 1', views: 245, rating: 4.8, createdAt: '2024-01-15' },
      { id: '2', title: 'Safety Procedures Overview', views: 189, rating: 4.9, createdAt: '2024-01-14' },
      { id: '3', title: 'Tool Change Process', views: 156, rating: 4.7, createdAt: '2024-01-13' },
    ],
    achievements: [
      { name: 'First Video', description: 'Created your first training video', icon: Video, earned: true },
      { name: 'Course Creator', description: 'Built your first course', icon: BookOpen, earned: true },
      { name: 'Top Performer', description: 'Video with 100+ views', icon: TrendingUp, earned: true },
      { name: 'Quality Expert', description: 'Average rating above 4.5', icon: Star, earned: true },
      { name: 'Content Master', description: 'Created 20+ videos', icon: Award, earned: false },
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'content', label: 'My Content', icon: Video },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'activity', label: 'Activity', icon: BarChart3 },
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground">
                Manage your profile and view your content
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors ${
                        activeTab === tab.id ? 'bg-primary text-primary-foreground' : ''
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-12 w-12 text-primary" />
                        </div>
                        {isEditing && (
                          <Button
                            size="sm"
                            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-muted-foreground">{user.role} • {user.department}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {user.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-4 sm:mt-0">
                            <Badge variant="default">{user.role}</Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground mt-4">
                          {user.bio}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{user.stats.videosCreated}</div>
                      <div className="text-sm text-muted-foreground">Videos Created</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{user.stats.coursesBuilt}</div>
                      <div className="text-sm text-muted-foreground">Courses Built</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{user.stats.totalViews.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Views</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{user.stats.rating}</div>
                      <div className="text-sm text-muted-foreground">Average Rating</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          defaultValue={user.name}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          defaultValue={user.email}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input 
                          id="department" 
                          defaultValue={user.department}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          defaultValue={user.location}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        defaultValue={user.bio}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Videos</CardTitle>
                    <CardDescription>
                      Videos you've created and uploaded
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.recentVideos.map((video) => (
                        <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Video className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="font-medium">{video.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>
                      Track your progress and unlock new achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.achievements.map((achievement, index) => (
                        <div 
                          key={index}
                          className={`p-4 border rounded-lg ${
                            achievement.earned ? 'border-green-200 bg-green-50' : 'border-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              achievement.earned ? 'bg-green-100' : 'bg-muted'
                            }`}>
                              <achievement.icon className={`h-5 w-5 ${
                                achievement.earned ? 'text-green-600' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div>
                              <h3 className={`font-medium ${
                                achievement.earned ? 'text-green-900' : 'text-muted-foreground'
                              }`}>
                                {achievement.name}
                              </h3>
                              <p className={`text-sm ${
                                achievement.earned ? 'text-green-700' : 'text-muted-foreground'
                              }`}>
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent actions and content updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <div>
                          <p className="text-sm">Published "CNC Mill Setup - Part 1"</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div>
                          <p className="text-sm">Created new course "Advanced Techniques"</p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                        <div>
                          <p className="text-sm">Updated "Safety Procedures" video</p>
                          <p className="text-xs text-muted-foreground">3 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                        <div>
                          <p className="text-sm">Completed "Quality Control" course</p>
                          <p className="text-xs text-muted-foreground">1 week ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Content Completion Rate</span>
                        <span>{user.stats.completionRate}%</span>
                      </div>
                      <Progress value={user.stats.completionRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Rating</span>
                        <span>{user.stats.rating}/5.0</span>
                      </div>
                      <Progress value={(user.stats.rating / 5) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
