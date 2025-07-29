import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Play, Pause, Volume2, VolumeX, CheckCircle, Circle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourseReaderProps {
  course: any;
  user: any;
  onBack: () => void;
}

interface CourseSection {
  id: string;
  title: string;
  content: string;
  subsections?: CourseSubsection[];
  completed?: boolean;
}

interface CourseSubsection {
  id: string;
  title: string;
  content: string;
  completed?: boolean;
}

const CourseReader: React.FC<CourseReaderProps> = ({ course, user, onBack }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSubsectionIndex, setCurrentSubsectionIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['0']));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Generate course structure from course plan
  const generateCourseStructure = (): CourseSection[] => {
    const coursePlan = course.course_plan;
    
    if (course.track_type === 'Corporate') {
      return [
        {
          id: '0',
          title: 'Introduction',
          content: `
            <h1>Welcome to ${course.course_title}</h1>
            <p>Welcome aboard, aspiring professionals! We're thrilled to have you joining us for this exciting journey into ${coursePlan?.goal || 'professional development'}.</p>
            
            <h2>What You'll Learn</h2>
            <p>In this course, we've laid out key objectives that will help you grasp the fundamentals of ${coursePlan?.goal || 'your field'}:</p>
            
            <ul>
              <li><strong>Understanding Core Concepts:</strong> Learn the essential principles and frameworks.</li>
              <li><strong>Practical Application:</strong> Gain skills to apply knowledge in real-world scenarios.</li>
              <li><strong>Best Practices:</strong> Discover industry standards and proven methodologies.</li>
              <li><strong>Professional Growth:</strong> Develop competencies for career advancement.</li>
            </ul>
            
            <h2>Course Navigation</h2>
            <p>You can easily navigate through the course by clicking the left and right arrows or use the menu on the left to move to specific sections.</p>
            
            <h2>Learning Approach</h2>
            <p>Throughout this course, you will be challenged with practical scenarios and real-world applications to reinforce your learning.</p>
            
            <p>Take your time, engage with the content, and remember to apply what you learn in your daily work.</p>
            
            <p>Enjoy your professional development journey!</p>
          `,
          subsections: [
            {
              id: '0-0',
              title: 'Welcome',
              content: 'Course introduction and overview'
            }
          ]
        },
        {
          id: '1',
          title: `Understanding ${coursePlan?.industry || 'Your Industry'}`,
          content: `
            <h1>Understanding ${coursePlan?.industry || 'Your Industry'}</h1>
            <p>In this section, we'll explore the fundamental concepts and principles that drive success in ${coursePlan?.industry || 'your industry'}.</p>
            
            <h2>Industry Overview</h2>
            <p>The ${coursePlan?.industry || 'industry'} landscape is constantly evolving, and understanding its core dynamics is essential for professional success.</p>
            
            <h2>Key Concepts</h2>
            <ul>
              <li>Market dynamics and trends</li>
              <li>Stakeholder relationships</li>
              <li>Regulatory environment</li>
              <li>Technology impact</li>
            </ul>
            
            <h2>Success Factors</h2>
            <p>To excel in ${coursePlan?.industry || 'this field'}, professionals must develop a comprehensive understanding of both technical and soft skills.</p>
          `,
          subsections: [
            {
              id: '1-0',
              title: 'Industry Basics',
              content: 'Fundamental concepts and terminology'
            },
            {
              id: '1-1',
              title: 'Market Dynamics',
              content: 'Understanding market forces and trends'
            },
            {
              id: '1-2',
              title: 'Key Players',
              content: 'Important stakeholders and their roles'
            }
          ]
        },
        {
          id: '2',
          title: `${coursePlan?.goal || 'Professional Skills'} Development`,
          content: `
            <h1>${coursePlan?.goal || 'Professional Skills'} Development</h1>
            <p>This section focuses on developing the specific skills needed to achieve your goal of ${coursePlan?.goal || 'professional excellence'}.</p>
            
            <h2>Core Competencies</h2>
            <p>We'll cover the essential competencies that every professional should master:</p>
            
            <ul>
              <li><strong>Communication Skills:</strong> Effective verbal and written communication</li>
              <li><strong>Problem Solving:</strong> Analytical thinking and solution development</li>
              <li><strong>Leadership:</strong> Influencing and guiding others</li>
              <li><strong>Adaptability:</strong> Thriving in changing environments</li>
            </ul>
            
            <h2>Practical Applications</h2>
            <p>Each skill will be demonstrated through real-world scenarios and case studies relevant to ${coursePlan?.industry || 'your industry'}.</p>
            
            <h2>Assessment and Growth</h2>
            <p>Regular self-assessment opportunities will help you track your progress and identify areas for continued development.</p>
          `,
          subsections: [
            {
              id: '2-0',
              title: 'Communication Excellence',
              content: 'Mastering professional communication'
            },
            {
              id: '2-1',
              title: 'Problem-Solving Framework',
              content: 'Structured approach to challenges'
            },
            {
              id: '2-2',
              title: 'Leadership Fundamentals',
              content: 'Building influence and impact'
            }
          ]
        },
        {
          id: '3',
          title: 'Practical Implementation',
          content: `
            <h1>Practical Implementation</h1>
            <p>Now that you've learned the fundamentals, it's time to put your knowledge into practice.</p>
            
            <h2>Real-World Scenarios</h2>
            <p>We'll explore common situations you'll encounter in ${coursePlan?.industry || 'your field'} and how to handle them effectively.</p>
            
            <h2>Best Practices</h2>
            <ul>
              <li>Industry-standard approaches</li>
              <li>Proven methodologies</li>
              <li>Common pitfalls to avoid</li>
              <li>Success metrics and KPIs</li>
            </ul>
            
            <h2>Action Planning</h2>
            <p>Develop a personalized action plan to implement what you've learned in your current role.</p>
            
            <h2>Continuous Improvement</h2>
            <p>Learn how to maintain and enhance your skills through ongoing practice and professional development.</p>
          `,
          subsections: [
            {
              id: '3-0',
              title: 'Case Studies',
              content: 'Real-world examples and analysis'
            },
            {
              id: '3-1',
              title: 'Implementation Strategy',
              content: 'Step-by-step implementation guide'
            },
            {
              id: '3-2',
              title: 'Success Metrics',
              content: 'Measuring and tracking progress'
            }
          ]
        }
      ];
    } else {
      // Educational track structure
      return [
        {
          id: '0',
          title: 'Introduction',
          content: `
            <h1>Welcome to ${course.course_title}</h1>
            <p>Hi there! Welcome to this exciting learning adventure about ${coursePlan?.subject || 'your subject'}.</p>
            
            <h2>What You'll Learn</h2>
            <p>In this course, we'll explore ${coursePlan?.objective || 'key concepts'} through engaging activities and examples:</p>
            
            <ul>
              <li><strong>Core Understanding:</strong> Master the fundamental concepts</li>
              <li><strong>Practical Skills:</strong> Apply what you learn through exercises</li>
              <li><strong>Critical Thinking:</strong> Develop analytical and reasoning skills</li>
              <li><strong>Real-World Connections:</strong> See how concepts apply in everyday life</li>
            </ul>
            
            <h2>How to Use This Course</h2>
            <p>Navigate through the sections using the menu on the left. Take your time with each topic and don't hesitate to revisit sections as needed.</p>
            
            <h2>Learning Tips</h2>
            <p>Remember to:</p>
            <ul>
              <li>Take notes as you read</li>
              <li>Think about how concepts connect</li>
              <li>Ask questions when something isn't clear</li>
              <li>Practice what you learn</li>
            </ul>
            
            <p>Let's begin this learning journey together!</p>
          `,
          subsections: [
            {
              id: '0-0',
              title: 'Course Overview',
              content: 'Introduction to the subject and learning objectives'
            }
          ]
        },
        {
          id: '1',
          title: `${coursePlan?.subject || 'Subject'} Fundamentals`,
          content: `
            <h1>${coursePlan?.subject || 'Subject'} Fundamentals</h1>
            <p>Let's start with the basics! Understanding the fundamentals is crucial for building a strong foundation in ${coursePlan?.subject || 'this subject'}.</p>
            
            <h2>Key Concepts</h2>
            <p>We'll cover the essential building blocks that form the foundation of ${coursePlan?.subject || 'this subject'}:</p>
            
            <ul>
              <li>Basic terminology and definitions</li>
              <li>Core principles and rules</li>
              <li>Historical context and development</li>
              <li>Modern applications and relevance</li>
            </ul>
            
            <h2>Why This Matters</h2>
            <p>Understanding these fundamentals will help you:</p>
            <ul>
              <li>Build confidence in the subject</li>
              <li>Connect new concepts to what you already know</li>
              <li>Solve problems more effectively</li>
              <li>Communicate ideas clearly</li>
            </ul>
            
            <h2>Learning Approach</h2>
            <p>We'll use examples, visual aids, and step-by-step explanations to make these concepts clear and memorable.</p>
          `,
          subsections: [
            {
              id: '1-0',
              title: 'Basic Concepts',
              content: 'Essential terminology and definitions'
            },
            {
              id: '1-1',
              title: 'Core Principles',
              content: 'Fundamental rules and guidelines'
            },
            {
              id: '1-2',
              title: 'Historical Context',
              content: 'How the subject developed over time'
            }
          ]
        },
        {
          id: '2',
          title: 'Practical Applications',
          content: `
            <h1>Practical Applications</h1>
            <p>Now that you understand the basics, let's see how ${coursePlan?.subject || 'this subject'} applies in real situations!</p>
            
            <h2>Real-World Examples</h2>
            <p>We'll explore how the concepts you've learned show up in everyday life and various fields:</p>
            
            <ul>
              <li>Common scenarios and situations</li>
              <li>Problem-solving strategies</li>
              <li>Step-by-step solutions</li>
              <li>Tips and tricks for success</li>
            </ul>
            
            <h2>Practice Opportunities</h2>
            <p>Learning by doing is one of the best ways to master any subject. You'll have chances to:</p>
            <ul>
              <li>Work through guided examples</li>
              <li>Solve practice problems</li>
              <li>Apply concepts to new situations</li>
              <li>Check your understanding</li>
            </ul>
            
            <h2>Building Confidence</h2>
            <p>With practice comes confidence. Each example and exercise is designed to help you feel more comfortable with the material.</p>
          `,
          subsections: [
            {
              id: '2-0',
              title: 'Guided Examples',
              content: 'Step-by-step worked examples'
            },
            {
              id: '2-1',
              title: 'Practice Problems',
              content: 'Exercises to test your understanding'
            },
            {
              id: '2-2',
              title: 'Real-World Connections',
              content: 'How concepts apply in daily life'
            }
          ]
        },
        {
          id: '3',
          title: 'Advanced Topics',
          content: `
            <h1>Advanced Topics</h1>
            <p>Ready for the next level? Let's explore more complex aspects of ${coursePlan?.subject || 'this subject'}!</p>
            
            <h2>Building on Basics</h2>
            <p>These advanced topics build directly on what you've already learned:</p>
            
            <ul>
              <li>Complex problem-solving techniques</li>
              <li>Advanced applications and use cases</li>
              <li>Integration with other subjects</li>
              <li>Current research and developments</li>
            </ul>
            
            <h2>Challenge Yourself</h2>
            <p>Don't worry if these topics seem challenging at first - that's normal! Remember:</p>
            <ul>
              <li>Take your time to understand each concept</li>
              <li>Review earlier sections if needed</li>
              <li>Practice with different examples</li>
              <li>Ask questions when you're stuck</li>
            </ul>
            
            <h2>Future Learning</h2>
            <p>These advanced concepts will prepare you for even more sophisticated topics and help you become truly proficient in ${coursePlan?.subject || 'this subject'}.</p>
          `,
          subsections: [
            {
              id: '3-0',
              title: 'Complex Concepts',
              content: 'Advanced theories and principles'
            },
            {
              id: '3-1',
              title: 'Integration Skills',
              content: 'Connecting multiple concepts'
            },
            {
              id: '3-2',
              title: 'Future Directions',
              content: 'Where to go from here'
            }
          ]
        }
      ];
    }
  };

  const [courseStructure] = useState<CourseSection[]>(generateCourseStructure());

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
    
    // Auto-expand the selected section
    const newExpanded = new Set(expandedSections);
    newExpanded.add(sectionIndex.toString());
    setExpandedSections(newExpanded);
  };

  const navigateNext = () => {
    const currentSection = courseStructure[currentSectionIndex];
    
    if (currentSection.subsections && currentSubsectionIndex < currentSection.subsections.length - 1) {
      setCurrentSubsectionIndex(currentSubsectionIndex + 1);
    } else if (currentSectionIndex < courseStructure.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentSubsectionIndex(0);
    }
  };

  const navigatePrevious = () => {
    if (currentSubsectionIndex > 0) {
      setCurrentSubsectionIndex(currentSubsectionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = courseStructure[currentSectionIndex - 1];
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
  };

  const getCurrentContent = () => {
    const currentSection = courseStructure[currentSectionIndex];
    if (currentSection.subsections && currentSection.subsections[currentSubsectionIndex]) {
      return {
        title: currentSection.subsections[currentSubsectionIndex].title,
        content: currentSection.content
      };
    }
    return {
      title: currentSection.title,
      content: currentSection.content
    };
  };

  const currentContent = getCurrentContent();

  const canNavigatePrevious = currentSectionIndex > 0 || currentSubsectionIndex > 0;
  const canNavigateNext = currentSectionIndex < courseStructure.length - 1 || 
    (courseStructure[currentSectionIndex].subsections && 
     currentSubsectionIndex < courseStructure[currentSectionIndex].subsections.length - 1);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
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
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}%</p>
        </div>

        {/* Course Navigation */}
        <div className="flex-1 overflow-y-auto">
          {courseStructure.map((section, sectionIndex) => (
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
                          ? 'bg-blue-50 border-r-2 border-blue-600'
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
                      <span className={`text-sm ${
                        sectionIndex === currentSectionIndex && subsectionIndex === currentSubsectionIndex
                          ? 'font-medium text-blue-900'
                          : 'text-gray-600'
                      }`}>
                        {subsection.title}
                      </span>
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
            
            <div className="text-sm text-gray-500">
              Read Audio
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
                Section {currentSectionIndex + 1} of {courseStructure.length}
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