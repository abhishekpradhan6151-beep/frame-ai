import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

/**
 * Camera Aperture Emblem:
 * - Circular outer ring
 * - Clean line work that adapts to current theme (dark lines in light mode, white in dark mode)
 * - 6 overlapping angled shutter blades
 * - Small central polygonal opening
 * - Tiny solid highlight dot tucked near the upper-right edge of the central opening
 * - Symmetrical, balanced, crisp at all sizes
 */
export const ApertureIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm text-slate-900 dark:text-white transition-colors duration-200 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Subtle glass blade highlight */}
        <linearGradient id="aperture_blade_grad" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Circular outer ring */}
      <circle
        cx="16"
        cy="16"
        r="13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeOpacity="0.85"
      />
      {/* Inner guide ring for subtle lens depth */}
      <circle
        cx="16"
        cy="16"
        r="14.5"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeOpacity="0.25"
      />

      {/* 6 Overlapping Angled Shutter Blades */}
      {/* Blade 1 */}
      <path
        d="M 16 2.5 L 20.8 13.2 A 4.5 4.5 0 0 1 18.2 11.5 Z"
        fill="url(#aperture_blade_grad)"
      />
      <line
        x1="16"
        y1="2.5"
        x2="20.8"
        y2="13.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />

      {/* Blade 2 */}
      <path
        d="M 27.69 9.25 L 20.8 18.8 A 4.5 4.5 0 0 1 20.8 15.8 Z"
        fill="url(#aperture_blade_grad)"
      />
      <line
        x1="27.69"
        y1="9.25"
        x2="20.8"
        y2="18.8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />

      {/* Blade 3 */}
      <path
        d="M 27.69 22.75 L 16 21.6 A 4.5 4.5 0 0 1 18.6 20.3 Z"
        fill="url(#aperture_blade_grad)"
      />
      <line
        x1="27.69"
        y1="22.75"
        x2="16"
        y2="21.6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />

      {/* Blade 4 */}
      <path
        d="M 16 29.5 L 11.2 18.8 A 4.5 4.5 0 0 1 13.8 20.5 Z"
        fill="url(#aperture_blade_grad)"
      />
      <line
        x1="16"
        y1="29.5"
        x2="11.2"
        y2="18.8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />

      {/* Blade 5 */}
      <path
        d="M 4.31 22.75 L 11.2 13.2 A 4.5 4.5 0 0 1 11.2 16.2 Z"
        fill="url(#aperture_blade_grad)"
      />
      <line
        x1="4.31"
        y1="22.75"
        x2="11.2"
        y2="13.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />

      {/* Blade 6 */}
      <path
        d="M 4.31 9.25 L 16 10.4 A 4.5 4.5 0 0 1 13.4 11.7 Z"
        fill="url(#aperture_blade_grad)"
      />
      <line
        x1="4.31"
        y1="9.25"
        x2="16"
        y2="10.4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />

      {/* Central polygonal opening outline */}
      <polygon
        points="16,10.4 20.8,13.2 20.8,18.8 16,21.6 11.2,18.8 11.2,13.2"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.6"
        fill="currentColor"
        fillOpacity="0.04"
      />

      {/* Tiny solid highlight dot tucked near the upper-right edge of the central opening */}
      <circle
        cx="19.2"
        cy="13.8"
        r="1.1"
        fill="currentColor"
      />
    </svg>
  );
};

/**
 * Main FRAME Logo:
 * Aperture emblem + Uppercase wordmark FRAME with wide letter spacing
 */
export const Logo: React.FC<LogoProps> = ({
  size = 24,
  className = '',
  showWordmark = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none text-slate-900 dark:text-white transition-colors duration-200 ${className}`}>
      <ApertureIcon size={size} />

      {showWordmark && (
        <span className="text-base font-semibold tracking-[0.25em] text-slate-900 dark:text-white uppercase font-sans transition-colors duration-200">
          FRAME
        </span>
      )}
    </div>
  );
};

/**
 * Standalone Aperture Badge for Homepage Hero:
 * - Small rounded square
 * - Theme-aware background (white glass in light, dark charcoal in dark)
 * - Subtle border
 * - Soft inner highlight
 * - Modest shadow and depth
 * - Icon centered with balanced padding
 * - Subtle glint / sweep animation
 */
export const StandaloneApertureBadge: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-white/[0.12] shadow-lg shadow-slate-200/50 dark:shadow-xl dark:shadow-black/40 backdrop-blur-xl group overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Soft inner radial highlight */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-slate-400/[0.08] dark:from-white/[0.08] to-transparent rounded-2xl" />

      {/* Subtle glint sweep */}
      <div className="pointer-events-none absolute -inset-full w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-slate-900/[0.04] dark:via-white/[0.07] to-transparent transform -rotate-45 translate-x-[-120%] animate-subtle-glint" />

      <ApertureIcon size={28} className="relative z-10 transition-transform duration-500 group-hover:scale-105" />
    </div>
  );
};

export default Logo;
