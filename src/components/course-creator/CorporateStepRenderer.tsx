
import React from 'react';
import { 
  corporateIndustries, 
  skillLevels, 
  deliveryStyles, 
  sessionDurations 
} from './courseCreatorData';
import { 
  getIndustryGoals, 
  getIndustryAudience, 
  getIndustryChallenges 
} from './courseCreatorUtils';

interface CorporateStepRendererProps {
  currentStep: number;
  formData: any;
  setFormData: (data: any) => void;
}

const CorporateStepRenderer: React.FC<CorporateStepRendererProps> = ({
  currentStep,
  formData,
  setFormData
}) => {
  switch (currentStep) {
    case 1:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">🧩 1. What's your industry?</h3>
            <p className="text-gray-600 mb-4">To tailor your session, which industry are you in?</p>
            <select
              value={formData.industry || ''}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select an industry</option>
              {corporateIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter your industry..."
              value={formData.customIndustry || ''}
              onChange={(e) => setFormData({ ...formData, customIndustry: e.target.value, industry: e.target.value })}
              className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">🧩 3. What's your main training goal?</h3>
            <p className="text-gray-600 mb-4">What do you want the learner to improve or achieve?</p>
            {formData.industry && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  You chose {formData.industry} — here are some popular training goals:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getIndustryGoals(formData.industry).map(goal => (
                    <button
                      key={goal}
                      onClick={() => setFormData({ ...formData, goal })}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        formData.goal === goal 
                          ? 'bg-green-500 text-white border-green-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      ☑️ {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <input
              type="text"
              placeholder="Or enter your specific goal..."
              value={formData.customGoal || ''}
              onChange={(e) => setFormData({ ...formData, customGoal: e.target.value, goal: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
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
              placeholder="e.g., Investors, traders, finance enthusiasts, business students, professionals"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
            {formData.industry && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  💡 For {formData.industry}, consider including: {getIndustryAudience(formData.industry).slice(0, 3).join(', ')}...
                </p>
              </div>
            )}
          </div>
        </div>
      );




    default:
      return null;
  }
};

export default CorporateStepRenderer;
