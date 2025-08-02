
import React from 'react';
import Dashboard from '@/components/Dashboard';
import AdminCoursesView from '@/components/AdminCoursesView';
import CourseCreator from '@/components/CourseCreator';
import CoursesView from '@/components/CoursesView';
import PeopleManagement from '@/components/PeopleManagement';
import PerformanceReports from '@/components/PerformanceReports';
import MyPerformance from '@/components/MyPerformance';
import UserProfile from '@/components/UserProfile';
import PricingPage from '@/components/PricingPage';
import AccountSettings from '@/components/AccountSettings';
import Profile from '@/components/Profile';
import HonestBox from '@/components/HonestBox';
import CourseReader from '@/components/CourseReader';
import CourseEditorPage from '@/components/course-creator/CourseEditorPage';

interface ContentRendererProps {
  activeTab: string;
  profile: any;
  user: any;
  onStartSession: (course: any) => void;
  onCourseCreated: () => void;
  currentSession: any;
  onSessionPerformanceComplete: () => void;
  onReadCourse?: (course: any) => void;
  courseReaderData?: {
    course: any;
    isReading: boolean;
  };
  onExitCourseReader?: () => void;
  courseEditorData?: {
    course: any;
    isEditing: boolean;
  };
  onExitCourseEditor?: () => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  activeTab,
  profile,
  user,
  onStartSession,
  onCourseCreated,
  currentSession,
  onSessionPerformanceComplete,
  onReadCourse,
  courseReaderData,
  onExitCourseReader,
  courseEditorData,
  onExitCourseEditor
}) => {
  // If in course reading mode, show the course reader
  if (courseReaderData?.isReading && courseReaderData.course) {
    return (
      <CourseReader
        course={courseReaderData.course}
        user={profile}
        onBack={onExitCourseReader || (() => {})}
        readOnly={activeTab === 'my-courses'}
      />
    );
  }

  // If in course editing mode, show the course editor
  if (courseEditorData?.isEditing && courseEditorData.course) {
    return (
      <CourseEditorPage
        course={courseEditorData.course}
        onBack={onExitCourseEditor || (() => {})}
        onSave={() => {
          // Refresh the courses view after saving
          if (onExitCourseEditor) {
            onExitCourseEditor();
          }
        }}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={profile} onStartSession={onStartSession} />;
      
      case 'courses':
        return <AdminCoursesView user={profile} onStartSession={onStartSession} onReadCourse={onReadCourse} onEditCourse={onEditCourse} />;
      
      case 'course-creator':
        return <CourseCreator userId={profile?.id} onCourseCreated={onCourseCreated} />;
      
      case 'my-courses':
        return <CoursesView user={profile} onStartSession={onStartSession} onReadCourse={onReadCourse} />;
      
      case 'people':
        return <PeopleManagement user={profile} />;
      
      case 'performance':
        return <PerformanceReports user={profile} />;
      
      case 'my-performance':
        return <MyPerformance user={profile} />;
      
      case 'honest-box':
        return <HonestBox />;
      
      case 'profile':
        return <Profile />;
      
      case 'upgrade':
        return <PricingPage />;
      
      case 'settings':
        // Only show Settings for Admin users
        return profile?.role === 'Admin' ? <AccountSettings /> : <Dashboard user={profile} onStartSession={onStartSession} />;
      
      default:
        return <Dashboard user={profile} onStartSession={onStartSession} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default ContentRenderer;
