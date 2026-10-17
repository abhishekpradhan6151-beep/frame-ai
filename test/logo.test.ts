import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Logo, GlassFIcon, FrameWordmark, StandaloneGlassBadge, BrandLockup } from '../src/components/Logo';

describe('FRAME Brand Logo & Wordmark', () => {
  it('renders GlassFIcon SVG with squircle and specular flare', () => {
    const html = renderToString(React.createElement(GlassFIcon, { size: 32 }));
    expect(html).toContain('viewBox="0 0 100 100"');
    expect(html).toContain('frame_squircle_base');
    expect(html).toContain('frame_star_flare');
    expect(html).toContain('glass_f_top_bar');
  });

  it('renders FrameWordmark with accessible sr-only text and stylized geometric characters', () => {
    const html = renderToString(React.createElement(FrameWordmark));
    expect(html).toContain('sr-only');
    expect(html).toContain('FRAME');
    // Expect stylized lambda/chevron A
    expect(html).toContain('M 3.5 21 L 12 3.5 L 20.5 21');
  });

  it('renders unified Logo with icon and wordmark aligned horizontally', () => {
    const html = renderToString(React.createElement(Logo, { size: 32, showWordmark: true }));
    expect(html).toContain('inline-flex items-center');
    expect(html).toContain('FRAME');
  });

  it('renders StandaloneGlassBadge for hero placement directly using glass icon without redundant double box', () => {
    const html = renderToString(React.createElement(StandaloneGlassBadge, { size: 56 }));
    expect(html).toContain('viewBox="0 0 100 100"');
    expect(html).toContain('width="56"');
    expect(html).toContain('FRAME AI');
  });

  it('renders standardized BrandLockup with exact wording FRAME AI — Short-Form Studio', () => {
    const html = renderToString(React.createElement(BrandLockup, { iconSize: 28 }));
    expect(html).toContain('FRAME AI');
    expect(html).toContain('—');
    expect(html).toContain('Short-Form Studio');
    expect(html).toContain('viewBox="0 0 100 100"');
    expect(html).toContain('width="28"');
  });
});
