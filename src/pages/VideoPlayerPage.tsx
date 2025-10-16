import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack, 
  SkipForward,
  Download,
  Share2,
  Heart,
  Bookmark,
  Flag,
  ArrowLeft,
  Clock,
  Eye,
  Star,
  User,
  Calendar,
  Tag
} from 'lucide-react';

// Mock video data - in a real app, this would come from API
const mockVideo = {
  id: '1',
  title: 'CNC Mill Setup - Part 1',
  description: 'Complete guide to setting up the CNC mill for precision machining operations. This video covers all the essential steps from initial machine preparation to final calibration.',
  duration: 150, // in seconds
  views: 245,
  rating: 4.8,
  author: 'John Doe',
  createdAt: '2024-01-15',
  tags: ['CNC', 'Setup', 'Machining', 'Precision'],
  machineModel: 'Haas VF-2',
  process: 'Setup',
  tooling: ['End Mill', 'Vise', 'Workpiece'],
  isCustomerSpecific: false,
  videoUrl: '/api/placeholder/video.mp4', // In real app, this would be actual video URL
  thumbnail: '/api/placeholder/800/450',
  transcript: `Welcome to this CNC mill setup tutorial. Today we'll be covering the complete process of setting up a Haas VF-2 mill for precision machining operations.

First, let's ensure the machine is properly powered on and all safety systems are engaged. Check that the emergency stop is released and the machine is ready for operation.

Next, we'll load our workpiece into the vise. Make sure the vise is properly secured to the table and the workpiece is positioned correctly. Use appropriate clamping pressure to avoid distortion.

Now we'll install our cutting tool. For this operation, we're using a 1/2 inch end mill. Make sure the tool is properly seated in the collet and tightened to the correct torque specification.

The next step is to set our work coordinate system. We'll use the machine's probe to establish our X, Y, and Z zero points. This is critical for accurate machining.

Finally, we'll run our setup program to verify everything is working correctly before proceeding with the actual machining operation.`,
  chapters: [
    { time: 0, title: 'Introduction' },
    { time: 15, title: 'Safety Check' },
    { time: 30, title: 'Workpiece Setup' },
    { time: 60, title: 'Tool Installation' },
    { time: 90, title: 'Coordinate System' },
    { time: 120, title: 'Verification' },
    { time: 150, title: 'Conclusion' }
  ]
};

export default function VideoPlayerPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Mock video data - in real app, fetch by ID
  const video = mockVideo;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/library')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold line-clamp-1">{video.title}</h1>
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
                  <User className="h-3 w-3" />
                  {video.author}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={video.thumbnail}
                  preload="metadata"
                >
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="space-y-2">
                    <Progress value={progress} className="h-1" />
                    <div className="flex items-center justify-between text-white text-sm">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => skipTime(-10)}
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={togglePlay}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => skipTime(10)}
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={toggleMute}
                        >
                          {isMuted ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? (
                            <Minimize className="h-4 w-4" />
                          ) : (
                            <Maximize className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Video Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{video.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant={video.isCustomerSpecific ? 'default' : 'secondary'}>
                        {video.isCustomerSpecific ? 'Customer Specific' : 'General'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className={isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className={isBookmarked ? 'text-blue-500' : ''}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{video.description}</p>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transcript</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTranscript(!showTranscript)}
                  >
                    {showTranscript ? 'Hide' : 'Show'} Transcript
                  </Button>
                </div>
              </CardHeader>
              {showTranscript && (
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line text-muted-foreground">
                      {video.transcript}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Details */}
            <Card>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Machine Model</h4>
                  <p className="text-sm">{video.machineModel}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Process</h4>
                  <p className="text-sm">{video.process}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Tooling</h4>
                  <div className="flex flex-wrap gap-1">
                    {video.tooling.map((tool) => (
                      <Badge key={tool} variant="outline" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chapters */}
            <Card>
              <CardHeader>
                <CardTitle>Chapters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {video.chapters.map((chapter, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => handleSeek(chapter.time)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{chapter.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(chapter.time)}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Playback Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Playback Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Speed</h4>
                  <div className="flex gap-2">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <Button
                        key={rate}
                        variant={playbackRate === rate ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setPlaybackRate(rate);
                          if (videoRef.current) {
                            videoRef.current.playbackRate = rate;
                          }
                        }}
                      >
                        {rate}x
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Volume</h4>
                  <div className="flex items-center gap-2">
                    <VolumeX className="h-4 w-4" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <Volume2 className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
