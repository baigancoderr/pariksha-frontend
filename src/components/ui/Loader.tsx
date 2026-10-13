import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'loader-bars-sm',
    md: 'loader-bars-md',
    lg: 'loader-bars-lg',
  };

  const bars = (
    <div className={`loader-bars ${sizeClasses[size]}`} role="status" aria-label={text || 'Loading'}>
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} className="loader-bar" />
      ))}
    </div>
  );

  const loader = (
    <div className="flex flex-col items-center justify-center">
      {bars}
      {text && <p className="mt-3 text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
        {loader}
      </div>
    );
  }

  return loader;
};
