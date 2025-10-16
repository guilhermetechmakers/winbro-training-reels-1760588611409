import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  Download, 
  Upload,
  Trash2,
  Save,
  Camera,
  Globe,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: false,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'data', label: 'Data & Storage', icon: Download },
  ];

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handleExportData = () => {
    toast.info('Data export started. You will receive an email when ready.');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires confirmation. Please contact support.');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
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
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and profile picture
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <Button
                          size="sm"
                          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-semibold">John Doe</h3>
                        <p className="text-sm text-muted-foreground">Curator</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Upload className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="john.doe@company.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" defaultValue="+1 (555) 123-4567" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          placeholder="Tell us about yourself..."
                          defaultValue="Experienced manufacturing professional with expertise in CNC operations and training."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" defaultValue="Detroit, MI" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" defaultValue="Manufacturing" />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Account Type</p>
                        <p className="text-sm text-muted-foreground">Curator</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to be notified about updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, email: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications in your browser
                          </p>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, push: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via SMS
                          </p>
                        </div>
                        <Switch
                          checked={notifications.sms}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, sms: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing Emails</p>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about new features and tips
                          </p>
                        </div>
                        <Switch
                          checked={notifications.marketing}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, marketing: checked }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>
                      Manage your privacy settings and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Profile Visibility</p>
                          <p className="text-sm text-muted-foreground">
                            Make your profile visible to other users
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Activity Status</p>
                          <p className="text-sm text-muted-foreground">
                            Show when you're online
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Data Analytics</p>
                          <p className="text-sm text-muted-foreground">
                            Allow usage data to improve the platform
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Password & Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full">
                      Enable Two-Factor Authentication
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-3">Theme</p>
                        <div className="flex gap-2">
                          <Button
                            variant={!isDarkMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsDarkMode(false)}
                          >
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </Button>
                          <Button
                            variant={isDarkMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsDarkMode(true)}
                          >
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </Button>
                          <Button variant="outline" size="sm">
                            <Monitor className="h-4 w-4 mr-2" />
                            System
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Language & Region</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input id="language" defaultValue="English (US)" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" defaultValue="Eastern Time (ET)" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>
                      Download your data or manage your storage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Export All Data</p>
                        <p className="text-sm text-muted-foreground">
                          Download all your videos, courses, and account data
                        </p>
                      </div>
                      <Button variant="outline" onClick={handleExportData}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Storage Usage</p>
                        <p className="text-sm text-muted-foreground">
                          2.3 GB of 10 GB used
                        </p>
                      </div>
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '23%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible actions that affect your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium text-red-600">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
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
