import { generateText } from '../llm';
import { LLMConfig, ProjectPlan } from '../types';

const RESEARCHER_SYSTEM_PROMPT = `You are the Researcher Agent of Cder.
Your responsibility is to analyze the engineering plan, determine critical technical libraries, syntax patterns, edge cases, and architectural best practices.
You extract search queries, synthesize API contracts, and provide concise, high-value technical context for the Coder agent.

Output a structured research summary in Markdown covering:
1. Recommended Libraries & Versions
2. Key API Signatures & Data Schemas
3. Common Pitfalls & Security / Edge Case Considerations
4. Implementation Guidelines`;

export interface ResearchResult {
  summary: string;
  queries: string[];
}

export async function runResearcher(
  prompt: string,
  plan: ProjectPlan,
  config: LLMConfig
): Promise<ResearchResult> {
  const userPrompt = `User Prompt: ${prompt}
Project: ${plan.title}
Tech Stack: ${plan.techStack.join(', ')}
Planned Files: ${plan.requiredFiles.join(', ')}

Analyze what specific documentation, modern library APIs, and design patterns the Coder will need to execute this plan flawlessly. Provide actionable, concise engineering references.`;

  const summary = await generateText({
    systemPrompt: RESEARCHER_SYSTEM_PROMPT,
    userPrompt,
    config,
    temperature: 0.2,
  });

  const queries = [
    `${plan.techStack[0] || 'software'} best practices`,
    `${plan.title} architecture`,
    `${plan.requiredFiles[0] || 'index'} implementation`,
  ];

  return {
    summary,
    queries,
  };
}
