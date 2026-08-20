import type { Instrumentation } from 'next';

/**
 * Server-side error hook. Next calls this for every uncaught error in a Server
 * Component, route handler, or middleware — including ones the client only ever
 * sees as an opaque digest. Logging the digest alongside the route is what makes
 * a user-reported "오류 코드: 1234567" traceable in the Vercel logs.
 */
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const digest = typeof err === 'object' && err && 'digest' in err ? err.digest : undefined;

  console.error(
    JSON.stringify({
      level: 'error',
      digest,
      path: request.path,
      method: request.method,
      routeType: context.routeType,
      routePath: context.routePath,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }),
  );
};
