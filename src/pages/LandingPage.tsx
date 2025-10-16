import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Users, 
  Shield, 
  Zap, 
  Search, 
  Download, 
  Award,
  ArrowRight,
  Star
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Winbro Training Reels</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-secondary/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent/30 rounded-full animate-pulse"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-4 animate-fade-in-up">
            🎯 Micro-Learning Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Master Machine Operations
            <br />
            in 20-30 Seconds
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            Capture, index, and deliver task-focused micro-videos for machine operation, 
            tooling, maintenance, and troubleshooting. Built for the modern workforce.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6 btn-primary group">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 group hover:bg-primary hover:text-primary-foreground transition-all duration-200">
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 animate-fade-in-up">Why Choose Winbro Training Reels?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Everything you need to create, manage, and deliver effective micro-learning content
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Quick Capture',
                description: 'Record 20-30 second clips directly from your device with guided capture workflows',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50'
              },
              {
                icon: Search,
                title: 'Smart Search',
                description: 'AI-powered search across transcripts, tags, and metadata for instant content discovery',
                color: 'text-green-600',
                bgColor: 'bg-green-50'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Curator workflows, approval processes, and role-based access for enterprise teams',
                color: 'text-purple-600',
                bgColor: 'bg-purple-50'
              },
              {
                icon: Award,
                title: 'Course Builder',
                description: 'Create structured courses with quizzes, certificates, and progress tracking',
                color: 'text-orange-600',
                bgColor: 'bg-orange-50'
              },
              {
                icon: Download,
                title: 'Offline Access',
                description: 'Download content for offline playback in challenging environments',
                color: 'text-red-600',
                bgColor: 'bg-red-50'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'SSO integration, data encryption, and customer-specific content libraries',
                color: 'text-indigo-600',
                bgColor: 'bg-indigo-50'
              }
            ].map((feature, index) => (
              <Card 
                key={feature.title} 
                className="card-hover group animate-fade-in-up" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                  <CardDescription className="group-hover:text-foreground/80 transition-colors">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Capture & Upload</h3>
              <p className="text-muted-foreground">
                Record micro-videos or upload existing content with our guided workflow
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Processing</h3>
              <p className="text-muted-foreground">
                Automatic transcription, tagging, and metadata extraction for easy discovery
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Share & Learn</h3>
              <p className="text-muted-foreground">
                Distribute content to your team and track learning progress with analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-muted-foreground">
              See what our customers are saying
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Winbro Training Reels has revolutionized how we onboard new operators. 
                  The micro-learning approach is perfect for our manufacturing environment."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary">JD</span>
                  </div>
                  <div>
                    <p className="font-semibold">John Doe</p>
                    <p className="text-sm text-muted-foreground">Operations Manager, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The AI-powered search and tagging makes finding the right training content 
                  incredibly fast. Our team adoption rate was 95% in the first month."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Miller</p>
                    <p className="text-sm text-muted-foreground">Training Director, AutoParts Inc</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The offline capabilities are game-changing for our shop floor. 
                  Operators can access training content even without internet connectivity."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold">Mike Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Plant Manager, Industrial Solutions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Training?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using Winbro Training Reels to improve 
            their workforce training and operational efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Winbro Training Reels</span>
              </div>
              <p className="text-muted-foreground">
                Empowering the modern workforce with micro-learning technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-primary">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary">About</Link></li>
                <li><Link to="/careers" className="hover:text-primary">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/help" className="hover:text-primary">Help Center</Link></li>
                <li><Link to="/docs" className="hover:text-primary">Documentation</Link></li>
                <li><Link to="/status" className="hover:text-primary">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Winbro Training Reels. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
