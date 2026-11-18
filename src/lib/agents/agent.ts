import {
  AgentLog,
  AgentState,
  AgentStreamEvent,
  LLMConfig,
  ProjectFile,
  ProjectPlan,
  SubAgentType,
} from '../types';
import { runPlanner } from './planner';
import { runResearcher } from './researcher';
import { runCoder } from './coder';
import { runPatcher } from './patcher';
import { runPreflightChecks } from './runner';
import { runReporter } from './reporter';

export type EventCallback = (event: AgentStreamEvent) => void;

export class CderAgent {
  private projectName: string;
  private config: LLMConfig;
  private state: AgentState = 'idle';
  private files: Record<string, ProjectFile> = {};
  private plan?: ProjectPlan;
  private onEvent: EventCallback;

  constructor(projectName: string, config: LLMConfig, onEvent: EventCallback) {
    this.projectName = projectName;
    this.config = config;
    this.onEvent = onEvent;
  }

  private log(sender: SubAgentType, message: string, level: AgentLog['level'] = 'info') {
    const logItem: AgentLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      sender,
      message,
      level,
    };
    this.onEvent({ type: 'log', log: logItem });
  }

  private setState(newState: AgentState) {
    this.state = newState;
    this.onEvent({ type: 'state', state: newState });
  }

  public async execute(userPrompt: string): Promise<void> {
    try {
      this.setState('starting');
      this.log('core', `Initializing Cder autonomous engineering session for "${this.projectName}"...`);
      this.log('core', `Configured model: ${this.config.model} (${this.config.provider})`);

      // 1. PLANNING PHASE
      this.setState('planning');
      this.log('planner', 'Deconstructing prompt into actionable engineering milestones...');
      const plan = await runPlanner(userPrompt, this.projectName, this.config);
      this.plan = plan;
      this.onEvent({ type: 'plan', plan });
      this.log('planner', `Plan generated: "${plan.title}" with ${plan.steps.length} sequential steps.`, 'success');

      // 2. RESEARCH PHASE
      this.setState('researching');
      this.log('researcher', 'Researching API contracts, packages, and architecture patterns...');
      const research = await runResearcher(userPrompt, plan, this.config);
      this.log('researcher', `Research completed. Synthesized key technical constraints.`, 'success');

      // 3. CODING PHASE
      this.setState('coding');
      this.log('coder', `Generating code for ${plan.requiredFiles.length} planned project files...`);
      const generatedFiles = await runCoder(userPrompt, plan, research.summary, this.config);

      this.files = generatedFiles;
      this.onEvent({ type: 'files_sync', files: this.files });

      const fileCount = Object.keys(generatedFiles).length;
      this.log('coder', `Generated ${fileCount} files successfully.`, fileCount > 0 ? 'success' : 'warn');

      // 4. PATCHING & DEBUGGING PHASE
      this.setState('patching');
      this.log('patcher', 'Inspecting codebase for broken imports, syntax mismatches, and missing files...');
      const patchResult = await runPatcher(this.files, plan, this.config);
      this.files = patchResult.files;
      this.onEvent({ type: 'files_sync', files: this.files });

      if (patchResult.patchesApplied.length > 0) {
        this.log('patcher', `Applied patches to: ${patchResult.patchesApplied.join(', ')}`, 'info');
      } else {
        this.log('patcher', 'No syntax anomalies detected. Codebase verified.', 'success');
      }

      // 5. RUNNER / PRE-FLIGHT VERIFICATION
      this.setState('running');
      this.log('runner', 'Executing pre-flight build checks and manifest verification...');
      const runResults = runPreflightChecks(this.files, plan);
      for (const msg of runResults.logs) {
        this.log('runner', msg);
      }

      // 6. REPORTING PHASE
      this.setState('reporting');
      this.log('reporter', 'Compiling executive engineering report and run guide...');
      const report = await runReporter(userPrompt, plan, this.files, this.config);
      this.onEvent({ type: 'report', report });
      this.log('reporter', 'Engineering summary ready.', 'success');

      // 7. COMPLETED
      this.setState('completed');
      this.log('core', `Project "${this.projectName}" completed successfully. Ready for download or deployment.`, 'success');
      this.onEvent({ type: 'done' });
    } catch (err: unknown) {
      this.setState('error');
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.log('core', `Agent execution error: ${errorMessage}`, 'error');
      this.onEvent({ type: 'error', error: errorMessage });
    }
  }
}
