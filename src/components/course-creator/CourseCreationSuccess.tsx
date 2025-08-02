
import React, { useState } from 'react';
import { Play, Edit3, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimpleCourseEditor from './SimpleCourseEditor';

interface CourseCreationSuccessProps {
  course: any;
  selectedTrack: 'Corporate' | 'Educational';
  onStartCourse: () => void;
}

const CourseCreationSuccess: React.FC<CourseCreationSuccessProps> = ({
  course,
  selectedTrack,
  onStartCourse
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [courseContent, setCourseContent] = useState(course.course_plan?.courseContent?.sections || []);

  const handleContentChange = (newContent: any[]) => {
    setCourseContent(newContent);
    // Here you would typically save the updated content to the database
    console.log('Course content updated:', newContent);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Course Created Successfully!</h2>
              <p className="text-gray-600 mt-1">
                Your course "<strong>{course.course_title}</strong>" is ready for live interaction.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setActiveTab(activeTab === 'preview' ? 'edit' : 'preview')}
                className="flex items-center space-x-2"
              >
                {activeTab === 'preview' ? (
                  <>
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Content</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </>
                )}
              </Button>
              <Button
                onClick={onStartCourse}
                className="bg-green-500 hover:bg-green-600 flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Start Course</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Course Details:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Track:</span>
              <p className="font-medium">{selectedTrack}</p>
            </div>
            <div>
              <span className="text-gray-600">Tutor:</span>
              <p className="font-medium">{selectedTrack === 'Corporate' ? 'Nia' : 'Leo'}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium text-green-600">Live & Ready</p>
            </div>
            <div>
              <span className="text-gray-600">Sections:</span>
              <p className="font-medium">{courseContent.length}</p>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'preview' | 'edit')}>
          <TabsList className="grid w-full grid-cols-2 mx-6 mt-6">
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Course Preview</span>
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center space-x-2">
              <Edit3 className="h-4 w-4" />
              <span>Edit Content</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="p-6">
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Start Learning!</h3>
                <p className="text-gray-600 mb-6">
                  Your AI tutor is ready to guide you through the course content interactively.
                </p>
                <Button
                  onClick={onStartCourse}
                  className="bg-green-500 hover:bg-green-600 text-lg px-8 py-3"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Begin Interactive Session
                </Button>
              </div>

              {/* Course Structure Preview */}
              {courseContent.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Course Structure Preview</h4>
                  <div className="space-y-3">
                    {courseContent.map((section: any, index: number) => (
                      <div key={section.id || index} className="bg-white rounded-lg p-4 border">
                        <h5 className="font-medium text-gray-900 mb-2">
                          {index + 1}. {section.title}
                        </h5>
                        <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                        {section.subsections && section.subsections.length > 0 && (
                          <div className="space-y-2">
                            {section.subsections.map((subsection: any, subIndex: number) => (
                              <div key={subsection.id || subIndex} className="flex items-center space-x-2 text-sm">
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-700">{subsection.title}</span>
                                {subsection.hasQuiz && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Quiz
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="edit" className="p-6">
            <SimpleCourseEditor
              courseContent={courseContent}
              onContentChange={handleContentChange}
              readOnly={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseCreationSuccess;
