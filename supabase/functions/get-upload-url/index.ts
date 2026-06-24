import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  let userId: string;
  let contentType: string;
  try {
    const body = await req.json();
    userId = body.user_id ?? '00000000-0000-0000-0000-000000000001';
    contentType = body.content_type ?? 'video/mp4';
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const ext = contentType === 'video/quicktime' ? 'mov' : 'mp4';
  const path = `${userId}/${Date.now()}.${ext}`;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data, error } = await admin.storage
    .from('videos')
    .createSignedUploadUrl(path);

  if (error || !data) {
    return json({ error: error?.message ?? 'Could not create upload URL.' }, 500);
  }

  return json({ signedUrl: data.signedUrl, path, token: data.token });
});
