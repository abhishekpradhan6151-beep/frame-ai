import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

/**
 * Premium Glass F Icon
 * Faithfully inspired by the FRAME reference design (IMG_5139.jpeg):
 * - Dark rounded-square (squircle) obsidian glass base
 * - Outer bevel with specular silver-white rim highlights
 * - Starburst specular flare glint in the top-left corner
 * - Soft ambient light and bottom reflection
 * - 3D folded translucent glass 'F' with beveled facet edges and liquid refractions
 */
export const GlassFIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm transition-transform duration-300 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Dark Obsidian Glass Squircle Base Gradient */}
        <linearGradient id="frame_squircle_base" x1="16" y1="10" x2="84" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#222533" />
          <stop offset="28%" stopColor="#13141d" />
          <stop offset="70%" stopColor="#0a0b10" />
          <stop offset="100%" stopColor="#050608" />
        </linearGradient>

        {/* Outer Rim Specular Bevel */}
        <linearGradient id="frame_squircle_rim" x1="8" y1="8" x2="92" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="16%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="38%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="65%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="85%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
        </linearGradient>

        {/* Inner Radial Ambient Glow */}
        <radialGradient id="frame_inner_glow" cx="45" cy="40" r="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Glass F Top Bar Gradient */}
        <linearGradient id="glass_f_top_bar" x1="45" y1="25.5" x2="76" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="80%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>

        {/* Glass F Middle Bar Gradient */}
        <linearGradient id="glass_f_mid_bar" x1="45" y1="46.5" x2="68" y2="59.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="80%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.06" />
        </linearGradient>

        {/* Glass F Vertical Stem Gradient */}
        <linearGradient id="glass_f_stem" x1="36" y1="35" x2="50" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="80%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
        </linearGradient>

        {/* Left Perspective Fold Facet */}
        <linearGradient id="glass_f_fold" x1="36" y1="45" x2="47" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
        </linearGradient>

        {/* Corner Specular Star Flare */}
        <radialGradient id="frame_star_flare" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Glass Squircle Body */}
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="23"
        ry="23"
        fill="url(#frame_squircle_base)"
        stroke="url(#frame_squircle_rim)"
        strokeWidth="1.25"
      />
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="23"
        ry="23"
        fill="url(#frame_inner_glow)"
      />

      {/* Subtle Inner Glass Bevel Contour */}
      <rect
        x="9.5"
        y="9.5"
        width="81"
        height="81"
        rx="21.5"
        ry="21.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.5"
        strokeOpacity="0.18"
      />

      {/* Corner Specular Flare (Top-Left) */}
      <g transform="translate(18, 13)">
        <circle cx="0" cy="0" r="5.5" fill="url(#frame_star_flare)" />
        <path d="M -8 0 Q 0 -0.8 8 0 Q 0 0.8 -8 0 Z" fill="#ffffff" opacity="0.9" />
        <path d="M 0 -8 Q -0.8 0 0 8 Q 0.8 0 0 -8 Z" fill="#ffffff" opacity="0.9" />
        <circle cx="0" cy="0" r="1.4" fill="#ffffff" />
      </g>

      {/* Bottom-Right Subtle Glint */}
      <circle cx="81" cy="85" r="1.2" fill="#ffffff" opacity="0.7" />

      {/* --- 3D TRANSLUCENT GLASS "F" --- */}

      {/* 1. Left Fold Facet (Background perspective ribbon) */}
      <path
        d="M 46 25.5 L 36 40 L 36 58 L 46 43 Z"
        fill="url(#glass_f_fold)"
      />
      <line x1="36" y1="40" x2="46" y2="25.5" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="36" y1="40" x2="36" y2="58" stroke="#ffffff" strokeWidth="0.9" strokeOpacity="0.7" />

      {/* 2. Main Vertical Stem with Loop Terminal */}
      <path
        d="M 36 40 L 36 63.5 C 36 70.5 40.5 74.5 46.5 74.5 C 48 74.5 48.5 73.5 48.5 71.5 L 48.5 25.5 L 46 25.5 C 41 25.5 36 33 36 40 Z"
        fill="url(#glass_f_stem)"
      />
      {/* Stem Outer Glowing Edge Lines */}
      <path
        d="M 36 40 L 36 63.5 C 36 70.5 40.5 74.5 46.5 74.5"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Stem Inner Crease Line for 3D Depth */}
      <line x1="46" y1="25.5" x2="46" y2="41" stroke="rgba(0, 0, 0, 0.35)" strokeWidth="1" />
      <line x1="47" y1="25.5" x2="47" y2="41" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.75" />

      {/* 3. Top Horizontal Arm */}
      <path
        d="M 46 25.5 L 75 25.5 C 75.6 25.5 76 26.1 75.7 26.6 L 65.5 40.5 C 65.2 41 64.6 41 64 41 L 46 41 Z"
        fill="url(#glass_f_top_bar)"
      />
      {/* Top Arm Beveled Edge Highlights */}
      <line x1="46" y1="25.5" x2="75" y2="25.5" stroke="#ffffff" strokeWidth="1.35" strokeLinecap="round" />
      <line x1="75" y1="25.5" x2="65.5" y2="40.5" stroke="#ffffff" strokeWidth="1.15" strokeLinecap="round" opacity="0.9" />
      <line x1="65.5" y1="41" x2="46" y2="41" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="0.8" />

      {/* 4. Middle Horizontal Arm */}
      <path
        d="M 46 46.5 L 67 46.5 C 67.6 46.5 68 47.1 67.7 47.6 L 58.5 59 C 58.2 59.5 57.6 59.5 57 59.5 L 46 59.5 Z"
        fill="url(#glass_f_mid_bar)"
      />
      {/* Middle Arm Beveled Edge Highlights */}
      <line x1="46" y1="46.5" x2="67" y2="46.5" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="67" y1="46.5" x2="58.5" y2="59" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
      <line x1="58.5" y1="59.5" x2="46" y2="59.5" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="0.8" />

      {/* Overlap Glint highlight where middle bar intersects stem */}
      <line x1="46" y1="46.5" x2="46" y2="59.5" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.8" />
    </svg>
  );
};

