import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  CheckCircle, 
  ArrowLeft,
  ArrowRight,
  Download
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { useCoursePlayer } from '@/hooks/use-course-player';

export default function CoursePlayerPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const {
    courseData,
    isLoading,
    error,
    updateProgress,
    generateCertificate,
    isUpdatingProgress,
  } = useCoursePlayer({ courseId: courseId! });

  // Get current lesson
  const currentLesson = courseData?.currentLesson;
  const allLessons = courseData?.course?.modules?.flatMap(m => m.lessons) || [];
  const progress = courseData?.progress || { completedLessons: 0, totalLessons: 0, percentage: 0 };

  // Handle lesson completion
  const handleLessonComplete = async () => {
    if (!courseData?.enrollment?.id || !currentLesson) return;

    try {
      await updateProgress({
        enrollmentId: courseData.enrollment.id,
        data: { lesson_id: currentLesson.id, completed: true }
      });
      toast.success('Lesson completed!');
    } catch (error) {
      toast.error('Failed to mark lesson as complete');
      console.error('Error updating progress:', error);
    }
  };


  // Handle course completion
  const handleCourseComplete = async () => {
    if (!courseData?.enrollment?.id) return;

    try {
      await generateCertificate(courseData.enrollment.id);
      setShowCertificate(true);
      toast.success('Congratulations! Course completed!');
    } catch (error) {
      toast.error('Failed to generate certificate');
      console.error('Error generating certificate:', error);
    }
  };

  // Navigation functions
  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      // Course completed
      handleCourseComplete();
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  // Video player controls
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              {error?.message || 'Course not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6 bg-slate-600" />
            <div>
              <h1 className="text-xl font-semibold text-white">
                {courseData.course.title}
              </h1>
              <p className="text-sm text-slate-300">
                Lesson {currentLessonIndex + 1} of {allLessons.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-slate-300">Progress</div>
              <div className="text-lg font-semibold text-white">
                {progress.percentage}%
              </div>
            </div>
            <Progress value={progress.percentage} className="w-32" />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 bg-black relative">
          {currentLesson ? (
            <div className="h-full flex flex-col">
              {/* Video Player */}
              <div className="flex-1 relative bg-black">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🎥</div>
                    <h3 className="text-2xl font-semibold mb-2">
                      {currentLesson.title || 'Video Lesson'}
                    </h3>
                    <p className="text-slate-300">
                      Video player would be integrated here
                    </p>
                  </div>
                </div>
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="flex items-center space-x-4">
                      <span className="text-white text-sm">
                        {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
                      </span>
                      <div className="flex-1 bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(currentTime / 300) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">
                        5:00
                      </span>
                    </div>
                    
                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={togglePlayPause}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleMute}
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                        
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-4 h-4 text-white" />
                          <div className="w-20 bg-slate-600 rounded-full h-2">
                            <div 
                              className="bg-white h-2 rounded-full transition-all duration-300"
                              style={{ width: `${isMuted ? 0 : volume}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={goToPreviousLesson}
                          disabled={currentLessonIndex === 0}
                          className="text-white hover:bg-white/20"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={goToNextLesson}
                          disabled={currentLessonIndex === allLessons.length - 1}
                          className="text-white hover:bg-white/20"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <Maximize className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lesson Actions */}
              <div className="bg-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {currentLesson.title || 'Untitled Lesson'}
                    </h3>
                    <p className="text-sm text-slate-300">
                      {currentLesson.video?.duration ? 
                        `${Math.floor(currentLesson.video.duration / 60)}:${(currentLesson.video.duration % 60).toString().padStart(2, '0')}` : 
                        'Duration unknown'
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleLessonComplete}
                      disabled={isUpdatingProgress}
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isUpdatingProgress ? 'Marking...' : 'Mark Complete'}
                    </Button>
                    
                    <Button
                      onClick={goToNextLesson}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Next Lesson
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-semibold mb-2">No lessons available</h3>
                <p className="text-slate-300">This course doesn't have any lessons yet.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Course Navigation */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Course Content</h3>
            
            <div className="space-y-2">
              {courseData.course.modules?.map((module, moduleIndex) => (
                <div key={module.id} className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-slate-700 rounded">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {moduleIndex + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{module.title}</h4>
                      <p className="text-xs text-slate-300">
                        {module.lessons.length} lessons
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-4 space-y-1">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const globalIndex = courseData.course.modules
                        ?.slice(0, moduleIndex)
                        .reduce((acc, m) => acc + m.lessons.length, 0) + lessonIndex || 0;
                      
                      const isCurrentLesson = globalIndex === currentLessonIndex;
                      const isCompleted = progress.completedLessons > globalIndex;
                      
                      return (
                        <div
                          key={lesson.id}
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            isCurrentLesson 
                              ? 'bg-blue-600 text-white' 
                              : isCompleted 
                                ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                          onClick={() => setCurrentLessonIndex(globalIndex)}
                        >
                          <div className="flex items-center space-x-2">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <div className="w-4 h-4 border border-current rounded-full" />
                            )}
                            <div className="flex-1">
                              <h5 className="text-sm font-medium">
                                {lesson.title || 'Untitled Lesson'}
                              </h5>
                              <p className="text-xs opacity-75">
                                {lesson.video?.duration ? 
                                  `${Math.floor(lesson.video.duration / 60)}:${(lesson.video.duration % 60).toString().padStart(2, '0')}` : 
                                  'Duration unknown'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal - Simplified */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Quiz</h3>
            <p className="text-slate-600 mb-4">Quiz functionality will be implemented here.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowQuiz(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal - Simplified */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
            <p className="text-slate-600 mb-4">You have successfully completed the course!</p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setShowCertificate(false)}>
                Close
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
