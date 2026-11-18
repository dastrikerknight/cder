import { generateText } from '../llm';
import { LLMConfig, ProjectFile, ProjectPlan } from '../types';

const REPORTER_SYSTEM_PROMPT = `You are the Reporter Agent of Cder.
Your job is to provide a final, executive-level engineering summary of the completed software project for the user.

Format your response as a clean, polished Markdown report:
1. # Project Name & Overview
2. ## Architecture & Technical Highlights
3. ## Generated Files Manifest (table of files and their purposes)
4. ## Quickstart & How to Run
5. ## Verification & Next Steps

Keep it concise, clear, and immediately actionable.`;

export async function runReporter(
  prompt: string,
  plan: ProjectPlan,
  files: Record<string, ProjectFile>,
  config: LLMConfig
): Promise<string> {
  const fileManifest = Object.keys(files)
    .map((p) => `- \`${p}\` (${files[p].content.split('\n').length} lines)`)
    .join('\n');

  const userPrompt = `User Prompt: ${prompt}
Project Title: ${plan.title}
Tech Stack: ${plan.techStack.join(', ')}
Total Files Generated: ${Object.keys(files).length}

Files List:
${fileManifest}

Generate the comprehensive final engineering report.`;

  return generateText({
    systemPrompt: REPORTER_SYSTEM_PROMPT,
    userPrompt,
    config,
    temperature: 0.2,
  });
}
