import { Footer29 } from '@/components/footer29';

/**
 * The real SiteFooter is an async cached server component, which a browser can't
 * render. Swapping only the wrapper keeps the actual footer markup under audit.
 */
export function SiteFooter(): React.JSX.Element {
  return <Footer29 year={2026} />;
}
