RESEARCHER_PROMPT = """You are the Researcher Agent of Cder.
Your responsibility is to analyze the engineering plan, identify key libraries, syntax patterns, and API signatures.
Synthesize clean engineering context and guidelines for the Coder agent.
"""

class Researcher:
    def __init__(self, llm_client):
        self.llm = llm_client

    def execute(self, prompt: str, plan: dict) -> dict:
        user_msg = (
            f"Project: {plan.get('title')}\n"
            f"Tech Stack: {plan.get('techStack')}\n"
            f"Planned Files: {plan.get('requiredFiles')}\n"
            f"Original Request: {prompt}\n\n"
            "Provide technical guidelines, library recommendations, and design patterns."
        )
        summary = self.llm.generate(RESEARCHER_PROMPT, user_msg)
        return {
            "summary": summary,
            "queries": [f"{plan.get('title')} architecture"]
        }
