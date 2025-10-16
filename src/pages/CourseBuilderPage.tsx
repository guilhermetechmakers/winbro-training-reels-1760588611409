import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Save, Eye, Send, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { useCourseBuilder } from '@/hooks/use-course-builder';

export default function CourseBuilderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get('id') || undefined;
  
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const {
    course,
    modules,
    videos,
    selectedModule,
    setSelectedModule,
    updateCourse,
    publishCourse,
    createModule,
    addVideoToModule,
    calculateEstimatedDuration,
    isUpdatingCourse,
    isPublishingCourse,
  } = useCourseBuilder({ courseId });

  // Initialize form with course data
  useEffect(() => {
    if (course) {
      setCourseTitle(course.title);
      setCourseDescription(course.description || '');
    }
  }, [course]);


  const handleSaveCourse = async () => {
    if (!course || !courseId) return;

    try {
      await updateCourse({
        id: courseId,
        data: {
          title: courseTitle,
          description: courseDescription,
          estimated_duration: calculateEstimatedDuration(),
        }
      });
      toast.success('Course saved successfully');
    } catch (error) {
      toast.error('Failed to save course');
      console.error('Error saving course:', error);
    }
  };

  const handlePublishCourse = async () => {
    if (!courseId) return;

    try {
      await publishCourse(courseId);
      toast.success('Course published successfully');
    } catch (error) {
      toast.error('Failed to publish course');
      console.error('Error publishing course:', error);
    }
  };

  const handleAddModule = async () => {
    if (!courseId) return;

    const moduleCount = modules.length + 1;
    try {
      createModule({
        course_id: courseId!,
        title: `Module ${moduleCount}`,
        sort_order: moduleCount,
      }, {
        onSuccess: () => {
          toast.success('Module added successfully');
        },
        onError: (error) => {
          toast.error('Failed to add module');
          console.error('Error adding module:', error);
        }
      });
    } catch (error) {
      toast.error('Failed to add module');
      console.error('Error adding module:', error);
    }
  };

  const handleAddVideoToModule = () => {
    if (!selectedModule) {
      toast.error('Please select a module first');
      return;
    }

    addVideoToModule(selectedModule);
    toast.success('Video added to module');
  };

  if (!courseId && !isCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Course Builder
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Create structured training courses with videos, quizzes, and certifications
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Structured Learning</h3>
                <p className="text-slate-600">
                  Organize videos into modules and lessons for sequential learning
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Interactive Quizzes</h3>
                <p className="text-slate-600">
                  Add quizzes to validate knowledge and ensure comprehension
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold mb-2">Certifications</h3>
                <p className="text-slate-600">
                  Generate completion certificates for successful learners
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                <p className="text-slate-600">
                  Monitor learner progress and completion rates
                </p>
              </Card>
            </div>

            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Course
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {course ? course.title : 'Course Builder'}
                </h1>
                <p className="text-sm text-slate-600">
                  {course ? 'Edit your course' : 'Create a new course'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleSaveCourse}
                disabled={isUpdatingCourse}
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdatingCourse ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreating(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handlePublishCourse}
                disabled={isPublishingCourse || !course?.is_published}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isPublishingCourse ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Video Library */}
        <div className="w-80 bg-white border-r border-slate-200 p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Video Library</h3>
            <Input placeholder="Search videos..." className="mb-3" />
          </div>
          
          <div className="space-y-2">
            {videos.map((video) => (
              <Card 
                key={video.id} 
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleAddVideoToModule()}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-12 bg-slate-200 rounded flex items-center justify-center">
                    <span className="text-xs text-slate-500">📹</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate">
                      {video.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {video.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content - Course Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Course Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Input
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      className="text-2xl font-bold border-none p-0 h-auto focus:ring-0"
                      placeholder="Enter course title"
                    />
                    <Textarea
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      className="mt-2 border-none p-0 h-auto focus:ring-0 resize-none"
                      placeholder="Enter course description"
                      rows={2}
                    />
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm text-slate-500">Estimated Duration</div>
                    <div className="text-lg font-semibold">
                      {Math.floor(calculateEstimatedDuration())} min
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Modules */}
            <div className="space-y-4">
              {modules.map((module, index) => (
                <Card key={module.id} className="overflow-hidden">
                  <CardHeader 
                    className="bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedModule(module.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{module.title}</h3>
                          <p className="text-sm text-slate-600">
                            {module.lessons.length} lessons
                          </p>
                        </div>
                      </div>
                      <Badge variant={selectedModule === module.id ? 'default' : 'secondary'}>
                        {selectedModule === module.id ? 'Selected' : 'Click to select'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-200">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="p-4 flex items-center space-x-3">
                          <div className="w-6 h-6 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs font-semibold">
                            {lessonIndex + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{lesson.title || 'Untitled Lesson'}</h4>
                            <p className="text-xs text-slate-500">Video Lesson</p>
                          </div>
                          <Badge variant="outline">Video</Badge>
                        </div>
                      ))}
                      
                      {module.lessons.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                          <p>No lessons in this module yet</p>
                          <p className="text-sm">Drag videos from the library to add lessons</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {modules.length === 0 && (
                <Card className="p-12 text-center">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No modules yet</h3>
                  <p className="text-slate-600 mb-4">Start building your course by adding modules</p>
                  <Button onClick={handleAddModule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Module
                  </Button>
                </Card>
              )}
            </div>

            {/* Add Module Button */}
            {modules.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={handleAddModule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Module
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Settings */}
        <div className="w-80 bg-white border-l border-slate-200 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Course Settings</h3>
              <p className="text-sm text-slate-600">
                Course settings and configuration options will be available here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
