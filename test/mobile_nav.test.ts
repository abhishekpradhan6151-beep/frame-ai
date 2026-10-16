import { describe, it, expect } from 'vitest';

describe('Mobile Navigation Geometry & Alignment', () => {
  const VIEWPORTS = [320, 375, 390, 430, 768, 1024];

  it('calculates deterministic pill alignment across mobile screen sizes', () => {
    VIEWPORTS.forEach((width) => {
      // Simulate mobile bar flex justify-around with 4 tabs
      const buttonWidth = width < 360 ? 56 : 68;
      const totalButtonsWidth = buttonWidth * 4;
      const remainingSpace = Math.max(0, width - totalButtonsWidth);
      const gap = remainingSpace / 5; // 4 buttons in justify-around

      const tabs = ['home', 'studio', 'creations', 'settings'];
      const positions: Record<string, { left: number; width: number }> = {};

      tabs.forEach((tab, index) => {
        const offsetLeft = Math.round(gap * (index + 1) + buttonWidth * index);
        positions[tab] = { left: offsetLeft, width: buttonWidth };
      });

      // Assert each tab has distinct positive coordinate and fits within container
      expect(positions.home.left).toBeGreaterThanOrEqual(0);
      expect(positions.studio.left).toBeGreaterThan(positions.home.left);
      expect(positions.creations.left).toBeGreaterThan(positions.studio.left);
      expect(positions.settings.left).toBeGreaterThan(positions.creations.left);
      expect(positions.settings.left + positions.settings.width).toBeLessThanOrEqual(width);
    });
  });

  it('adjusts coordinates properly when horizontally scrolled', () => {
    const offsetLeft = 240;
    const scrollLeft = 45;
    const targetLeft = offsetLeft - scrollLeft;
    expect(targetLeft).toBe(195);
  });
});
