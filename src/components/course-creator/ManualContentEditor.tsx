import React, { useState } from 'react';
import { Edit3, Save, Plus, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'list' | 'definition';
}

interface ManualContentEditorProps {
  formData: any;
  setFormData: (data: any) => void;
}

const ManualContentEditor: React.FC<ManualContentEditorProps> = ({
  formData,
  setFormData
}) => {
  const [sections, setSections] = useState<ContentSection[]>(
    formData.manualContent?.sections || []
  );
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSection, setNewSection] = useState({
    title: '',
    content: '',
    type: 'text' as const
  });

  const addSection = () => {
    if (newSection.title.trim() && newSection.content.trim()) {
      const section: ContentSection = {
        id: Date.now().toString(),
        title: newSection.title,
        content: newSection.content,
        type: newSection.type
      };
      
      const updatedSections = [...sections, section];
      setSections(updatedSections);
      
      // Update form data
      setFormData({
        ...formData,
        contentSource: 'manual',
        manualContent: {
          sections: updatedSections,
          totalSections: updatedSections.length,
          totalWords: updatedSections.reduce((sum, section) => 
            sum + section.content.split(' ').length, 0
          ),
          lastEdited: new Date().toISOString()
        }
      });
      
      // Reset new section form
      setNewSection({ title: '', content: '', type: 'text' });
    }
  };

  const updateSection = (id: string, updates: Partial<ContentSection>) => {
    const updatedSections = sections.map(section =>
      section.id === id ? { ...section, ...updates } : section
    );
    setSections(updatedSections);
    
    // Update form data
    setFormData({
      ...formData,
      contentSource: 'manual',
      manualContent: {
        sections: updatedSections,
        totalSections: updatedSections.length,
        totalWords: updatedSections.reduce((sum, section) => 
          sum + section.content.split(' ').length, 0
        ),
        lastEdited: new Date().toISOString()
      }
    });
    
    setEditingSection(null);
  };

  const deleteSection = (id: string) => {
    const updatedSections = sections.filter(section => section.id !== id);
    setSections(updatedSections);
    
    // Update form data
    setFormData({
      ...formData,
      contentSource: 'manual',
      manualContent: {
        sections: updatedSections,
        totalSections: updatedSections.length,
        totalWords: updatedSections.reduce((sum, section) => 
          sum + section.content.split(' ').length, 0
        ),
        lastEdited: new Date().toISOString()
      }
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'list': return '📋';
      case 'definition': return '📖';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'list': return 'List';
      case 'definition': return 'Definition';
      default: return 'Text';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h3 className="text-xl font-semibold">Manual Content Editor</h3>
        <FileText className="h-5 w-5 text-gray-400" />
      </div>
      
      <p className="text-gray-600">
        Add and edit content manually to train the AI on your specific materials.
      </p>

      {/* Add New Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Content Section</span>
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
                placeholder="e.g., Introduction, Key Concepts, Examples"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={newSection.type}
                onChange={(e) => setNewSection({ ...newSection, type: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="text">Text Content</option>
                <option value="list">List/Bullet Points</option>
                <option value="definition">Definitions/Glossary</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <Textarea
              value={newSection.content}
              onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
              placeholder={
                newSection.type === 'list' 
                  ? "Enter your list items, one per line or separated by commas..."
                  : newSection.type === 'definition'
                  ? "Enter terms and their definitions, one per line..."
                  : "Enter your content here..."
              }
              rows={4}
            />
          </div>
          
          <Button 
            onClick={addSection}
            disabled={!newSection.title.trim() || !newSection.content.trim()}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </CardContent>
      </Card>

      {/* Existing Sections */}
      {sections.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Content Sections ({sections.length})</h4>
          
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getTypeIcon(section.type)}</span>
                    <div>
                      <CardTitle className="text-lg">
                        {editingSection === section.id ? (
                          <Input
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            onBlur={() => setEditingSection(null)}
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="cursor-pointer hover:text-purple-600"
                            onClick={() => setEditingSection(section.id)}
                          >
                            {section.title}
                          </span>
                        )}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(section.type)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                    >
                      <Edit3 className="h-4 w-4" />
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
                </div>
              </CardHeader>
              
              <CardContent>
                {editingSection === section.id ? (
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    onBlur={() => setEditingSection(null)}
                    rows={4}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-gray-700">
                    {section.content}
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  {section.content.split(' ').length} words
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {sections.length > 0 && (
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{sections.length}</div>
                <div className="text-sm text-blue-700">Sections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {sections.reduce((sum, section) => sum + section.content.split(' ').length, 0)}
                </div>
                <div className="text-sm text-blue-700">Total Words</div>
              </div>
                             <div>
                 <div className="text-2xl font-bold text-blue-600">
                   {sections.filter(s => s.type === 'list').length}
                 </div>
                 <div className="text-sm text-blue-700">Lists</div>
               </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManualContentEditor; 