/**
 * Geometric FRAME Wordmark
 * - Uppercase geometric lettering with generous letter spacing
 * - Stylized Lambda / Chevron 'Λ' apex matching reference artwork (IMG_5139.jpeg)
 * - Adapts to Light and Dark themes (deep graphite in Light, silver metallic in Dark)
 * - Accessible sr-only label ensures screen readers always announce "FRAME"
 */
export const FrameWordmark: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs sm:text-sm tracking-[0.24em]',
    md: 'text-[16px] sm:text-[18px] md:text-[20px] tracking-[0.28em] sm:tracking-[0.3em]',
    lg: 'text-[18px] sm:text-[20px] md:text-[22px] tracking-[0.28em] sm:tracking-[0.32em]',
    xl: 'text-[24px] sm:text-[28px] tracking-[0.34em]',
  }[size];

  return (
    <div
      className={`inline-flex items-center font-extrabold select-none ${sizeClasses} ${className}`}
    >
      {/* Accessible text for screen readers and search engines */}
      <span className="sr-only">FRAME</span>

      {/* Visual stylized geometric brand mark matching reference image */}
      <span
        aria-hidden="true"
        className="flex items-center text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:via-zinc-100 dark:to-zinc-400 font-extrabold tracking-[0.28em] sm:tracking-[0.32em] transition-colors duration-200"
      >
        <span>F</span>
        <span className="ml-[0.26em]">R</span>
        {/* Stylized geometric Lambda / Chevron A */}
        <span className="ml-[0.26em] inline-flex items-center justify-center">
          <svg
            className="h-[0.88em] w-[0.82em] inline-block stroke-slate-900 dark:stroke-zinc-100 fill-none stroke-[2.8]"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M 3.5 21 L 12 3.5 L 20.5 21" strokeLinecap="round" strokeLinejoin="miter" />
          </svg>
        </span>
        <span className="ml-[0.26em]">M</span>
        <span className="ml-[0.26em]">E</span>
      </span>
    </div>
  );
};

/**
 * Main FRAME Logo:
 * - Premium Glass F icon + Horizontally positioned FRAME geometric wordmark
 * - Vertically aligned in the website header
 * - Responsive sizing across mobile, tablet, and desktop (36-44px icon, 18-22px wordmark)
 * - Theme-aware (dark glass squircle icon with theme-adaptive wordmark)
 */
export const Logo: React.FC<LogoProps> = ({
  size = 40,
  className = '',
  showWordmark = true,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-3 sm:gap-3.5 select-none transition-colors duration-200 ${className}`}
    >
      <GlassFIcon size={size} className="shrink-0" />

      {showWordmark && (
        <FrameWordmark size={size < 30 ? 'sm' : size >= 38 ? 'lg' : 'md'} />
      )}
    </div>
  );
};

/**
 * Standalone Glass Badge for Homepage Hero:
 * - Uses the glass F logo asset directly, eliminating redundant outer container boxes
 * - Centered, properly proportioned (56px) without double frames or double backgrounds
 * - Subtle ambient depth and micro-interaction hover effect
 */
export const StandaloneGlassBadge: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 56,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center group select-none transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="FRAME AI"
    >
      {/* Soft ambient underglow to naturally elevate the glass icon */}
      <div
        className="pointer-events-none absolute inset-0 -m-2 rounded-2xl bg-indigo-500/10 dark:bg-white/[0.06] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />
      {/* Glass F App Icon directly — preserves its dark squircle, bevel rim, & 3D F artwork */}
      <GlassFIcon
        size={size}
        className="relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </div>
  );
};

/**
 * Standardized Brand Lockup:
 * FRAME AI — Short-Form Studio
 *
 * - Clean Glass F Icon with moderate, readable proportions (default 28px)
 * - Bold uppercase "FRAME AI" in clean geometric sans typography
 * - Restrained separator dash with balanced spacing
 * - "Short-Form Studio" in slightly lighter weight and readable muted foreground
 * - Responsive horizontal alignment across mobile, tablet, and desktop
 */
export const BrandLockup: React.FC<{
  iconSize?: number;
  className?: string;
}> = ({
  iconSize = 28,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap justify-center sm:justify-start select-none transition-colors duration-200 ${className}`}
    >
      <GlassFIcon size={iconSize} className="shrink-0 drop-shadow-sm" />

      <div className="flex items-center text-sm sm:text-[15px] leading-none">
        {/* FRAME AI: Bold, uppercase, clean geometric sans */}
        <span className="font-extrabold tracking-[0.22em] text-slate-900 dark:text-white uppercase transition-colors">
          FRAME AI
        </span>

        {/* Restrained Separator Dash */}
        <span
          className="mx-2 sm:mx-2.5 text-slate-400 dark:text-zinc-500 font-light select-none"
          aria-hidden="true"
        >
          —
        </span>

        {/* Short-Form Studio: lighter weight, readable muted contrast */}
        <span className="font-normal text-slate-600 dark:text-zinc-300 text-xs sm:text-sm tracking-normal transition-colors">
          Short-Form Studio
        </span>
      </div>
    </div>
  );
};

// Backward compatibility alias for any existing imports
export const StandaloneApertureBadge = StandaloneGlassBadge;
export const ApertureIcon = GlassFIcon;
export const FooterBrandLockup = BrandLockup;

export default Logo;
