import React, { useLayoutEffect, useRef, useState } from 'react';

interface AnnouncementTickerProps {
  message: string;
  className?: string;
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({ message, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLSpanElement>(null);
  const [repeatCount, setRepeatCount] = useState(2);
  const [duration, setDuration] = useState(24);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const item = itemRef.current;
    if (!container || !item) return;

    const updateLayout = () => {
      const itemWidth = item.getBoundingClientRect().width;
      const containerWidth = container.getBoundingClientRect().width;
      if (itemWidth <= 0) return;
      const count = Math.max(2, Math.ceil(containerWidth / itemWidth) + 1);
      setRepeatCount(count);
      setDuration(Math.max(12, (count * itemWidth * 2) / 45));
    };

    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);
    observer.observe(item);
    return () => observer.disconnect();
  }, [message]);

  const renderGroup = (isDuplicate: boolean) => (
    <span className="announcement-marquee-group flex shrink-0 items-center" aria-hidden={isDuplicate}>
      {Array.from({ length: repeatCount }, (_, index) => (
        <React.Fragment key={`${isDuplicate ? 'copy' : 'main'}-${index}`}>
          <span ref={!isDuplicate && index === 0 ? itemRef : undefined}>{message}</span>
          <span className="px-3 text-indigo-500" aria-hidden="true">•</span>
        </React.Fragment>
      ))}
    </span>
  );

  return (
    <div ref={containerRef} aria-hidden="true" className={`min-w-0 overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="announcement-marquee flex w-max items-center"
        style={{ animationDuration: `${duration}s` }}
      >
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </div>
  );
};
