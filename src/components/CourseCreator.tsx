import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TrackSelection from './course-creator/TrackSelection';
import CourseCreationSuccess from './course-creator/CourseCreationSuccess';
import CourseCreatorSteps from './course-creator/CourseCreatorSteps';

interface CourseCreatorProps {
  userId: string;
  onCourseCreated: (course: any) => void;
}

const CourseCreator: React.FC<CourseCreatorProps> = ({ userId, onCourseCreated }) => {
  const [selectedTrack, setSelectedTrack] = useState<'Corporate' | 'Educational' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [courseCreated, setCourseCreated] = useState(false);
  const [createdCourse, setCreatedCourse] = useState<any>(null);
  const { toast } = useToast();

  const createCourse = async () => {
    setLoading(true);
    try {
      const courseTitle = selectedTrack === 'Corporate' 
        ? `${formData.industry} Training: ${formData.goal}`
        : `${formData.subject} Lesson: ${formData.objective}`;

      // Set the correct tutor persona based on track type
      const tutorPersona = selectedTrack === 'Corporate' ? 'Nia' : 'Leo';
      
      // Add tutorPersona to the course plan
      const enhancedFormData = {
        ...formData,
        tutorPersona: tutorPersona
      };

      console.log('Creating course with tutor persona:', tutorPersona);
      console.log('Track type:', selectedTrack);
      console.log('Enhanced form data:', enhancedFormData);

      // Simplified system prompt - detailed prompts handled at runtime
      const systemPrompt = `This is a placeholder prompt for a course on ${selectedTrack === 'Corporate' ? formData.goal : formData.objective}. The detailed, structured prompt will be generated at runtime.`;

      const { data: courseData, error } = await supabase
        .from('courses')
        .insert({
          creator_id: userId,
          course_title: courseTitle,
          course_plan: enhancedFormData,
          system_prompt: systemPrompt,
          track_type: selectedTrack,
          status: 'drafted'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Course created successfully:', courseData);
      setCreatedCourse(courseData);
      setCourseCreated(true);

      toast({
        title: "Course Created!",
        description: "Your course has been created as a draft. You can test it and publish it when ready.",
      });

    } catch (error: any) {
      console.error('Course creation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const startCourse = () => {
    if (createdCourse) {
      onCourseCreated(createdCourse);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setSelectedTrack(null);
      setFormData({});
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  // Course creation success screen
  if (courseCreated && createdCourse) {
    return (
      <CourseCreationSuccess
        course={createdCourse}
        selectedTrack={selectedTrack!}
        onStartCourse={startCourse}
      />
    );
  }

  // Track selection screen
  if (!selectedTrack) {
    return <TrackSelection onTrackSelect={setSelectedTrack} />;
  }

  // Course creation steps
  return (
    <CourseCreatorSteps
      selectedTrack={selectedTrack}
      currentStep={currentStep}
      formData={formData}
      setFormData={setFormData}
      setCurrentStep={setCurrentStep}
      onBack={handleBack}
      onCreateCourse={createCourse}
      loading={loading}
    />
  );
};

export default CourseCreator;
