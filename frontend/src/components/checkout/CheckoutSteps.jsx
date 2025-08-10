import React from 'react';

const CheckoutSteps = ({ steps, currentStep, onStepChange, completedSteps }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const isAccessible = index === 0 || completedSteps.includes(steps[index - 1].id);

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => isAccessible && onStepChange(step.id)}
                disabled={!isAccessible}
                className={`flex flex-col items-center space-y-2 p-4 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : isAccessible
                        ? 'text-gray-600 dark:text-gray-400 hover:bg-white/10'
                        : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive || isCompleted ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  <i className={`${step.icon} ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}></i>
                </div>
                <span className="text-sm font-medium">{step.label}</span>
              </button>

              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutSteps;
