import { generateText } from '../llm';
import { LLMConfig, ProjectFile, ProjectPlan } from '../types';

const CODER_SYSTEM_PROMPT = `You are the Coder Agent of Cder, an autonomous agentic software engineer.
Your mission is to generate the complete, working source code for all required files in the project.

CRITICAL INSTRUCTIONS:
1. Write real, complete, production-grade code. DO NOT leave placeholders like "// TODO: implement this later" or "// your code here".
2. You MUST output each file using this EXACT delimiter format:

<<<FILE:path/to/file.ext>>>
[entire file content goes here]
<<<END_FILE>>>

3. Include every necessary file: entry points, components/modules, style sheets, configs (e.g. package.json, requirements.txt, tsconfig.json), and README.md with clear run/test instructions.
4. Keep file paths clean and relative to project root (e.g. src/index.ts, public/index.html). Never use parent directory traversals like ../.
5. Provide modern, clean, self-contained code with robust error handling.`;

export function parseGeneratedFiles(rawOutput: string): Record<string, ProjectFile> {
  const files: Record<string, ProjectFile> = {};
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

  // Fallback: If no delimiters matched (rare edge case where LLM used markdown blocks)
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

export async function runCoder(
  prompt: string,
  plan: ProjectPlan,
  researchSummary: string,
  config: LLMConfig
): Promise<Record<string, ProjectFile>> {
  const userPrompt = `Project: ${plan.title}
Architecture Overview:
${plan.description}

Required Files to Create:
${plan.requiredFiles.map((f) => `- ${f}`).join('\n')}

Research & Technical Guidelines:
${researchSummary}

User Request:
${prompt}

Generate all project files now using the <<<FILE:path>>> ... <<<END_FILE>>> format.`;

  const rawOutput = await generateText({
    systemPrompt: CODER_SYSTEM_PROMPT,
    userPrompt,
    config,
    temperature: 0.2,
  });

  return parseGeneratedFiles(rawOutput);
}
