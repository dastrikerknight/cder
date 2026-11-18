export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'cder-agent-engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
