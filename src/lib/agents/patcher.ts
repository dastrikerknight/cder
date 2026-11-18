import { generateText } from '../llm';
import { LLMConfig, ProjectFile, ProjectPlan } from '../types';
import { parseGeneratedFiles } from './coder';

const PATCHER_SYSTEM_PROMPT = `You are the Patcher & Debugger Agent of Cder.
Your job is to perform a rigorous code review on the newly generated codebase:
1. Verify all imports and file references resolve correctly.
2. Check for missing packages in package.json / requirements.txt.
3. Catch unhandled errors, broken syntax, or omitted functions.
4. If any file needs a fix, output the corrected version of that file using:
<<<FILE:path/to/file.ext>>>
[complete corrected file content]
<<<END_FILE>>>

If no fixes are needed, respond with "NO_PATCHES_NEEDED".`;

export async function runPatcher(
  files: Record<string, ProjectFile>,
  plan: ProjectPlan,
  config: LLMConfig
): Promise<{ files: Record<string, ProjectFile>; patchesApplied: string[] }> {
  const fileSummaries = Object.values(files)
    .map((f) => `--- File: ${f.path} ---\n${f.content.slice(0, 1500)}${f.content.length > 1500 ? '\n... [truncated]' : ''}`)
    .join('\n\n');

  const userPrompt = `Project: ${plan.title}
File List: ${Object.keys(files).join(', ')}

Codebase Snippets:
${fileSummaries}

Review these files for syntax errors, missing dependencies, or runtime issues. Provide fixes using <<<FILE:path>>> format if needed, or say NO_PATCHES_NEEDED.`;

  const response = await generateText({
    systemPrompt: PATCHER_SYSTEM_PROMPT,
    userPrompt,
    config,
    temperature: 0.1,
  });

  const updatedFiles = { ...files };
  const patchesApplied: string[] = [];

  if (!response.includes('NO_PATCHES_NEEDED')) {
    const patched = parseGeneratedFiles(response);
    for (const [path, file] of Object.entries(patched)) {
      updatedFiles[path] = file;
      patchesApplied.push(path);
    }
  }

  return {
    files: updatedFiles,
    patchesApplied,
  };
}
