import React from 'react';

/**
 * Simple, clean default profile avatar similar to WhatsApp's default avatar.
 * Neutral soft background (#dfe5e7) with a clean white head & shoulders silhouette.
 * Uniform across both groom and bride profiles.
 */
export default function DefaultAvatar({
  size = 'card', // 'xs' | 'sm' | 'md' | 'lg' | 'card'
  className = '',
}) {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    card: 'w-full h-full',
  };

  const currentSize = sizeMap[size] || sizeMap.card;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden select-none bg-[#dfe5e7] ${currentSize} ${className}`}
      style={{ backgroundColor: '#dfe5e7' }}
    >
      <svg
        viewBox="0 0 200 200"
        className={
          size === 'card'
            ? 'w-24 h-24 sm:w-28 sm:h-28'
            : 'w-[85%] h-[85%]'
        }
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g fill="#FFFFFF">
          {/* Head */}
          <circle cx="100" cy="72" r="34" />
          {/* Shoulders / Torso */}
          <path d="M100 120 C64 120 35 138 30 178 C30 185 36 190 44 190 L156 190 C164 190 170 185 170 178 C165 138 136 120 100 120 Z" />
        </g>
      </svg>
    </div>
  );
}
