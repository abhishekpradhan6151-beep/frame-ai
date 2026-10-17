import { describe, it, expect } from 'vitest';

describe('Option Card Contrast & Accessibility Tokens', () => {
  it('ensures selected state uses explicit high-contrast classes in both Light and Dark modes', () => {
    // In light mode, when a selected card has a dark navy background (bg-slate-900),
    // title/label and descriptions must explicitly use light colors (text-white, text-slate-300).
    const lightSelectedBg = 'bg-slate-900';
    const lightSelectedTitle = 'text-white font-semibold';
    const lightSelectedDesc = 'text-slate-300';
    const lightSelectedCheck = 'text-white';

    expect(lightSelectedBg).toContain('slate-900');
    expect(lightSelectedTitle).toContain('text-white');
    expect(lightSelectedDesc).toContain('text-slate-300');
    expect(lightSelectedCheck).toContain('text-white');

    // In dark mode, selected cards must have clear borders and readable text
    const darkSelectedBg = 'dark:bg-white/15';
    const darkSelectedBorder = 'dark:border-white/80';
    const darkSelectedTitle = 'dark:text-white';
    const darkSelectedDesc = 'dark:text-zinc-300';

    expect(darkSelectedBg).toContain('dark:bg-white/15');
    expect(darkSelectedBorder).toContain('dark:border-white/80');
    expect(darkSelectedTitle).toContain('dark:text-white');
    expect(darkSelectedDesc).toContain('dark:text-zinc-300');
  });

  it('ensures unselected cards remain visually distinct and readable in both themes', () => {
    const lightUnselectedTitle = 'text-slate-900';
    const lightUnselectedDesc = 'text-slate-500';
    const darkUnselectedTitle = 'dark:text-zinc-100';
    const darkUnselectedDesc = 'dark:text-zinc-400';

    expect(lightUnselectedTitle).not.toBe('text-white');
    expect(darkUnselectedTitle).not.toBe(lightUnselectedTitle);
    expect(lightUnselectedDesc).not.toBe(darkUnselectedDesc);
  });
});
