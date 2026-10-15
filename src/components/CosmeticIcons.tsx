import React from 'react';

export function LipstickIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Base container */}
      <rect x="7" y="12" width="10" height="9" rx="2" fill="currentColor" fillOpacity="0.15" />
      <line x1="7" y1="16" x2="17" y2="16" />
      {/* Lipstick bullet angled */}
      <path d="M9 12V6.5c0-1.5 1.5-3.5 3-4.5 1.5 1 3 3 3 4.5V12" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

export function BlushIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Compact palette */}
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.12" />
      <circle cx="12" cy="12" r="5" strokeDasharray="2 2" fill="currentColor" fillOpacity="0.3" />
      {/* Sparkle dot */}
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function MascaraIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Mascara tube */}
      <rect x="14" y="9" width="6" height="13" rx="1.5" fill="currentColor" fillOpacity="0.15" />
      {/* Wand handle and brush */}
      <line x1="6" y1="2" x2="10" y2="10" strokeWidth="2.5" />
      <line x1="4" y1="4" x2="6" y2="3" />
      <line x1="5" y1="6" x2="7" y2="5" />
      <line x1="6" y1="8" x2="8" y2="7" />
      <circle cx="6" cy="2" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function SparklesIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M19 16L20 19L23 20L20 21L19 24L18 21L15 20L18 19L19 16Z" fill="currentColor" />
      <path d="M5 2L5.8 4.2L8 5L5.8 5.8L5 8L4.2 5.8L2 5L4.2 4.2L5 2Z" fill="currentColor" />
    </svg>
  );
}
