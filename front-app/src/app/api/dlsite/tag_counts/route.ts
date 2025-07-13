// app/api/dlsite/tag_counts/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get('prefix');

  if (!prefix) {
    return new Response(JSON.stringify({ error: 'Missing prefix' }), { status: 400 });
  }

  const url = `https://bouz3ltmq6.execute-api.ap-northeast-1.amazonaws.com/test/dlsite_data/index/${prefix}/tag_counts`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Fetch failed' }), { status: 500 });
  }
}
