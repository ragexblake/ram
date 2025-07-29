
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
            <h3 className="text-xl font-semibold mb-2">🧩 2. What's your main training goal?</h3>
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
            <h3 className="text-xl font-semibold mb-2">🧩 3. Who is the training for?</h3>
            <p className="text-gray-600 mb-4">Who's taking this training?</p>
            <div className="flex flex-wrap gap-2">
              {getIndustryAudience(formData.industry).map(audience => (
                <button
                  key={audience}
                  onClick={() => setFormData({ ...formData, audience })}
                  className={`px-4 py-2 rounded-full border ${
                    formData.audience === audience 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                  }`}
                >
                  {audience}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">🧩 4. What skill level is it for?</h3>
            <p className="text-gray-600 mb-4">Should we keep it simple, go deep, or challenge the learner?</p>
            <div className="flex flex-wrap gap-2">
              {skillLevels.map(level => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, skillLevel: level })}
                  className={`px-4 py-2 rounded-full border ${
                    formData.skillLevel === level 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">🧩 5. How should the session be delivered?</h3>
            <p className="text-gray-600 mb-4">What type of learning suits you best?</p>
            <div className="flex flex-wrap gap-2">
              {deliveryStyles.map(style => (
                <button
                  key={style}
                  onClick={() => {
                    const current = formData.deliveryStyle || [];
                    const updated = current.includes(style) 
                      ? current.filter((s: string) => s !== style)
                      : [...current, style];
                    setFormData({ ...formData, deliveryStyle: updated });
                  }}
                  className={`px-4 py-2 rounded-full border ${
                    (formData.deliveryStyle || []).includes(style)
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">🧩 6. How long should the session run?</h3>
            <p className="text-gray-600 mb-4">How much time do you want to spend on this lesson?</p>
            <div className="flex flex-wrap gap-2">
              {sessionDurations.map(duration => (
                <button
                  key={duration}
                  onClick={() => setFormData({ ...formData, duration })}
                  className={`px-4 py-2 rounded-full border ${
                    formData.duration === duration 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                  }`}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 7:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">🧩 7. Are there specific challenges or scenarios you want to simulate?</h3>
            <p className="text-gray-600 mb-4">Want me to focus on a tricky part of your workflow?</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {getIndustryChallenges(formData.industry).map(challenge => (
                <button
                  key={challenge}
                  onClick={() => setFormData({ ...formData, challenges: challenge })}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    formData.challenges === challenge 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                  }`}
                >
                  {challenge}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Or describe your specific challenge..."
              value={formData.customChallenges || ''}
              onChange={(e) => setFormData({ ...formData, customChallenges: e.target.value, challenges: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default CorporateStepRenderer;
