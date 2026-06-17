import { markdownToBlocks } from '@tryfabric/martian';

export function chunkBlocks(blocks, size = 100) {
  const chunks = [];
  for (let i = 0; i < blocks.length; i += size) {
    chunks.push(blocks.slice(i, i + size));
  }
  return chunks;
}

export function markdownToBlockChunks(markdown, size = 100) {
  const blocks = markdownToBlocks(markdown);
  const chunks = chunkBlocks(blocks, size);
  return { initial: chunks[0] ?? [], rest: chunks.slice(1) };
}
