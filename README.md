# Cder ⚡
### Autonomous Agentic AI Software Engineer (Devika Alternative for Vercel)

**Cder** is an open-source autonomous agentic software engineering platform inspired by Devin and Devika (`stitionai/devika`). It takes high-level user instructions, breaks them down into architectural plans, researches relevant documentation and libraries, writes multi-file production-ready code, verifies syntax, and compiles an executive engineering report.

Unlike legacy Python-only implementations that depend on persistent WebSocket servers and background daemons (making them incompatible with serverless environments), **Cder is built natively for Vercel**, running serverless sub-agents with real-time Server-Sent Events (SSE) streaming and interactive web UI.

---

## 🏗️ Multi-Agent Architecture

```text
                             [ User Prompt ]
                                    │
                                    ▼
                         [ Cder Agent Core ]
                                    │
    ┌───────────────────────────────┴──────────────────────────────┐
    ▼                                                              ▼
1. Planner Agent        ──► Deconstructs goal into tasks & required files
2. Researcher Agent     ──► Synthesizes API signatures & design patterns
3. Coder Agent          ──► Generates complete multi-file source code
4. Patcher Agent        ──► Debugs syntax, fixes broken imports & edge cases
5. Runner Agent         ──► Performs pre-flight build & manifest verification
6. Reporter Agent       ──► Produces executive deliverable report & run guide
    │
    ▼
[ Interactive UI Dashboard ] ──► Real-time logs, Monaco-style editor, 1-Click ZIP Download
```

---

## 🌟 Key Features

- **Devika Multi-Agent Logic**: Ported and enhanced sub-agent orchestration (Planner, Researcher, Coder, Patcher, Runner, Reporter).
- **Vercel Native**: Zero server setup, zero Docker requirement. Deploys seamlessly to Vercel Serverless.
- **Real-Time Streaming**: Live thoughts and execution logs delivered via standard HTTP Server-Sent Events (SSE).
- **Multi-LLM Provider Support**:
  - Google Gemini (Gemini 2.5 Flash, 1.5 Pro)
  - Anthropic (Claude 3.5 Sonnet, Claude 3.5 Haiku)
  - OpenAI (GPT-4o, GPT-4o-mini, o1)
  - Groq (Llama 3.3 70B Versatile)
  - OpenRouter
- **Integrated Workspace & Code Viewer**:
  - Interactive file tree explorer.
  - Multi-language syntax rendering.
  - One-click project download as `.zip`.
- **Hardened Security**: Includes automatic path traversal protection (mitigating CWE-22 issues found in earlier agentic implementations).
- **Dual Runtime**: Contains both the Next.js fullstack Vercel app and the standalone Python backend (`backend_python/`).

---

## 🚀 Quickstart (Local Development)

### 1. Web Application (Next.js)

```bash
cd cder

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Standalone Python CLI

If you want to run Cder directly from Python terminal:

```bash
cd cder/backend_python
pip install -r requirements.txt
export GEMINI_API_KEY="your-api-key"

python cder.py --prompt "Create a fast URL shortener microservice with SQLite" --project url_shortener
```

---

## ☁️ Deploy to Vercel

See [DEPLOY_TO_VERCEL.md](DEPLOY_TO_VERCEL.md) for full instructions:
1. Push this repository to GitHub.
2. Import the project into [vercel.com](https://vercel.com).
3. Set your `GEMINI_API_KEY` (or other LLM key) under Environment Variables.
4. Click **Deploy**!

---

## 📜 License

MIT License. Inspired by [stitionai/devika](https://github.com/stitionai/devika).
