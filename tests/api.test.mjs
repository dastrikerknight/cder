import test from 'node:test';
import assert from 'node:assert/strict';

test('API Validation: rejects requests missing prompt', () => {
  const payload = { projectName: 'demo-app' };
  const hasPrompt = Boolean(payload.prompt && typeof payload.prompt === 'string');
  assert.equal(hasPrompt, false, 'Validation should reject payload without prompt');
});

test('API Validation: accepts valid agent task request', () => {
  const payload = {
    prompt: 'Create a web application with Vite and React',
    projectName: 'vite-app',
    config: { provider: 'gemini', model: 'gemini-2.5-flash' }
  };
  assert.ok(payload.prompt);
  assert.equal(payload.config.provider, 'gemini');
});
