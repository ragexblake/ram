import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Play, Pause, Volume2, VolumeX, CheckCircle, Circle, ArrowLeft, MoreHorizontal, Edit, Plus, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingSubsection, setEditingSubsection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCourseContent();
  }, [course]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      
      // First check if course already has generated content
      if (course.course_plan?.courseContent) {
        console.log('Loading existing course content from database');
        setCourseContent(course.course_plan.courseContent);
        setLoading(false);
        return;
      }
      
      // If no existing content, generate new content
      console.log('Generating new course content');
      const response = await supabase.functions.invoke('generate-course-content', {
        body: { course }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.courseContent?.sections) {
        const generatedContent = response.data.courseContent.sections;
        setCourseContent(generatedContent);
        
        // Save the generated content to database for future use
        saveCourseContentToDatabase(generatedContent);
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

  const handleEditSubsection = (subsection: CourseSubsection) => {
    setEditingSubsection(subsection.id);
    setEditTitle(subsection.title);
    setEditContent(subsection.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setCourseContent(prev => prev.map(section => ({
      ...section,
      subsections: section.subsections.map(sub => 
        sub.id === editingSubsection 
          ? { ...sub, title: editTitle, content: editContent }
          : sub
      )
    })));
    
    setIsEditing(false);
    setEditingSubsection(null);
    setEditTitle('');
    setEditContent('');
    
    toast({
      title: "Content Updated",
      description: "The course content has been updated successfully.",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSubsection(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleDeleteSubsection = (sectionIndex: number, subsectionIndex: number) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      setCourseContent(prev => prev.map((section, sIdx) => 
        sIdx === sectionIndex 
          ? {
              ...section,
              subsections: section.subsections.filter((_, subIdx) => subIdx !== subsectionIndex)
            }
          : section
      ));
      
      toast({
        title: "Topic Deleted",
        description: "The topic has been removed from the course.",
      });
    }
  };

  const handleAddTopic = () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for the new topic.",
        variant: "destructive",
      });
      return;
    }

    const newSubsection: CourseSubsection = {
      id: `subsection-${Date.now()}`,
      title: newTopicTitle.trim(),
      content: newTopicContent.trim(),
      hasQuiz: false
    };

    setCourseContent(prev => prev.map((section, sIdx) => 
      sIdx === currentSectionIndex 
        ? {
            ...section,
            subsections: [...section.subsections, newSubsection]
          }
        : section
    ));

    setShowAddTopic(false);
    setNewTopicTitle('');
    setNewTopicContent('');
    
    toast({
      title: "Topic Added",
      description: "New topic has been added to the course.",
    });
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
            
            {/* Course Editing Options */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Course Management</h4>
              <div className="space-y-2">
                <Button
                  onClick={() => setShowAddTopic(true)}
                  size="sm"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Topic</span>
                </Button>
              </div>
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
            
            {/* Course Management Section */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-gray-800 mb-3">Course Management</h4>
              <div className="space-y-2">
                {hasUnsavedChanges && (
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white mb-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => setShowAddTopic(true)}
                  size="sm"
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Topic</span>
                </Button>
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
                    <div key={subsection.id} className="group">
                      <button
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
                        
                        {/* Edit and Delete buttons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSubsection(subsection);
                            }}
                            className="p-1 hover:bg-blue-100 rounded"
                            title="Edit topic"
                          >
                            <Edit className="h-3 w-3 text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubsection(sectionIndex, subsectionIndex);
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Delete topic"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </button>
                        </div>
                      </button>
                    </div>
                  ))}
                  
                  {/* Add Topic Button for current section */}
                  {sectionIndex === currentSectionIndex && (
                    <button
                      onClick={() => setShowAddTopic(true)}
                      className="w-full flex items-center justify-center p-3 text-blue-600 hover:bg-blue-50 border-t border-gray-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="text-sm">Add Topic to This Section</span>
                    </button>
                  )}
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
            {isEditing && editingSubsection ? (
              /* Edit Mode */
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-h-[600px] p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Topic</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topic Title
                      </label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Enter topic title"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content (HTML supported)
                      </label>
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Enter content with HTML formatting"
                        rows={15}
                        className="w-full font-mono text-sm"
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button onClick={handleSaveEdit} className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" className="flex items-center space-x-2">
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Reading Mode */
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-h-[600px]">
                <div className="p-8">
                  <div 
                    className="prose prose-xl max-w-none"
                    style={{
                      fontSize: '18px',
                      lineHeight: '1.7',
                      color: '#374151'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: currentContent.content
                        .replace(/<h1>/g, '<h1 style="font-size: 2.5rem; font-weight: 700; margin: 2rem 0 1.5rem 0; color: #111827; line-height: 1.2;">')
                        .replace(/<h2>/g, '<h2 style="font-size: 2rem; font-weight: 600; margin: 1.75rem 0 1rem 0; color: #1f2937; line-height: 1.3;">')
                        .replace(/<h3>/g, '<h3 style="font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 0.75rem 0; color: #374151; line-height: 1.4;">')
                        .replace(/<h4>/g, '<h4 style="font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem 0; color: #4b5563; line-height: 1.4;">')
                        .replace(/<p>/g, '<p style="margin: 1rem 0; line-height: 1.7;">')
                        .replace(/<ul>/g, '<ul style="margin: 1rem 0; padding-left: 1.5rem; line-height: 1.7;">')
                        .replace(/<ol>/g, '<ol style="margin: 1rem 0; padding-left: 1.5rem; line-height: 1.7;">')
                        .replace(/<li>/g, '<li style="margin: 0.5rem 0;">')
                        .replace(/<strong>/g, '<strong style="font-weight: 600; color: #111827;">')
                        .replace(/<em>/g, '<em style="font-style: italic; color: #4b5563;">')
                    }}
                  />
                </div>
              </div>
            )}
                
            {/* Quiz Button */}
            {!isEditing && currentContent.hasQuiz && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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

            {/* Navigation Controls */}
            {!isEditing && (
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
            )}
          </div>
        </div>
      </div>
      
      {/* Add Topic Modal */}
      {showAddTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Add New Topic</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic Title
                </label>
                <Input
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Enter topic title"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (HTML supported)
                </label>
                <Textarea
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  placeholder="Enter content with HTML formatting (e.g., <h2>Heading</h2>, <p>Paragraph</p>, <ul><li>List item</li></ul>)"
                  rows={10}
                  className="w-full font-mono text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowAddTopic(false);
                    setNewTopicTitle('');
                    setNewTopicContent('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddTopic} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Topic</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseReader;