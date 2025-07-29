
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

interface ContentRendererProps {
  activeTab: string;
  profile: any;
  user: any;
  onStartSession: (course: any) => void;
  onCourseCreated: () => void;
  currentSession: any;
  onSessionPerformanceComplete: () => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  activeTab,
  profile,
  user,
  onStartSession,
  onCourseCreated,
  currentSession,
  onSessionPerformanceComplete
}) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={profile} onStartSession={onStartSession} />;
      
      case 'courses':
        return <AdminCoursesView user={profile} onStartSession={onStartSession} />;
      
      case 'course-creator':
        return <CourseCreator userId={profile?.id} onCourseCreated={onCourseCreated} />;
      
      case 'my-courses':
        return <CoursesView user={profile} onStartSession={onStartSession} />;
      
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
