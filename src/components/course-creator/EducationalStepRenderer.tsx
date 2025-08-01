import React from 'react';

interface EducationalStepRendererProps {
  currentStep: number;
  formData: any;
  setFormData: (data: any) => void;
}

const EducationalStepRenderer: React.FC<EducationalStepRendererProps> = ({
  currentStep,
  formData,
  setFormData
}) => {
  const educationalLevels = [
    'Primary School (Ages 5-11)',
    'Secondary School (Ages 12-18)', 
    'University (Ages 18+)',
    'College',
    'TAFE / Community College',
    'Professional Development'
  ];

  const getSubjectSuggestions = (level: string) => {
    const suggestions: { [key: string]: string[] } = {
      'Primary School (Ages 5-11)': ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Art'],
      'Secondary School (Ages 12-18)': ['Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 'Literature', 'History', 'Geography', 'Languages'],
      'University (Ages 18+)': ['Engineering', 'Computer Science', 'Business', 'Medicine', 'Law', 'Psychology', 'Economics'],
      'College': ['Digital Literacy', 'Financial Planning', 'Career Change', 'Language Learning'],
      'TAFE / Community College': ['Leadership', 'Project Management', 'Communication Skills', 'Technical Training'],
      'Professional Development': ['Leadership', 'Project Management', 'Communication Skills', 'Technical Training']
    };
    return suggestions[level] || [];
  };

  const getObjectiveSuggestions = (subject: string) => {
    const suggestions: { [key: string]: string[] } = {
      'Mathematics': ['Solve algebraic equations', 'Understand geometry concepts', 'Master calculus fundamentals'],
      'English': ['Improve writing skills', 'Analyze literature', 'Enhance vocabulary'],
      'Science': ['Understand scientific method', 'Learn lab safety', 'Explore physics concepts'],
      'Computer Science': ['Learn programming basics', 'Understand algorithms', 'Master data structures'],
      'Business': ['Develop business plans', 'Understand marketing', 'Learn financial analysis'],
      'Leadership': ['Develop team management', 'Improve decision making', 'Enhance communication']
    };
    return suggestions[subject] || ['Master key concepts', 'Apply practical skills', 'Build confidence'];
  };

  const supportLevels = [
    'Beginner - New to this subject',
    'Intermediate - Some knowledge',
    'Advanced - Strong foundation',
    'Expert - Looking to refine skills'
  ];

  const sessionTypes = [
    'Interactive Q&A',
    'Practice Problems',
    'Concept Explanation',
    'Real-world Examples',
    'Step-by-step Guidance'
  ];

  const durations = [
    'No time limit (free flow)',
    '15 minutes - Quick review',
    '30 minutes - Standard lesson',
    '45 minutes - In-depth study',
    '60 minutes - Comprehensive session'
  ];

  const handleMultiSelect = (field: string, value: string) => {
    const current = formData[field] || [];
    const updated = current.includes(value)
      ? current.filter((item: string) => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const handleSuggestionClick = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  switch (currentStep) {
    case 1:
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">What level are you teaching?</h3>
          <p className="text-gray-600">This helps me create age-appropriate content and teaching methods.</p>
          
          <div className="grid grid-cols-1 gap-3">
            {educationalLevels.map((level) => (
              <button
                key={level}
                onClick={() => setFormData({ ...formData, educationalLevel: level })}
                className={`p-4 text-left rounded-lg border-2 transition-all ${
                  formData.educationalLevel === level
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{level}</span>
              </button>
            ))}
          </div>
        </div>
      );



    case 3:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Describe your learner</h3>
            <p className="text-gray-600 mb-4">Who is this training for?</p>
            <textarea
              value={formData.audience || ''}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              placeholder="e.g., High school students, university graduates, working professionals, beginners in the field"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
            {formData.educationalLevel && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  💡 For {formData.educationalLevel}, consider the typical background and experience level of your students.
                </p>
              </div>
            )}
          </div>
        </div>
      );




    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Ready to create your personalized educational lesson!</p>
        </div>
      );
  }
};

export default EducationalStepRenderer;
