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
  Square,
  Save,
  Copy,
  Move
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CourseSubsection {
  id: string;
  title: string;
  content: string;
  hasQuiz: boolean;
  quizQuestions?: string[];
}

interface CourseSection {
  id: string;
  title: string;
  description: string;
  subsections: CourseSubsection[];
}

interface CourseContentEditorProps {
  courseContent: CourseSection[];
  onContentChange: (content: CourseSection[]) => void;
  readOnly?: boolean;
}

const CourseContentEditor: React.FC<CourseContentEditorProps> = ({
  courseContent,
  onContentChange,
  readOnly = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingSubsection, setEditingSubsection] = useState<string | null>(null);
  const [newSection, setNewSection] = useState({
    title: '',
    description: ''
  });
  const [newSubsection, setNewSubsection] = useState({
    title: '',
    content: '',
    hasQuiz: false
  });

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
    setEditingSubsection(null);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Course Content Editor</h3>
          <p className="text-gray-600">Edit sections, topics, and content for your course</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {courseContent.length} Sections
          </Badge>
          <Badge variant="secondary">
            {courseContent.reduce((sum, section) => sum + section.subsections.length, 0)} Topics
          </Badge>
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
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={sectionIndex === courseContent.length - 1}
                    >
                      ↓
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
                        rows={3}
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
                <div className="space-y-3">
                  {section.subsections.map((subsection) => (
                    <div key={subsection.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div>
                            {editingSubsection === subsection.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={subsection.title}
                                  onChange={(e) => updateSubsection(section.id, subsection.id, { title: e.target.value })}
                                  onBlur={() => setEditingSubsection(null)}
                                  autoFocus
                                />
                                <Textarea
                                  value={subsection.content}
                                  onChange={(e) => updateSubsection(section.id, subsection.id, { content: e.target.value })}
                                  onBlur={() => setEditingSubsection(null)}
                                  rows={2}
                                />
                              </div>
                            ) : (
                              <div>
                                <h5 
                                  className="font-medium cursor-pointer hover:text-blue-600"
                                  onClick={() => !readOnly && setEditingSubsection(subsection.id)}
                                >
                                  {subsection.title}
                                </h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  {subsection.content}
                                </p>
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
                              >
                                <Edit3 className="h-4 w-4" />
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

export default CourseContentEditor; 