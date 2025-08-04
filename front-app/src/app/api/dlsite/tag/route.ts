// app/api/dlsite/tag/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get('prefix');
  const filename = searchParams.get('filename');

  if (!prefix || !filename) {
    return new Response(JSON.stringify({ error: 'Missing prefix or filename' }), { status: 400 });
  }

  const url = `https://bouz3ltmq6.execute-api.ap-northeast-1.amazonaws.com/test/dlsite_data/${prefix}/${filename}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }
}
