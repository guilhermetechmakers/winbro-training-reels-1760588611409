import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Camera, Lightbulb, Target } from 'lucide-react';

export default function CaptureGuidelines() {
  const guidelines = [
    {
      icon: Clock,
      title: 'Duration',
      description: 'Keep clips between 20-30 seconds',
      details: 'Short, focused content is more effective for training'
    },
    {
      icon: Camera,
      title: 'Framing',
      description: 'Show the complete process',
      details: 'Include hands, tools, and work area in frame'
    },
    {
      icon: Lightbulb,
      title: 'Lighting',
      description: 'Ensure good visibility',
      details: 'Avoid backlighting and shadows on work area'
    },
    {
      icon: Target,
      title: 'Focus',
      description: 'One process per clip',
      details: 'Break complex procedures into single steps'
    }
  ];

  const bestPractices = [
    'Start with a brief overview of what you\'ll demonstrate',
    'Speak clearly and at a moderate pace',
    'Point out important details and safety considerations',
    'End with a summary of key points',
    'Use consistent terminology throughout'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Capture Guidelines
          </CardTitle>
          <CardDescription>
            Follow these best practices to create effective training content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {guidelines.map((guideline, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <guideline.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">{guideline.title}</h4>
                <p className="text-sm text-muted-foreground">{guideline.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{guideline.details}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {bestPractices.map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-primary mb-2">Ready to Upload?</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your video file or click to browse
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
