import React from 'react';

interface UburUburLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export const UburUburLogo: React.FC<UburUburLogoProps> = ({
  className = 'w-9 h-9',
  size = 36,
  animated = true,
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-md ${animated ? 'hover:scale-110 transition-transform duration-300' : ''}`}
      >
        <defs>
          {/* Bioluminescent Jellyfish Body Gradient */}
          <linearGradient id="jellyBell" x1="10" y1="10" x2="90" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* Inner Glow Gradient */}
          <radialGradient id="jellyInnerGlow" cx="45" cy="35" r="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#67e8f9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>

          {/* Tentacle Gradient */}
          <linearGradient id="tentacleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
          </linearGradient>

          {/* Eye Sparkle */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Glow Halo */}
        <ellipse cx="50" cy="42" rx="38" ry="32" fill="#06b6d4" opacity="0.2" filter="url(#softGlow)" />

        {/* Tentacles (Flowing Wavy Curves) */}
        <g stroke="url(#tentacleGrad)" strokeWidth="3" strokeLinecap="round" fill="none">
          {/* Tentacle 1 (Left Outer) */}
          <path d="M26 56 C20 68, 30 76, 24 88 C22 92, 19 96, 23 98" opacity="0.85" />
          {/* Tentacle 2 (Left Inner) */}
          <path d="M38 58 C34 72, 42 78, 36 92 C34 96, 38 98, 40 99" strokeWidth="3.5" />
          {/* Tentacle 3 (Center Main) */}
          <path d="M50 60 C54 72, 44 80, 52 94 C54 97, 51 99, 50 100" strokeWidth="4" stroke="#67e8f9" />
          {/* Tentacle 4 (Right Inner) */}
          <path d="M62 58 C66 72, 58 78, 64 92 C66 96, 62 98, 60 99" strokeWidth="3.5" />
          {/* Tentacle 5 (Right Outer) */}
          <path d="M74 56 C80 68, 70 76, 76 88 C78 92, 81 96, 77 98" opacity="0.85" />
        </g>

        {/* Little Bioluminescent Tentacle Dots */}
        <circle cx="23" cy="98" r="1.5" fill="#f472b6" />
        <circle cx="40" cy="99" r="2" fill="#38bdf8" />
        <circle cx="50" cy="100" r="2.5" fill="#a78bfa" />
        <circle cx="60" cy="99" r="2" fill="#38bdf8" />
        <circle cx="77" cy="98" r="1.5" fill="#f472b6" />

        {/* Jellyfish Bell (Head/Cap) */}
        <path
          d="M15 48 C15 22, 30 10, 50 10 C70 10, 85 22, 85 48 C85 56, 78 60, 72 58 C66 56, 62 60, 50 60 C38 60, 34 56, 28 58 C22 60, 15 56, 15 48 Z"
          fill="url(#jellyBell)"
        />

        {/* Jellyfish Cap Inner Highlight / Glow */}
        <path
          d="M20 44 C20 25, 33 14, 50 14 C67 14, 80 25, 80 44 C76 48, 68 47, 50 48 C32 47, 24 48, 20 44 Z"
          fill="url(#jellyInnerGlow)"
        />

        {/* Little Top Crest Sparkle */}
        <ellipse cx="40" cy="22" rx="14" ry="5" fill="#ffffff" opacity="0.6" transform="rotate(-15 40 22)" />
        <circle cx="62" cy="22" r="3" fill="#ffffff" opacity="0.5" />

        {/* Cute Inquisitive / Kepo Big Eyes */}
        <g id="kepoEyes">
          {/* Left Eye Sclera */}
          <ellipse cx="38" cy="38" rx="7.5" ry="9" fill="#ffffff" />
          {/* Left Pupil (Looking Curiously to Top-Right) */}
          <ellipse cx="40" cy="36.5" rx="5" ry="6" fill="#0f172a" />
          {/* Left Pupil Sparkles */}
          <circle cx="42" cy="34" r="2.2" fill="#ffffff" />
          <circle cx="38.5" cy="39" r="1" fill="#ffffff" />

          {/* Right Eye Sclera */}
          <ellipse cx="62" cy="38" rx="7.5" ry="9" fill="#ffffff" />
          {/* Right Pupil (Looking Curiously to Top-Right) */}
          <ellipse cx="64" cy="36.5" rx="5" ry="6" fill="#0f172a" />
          {/* Right Pupil Sparkles */}
          <circle cx="66" cy="34" r="2.2" fill="#ffffff" />
          <circle cx="62.5" cy="39" r="1" fill="#ffffff" />

          {/* Curious Eyebrows (Kepo Expression) */}
          <path d="M33 26 Q39 24 43 28" stroke="#0e7490" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M57 28 Q61 24 67 26" stroke="#0e7490" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* Blushing Cute Cheeks */}
        <ellipse cx="28" cy="45" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.45" />
        <ellipse cx="72" cy="45" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.45" />

        {/* Cute Cheerful Mouth */}
        <path
          d="M46 46 Q50 51 54 46"
          stroke="#0f172a"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Little Floating Bubbles */}
        <circle cx="86" cy="22" r="3" fill="#38bdf8" opacity="0.7" stroke="#ffffff" strokeWidth="0.8" />
        <circle cx="91" cy="14" r="1.8" fill="#a855f7" opacity="0.6" stroke="#ffffff" strokeWidth="0.6" />
        <circle cx="12" cy="28" r="2.2" fill="#38bdf8" opacity="0.6" stroke="#ffffff" strokeWidth="0.6" />
      </svg>
    </div>
  );
};
