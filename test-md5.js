const fixMarkdown = (md) => {
  if (!md) return md;
  let current = md;
  let previous;
  
  // Repeatedly unescape until no more changes (handles double/triple escaping)
  // And remove the redundant markers
  do {
    previous = current;
    current = current
      .replace(/\*\*\*\*/g, '')
      .replace(/~~~~/g, '')
      .replace(/\*\* \*\*/g, ' ')
      .replace(/__ __/g, ' ')
      .replace(/\\([*|_~`\[\]()#+!.-])/g, '$1');
  } while (current !== previous);
  
  return current;
};

const testCases = [
  { 
    name: 'Double Escaped Bold', 
    input: "\\\\\\*\\\\\\*text\\\\\\*\\\\\\*", // In JS string, this represents many backslashes
    // Let's use a simpler way to represent literal backslashes
  }
];

// Re-testing with literal backslashes
const input1 = "\\*\\*text\\*\\*"; // One \
const input2 = "\\\\*\\\\*text\\\\*\\\\*"; // Two \

console.log('Input 1:', input1, '->', fixMarkdown(input1));
console.log('Input 2:', input2, '->', fixMarkdown(input2));

const userCase = "\\*\\*비대해진 서비스(Fat Service)\\*\\*";
console.log('User Case:', userCase, '->', fixMarkdown(userCase));

const multiEscaped = "Supavisor\\\\(text\\\\)";
console.log('Multi Escaped Paren:', multiEscaped, '->', fixMarkdown(multiEscaped));
