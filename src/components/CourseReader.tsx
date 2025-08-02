import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, ChevronDown, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CourseReaderProps {
  course: any;
  user: any;
  onBack: () => void;
  readOnly?: boolean;
}

interface CourseSection {
  id: string;
  title: string;
  description: string;
  subsections: CourseSubsection[];
}

interface CourseSubsection {
  id: string;
  title: string;
  content: string;
  hasQuiz: boolean;
}

const CourseReader: React.FC<CourseReaderProps> = ({
  course,
  user,
  onBack,
  readOnly = true
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [courseContent, setCourseContent] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseContent();
  }, [course]);

  const loadCourseContent = () => {
    try {
      // Extract course content from course plan
      let content: CourseSection[] = [];
      
      if (course.course_plan?.courseContent?.sections) {
        content = course.course_plan.courseContent.sections;
      } else if (course.course_plan?.sections) {
        content = course.course_plan.sections;
      } else if (Array.isArray(course.course_plan?.courseContent)) {
        content = course.course_plan.courseContent;
      } else {
        // Create basic structure from course plan if no structured content exists
        content = createBasicStructure();
      }
      
      setCourseContent(content);
      
      // Expand first section by default
      if (content.length > 0) {
        setExpandedSections(new Set([content[0].id]));
      }
    } catch (error) {
      console.error('Error loading course content:', error);
      setCourseContent(createBasicStructure());
    } finally {
      setLoading(false);
    }
  };

  const createBasicStructure = (): CourseSection[] => {
    // Create a basic structure from available course data
    const sections: CourseSection[] = [];
    
    // Introduction section
    sections.push({
      id: 'intro',
      title: 'Introduction',
      description: 'Course overview and objectives',
      subsections: [
        {
          id: 'welcome',
          title: 'Welcome',
          content: `Welcome to ${course.course_title}!\n\nThis ${course.track_type} course is designed to help you achieve your learning objectives through interactive AI-powered tutoring.`,
          hasQuiz: false
        }
      ]
    });

    // Main content section
    if (course.course_plan?.goal) {
      sections.push({
        id: 'main',
        title: 'Main Content',
        description: 'Core learning material',
        subsections: [
          {
            id: 'objectives',
            title: 'Learning Objectives',
            content: `Goal: ${course.course_plan.goal}\n\n${course.course_plan.industry ? `Industry: ${course.course_plan.industry}\n\n` : ''}This course will guide you through practical applications and real-world scenarios to master the subject matter.`,
            hasQuiz: false
          }
        ]
      });
    }

    return sections;
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading course content...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {course.course_title}
                </h1>
                <p className="text-sm text-gray-600">
                  {course.track_type} Course
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="flex items-center space-x-1">
                <BookOpen className="h-3 w-3" />
                <span>{courseContent.length} Sections</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>Read Mode</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <span>Course Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Course Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Track Type:</span>
                    <span className="font-medium">{course.track_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium capitalize">{course.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              {course.course_plan && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Learning Objectives</h3>
                  <div className="space-y-2 text-sm">
                    {course.course_plan.goal && (
                      <div>
                        <span className="text-gray-600">Goal:</span>
                        <p className="text-gray-900 mt-1">{course.course_plan.goal}</p>
                      </div>
                    )}
                    {course.course_plan.industry && (
                      <div>
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium ml-2">{course.course_plan.industry}</span>
                      </div>
                    )}
                    {course.course_plan.duration && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{course.course_plan.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Course Sections */}
        <div className="space-y-6">
          {courseContent.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Structured Content Available</h3>
                <p className="text-gray-600">
                  This course uses AI-powered interactive tutoring. Start a session to begin learning!
                </p>
              </CardContent>
            </Card>
          ) : (
            courseContent.map((section, sectionIndex) => (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium text-sm">
                          {sectionIndex + 1}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {section.subsections.length} Topics
                      </Badge>
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedSections.has(section.id) && (
                  <CardContent className="pt-0">
                    <Separator className="mb-6" />
                    
                    <div className="space-y-6">
                      {section.subsections.map((subsection, subsectionIndex) => (
                        <div key={subsection.id} className="border-l-4 border-green-200 pl-6">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-xs">
                                {subsectionIndex + 1}
                              </span>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {subsection.title}
                            </h4>
                            {subsection.hasQuiz && (
                              <Badge variant="outline" className="text-xs">
                                Quiz Available
                              </Badge>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-6">
                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {subsection.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card>
            <CardContent className="py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Start Learning?
              </h3>
              <p className="text-gray-600 mb-4">
                This course uses AI-powered interactive tutoring for the best learning experience.
              </p>
              <Button 
                onClick={onBack}
                className="bg-green-500 hover:bg-green-600"
              >
                Start Interactive Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseReader;