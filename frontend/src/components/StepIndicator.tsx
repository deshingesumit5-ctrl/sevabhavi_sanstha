import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 1-based index
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  layout = 'horizontal',
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {layout === 'horizontal' ? (
        // Horizontal Layout (for mobile/tablet screens and member registration)
        <div className="flex items-center justify-between w-full">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <React.Fragment key={idx}>
                {/* Step Circle & Label */}
                <div className="flex flex-col items-center flex-1 relative">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-base transition-all duration-300 z-10 ${
                      isCompleted
                        ? 'bg-saffron text-white'
                        : isActive
                        ? 'bg-saffron text-white ring-4 ring-saffron/25'
                        : 'bg-white border-2 border-charcoal/20 text-charcoal/50'}`} style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {isCompleted ? <Check size={18} /> : stepNum}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold text-center max-w-[80px] hidden md:block transition-colors ${
                      isActive ? 'text-saffron' : isCompleted ? 'text-saffron' : 'text-charcoal/60'
                    }`}
                  >
                    {step}
                  </span>
                </div>

                {/* Connecting Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-all duration-300 ${
                      stepNum < currentStep ? 'bg-saffron' : 'bg-charcoal/20'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        // Vertical Layout (for desktop sidebar on Marriage Registration / Member Registration)
        <div className="flex flex-col gap-4">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <div key={idx} className="flex items-center gap-4 group">
                {/* Step Circle */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all duration-300 z-10 ${
                      isCompleted
                        ? 'bg-saffron text-white'
                        : isActive
                        ? 'bg-saffron text-white ring-4 ring-saffron/25'
                        : 'bg-white border-2 border-charcoal/20 text-charcoal/50'}`} style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {isCompleted ? <Check size={16} /> : stepNum}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-0.5 absolute top-9 bottom-[-20px] transition-all duration-300 ${
                        stepNum < currentStep ? 'bg-saffron' : 'bg-charcoal/20'
                      }`}
                    />
                  )}
                </div>

                {/* Step Label */}
                <div className="flex flex-col py-1">
                  <span
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      isActive
                        ? 'text-saffron font-bold'
                        : isCompleted
                        ? 'text-saffron font-medium'
                        : 'text-charcoal/60'
                    }`}
                  >
                    {stepNum}. {step}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StepIndicator;
