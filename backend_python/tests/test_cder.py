import unittest
import os
import re

class TestCoderSanitization(unittest.TestCase):
    def test_path_traversal_sanitization(self):
        malicious_paths = [
            "../../../../etc/shadow",
            "..\\..\\system32\\calc.exe",
            "/absolute/root/file.txt",
            "normal/src/index.py"
        ]
        clean_paths = []
        for p in malicious_paths:
            clean = os.path.normpath(p.strip()).replace("..", "").lstrip("/\\")
            clean_paths.append(clean)

        for p in clean_paths:
            self.assertFalse(".." in p)
            self.assertFalse(p.startswith("/"))
            self.assertFalse(p.startswith("\\"))

    def test_file_parsing(self):
        sample = """
<<<FILE:src/app.py>>>
print("hello world")
<<<END_FILE>>>
"""
        pattern = r"<<<FILE:([^>\n\r]+)>>>([\s\S]*?)<<<END_FILE>>>"
        matches = re.findall(pattern, sample)
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0][0].strip(), "src/app.py")
        self.assertIn("hello world", matches[0][1])

if __name__ == "__main__":
    unittest.main()
