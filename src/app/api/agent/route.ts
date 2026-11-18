import { NextRequest } from 'next/server';
import { CderAgent } from '@/lib/agents/agent';
import { LLMConfig } from '@/lib/types';

export const maxDuration = 60; // Set to max allowable on Vercel Pro/Hobby
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, projectName = 'cder-project', config = {} } = body;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const llmConfig: LLMConfig = {
      provider: config.provider || 'gemini',
      model: config.model || (config.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o'),
      apiKey: config.apiKey,
    };

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendEvent = async (event: unknown) => {
      try {
        const payload = `data: ${JSON.stringify(event)}\n\n`;
        await writer.write(encoder.encode(payload));
      } catch {
        // Stream may have closed on client disconnect
      }
    };

    // Run agent in background and stream events
    (async () => {
      try {
        const agent = new CderAgent(projectName, llmConfig, (event) => {
          sendEvent(event);
        });
        await agent.execute(prompt);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await sendEvent({ type: 'error', error: msg });
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
