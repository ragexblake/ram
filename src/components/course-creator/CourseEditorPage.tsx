import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SimpleCourseEditor from './SimpleCourseEditor';
import { supabase } from '@/integrations/supabase/client';

interface CourseEditorPageProps {
  course: any;
  onBack: () => void;
  onSave?: () => void;
}

const CourseEditorPage: React.FC<CourseEditorPageProps> = ({
  course,
  onBack,
  onSave
}) => {
  const [courseContent, setCourseContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCourseContent();
  }, [course]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      
      // Load existing course content
      if (course.course_plan?.courseContent) {
        console.log('Loading existing course content from database');
        setCourseContent(course.course_plan.courseContent.sections || course.course_plan.courseContent);
      } else {
        // If no content exists, create basic structure
        setCourseContent([]);
      }
    } catch (error) {
      console.error('Error loading course content:', error);
      toast({
        title: "Error",
        description: "Failed to load course content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (newContent: any[]) => {
    setCourseContent(newContent);
  };

  const handleSave = async () => {
    try {
      console.log('handleSave called, saving course content...');
      setSaving(true);
      
      // Save the updated content to the database
      const { error } = await supabase
        .from('courses')
        .update({
          course_plan: {
            ...course.course_plan,
            courseContent: {
              sections: courseContent,
              lastUpdated: new Date().toISOString()
            }
          }
        })
        .eq('id', course.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Course content saved successfully",
      });

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving course content:', error);
      toast({
        title: "Error",
        description: "Failed to save course content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading course content...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Course</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Edit Course: {course.course_title}
                </h1>
                <p className="text-sm text-gray-600">
                  Modify sections, topics, and content
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SimpleCourseEditor
          courseContent={courseContent}
          onContentChange={handleContentChange}
          onSave={handleSave}
          readOnly={false}
          courseId={course.id}
        />
      </div>
    </div>
  );
};

export default CourseEditorPage; 