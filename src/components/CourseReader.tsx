import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Play, Pause, Volume2, VolumeX, CheckCircle, Circle, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourseReaderProps {
  course: any;
  user: any;
  onBack: () => void;
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
  hasQuiz?: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const CourseReader: React.FC<CourseReaderProps> = ({ course, user, onBack }) => {
  const [courseContent, setCourseContent] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSubsectionIndex, setCurrentSubsectionIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['section-1']));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState<{ [key: string]: number }>({});
  const [quizResults, setQuizResults] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    generateCourseContent();
  }, [course]);

  const generateCourseContent = async () => {
    try {
      setLoading(true);
      
      const response = await supabase.functions.invoke('generate-course-content', {
        body: { course }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.courseContent?.sections) {
        setCourseContent(response.data.courseContent.sections);
      } else {
        throw new Error('Invalid course content structure');
      }
    } catch (error) {
      console.error('Error generating course content:', error);
      toast({
        title: "Error",
        description: "Failed to load course content. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to basic structure
      setCourseContent([
        {
          id: "section-1",
          title: "Introduction",
          description: "Course overview",
          subsections: [
            {
              id: "subsection-1-1",
              title: "Welcome",
              content: `<h2>Welcome to ${course.course_title}</h2><p>This course will help you master the concepts and skills needed for success.</p>`
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateQuizQuestions = (sectionId: string, subsectionId: string): QuizQuestion[] => {
    const currentSection = courseContent[currentSectionIndex];
    const currentSubsection = currentSection?.subsections[currentSubsectionIndex];
    
    return [
      {
        id: 'q1',
        question: `What is the main focus of "${currentSubsection?.title}"?`,
        options: [
          'Understanding basic concepts',
          'Advanced implementation',
          'Historical background',
          'Future predictions'
        ],
        correctAnswer: 0
      },
      {
        id: 'q2',
        question: 'Which approach is most effective for learning?',
        options: [
          'Memorizing facts only',
          'Practical application and understanding',
          'Skipping difficult topics',
          'Reading without practice'
        ],
        correctAnswer: 1
      },
      {
        id: 'q3',
        question: 'What should you do when facing challenges?',
        options: [
          'Give up immediately',
          'Skip to easier topics',
          'Take time to understand and practice',
          'Ignore the difficulty'
        ],
        correctAnswer: 2
      }
    ];
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

  const navigateToSection = (sectionIndex: number, subsectionIndex: number = 0) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentSubsectionIndex(subsectionIndex);
    setShowQuiz(false);
    
    // Auto-expand the selected section
    const section = courseContent[sectionIndex];
    if (section) {
      const newExpanded = new Set(expandedSections);
      newExpanded.add(section.id);
      setExpandedSections(newExpanded);
    }
  };

  const navigateNext = () => {
    const currentSection = courseContent[currentSectionIndex];
    
    if (currentSection?.subsections && currentSubsectionIndex < currentSection.subsections.length - 1) {
      setCurrentSubsectionIndex(currentSubsectionIndex + 1);
    } else if (currentSectionIndex < courseContent.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentSubsectionIndex(0);
    }
    setShowQuiz(false);
  };

  const navigatePrevious = () => {
    if (showQuiz) {
      setShowQuiz(false);
      return;
    }
    
    if (currentSubsectionIndex > 0) {
      setCurrentSubsectionIndex(currentSubsectionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = courseContent[currentSectionIndex - 1];
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentSubsectionIndex(prevSection.subsections ? prevSection.subsections.length - 1 : 0);
    }
  };

  const markAsCompleted = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
    
    // Update progress
    const totalItems = courseContent.reduce((total, section) => {
      return total + (section.subsections ? section.subsections.length : 1);
    }, 0);
    const completedCount = newCompleted.size;
    setProgress(Math.round((completedCount / totalItems) * 100));
  };

  const getCurrentContent = () => {
    const currentSection = courseContent[currentSectionIndex];
    if (currentSection?.subsections && currentSection.subsections[currentSubsectionIndex]) {
      return {
        title: currentSection.subsections[currentSubsectionIndex].title,
        content: currentSection.subsections[currentSubsectionIndex].content,
        hasQuiz: currentSection.subsections[currentSubsectionIndex].hasQuiz
      };
    }
    return {
      title: currentSection?.title || 'Loading...',
      content: currentSection?.subsections?.[0]?.content || '<p>Loading content...</p>',
      hasQuiz: false
    };
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setCurrentQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const submitQuiz = () => {
    const questions = generateQuizQuestions(currentSectionIndex.toString(), currentSubsectionIndex.toString());
    const results: { [key: string]: boolean } = {};
    
    questions.forEach(question => {
      const userAnswer = currentQuizAnswers[question.id];
      results[question.id] = userAnswer === question.correctAnswer;
    });
    
    setQuizResults(results);
    
    // Mark current item as completed if quiz passed
    const passedQuiz = Object.values(results).filter(Boolean).length >= Math.ceil(questions.length * 0.7);
    if (passedQuiz) {
      const currentSection = courseContent[currentSectionIndex];
      const itemId = currentSection?.subsections 
        ? currentSection.subsections[currentSubsectionIndex].id
        : currentSection?.id;
      if (itemId) {
        markAsCompleted(itemId);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Generating course content...</div>
        </div>
      </div>
    );
  }

  const currentContent = getCurrentContent();

  const canNavigatePrevious = currentSectionIndex > 0 || currentSubsectionIndex > 0 || showQuiz;
  const canNavigateNext = currentSectionIndex < courseContent.length - 1 || 
    (courseContent[currentSectionIndex]?.subsections && 
     currentSubsectionIndex < courseContent[currentSectionIndex].subsections.length - 1);

  if (showQuiz) {
    const questions = generateQuizQuestions(currentSectionIndex.toString(), currentSubsectionIndex.toString());
    const hasResults = Object.keys(quizResults).length > 0;
    
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-3"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Course landing page
            </button>
            <h2 className="font-semibold text-gray-900 text-sm">{course.course_title}</h2>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Quiz in Progress</h3>
              <p className="text-sm text-blue-700">
                {currentContent.title} - Knowledge Check
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-h-[600px]">
                <div className="p-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Knowledge Check: {currentContent.title}
                  </h1>
                  
                  {!hasResults ? (
                    <div className="space-y-6">
                      {questions.map((question, index) => (
                        <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {index + 1}. {question.question}
                          </h3>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={optionIndex}
                                  checked={currentQuizAnswers[question.id] === optionIndex}
                                  onChange={() => handleQuizAnswer(question.id, optionIndex)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-6">
                        <Button
                          onClick={submitQuiz}
                          disabled={Object.keys(currentQuizAnswers).length < questions.length}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Submit Quiz
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">Quiz Results</h3>
                        <p className="text-green-700">
                          You scored {Object.values(quizResults).filter(Boolean).length} out of {questions.length}
                        </p>
                      </div>
                      
                      {questions.map((question, index) => {
                        const userAnswer = currentQuizAnswers[question.id];
                        const isCorrect = quizResults[question.id];
                        
                        return (
                          <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              {index + 1}. {question.question}
                            </h3>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => {
                                const isUserAnswer = userAnswer === optionIndex;
                                const isCorrectAnswer = optionIndex === question.correctAnswer;
                                
                                let className = "flex items-center space-x-3 p-2 rounded";
                                if (isCorrectAnswer) {
                                  className += " bg-green-100 border border-green-300";
                                } else if (isUserAnswer && !isCorrect) {
                                  className += " bg-red-100 border border-red-300";
                                }
                                
                                return (
                                  <div key={optionIndex} className={className}>
                                    <div className="w-4 h-4 flex items-center justify-center">
                                      {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                                      {isUserAnswer && !isCorrect && <Circle className="h-4 w-4 text-red-600" />}
                                    </div>
                                    <span className="text-gray-700">{option}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="pt-6">
                        <Button
                          onClick={() => {
                            setShowQuiz(false);
                            setCurrentQuizAnswers({});
                            setQuizResults({});
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Continue Learning
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-800 text-white">
          <button
            onClick={onBack}
            className="flex items-center text-gray-300 hover:text-white mb-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Course landing page
          </button>
          <div className="bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-300">{progress}%</p>
        </div>

        {/* Course Navigation */}
        <div className="flex-1 overflow-y-auto">
          {courseContent.map((section, sectionIndex) => (
            <div key={section.id} className="border-b border-gray-100">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 ${
                    sectionIndex === currentSectionIndex ? 'bg-blue-600' : 'bg-gray-400'
                  }`}>
                    {sectionIndex + 1}
                  </div>
                  <span className={`text-sm ${sectionIndex === currentSectionIndex ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {section.title}
                  </span>
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {expandedSections.has(section.id) && section.subsections && (
                <div className="bg-gray-50">
                  {section.subsections.map((subsection, subsectionIndex) => (
                    <button
                      key={subsection.id}
                      onClick={() => navigateToSection(sectionIndex, subsectionIndex)}
                      className={`w-full flex items-center p-3 pl-12 text-left hover:bg-gray-100 ${
                        sectionIndex === currentSectionIndex && subsectionIndex === currentSubsectionIndex
                          ? 'bg-blue-900 text-white'
                          : ''
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsCompleted(subsection.id);
                        }}
                        className="mr-3"
                      >
                        {completedItems.has(subsection.id) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <span className={`text-sm flex-1 ${
                        sectionIndex === currentSectionIndex && subsectionIndex === currentSubsectionIndex
                          ? 'font-medium text-white'
                          : 'text-gray-600'
                      }`}>
                        {subsection.title}
                      </span>
                      {subsection.hasQuiz && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">
                          Quiz
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Audio Player Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="text-sm">0:00 / 1:00</span>
              </Button>
              
              <div className="flex-1 max-w-md">
                <div className="bg-gray-200 rounded-full h-1">
                  <div className="bg-blue-600 h-1 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Read Audio</span>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            {/* PDF-style Content Box */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-h-[600px]">
              <div className="p-8">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentContent.content }}
                />
                
                {/* Quiz Button */}
                {currentContent.hasQuiz && (
                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Knowledge Check Available</h3>
                    <p className="text-yellow-700 text-sm mb-4">
                      Test your understanding of this section with a quick quiz.
                    </p>
                    <Button
                      onClick={() => setShowQuiz(true)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Take Quiz
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={navigatePrevious}
                disabled={!canNavigatePrevious}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="text-sm text-gray-500">
                Section {currentSectionIndex + 1} of {courseContent.length}
              </div>

              <Button
                onClick={navigateNext}
                disabled={!canNavigateNext}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseReader;