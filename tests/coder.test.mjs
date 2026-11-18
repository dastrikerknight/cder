import test from 'node:test';
import assert from 'node:assert/strict';

// Import parser logic to test directly
function parseGeneratedFiles(rawOutput) {
  const files = {};
  const regex = /<<<FILE:([^\n\r>]+)>>>([\s\S]*?)<<<END_FILE>>>/g;

  let match;
  while ((match = regex.exec(rawOutput)) !== null) {
    let filePath = match[1].trim();
    // Path traversal sanitization (fixes Devika CWE-22 issue)
    filePath = filePath.replace(/^[\\/]+/, '').replace(/\.\.[\\/]/g, '');

    const content = match[2].trimStart();
    const ext = filePath.split('.').pop()?.toLowerCase() || '';

    let language = 'plaintext';
    if (['js', 'jsx'].includes(ext)) language = 'javascript';
    else if (['ts', 'tsx'].includes(ext)) language = 'typescript';
    else if (['py'].includes(ext)) language = 'python';
    else if (['html'].includes(ext)) language = 'html';
    else if (['css'].includes(ext)) language = 'css';
    else if (['json'].includes(ext)) language = 'json';
    else if (['md'].includes(ext)) language = 'markdown';
    else if (['yaml', 'yml'].includes(ext)) language = 'yaml';
    else if (['sh', 'bash'].includes(ext)) language = 'bash';

    if (filePath) {
      files[filePath] = {
        path: filePath,
        content,
        language,
      };
    }
  }

  // Fallback: If no delimiters matched
  if (Object.keys(files).length === 0) {
    const mdBlockRegex = /```([a-zA-Z0-9_\-\.]+)?\s*(?:\/\/\s*|#\s*)?(?:file:\s*|filename:\s*)?([^\n\r`]+)?\n([\s\S]*?)```/g;
    let mdMatch;
    let fallbackIndex = 1;

    while ((mdMatch = mdBlockRegex.exec(rawOutput)) !== null) {
      const langHint = (mdMatch[1] || '').trim().toLowerCase();
      let detectedName = (mdMatch[2] || '').trim();
      const codeContent = mdMatch[3].trimStart();

      if (!detectedName || detectedName.includes(' ') || detectedName.length > 50) {
        const ext = langHint === 'typescript' ? 'ts' : langHint === 'javascript' ? 'js' : langHint || 'txt';
        detectedName = `file_${fallbackIndex++}.${ext}`;
      }

      detectedName = detectedName.replace(/^[\\/]+/, '').replace(/\.\.[\\/]/g, '');
      files[detectedName] = {
        path: detectedName,
        content: codeContent,
        language: langHint || 'plaintext',
      };
    }
  }

  return files;
}

test('Coder: correctly parses standard file blocks', () => {
  const sample = `
Some intro remarks from the Coder agent.

<<<FILE:src/index.ts>>>
console.log("Hello from Cder!");
<<<END_FILE>>>

<<<FILE:package.json>>>
{
  "name": "sample-app",
  "version": "1.0.0"
}
<<<END_FILE>>>
`;

  const files = parseGeneratedFiles(sample);
  assert.equal(Object.keys(files).length, 2);
  assert.ok(files['src/index.ts']);
  assert.equal(files['src/index.ts'].language, 'typescript');
  assert.ok(files['src/index.ts'].content.includes('Hello from Cder!'));
  assert.ok(files['package.json']);
  assert.equal(files['package.json'].language, 'json');
});

test('Coder Security: sanitizes directory traversal paths (CWE-22 prevention)', () => {
  const maliciousSample = `
<<<FILE:../../../../etc/passwd>>>
root:x:0:0:root:/root:/bin/bash
<<<END_FILE>>>

<<<FILE:..\\..\\windows\\system32\\cmd.exe>>>
malicious payload
<<<END_FILE>>>
`;

  const files = parseGeneratedFiles(maliciousSample);
  const paths = Object.keys(files);
  for (const p of paths) {
    assert.equal(p.includes('..'), false, `Path must not contain traversal characters: ${p}`);
  }
  assert.ok(files['etc/passwd']);
});

test('Coder: handles fallback markdown codeblocks gracefully', () => {
  const mdSample = `
Here is your code:

\`\`\`javascript // file: server.js
const express = require('express');
const app = express();
app.listen(3000);
\`\`\`
`;

  const files = parseGeneratedFiles(mdSample);
  assert.ok(files['server.js']);
  assert.equal(files['server.js'].language, 'javascript');
});
