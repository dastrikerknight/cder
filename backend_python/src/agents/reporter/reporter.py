REPORTER_PROMPT = """You are the Reporter Agent of Cder.
Create an executive Markdown engineering report summarizing the architecture, generated file manifest, setup steps, and how to run the project.
"""

class Reporter:
    def __init__(self, llm_client):
        self.llm = llm_client

    def execute(self, prompt: str, plan: dict, files: dict) -> str:
        manifest = "\n".join([f"- {f} ({len(c.splitlines())} lines)" for f, c in files.items()])
        user_msg = (
            f"Project: {plan.get('title')}\n"
            f"Prompt: {prompt}\n"
            f"Generated Files:\n{manifest}\n"
            "Compile the executive engineering report."
        )
        return self.llm.generate(REPORTER_PROMPT, user_msg)
