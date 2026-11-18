import os
from .planner.planner import Planner
from .researcher.researcher import Researcher
from .coder.coder import Coder
from .patcher.patcher import Patcher
from .runner.runner import Runner
from .reporter.reporter import Reporter

class Agent:
    def __init__(self, llm_client, workspace_dir: str = "./projects"):
        self.llm = llm_client
        self.workspace_dir = workspace_dir
        self.planner = Planner(llm_client)
        self.researcher = Researcher(llm_client)
        self.coder = Coder(llm_client)
        self.patcher = Patcher(llm_client)
        self.runner = Runner()
        self.reporter = Reporter(llm_client)

    def execute(self, prompt: str, project_name: str) -> dict:
        print(f"\n[Cder Agent Core] Initializing project: {project_name}")
        
        # 1. Plan
        print("[Planner] Generating architectural roadmap...")
        plan = self.planner.execute(prompt, project_name)

        # 2. Research
        print("[Researcher] Synthesizing libraries and API signatures...")
        research = self.researcher.execute(prompt, plan)

        # 3. Code
        print(f"[Coder] Generating {len(plan.get('requiredFiles', []))} project files...")
        files = self.coder.execute(prompt, plan, research["summary"])

        # 4. Patch
        print("[Patcher] Reviewing syntax and imports...")
        files, patches = self.patcher.execute(files, plan)

        # 5. Run Sanity Checks
        print("[Runner] Running sanity verification...")
        logs = self.runner.execute(files, plan)

        # 6. Report
        print("[Reporter] Compiling executive deliverable report...")
        report = self.reporter.execute(prompt, plan, files)

        # Save files to disk
        target_dir = os.path.join(self.workspace_dir, project_name)
        os.makedirs(target_dir, exist_ok=True)
        for filepath, content in files.items():
            full_path = os.path.join(target_dir, filepath)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
        
        with open(os.path.join(target_dir, "CDER_REPORT.md"), "w", encoding="utf-8") as f:
            f.write(report)

        print(f"[Cder Agent Core] Successfully saved {len(files)} files to {target_dir}")
        return {
            "project_name": project_name,
            "target_dir": target_dir,
            "plan": plan,
            "files": files,
            "report": report
        }
