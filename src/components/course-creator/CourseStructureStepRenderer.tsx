import React, { useState } from 'react';
import { Crown, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface CourseStructureStepRendererProps {
  formData: any;
  setFormData: (data: any) => void;
}

const CourseStructureStepRenderer: React.FC<CourseStructureStepRendererProps> = ({
  formData,
  setFormData
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [createFromFile, setCreateFromFile] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData({ ...formData, [field]: numValue });
  };

  return (
    <div className="space-y-6">
      {/* Header with Upgrade Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-semibold">Course Structure</h3>
          <HelpCircle className="h-5 w-5 text-gray-400" />
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white">
          <Crown className="h-4 w-4 mr-2" />
          Upgrade
        </Button>
      </div>

      {/* Create Structure from File */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">Create Structure from File</span>
        </div>
        <Switch
          checked={createFromFile}
          onCheckedChange={setCreateFromFile}
          className="data-[state=checked]:bg-purple-500"
        />
      </div>

      {/* Course Structure Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span>Sections</span>
          </label>
          <Input
            type="number"
            value={formData.sections || 3}
            onChange={(e) => handleInputChange('sections', e.target.value)}
            className="w-full"
            min="1"
            max="20"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span>Quizzes per Section</span>
          </label>
          <Input
            type="number"
            value={formData.quizzesPerSection || 1}
            onChange={(e) => handleInputChange('quizzesPerSection', e.target.value)}
            className="w-full"
            min="0"
            max="10"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span>Pages per Section</span>
          </label>
          <Input
            type="number"
            value={formData.pagesPerSection || 1}
            onChange={(e) => handleInputChange('pagesPerSection', e.target.value)}
            className="w-full"
            min="1"
            max="50"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span>Questions per Quiz</span>
          </label>
          <Input
            type="number"
            value={formData.questionsPerQuiz || 3}
            onChange={(e) => handleInputChange('questionsPerQuiz', e.target.value)}
            className="w-full"
            min="1"
            max="20"
          />
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="border-t pt-4">
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {showAdvancedSettings ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span>Advanced Settings</span>
        </button>

        {showAdvancedSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Difficulty Progression
                </label>
                <select
                  value={formData.difficultyProgression || 'linear'}
                  onChange={(e) => setFormData({ ...formData, difficultyProgression: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="linear">Linear</option>
                  <option value="exponential">Exponential</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Assessment Type
                </label>
                <select
                  value={formData.assessmentType || 'mixed'}
                  onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="mixed">Mixed</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="open-ended">Open Ended</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Learning Path Customization
              </label>
              <textarea
                value={formData.learningPath || ''}
                onChange={(e) => setFormData({ ...formData, learningPath: e.target.value })}
                placeholder="Describe any specific learning path requirements..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 These settings help create a structured learning experience. Premium features allow for more customization and advanced course creation options.
        </p>
      </div>
    </div>
  );
};

export default CourseStructureStepRenderer; 