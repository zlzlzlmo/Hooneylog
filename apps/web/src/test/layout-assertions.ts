import { expect } from 'vitest';

export const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1536, height: 960 },
] as const;

/** Elements that clip on purpose — truncation, marquees, scrollers. */
function clipsIntentionally(el: Element): boolean {
  const style = getComputedStyle(el);
  if (style.overflowX === 'auto' || style.overflowX === 'scroll') return true;
  if (style.overflowY === 'auto' || style.overflowY === 'scroll') return true;
  if (style.textOverflow === 'ellipsis') return true;
  if (style.webkitLineClamp && style.webkitLineClamp !== 'none') return true;
  // `sr-only` collapses to a 1px box on purpose.
  if (el.clientWidth <= 1 && el.clientHeight <= 1) return true;
  return false;
}

/** Inside a horizontal scroller, being wider than the viewport is the point. */
function insideScroller(el: Element): boolean {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const overflowX = getComputedStyle(node).overflowX;
    if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') return true;
    node = node.parentElement;
  }
  return false;
}

/**
 * WCAG 2.2 SC 2.5.8 exempts targets rendered inline within a block of text, and
 * visually-hidden skip links have no target to speak of until focused.
 */
function exemptFromTargetSize(el: Element): boolean {
  if (el.closest('.sr-only')) return true;
  if (el.classList.contains('sr-only')) return true;
  const display = getComputedStyle(el).display;
  return display === 'inline' || display === 'contents';
}

function isRendered(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  const style = getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function describeEl(el: Element): string {
  const cls = typeof el.className === 'string' ? el.className.slice(0, 90) : '';
  const text = (el.textContent ?? '').trim().slice(0, 40);
  return `<${el.tagName.toLowerCase()} class="${cls}">${text}`;
}

/** Nothing may push the page wider than the viewport. */
export function expectNoHorizontalOverflow(viewportWidth: number): void {
  const doc = document.documentElement;

  const offenders = Array.from(document.querySelectorAll<HTMLElement>('body *'))
    .filter(isRendered)
    .filter((el) => el.getBoundingClientRect().right > viewportWidth + 1)
    .filter((el) => getComputedStyle(el).position !== 'fixed')
    .filter((el) => !insideScroller(el))
    .map(describeEl);

  expect(offenders, `elements overflow the ${viewportWidth}px viewport`).toEqual([]);

  expect(
    doc.scrollWidth,
    `page scrolls horizontally at ${viewportWidth}px (scrollWidth ${doc.scrollWidth} > client ${doc.clientWidth})`,
  ).toBeLessThanOrEqual(doc.clientWidth + 1);
}

/** No visible box may cut off its own content unless it opted into clipping. */
export function expectNoClippedContent(root: Element): void {
  const offenders = Array.from(root.querySelectorAll<HTMLElement>('*'))
    .filter(isRendered)
    .filter((el) => !clipsIntentionally(el))
    .filter((el) => {
      const style = getComputedStyle(el);
      const hidden = style.overflowX === 'hidden' || style.overflowY === 'hidden';
      if (!hidden) return false;
      return el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
    })
    .map(describeEl);

  expect(offenders, 'content is clipped by an overflow:hidden box').toEqual([]);
}

/** Interactive controls must stay tappable (WCAG 2.2 target size, minimum 24px). */
export function expectTapTargets(root: Element): void {
  const tooSmall = Array.from(
    root.querySelectorAll<HTMLElement>('button, a[href], input, [role="button"]'),
  )
    .filter(isRendered)
    .filter((el) => !exemptFromTargetSize(el))
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width < 24 || rect.height < 24;
    })
    .map(describeEl);

  expect(tooSmall, 'interactive targets are smaller than 24x24 CSS px').toEqual([]);
}

/** Every rendered text node must resolve to a non-transparent colour. */
export function expectVisibleText(root: Element): void {
  const invisible = Array.from(root.querySelectorAll<HTMLElement>('*'))
    .filter(isRendered)
    .filter((el) => (el.textContent ?? '').trim().length > 0)
    .filter((el) => {
      const color = getComputedStyle(el).color;
      return color === 'rgba(0, 0, 0, 0)' || color === 'transparent';
    })
    .map(describeEl);

  expect(invisible, 'text renders fully transparent').toEqual([]);
}

/** Content must never sit flush against the screen edge. */
export function expectSideGutters(viewportWidth: number): void {
  const containers = Array.from(document.querySelectorAll<HTMLElement>('.container')).filter(
    isRendered,
  );
  expect(containers.length, 'no .container on screen to measure').toBeGreaterThan(0);

  const flush = containers
    .filter((el) => {
      const style = getComputedStyle(el);
      return parseFloat(style.paddingLeft) < 12 || parseFloat(style.paddingRight) < 12;
    })
    .map(describeEl);

  expect(flush, `containers have no side gutter at ${viewportWidth}px`).toEqual([]);
}

/** Reads the resolved page colours so a broken theme can't pass unnoticed. */
export function pageColors(): { background: string; foreground: string } {
  const style = getComputedStyle(document.body);
  return { background: style.backgroundColor, foreground: style.color };
}

export function auditLayout(root: Element, viewportWidth: number): void {
  expectSideGutters(viewportWidth);
  expectNoHorizontalOverflow(viewportWidth);
  expectNoClippedContent(root);
  expectTapTargets(root);
  expectVisibleText(root);
}
