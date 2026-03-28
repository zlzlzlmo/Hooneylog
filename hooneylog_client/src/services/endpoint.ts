export const OEndpoint = {
  allNotion: '/notion/all',
  oneNotion: '/notion',
  blocksNotion: '/notion/blocks',
} as const;

export type EndPointType = typeof OEndpoint[keyof typeof OEndpoint];
