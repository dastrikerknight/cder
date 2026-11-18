import json
import re

PLANNER_PROMPT = """You are the Planner Agent of Cder, an autonomous agentic software engineering system inspired by Devika.
Your duty is to break down any high-level software development goal into an actionable, structured, step-by-step engineering plan.

You must output STRICT JSON matching this schema:
{
  "title": "Short descriptive title of the project",
  "description": "High level architecture and goal summary",
  "techStack": ["Tech1", "Tech2"],
  "requiredFiles": ["src/main.py", "requirements.txt", "README.md"],
  "steps": [
    {
      "id": 1,
      "title": "Step title",
      "description": "What this step achieves",
      "status": "pending"
    }
  ]
}
Return raw JSON only. Do not wrap in markdown fences.
"""

class Planner:
    def __init__(self, llm_client):
        self.llm = llm_client

    def execute(self, prompt: str, project_name: str) -> dict:
        user_msg = f"Project: {project_name}\nPrompt: {prompt}\nCreate the software architecture plan."
        raw_res = self.llm.generate(PLANNER_PROMPT, user_msg)
        cleaned = re.sub(r"^```json\s*", "", raw_res, flags=re.MULTILINE)
        cleaned = re.sub(r"^```\s*", "", cleaned, flags=re.MULTILINE).strip()
        try:
            return json.loads(cleaned)
        except Exception:
            return {
                "title": project_name,
                "description": prompt,
                "techStack": ["Python"],
                "requiredFiles": ["main.py", "README.md"],
                "steps": [{"id": 1, "title": "Setup", "description": prompt, "status": "pending"}]
            }
