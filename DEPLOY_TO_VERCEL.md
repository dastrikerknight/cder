# Deploying Cder to Vercel

Cder is an autonomous agentic software engineering system inspired by Devin and Devika. While the original Devika repository relies on long-running Python daemons and WebSocket servers (which conflict with serverless hosting limits), **Cder is architected specifically for Vercel Serverless & Edge execution** using HTTP Server-Sent Events (SSE) streaming and stateless sub-agents.

---

## 🚀 Method 1: Deploy via GitHub (Recommended - 1 Click)

1. **Initialize Git & Push to GitHub**:
   ```bash
   cd cder
   git init
   git add .
   git commit -m "feat: initial commit of Cder agentic software engineer"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cder.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your `cder` GitHub repository.
   - Framework Preset: **Next.js** (detected automatically).
   - Root Directory: `./` (leave default).

3. **Configure Environment Variables in Vercel**:
   In the Vercel project configuration screen, add at least one of the following under **Environment Variables**:
   
   | Variable | Value | Description |
   |---|---|---|
   | `GEMINI_API_KEY` | `AIzaSy...` | *(Recommended)* Google Gemini API Key |
   | `OPENAI_API_KEY` | `sk-...` | OpenAI API Key (for GPT-4o / o1) |
   | `ANTHROPIC_API_KEY` | `sk-ant-...` | Anthropic API Key (for Claude 3.5 Sonnet) |
   | `GROQ_API_KEY` | `gsk_...` | Groq API Key (for ultra-fast Llama 3.3) |

   *(Note: Users can also input their own API keys directly in the Cder web interface via the Settings modal!)*

4. **Click Deploy**:
   Vercel will build and deploy your application to a live URL (e.g. `https://cder-yourname.vercel.app`).

---

## ⚡ Method 2: Deploy via Vercel CLI

If you have Node.js and the Vercel CLI installed:

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy directly from the terminal**:
   ```bash
   cd cder
   vercel
   ```
   Follow the prompts to link to your Vercel account.

3. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

4. **Add Environment Variables via CLI**:
   ```bash
   vercel env add GEMINI_API_KEY
   ```

---

## ⚙️ Architecture & Vercel Optimizations

- **Vercel Serverless Function Limits**:
  In `vercel.json`, functions are configured with `maxDuration: 60` seconds and `1024MB` memory to allow multi-agent reasoning, planning, and multi-file code synthesis.
- **Server-Sent Events (SSE)**:
  Real-time communication uses standard HTTP streaming (`text/event-stream`). This avoids WebSocket disconnections on serverless lambdas.
- **Client-Side ZIP Generation**:
  Project codefiles are packaged and downloaded directly in the client browser using JSZip, minimizing serverless RAM overhead.
- **Path Traversal Security**:
  Unlike early Devika releases (which were flagged for CWE-22 path traversal), Cder includes path normalization and boundary sanitization on all generated code paths.
