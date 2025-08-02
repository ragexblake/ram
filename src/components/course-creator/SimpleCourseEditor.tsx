import React, { useState } from 'react';
import { 
  Edit3, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  CheckSquare,
  Save,
  Copy,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourseSubsection {
  id: string;
  title: string;
  content: string;
  hasQuiz: boolean;
}

interface CourseSection {
  id: string;
  title: string;
  description: string;
  subsections: CourseSubsection[];
}

interface SimpleCourseEditorProps {
  courseContent: CourseSection[];
  onContentChange: (content: CourseSection[]) => void;
  onSave?: () => void;
  readOnly?: boolean;
  courseId?: string;
}

const SimpleCourseEditor: React.FC<SimpleCourseEditorProps> = ({
  courseContent,
  onContentChange,
  onSave,
  readOnly = false,
  courseId
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingSubsection, setEditingSubsection] = useState<string | null>(null);
  const [expandedContent, setExpandedContent] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [newSection, setNewSection] = useState({
    title: '',
    description: ''
  });
  const [newSubsection, setNewSubsection] = useState({
    title: '',
    content: '',
    hasQuiz: false
  });
  const { toast } = useToast();

  // Debug function to check current database state
  const debugDatabaseState = async () => {
    if (!courseId) return;
    
    try {
      console.log('=== DEBUG: Checking database state ===');
      const { data: currentCourse, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('Error fetching course:', error);
      } else {
        console.log('Full course data from database:', currentCourse);
        console.log('Current course_plan structure:', currentCourse?.course_plan);
        console.log('Current local courseContent:', courseContent);
      }
    } catch (error) {
      console.error('Debug error:', error);
    }
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

  const addSection = () => {
    if (newSection.title.trim()) {
      const section: CourseSection = {
        id: Date.now().toString(),
        title: newSection.title,
        description: newSection.description,
        subsections: []
      };
      
      const updatedContent = [...courseContent, section];
      onContentChange(updatedContent);
      setNewSection({ title: '', description: '' });
      setExpandedSections(new Set([...expandedSections, section.id]));
    }
  };

  const updateSection = (sectionId: string, updates: Partial<CourseSection>) => {
    const updatedContent = courseContent.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    onContentChange(updatedContent);
    setEditingSection(null);
  };

  const deleteSection = (sectionId: string) => {
    const updatedContent = courseContent.filter(section => section.id !== sectionId);
    onContentChange(updatedContent);
  };

  const addSubsection = (sectionId: string) => {
    if (newSubsection.title.trim()) {
      const subsection: CourseSubsection = {
        id: Date.now().toString(),
        title: newSubsection.title,
        content: newSubsection.content,
        hasQuiz: newSubsection.hasQuiz
      };
      
      const updatedContent = courseContent.map(section =>
        section.id === sectionId
          ? { ...section, subsections: [...section.subsections, subsection] }
          : section
      );
      onContentChange(updatedContent);
      setNewSubsection({ title: '', content: '', hasQuiz: false });
    }
  };

  const updateSubsection = (sectionId: string, subsectionId: string, updates: Partial<CourseSubsection>) => {
    const updatedContent = courseContent.map(section =>
      section.id === sectionId
        ? {
            ...section,
            subsections: section.subsections.map(subsection =>
              subsection.id === subsectionId ? { ...subsection, ...updates } : subsection
            )
          }
        : section
    );
    onContentChange(updatedContent);
    // Don't close edit mode automatically - let user control it
  };

  const deleteSubsection = (sectionId: string, subsectionId: string) => {
    const updatedContent = courseContent.map(section =>
      section.id === sectionId
        ? {
            ...section,
            subsections: section.subsections.filter(subsection => subsection.id !== subsectionId)
          }
        : section
    );
    onContentChange(updatedContent);
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = courseContent.findIndex(section => section.id === sectionId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= courseContent.length) return;
    
    const updatedContent = [...courseContent];
    [updatedContent[currentIndex], updatedContent[newIndex]] = [updatedContent[newIndex], updatedContent[currentIndex]];
    onContentChange(updatedContent);
  };

  const duplicateSection = (sectionId: string) => {
    const section = courseContent.find(s => s.id === sectionId);
    if (!section) return;
    
    const duplicatedSection: CourseSection = {
      ...section,
      id: Date.now().toString(),
      title: `${section.title} (Copy)`,
      subsections: section.subsections.map(subsection => ({
        ...subsection,
        id: Date.now().toString() + Math.random()
      }))
    };
    
    const updatedContent = [...courseContent, duplicatedSection];
    onContentChange(updatedContent);
  };

  const saveSubsectionChanges = async (sectionId: string, subsectionId: string) => {
    try {
      setSaving(true);
      console.log('Saving subsection changes...');
      console.log('Current course content to save:', courseContent);
      
      // First, let's fetch the current course_plan from database to see its structure
      if (courseId) {
        console.log('Fetching current course_plan from database...');
        const { data: currentCourse, error: fetchError } = await supabase
          .from('courses')
          .select('course_plan')
          .eq('id', courseId)
          .single();

        if (fetchError) {
          console.error('Error fetching current course:', fetchError);
        } else {
          console.log('Current course_plan in database:', currentCourse?.course_plan);
        }

        console.log('Saving to database with courseId:', courseId);
        
        // Try to preserve the existing course_plan structure and just update the sections
        const updatedCoursePlan = {
          ...currentCourse?.course_plan,
          sections: courseContent,
          lastUpdated: new Date().toISOString()
        };
        
        console.log('Updated course_plan to save:', updatedCoursePlan);
        
        const { error } = await supabase
          .from('courses')
          .update({
            course_plan: updatedCoursePlan
          })
          .eq('id', courseId);

        if (error) {
          console.error('Database save error:', error);
          throw error;
        }

        console.log('Database save successful');
        toast({
          title: "Success",
          description: "Changes saved successfully",
        });
      } else {
        console.log('No courseId provided, calling onSave callback');
        // Fallback to onSave callback if no courseId
        if (onSave) {
          await onSave();
        }
      }
      
      // Close the edit mode
      setEditingSubsection(null);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelSubsectionEdit = () => {
    // Cancel editing and close edit mode
    setEditingSubsection(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Course Content Editor</h3>
          <p className="text-gray-600">Edit sections, topics, and content for your course</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={debugDatabaseState}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Debug DB
          </Button>
          <Badge variant="secondary">
            {courseContent.length} Sections
          </Badge>
          <Badge variant="secondary">
            {courseContent.reduce((sum, section) => sum + section.subsections.length, 0)} Topics
          </Badge>
          {onSave && (
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Add New Section */}
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add New Section</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <Input
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="e.g., Introduction, Core Concepts"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Description
                </label>
                <Input
                  value={newSection.description}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                  placeholder="Brief description of this section"
                />
              </div>
            </div>
            <Button 
              onClick={addSection}
              disabled={!newSection.title.trim()}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Course Sections */}
      <div className="space-y-4">
        {courseContent.map((section, sectionIndex) => (
          <Card key={section.id} className="border-2 border-gray-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(section.id)}
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    <div>
                      {editingSection === section.id ? (
                        <div className="space-y-2">
                          <Input
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            onBlur={() => setEditingSection(null)}
                            autoFocus
                          />
                          <Input
                            value={section.description}
                            onChange={(e) => updateSection(section.id, { description: e.target.value })}
                            onBlur={() => setEditingSection(null)}
                            placeholder="Section description"
                          />
                        </div>
                      ) : (
                        <div>
                          <CardTitle 
                            className="text-lg cursor-pointer hover:text-purple-600"
                            onClick={() => !readOnly && setEditingSection(section.id)}
                          >
                            {section.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {!readOnly && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={sectionIndex === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={sectionIndex === courseContent.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateSection(section.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSection(section.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            {expandedSections.has(section.id) && (
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                
                {/* Add New Subsection */}
                {!readOnly && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Add New Topic</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Topic Title
                        </label>
                        <Input
                          value={newSubsection.title}
                          onChange={(e) => setNewSubsection({ ...newSubsection, title: e.target.value })}
                          placeholder="e.g., Market Analysis, Sales Techniques"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newSubsection.hasQuiz}
                            onChange={(e) => setNewSubsection({ ...newSubsection, hasQuiz: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Include Quiz</span>
                        </label>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topic Content
                      </label>
                      <Textarea
                        value={newSubsection.content}
                        onChange={(e) => setNewSubsection({ ...newSubsection, content: e.target.value })}
                        placeholder="Enter the content for this topic..."
                        rows={6}
                        className="w-full min-w-full resize-none"
                      />
                    </div>
                    <Button 
                      onClick={() => addSubsection(section.id)}
                      disabled={!newSubsection.title.trim()}
                      className="mt-3 bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Topic
                    </Button>
                  </div>
                )}

                {/* Subsections */}
                <div className="space-y-4">
                  {section.subsections.map((subsection) => (
                    <div key={subsection.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div>
                            {editingSubsection === subsection.id ? (
                              <div className="space-y-4 w-full min-w-full">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Topic Title
                                  </label>
                                  <Input
                                    value={subsection.title}
                                    onChange={(e) => updateSubsection(section.id, subsection.id, { title: e.target.value })}
                                    placeholder="Enter topic title"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Topic Content
                                  </label>
                                  <Textarea
                                    value={subsection.content}
                                    onChange={(e) => updateSubsection(section.id, subsection.id, { content: e.target.value })}
                                    placeholder="Enter the content for this topic. You can use simple text formatting like paragraphs, lists, and headings."
                                    rows={12}
                                    className="font-mono text-sm w-full min-w-full resize-none"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Tip: Use simple text formatting. No HTML required.
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => saveSubsectionChanges(section.id, subsection.id)}
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
                                  <Button
                                    onClick={cancelSubsectionEdit}
                                    disabled={saving}
                                    variant="outline"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full">
                                <h5 
                                  className="font-medium cursor-pointer hover:text-blue-600 mb-2"
                                  onClick={() => !readOnly && setEditingSubsection(subsection.id)}
                                >
                                  {subsection.title}
                                </h5>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto">
                                    {expandedContent.has(subsection.id) 
                                      ? subsection.content
                                      : subsection.content.length > 200 
                                        ? `${subsection.content.substring(0, 200)}...` 
                                        : subsection.content
                                    }
                                  </div>
                                  {subsection.content.length > 200 && (
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-xs text-gray-500">
                                        {expandedContent.has(subsection.id) 
                                          ? `${subsection.content.length} characters` 
                                          : `${subsection.content.length} characters - click to expand`
                                        }
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newExpanded = new Set(expandedContent);
                                          if (newExpanded.has(subsection.id)) {
                                            newExpanded.delete(subsection.id);
                                          } else {
                                            newExpanded.add(subsection.id);
                                          }
                                          setExpandedContent(newExpanded);
                                        }}
                                        className="text-xs"
                                      >
                                        {expandedContent.has(subsection.id) ? 'Show Less' : 'Show More'}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {subsection.hasQuiz && (
                            <Badge variant="outline" className="text-xs">
                              <CheckSquare className="h-3 w-3 mr-1" />
                              Quiz
                            </Badge>
                          )}
                          {!readOnly && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingSubsection(editingSubsection === subsection.id ? null : subsection.id)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                              >
                                <Edit3 className="h-4 w-4 mr-1" />
                                {editingSubsection === subsection.id ? 'Cancel' : 'Edit'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteSubsection(section.id, subsection.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {courseContent.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Content Yet</h3>
            <p className="text-gray-600 mb-4">
              Start by adding sections and topics to build your course structure.
            </p>
            {!readOnly && (
              <Button onClick={addSection} className="bg-purple-500 hover:bg-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleCourseEditor; 