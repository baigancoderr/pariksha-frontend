import React from 'react';
import { useToast } from '@/hooks/useToast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const config = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      icon: '✓',
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      icon: '✕',
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
      icon: '⚠',
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      icon: 'ℹ',
    },
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const { bgColor, borderColor, iconColor, textColor, icon } = config[toast.type];
        
        return (
          <div
            key={toast.id}
            className={`${bgColor} ${borderColor} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md animate-slide-in-right`}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${iconColor} text-xl font-bold`}>
                {icon}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${textColor}`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className={`ml-3 ${textColor} hover:opacity-70`}
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
