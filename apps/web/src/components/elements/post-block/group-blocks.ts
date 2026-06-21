import { BlockObjectResponse } from '@hooneylog/shared-types';

export type BlockGroup =
  | { kind: 'ul'; items: BlockObjectResponse[] }
  | { kind: 'ol'; items: BlockObjectResponse[] }
  | { kind: 'single'; block: BlockObjectResponse };

export function groupBlocks(blocks: BlockObjectResponse[]): BlockGroup[] {
  const groups: BlockGroup[] = [];

  for (const block of blocks) {
    const type = block.type;
    const last = groups[groups.length - 1];

    if (type === 'bulleted_list_item') {
      if (last && last.kind === 'ul') last.items.push(block);
      else groups.push({ kind: 'ul', items: [block] });
    } else if (type === 'numbered_list_item') {
      if (last && last.kind === 'ol') last.items.push(block);
      else groups.push({ kind: 'ol', items: [block] });
    } else {
      groups.push({ kind: 'single', block });
    }
  }

  return groups;
}
