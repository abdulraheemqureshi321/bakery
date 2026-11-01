import React from 'react';

export const FloatingPetals: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-10 select-none"
      aria-hidden="true"
    >
      {/* Floating Petal 1 - Top Left */}
      <div
        className="absolute top-[12%] left-[4%] animate-petal-float opacity-65"
        style={{ animationDuration: '8s', animationDelay: '0s' }}
      >
        <svg width="22" height="28" viewBox="0 0 24 30" fill="none">
          <ellipse cx="12" cy="15" rx="8" ry="13" fill="#F5CDD2" transform="rotate(25 12 15)" />
        </svg>
      </div>

      {/* Floating Petal 2 - Top Right */}
      <div
        className="absolute top-[8%] right-[6%] animate-petal-float opacity-50"
        style={{ animationDuration: '9.5s', animationDelay: '-3.2s' }}
      >
        <svg width="20" height="26" viewBox="0 0 24 30" fill="none">
          <ellipse cx="12" cy="15" rx="7" ry="12" fill="#D7848F" transform="rotate(-35 12 15)" />
        </svg>
      </div>

      {/* Floating Sparkle / Petal 3 - Mid Right */}
      <div
        className="absolute top-[48%] right-[3%] animate-petal-float opacity-60"
        style={{ animationDuration: '11s', animationDelay: '-5.5s' }}
      >
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
          <ellipse cx="12" cy="16" rx="8" ry="14" fill="#F5CDD2" transform="rotate(18 12 16)" />
        </svg>
      </div>

      {/* Floating Petal 4 - Mid Left */}
      <div
        className="absolute top-[62%] left-[2%] animate-petal-float opacity-55"
        style={{ animationDuration: '10s', animationDelay: '-2s' }}
      >
        <svg width="18" height="24" viewBox="0 0 24 30" fill="none">
          <ellipse cx="12" cy="15" rx="6" ry="11" fill="#EFD49B" transform="rotate(-20 12 15)" />
        </svg>
      </div>

      {/* Floating Sparkle 5 - Lower Right */}
      <div
        className="absolute top-[85%] right-[8%] animate-soft-sparkle opacity-40"
        style={{ animationDuration: '4.5s', animationDelay: '-1.5s' }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <polygon
            points="10,0 12,7 19,10 12,13 10,20 8,13 1,10 8,7"
            fill="#EFD49B"
          />
        </svg>
      </div>
    </div>
  );
};

