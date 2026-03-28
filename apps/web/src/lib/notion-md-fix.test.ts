import { describe, it, expect } from 'vitest';

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

describe('notion-md-fix', () => {
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

  it('fixes markdown correctly', () => {
    testCases.forEach(({ input, expected }) => {
      const result = fixMarkdown(input);
      expect(result).toBe(expected);
    });
  });
});
