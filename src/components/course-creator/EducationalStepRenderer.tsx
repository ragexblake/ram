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

    case 2:
      const subjectSuggestions = getSubjectSuggestions(formData.educationalLevel || '');
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">What subject are you teaching?</h3>
          <p className="text-gray-600">Tell me the main subject or topic for this lesson.</p>
          
          {subjectSuggestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Popular subjects for {formData.educationalLevel}:</p>
              <div className="flex flex-wrap gap-2">
                {subjectSuggestions.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => handleSuggestionClick('subject', subject)}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <input
            type="text"
            value={formData.subject || ''}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Enter subject (e.g., Mathematics, History, Science)"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      );

    case 3:
      const objectiveSuggestions = getObjectiveSuggestions(formData.subject || '');
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">What's the main learning objective?</h3>
          <p className="text-gray-600">What specific skill or knowledge should students gain from this lesson?</p>
          
          {objectiveSuggestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Common objectives for {formData.subject}:</p>
              <div className="flex flex-wrap gap-2">
                {objectiveSuggestions.map((objective) => (
                  <button
                    key={objective}
                    onClick={() => handleSuggestionClick('objective', objective)}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                  >
                    {objective}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <textarea
            value={formData.objective || ''}
            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            placeholder="Describe what students should learn or be able to do"
            rows={4}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">What's the student's current level?</h3>
          <p className="text-gray-600">This helps me provide the right level of support and explanation.</p>
          
          <div className="grid grid-cols-1 gap-3">
            {supportLevels.map((level) => (
              <button
                key={level}
                onClick={() => setFormData({ ...formData, supportLevel: level })}
                className={`p-4 text-left rounded-lg border-2 transition-all ${
                  formData.supportLevel === level
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{level.split(' - ')[0]}</span>
                <p className="text-sm text-gray-600 mt-1">{level.split(' - ')[1]}</p>
              </button>
            ))}
          </div>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">How should I teach this lesson?</h3>
          <p className="text-gray-600">Choose the teaching methods that work best for your students. (Select multiple)</p>
          
          <div className="grid grid-cols-1 gap-3">
            {sessionTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleMultiSelect('sessionType', type)}
                className={`p-4 text-left rounded-lg border-2 transition-all ${
                  formData.sessionType?.includes(type)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{type}</span>
              </button>
            ))}
          </div>
          
          {formData.sessionType?.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Selected: {formData.sessionType.join(', ')}
              </p>
            </div>
          )}
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">How long should this lesson be?</h3>
          <p className="text-gray-600">Choose the ideal duration for your learning session.</p>
          
          <div className="grid grid-cols-1 gap-3">
            {durations.map((duration) => (
              <button
                key={duration}
                onClick={() => setFormData({ ...formData, duration: duration })}
                className={`p-4 text-left rounded-lg border-2 transition-all ${
                  formData.duration === duration
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{duration.split(' - ')[0]}</span>
                {duration.includes(' - ') && (
                  <p className="text-sm text-gray-600 mt-1">{duration.split(' - ')[1]}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      );

    case 7:
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Any specific challenges to address?</h3>
          <p className="text-gray-600">What difficulties do your students typically face with this topic? (Optional)</p>
          
          <textarea
            value={formData.challenges || ''}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            placeholder="e.g., Students struggle with word problems, difficulty visualizing concepts, need more practice with basics..."
            rows={4}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
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
