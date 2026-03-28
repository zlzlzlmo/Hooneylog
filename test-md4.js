const fixMarkdown = (md) => {
  if (!md) return md;
  // Improved regex to handle various over-escaping scenarios from notion-to-md
  return md
    .replace(/\*\*\*\*/g, '')
    .replace(/~~~~/g, '')
    .replace(/\*\* \*\*/g, ' ')
    .replace(/__ __/g, ' ')
    // Unescape markdown markers that notion-to-md often over-escapes
    .replace(/\\([*|_~`\[\]()#+!.-])/g, '$1');
};

const cases = [
  { name: 'Bold Escaped', input: "\\*\\*text\\*\\*", expected: "**text**" },
  { name: 'Paren Escaped', input: "Supavisor\\(text\\)", expected: "Supavisor(text)" },
  { name: 'Dash Escaped', input: "\\- item", expected: "- item" },
  { name: 'Dot Escaped', input: "1\\. first", expected: "1. first" },
];

cases.forEach(c => {
  const result = fixMarkdown(c.input);
  if (result === c.expected) {
    console.log(`✅ ${c.name} Passed`);
  } else {
    console.error(`❌ ${c.name} Failed: expected "${c.expected}", got "${result}"`);
  }
});
