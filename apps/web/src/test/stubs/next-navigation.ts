type Noop = (...args: unknown[]) => void;

const noop: Noop = () => {};

export const usePathname = (): string => '/';
export const useSearchParams = (): URLSearchParams => new URLSearchParams();
export const useRouter = (): Record<
  'push' | 'replace' | 'refresh' | 'back' | 'forward' | 'prefetch',
  Noop
> => ({
  push: noop,
  replace: noop,
  refresh: noop,
  back: noop,
  forward: noop,
  prefetch: noop,
});
export const useParams = (): Record<string, string> => ({});
export const redirect: Noop = noop;
export const notFound: Noop = noop;
