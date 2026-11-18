#!/usr/bin/env python3
import sys
import argparse
from src.llm.llm import LLM
from src.agents.agent import Agent

def main():
    parser = argparse.ArgumentParser(description="Cder - Autonomous AI Software Engineer (Devika logic)")
    parser.add_argument("--prompt", "-p", type=str, required=True, help="Software task description")
    parser.add_argument("--project", "-n", type=str, default="cder_demo", help="Project name")
    parser.add_argument("--provider", type=str, default="gemini", choices=["gemini", "openai"], help="LLM Provider")
    parser.add_argument("--model", type=str, default="gemini-2.5-flash", help="Model name")
    parser.add_argument("--output-dir", type=str, default="./projects", help="Output directory")

    args = parser.parse_args()

    llm = LLM(provider=args.provider, model=args.model)
    agent = Agent(llm_client=llm, workspace_dir=args.output_dir)

    print("=" * 60)
    print(" Cder - Agentic AI Software Engineer")
    print("=" * 60)
    result = agent.execute(args.prompt, args.project)
    print("\n✅ Task completed!")
    print(f"📁 Files written to: {result['target_dir']}")

if __name__ == "__main__":
    main()
