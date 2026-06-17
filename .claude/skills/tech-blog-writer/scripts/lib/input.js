export function parseInput(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`input is not valid JSON: ${err.message}`);
  }
  if (!data.title || !String(data.title).trim()) throw new Error('input.title is required');
  if (!data.category) throw new Error('input.category is required');
  if (!data.markdown || !String(data.markdown).trim()) throw new Error('input.markdown is required');

  return {
    title: data.title,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : [],
    description: data.description ?? '',
    markdown: data.markdown,
    status: data.status ?? 'published',
  };
}
