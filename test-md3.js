const fixMarkdown = (md) => {
  if (!md) return md;
  return md
    .replace(/\*\*\*\*/g, '')
    .replace(/~~~~/g, '')
    .replace(/\*\* \*\*/g, ' ')
    .replace(/__ __/g, ' ')
    .replace(/\\([*|_~`\[\]()#])/g, '$1');
};

const input = "\\*\\*Supavisor(연결 풀러)\\*\\*";
const result = fixMarkdown(input);
console.log('Result:', result);
if (result === "**Supavisor(연결 풀러)**") {
  console.log('Bold conversion success');
} else {
  console.error('Bold conversion fail');
}

const input2 = "**Supavisor\\(연결 풀러\\)**";
const result2 = fixMarkdown(input2);
console.log('Result2:', result2);
if (result2 === "**Supavisor(연결 풀러)**") {
  console.log('Paren conversion success');
} else {
  console.error('Paren conversion fail');
}
