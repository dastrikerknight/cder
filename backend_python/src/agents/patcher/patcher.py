import re
import os

PATCHER_PROMPT = """You are the Patcher & Debugger Agent of Cder.
Review the generated code files for syntax issues, missing imports, or missing files.
If fixes are needed, output updated files with <<<FILE:path>>>...<<<END_FILE>>>.
Otherwise respond with NO_PATCHES_NEEDED.
"""

class Patcher:
    def __init__(self, llm_client):
        self.llm = llm_client

    def execute(self, files: dict, plan: dict) -> tuple[dict, list]:
        snippets = "\n".join([f"--- {p} ---\n{c[:1000]}" for p, c in files.items()])
        user_msg = f"Project: {plan.get('title')}\nFiles:\n{snippets}\nAudit and patch."
        res = self.llm.generate(PATCHER_PROMPT, user_msg)
        
        updated = dict(files)
        patched_paths = []
        if "NO_PATCHES_NEEDED" not in res:
            pattern = r"<<<FILE:([^>\n\r]+)>>>([\s\S]*?)<<<END_FILE>>>"
            for filepath, content in re.findall(pattern, res):
                clean_path = os.path.normpath(filepath.strip()).replace("..", "").lstrip("/\\")
                if clean_path:
                    updated[clean_path] = content.lstrip("\r\n")
                    patched_paths.append(clean_path)
        return updated, patched_paths
