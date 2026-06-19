import { Check } from 'lucide-react';

type Step = 'timeline' | 'network' | 'turning' | 'result';

interface StepIndicatorProps {
  currentStep: Step;
}

const steps: { key: Step; label: string; number: number }[] = [
  { key: 'timeline', label: '找源头', number: 1 },
  { key: 'network', label: '连路径', number: 2 },
  { key: 'turning', label: '判拐点', number: 3 },
];

const stepOrder: Step[] = ['timeline', 'network', 'turning', 'result'];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isActive = stepOrder.indexOf(step.key) <= currentIndex;
          const isCurrent = stepOrder.indexOf(step.key) === currentIndex;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}
                >
                  {isActive && stepOrder.indexOf(step.key) < currentIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    isActive ? 'text-primary-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`w-16 md:w-24 h-1 mx-2 rounded-full transition-colors duration-300 ${
                    stepOrder.indexOf(step.key) < currentIndex
                      ? 'bg-primary-700'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
