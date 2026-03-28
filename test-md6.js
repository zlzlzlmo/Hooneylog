const fixMarkdown = (md) => {
  if (!md) return md;
  
  // 1. First, handle the most common Notion-to-MD escaping issues
  let result = md
    .replace(/\*\*\*\*/g, '')
    .replace(/~~~~/g, '')
    .replace(/\*\* \*\*/g, ' ')
    .replace(/__ __/g, ' ');

  // 2. Unescape markers recursively
  let previous;
  do {
    previous = result;
    result = result.replace(/\\([*|_~`\[\]()#+!.-])/g, '$1');
  } while (result !== previous);

  // 3. Fix adjacent bold markers that should be merged
  // Example: **bold****text** -> **boldtext**
  result = result.replace(/\*\*\*\*/g, '');
  
  // 4. Fix Notion's "1)" list style to standard "1."
  result = result.replace(/^(\s*)(\d+)\)\s/gm, '$1$2. ');

  return result;
};

const input = "작은 프로젝트에 과한 아키텍처를 적용하면 보일러플레이트 코드에 지치게 되고, 반대로 거대한 프로젝트를 단순한 구조로 짜면 \\*\\*비대해진 서비스(Fat Service)\\*\\*와 스파게티 코드를 마주하게 됩니다.";
const expected = "작은 프로젝트에 과한 아키텍처를 적용하면 보일러플레이트 코드에 지치게 되고, 반대로 거대한 프로젝트를 단순한 구조로 짜면 **비대해진 서비스(Fat Service)**와 스파게티 코드를 마주하게 됩니다.";

const result = fixMarkdown(input);
console.log('Result matched expected:', result === expected);
if (result !== expected) {
  console.log('Got:     ', result);
  console.log('Expected:', expected);
}

const listInput = "1) First item\n2) Second item";
console.log('List conversion:\n', fixMarkdown(listInput));
