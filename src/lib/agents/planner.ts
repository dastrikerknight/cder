import { generateText } from '../llm';
import { LLMConfig, ProjectPlan } from '../types';

const PLANNER_SYSTEM_PROMPT = `You are the Planner Agent of Cder, an autonomous agentic software engineering system inspired by Devin and Devika.
Your duty is to break down any high-level software development goal, user prompt, or repository requirement into an actionable, structured, step-by-step engineering plan.

You must output STRICT JSON matching this schema:
{
  "title": "Short descriptive title of the project",
  "description": "High level architecture and goal summary",
  "techStack": ["Technology 1", "Technology 2"],
  "requiredFiles": ["src/index.js", "src/styles.css", "package.json", "README.md"],
  "steps": [
    {
      "id": 1,
      "title": "Step 1 title",
      "description": "What this step achieves and which files it prepares",
      "status": "pending"
    }
  ]
}

DO NOT wrap your response with markdown code blocks (no \`\`\`json). Output pure raw JSON only.`;

export async function runPlanner(
  prompt: string,
  projectName: string,
  config: LLMConfig
): Promise<ProjectPlan> {
  const userPrompt = `Project Name: ${projectName}
User Request:
${prompt}

Deconstruct this into a clean, complete, production-ready software project plan. Ensure the requiredFiles cover all necessary logic, config, and documentation without unnecessary bloat. Return raw JSON only.`;

  const raw = await generateText({
    systemPrompt: PLANNER_SYSTEM_PROMPT,
    userPrompt,
    config,
    temperature: 0.2,
  });

  try {
    // Strip possible markdown code fences if LLM added them
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed: ProjectPlan = JSON.parse(cleaned);
    return parsed;
  } catch {
    // Fallback if parsing fails
    return {
      title: projectName,
      description: prompt,
      techStack: ['Node.js', 'TypeScript/JavaScript'],
      requiredFiles: ['src/index.js', 'package.json', 'README.md'],
      steps: [
        {
          id: 1,
          title: 'Project Setup & Scaffolding',
          description: 'Initialize project files and base configuration.',
          status: 'pending',
        },
        {
          id: 2,
          title: 'Core Implementation',
          description: 'Implement core software logic based on user request.',
          status: 'pending',
        },
        {
          id: 3,
          title: 'Testing & Verification',
          description: 'Validate behavior, edge cases, and documentation.',
          status: 'pending',
        },
      ],
    };
  }
}
