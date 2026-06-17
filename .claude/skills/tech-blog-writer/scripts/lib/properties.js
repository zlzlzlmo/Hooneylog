export const CATEGORIES = ['Frontend', 'Backend', 'Artificial Intelligence'];
export const STATUSES = ['writing', 'ready', 'published'];

export function buildPageProperties({ title, category, tags = [], description = '', status = 'published' }) {
  if (!title || !title.trim()) throw new Error('title is required and must be non-empty');
  if (!CATEGORIES.includes(category)) throw new Error(`category must be one of ${CATEGORIES.join(', ')} (got: ${category})`);
  if (!STATUSES.includes(status)) throw new Error(`status must be one of ${STATUSES.join(', ')} (got: ${status})`);

  return {
    '이름': { title: [{ text: { content: title } }] },
    category: { multi_select: [{ name: category }] },
    tag: { multi_select: tags.map((name) => ({ name })) },
    description: { rich_text: description ? [{ text: { content: description } }] : [] },
    status: { select: { name: status } },
  };
}
