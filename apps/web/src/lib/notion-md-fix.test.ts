const fixMarkdown = (md: string) => {
  return md
    .replace(/\*\*\*\*/g, '')
    .replace(/~~~~/g, '')
    // Add more patterns here if needed
    .replace(/\*\* \*\*/g, '') // Empty bold with space
    .replace(/\*\*([^*]+)\*\*/g, (match) => {
       // If there's an unnecessary escaping or messy markers, we could fix here.
       // But usually standard bold is fine.
       return match;
    });
};

const testCases = [
  {
    input: "**Supavisor(연결 풀러)**",
    expected: "**Supavisor(연결 풀러)**", // This should be rendered as bold by ReactMarkdown
  },
  {
    input: "**`code`****text**",
    expected: "**`code`text**",
  },
  {
    input: "****",
    expected: "",
  }
];

testCases.forEach(({ input, expected }, i) => {
  const result = fixMarkdown(input);
  if (result !== expected) {
    console.error(`Test Case ${i} Failed: Input "${input}", Expected "${expected}", Got "${result}"`);
    process.exit(1);
  } else {
    console.log(`Test Case ${i} Passed`);
  }
});
