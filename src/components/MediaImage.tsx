import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface MediaImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const MediaImage: React.FC<MediaImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-blue-50 dark:from-slate-800 dark:via-slate-900 dark:to-indigo-950 text-slate-500 dark:text-slate-400 p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="w-8 h-8 mb-2 text-indigo-600/70 dark:text-indigo-400/70" />
        <span className="text-xs font-medium max-w-[20ch] truncate">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
