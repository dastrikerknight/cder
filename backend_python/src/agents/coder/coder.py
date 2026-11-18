import re
import os

CODER_PROMPT = """You are the Coder Agent of Cder.
Your duty is to write real, complete, production-grade source code for every file specified in the plan.
Output every single file strictly formatted as:

<<<FILE:path/to/file.ext>>>
[entire file content]
<<<END_FILE>>>

Never output incomplete code or placeholders. Include all configs, manifests, and documentation.
"""

class Coder:
    def __init__(self, llm_client):
        self.llm = llm_client

    def execute(self, prompt: str, plan: dict, research: str) -> dict:
        user_msg = (
            f"Project: {plan.get('title')}\n"
            f"Files to generate:\n" + "\n".join([f"- {f}" for f in plan.get('requiredFiles', [])]) + "\n\n"
            f"Research Context:\n{research}\n\n"
            f"User Goal:\n{prompt}\n\n"
            "Generate all files using <<<FILE:path>>>...<<<END_FILE>>> format now."
        )
        raw_output = self.llm.generate(CODER_PROMPT, user_msg)
        return self.parse_files(raw_output)

    def parse_files(self, text: str) -> dict:
        files = {}
        pattern = r"<<<FILE:([^>\n\r]+)>>>([\s\S]*?)<<<END_FILE>>>"
        matches = re.findall(pattern, text)
        for filepath, content in matches:
            filepath = filepath.strip().lstrip("/\\")
            # Sanitize path to prevent directory traversal
            clean_path = os.path.normpath(filepath).replace("..", "").lstrip("/\\")
            if clean_path:
                files[clean_path] = content.lstrip("\r\n")
        return files
