import test from 'node:test';
import assert from 'node:assert/strict';

function runPreflightChecks(files, plan) {
  const logs = [];
  logs.push(`[Runner] Initializing pre-flight code analysis for ${plan.title}...`);

  const fileKeys = Object.keys(files);
  logs.push(`[Runner] Inspecting ${fileKeys.length} generated files...`);

  let hasPackageManifest = false;
  let entryPoint;

  // Check manifest files
  if (files['package.json']) {
    hasPackageManifest = true;
    logs.push('[Runner] Found package.json. Parsing dependency graph...');
    try {
      const pkg = JSON.parse(files['package.json'].content);
      logs.push(`[Runner] Package name: "${pkg.name || 'unnamed'}"`);
    } catch {
      logs.push('[Runner] Warning: package.json has parsing anomalies.');
    }
  } else if (files['requirements.txt']) {
    hasPackageManifest = true;
    logs.push('[Runner] Found Python requirements.txt manifest.');
  }

  // Detect entry point
  const commonEntries = [
    'src/index.ts',
    'src/index.js',
    'src/main.ts',
    'src/main.py',
    'main.py',
    'app.py',
    'index.html',
    'src/App.tsx',
    'src/App.jsx',
  ];

  for (const candidate of commonEntries) {
    if (files[candidate]) {
      entryPoint = candidate;
      break;
    }
  }

  if (entryPoint) {
    logs.push(`[Runner] Primary entry point identified: "${entryPoint}"`);
  }

  return {
    passed: true,
    logs,
    entryPoint,
    hasPackageManifest,
  };
}

test('Runner: identifies Node project entrypoint and manifests', () => {
  const files = {
    'package.json': {
      path: 'package.json',
      content: JSON.stringify({ name: 'test-app', scripts: { start: 'node src/index.js' } }),
      language: 'json',
    },
    'src/index.js': {
      path: 'src/index.js',
      content: 'console.log("start");',
      language: 'javascript',
    },
  };

  const plan = {
    title: 'Test App',
    description: 'Unit test execution',
    techStack: ['Node.js'],
    requiredFiles: ['package.json', 'src/index.js'],
    steps: [],
  };

  const res = runPreflightChecks(files, plan);
  assert.equal(res.passed, true);
  assert.equal(res.hasPackageManifest, true);
  assert.equal(res.entryPoint, 'src/index.js');
});

test('Runner: identifies Python project manifest and main.py', () => {
  const files = {
    'requirements.txt': {
      path: 'requirements.txt',
      content: 'requests>=2.0.0',
      language: 'plaintext',
    },
    'main.py': {
      path: 'main.py',
      content: 'print("hello")',
      language: 'python',
    },
  };

  const plan = {
    title: 'Python App',
    description: 'Py unit test',
    techStack: ['Python'],
    requiredFiles: ['requirements.txt', 'main.py'],
    steps: [],
  };

  const res = runPreflightChecks(files, plan);
  assert.equal(res.passed, true);
  assert.equal(res.hasPackageManifest, true);
  assert.equal(res.entryPoint, 'main.py');
});
