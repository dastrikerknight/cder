export type AgentState =
  | 'idle'
  | 'starting'
  | 'planning'
  | 'researching'
  | 'coding'
  | 'patching'
  | 'running'
  | 'reporting'
  | 'completed'
  | 'error';

export type SubAgentType =
  | 'core'
  | 'planner'
  | 'researcher'
  | 'coder'
  | 'patcher'
  | 'runner'
  | 'reporter';

export interface PlanStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ProjectPlan {
  title: string;
  description: string;
  techStack: string[];
  requiredFiles: string[];
  steps: PlanStep[];
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  sender: SubAgentType;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface AgentStreamEvent {
  type:
    | 'state'
    | 'plan'
    | 'log'
    | 'file_created'
    | 'file_updated'
    | 'files_sync'
    | 'report'
    | 'error'
    | 'done';
  state?: AgentState;
  plan?: ProjectPlan;
  log?: AgentLog;
  file?: ProjectFile;
  files?: Record<string, ProjectFile>;
  report?: string;
  error?: string;
}

export type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'openrouter';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  plan?: ProjectPlan;
  report?: string;
}
