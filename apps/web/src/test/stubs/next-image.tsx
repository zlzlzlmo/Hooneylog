import React from 'react';

/**
 * Outside a Next runtime there is no image loader, so render a plain <img>.
 * `fill` keeps its absolute-inset behaviour because the layout audit measures it.
 */
export default function Image({
  src,
  alt,
  fill,
  priority,
  sizes,
  quality,
  loader,
  placeholder,
  blurDataURL,
  style,
  ...rest
}: Record<string, unknown>) {
  void priority;
  void sizes;
  void quality;
  void loader;
  void placeholder;
  void blurDataURL;

  return React.createElement('img', {
    src: typeof src === 'string' ? src : '',
    alt: (alt as string) ?? '',
    style: fill
      ? {
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...(style as object),
        }
      : (style as object),
    ...rest,
  });
}
