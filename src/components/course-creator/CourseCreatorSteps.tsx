
import React from 'react';
import { Building2, GraduationCap, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import CorporateStepRenderer from './CorporateStepRenderer';
import EducationalStepRenderer from './EducationalStepRenderer';

interface CourseCreatorStepsProps {
  selectedTrack: 'Corporate' | 'Educational';
  currentStep: number;
  formData: any;
  setFormData: (data: any) => void;
  setCurrentStep: (step: number) => void;
  onBack: () => void;
  onCreateCourse: () => void;
  loading: boolean;
}

const CourseCreatorSteps: React.FC<CourseCreatorStepsProps> = ({
  selectedTrack,
  currentStep,
  formData,
  setFormData,
  setCurrentStep,
  onBack,
  onCreateCourse,
  loading
}) => {
  const maxSteps = 7; // Both Corporate and Educational now have 7 steps

  const canProceed = () => {
    if (selectedTrack === 'Corporate') {
      switch (currentStep) {
        case 1: return formData.industry;
        case 2: return formData.goal;
        case 3: return formData.audience;
        case 4: return formData.skillLevel;
        case 5: return formData.deliveryStyle && formData.deliveryStyle.length > 0;
        case 6: return formData.duration;
        case 7: return true; // Optional step
        default: return false;
      }
    } else {
      switch (currentStep) {
        case 1: return formData.educationalLevel;
        case 2: return formData.subject;
        case 3: return formData.objective;
        case 4: return formData.supportLevel;
        case 5: return formData.sessionType && formData.sessionType.length > 0;
        case 6: return formData.duration;
        case 7: return true; // Optional step
        default: return false;
      }
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          {selectedTrack === 'Corporate' ? <Building2 className="h-6 w-6 text-green-500" /> : <GraduationCap className="h-6 w-6 text-green-500" />}
          <h2 className="text-2xl font-bold">Let's Build Your {selectedTrack} Course</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          I'll guide you through a few quick questions to create the perfect learning experience.
        </p>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {maxSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / maxSteps) * 100)}%</span>
          </div>
          <Progress value={(currentStep / maxSteps) * 100} className="h-2" />
        </div>
      </div>

      <div className="bg-white rounded-lg p-8 shadow-sm border">
        {selectedTrack === 'Corporate' ? (
          <CorporateStepRenderer 
            currentStep={currentStep} 
            formData={formData} 
            setFormData={setFormData} 
          />
        ) : (
          <EducationalStepRenderer 
            currentStep={currentStep} 
            formData={formData} 
            setFormData={setFormData} 
          />
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Back
        </button>

        {currentStep < maxSteps ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onCreateCourse}
            disabled={loading}
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating Your Course...' : 'Create Course'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCreatorSteps;
