import test from 'node:test';
import assert from 'node:assert/strict';

function parsePlanOutput(raw, projectName, prompt) {
  try {
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      title: projectName,
      description: prompt,
      techStack: ['Node.js'],
      requiredFiles: ['src/index.js', 'package.json', 'README.md'],
      steps: [
        {
          id: 1,
          title: 'Project Setup & Scaffolding',
          description: 'Initialize project files and base configuration.',
          status: 'pending',
        },
      ],
    };
  }
}

test('Planner: parses cleanly structured JSON plan', () => {
  const sample = JSON.stringify({
    title: 'URL Shortener',
    description: 'High performance link shortener',
    techStack: ['Node.js', 'Express', 'Redis'],
    requiredFiles: ['src/server.ts', 'package.json', 'README.md'],
    steps: [
      { id: 1, title: 'Setup', description: 'Init project', status: 'pending' },
      { id: 2, title: 'Endpoints', description: 'Create routes', status: 'pending' },
    ],
  });

  const plan = parsePlanOutput(sample, 'URL Shortener', 'Build link shortener');
  assert.equal(plan.title, 'URL Shortener');
  assert.equal(plan.techStack.length, 3);
  assert.equal(plan.requiredFiles.length, 3);
  assert.equal(plan.steps.length, 2);
});

test('Planner: recovers from markdown code fences or invalid JSON', () => {
  const fenced = '```json\n{"title": "Valid Plan", "techStack": ["TS"], "requiredFiles": [], "steps": []}\n```';
  const plan1 = parsePlanOutput(fenced, 'Fallback', 'Prompt');
  assert.equal(plan1.title, 'Valid Plan');

  const invalid = 'This is not JSON';
  const plan2 = parsePlanOutput(invalid, 'Fallback', 'Prompt');
  assert.equal(plan2.title, 'Fallback');
  assert.ok(plan2.requiredFiles.includes('package.json'));
});
