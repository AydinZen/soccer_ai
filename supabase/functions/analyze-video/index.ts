// =============================================================================
// analyze-video — Supabase Edge Function (Deno)
//
// The secure server-side broker for Step 3. It is the ONLY place the Anthropic
// API key is ever read (Deno.env.get('ANTHROPIC_API_KEY') — a Supabase secret,
// never an EXPO_PUBLIC_ var). Flow:
//   1. Verify the caller's JWT and that they own the video.
//   2. Read the player-identification context (position, jersey, pitch side) from
//      the video row, and skill_level from the player's profile.
//   3. Create an `analyses` row (status 'processing') and flip videos.status.
//   4. Send the client-extracted frames + a coaching system prompt to Claude,
//      forcing a single structured tool call so the JSON is always valid.
//   5. Persist the result (status 'complete') and return the row inline.
//
// Deploy: see supabase/functions/README.md
// =============================================================================
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Default to Sonnet 4.6 — strong vision at ~1/5 the cost of Opus, and lower
// latency keeps us comfortably inside the Edge wall-clock budget. Swap to
// 'claude-opus-4-8' for the highest-fidelity vision if cost is not a concern.
const ANALYSIS_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';
const SCHEMA_VERSION = '1.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Position = 'gk' | 'defender' | 'midfielder' | 'forward';

const SKILL_KEYS_BY_POSITION: Record<Position, string[]> = {
  gk: ['positioning', 'handling', 'shot_stopping_setup', 'distribution', 'command_of_area'],
  defender: ['positioning', 'marking', 'tackling', 'aerial_duels', 'distribution'],
  midfielder: ['passing_range', 'positioning', 'ball_retention', 'vision_scanning', 'work_rate'],
  forward: ['finishing', 'movement_off_ball', 'first_touch', 'dribbling', 'pressing'],
};

const SYSTEM_PROMPT = `You are an expert youth and amateur soccer coach with a UEFA-style coaching background. You are reviewing a short match clip that has been broken into a handful of still frames. Your job is to give ONE specific player constructive, encouraging, and HONEST performance feedback, plus personalized training drills.

WHO YOU ARE ANALYZING
You will be told the target player's position, skill level, jersey number, jersey color, and which side of the pitch they play. Analyze ONLY that player. Use jersey number + jersey color + pitch side to find them in each frame. If you cannot confidently identify that player in a given frame, do not guess — note that they were not clearly visible in that frame and exclude it from your assessment.

WHAT YOU CAN AND CANNOT DO (READ CAREFULLY)
These are STILL FRAMES, not video. You can reasonably assess things visible in a static image: body shape and orientation, stance and balance, foot/arm positioning, where the player is relative to the ball, teammates, opponents, and space, scanning/head position, and the general decision context of the moment.
You CANNOT measure or claim: running speed, sprint velocity, distance covered, pass or shot power, reaction time, stamina, or anything requiring continuous motion. You CANNOT confirm what happened BETWEEN frames. Never state that a specific event occurred (a goal, tackle, completed pass, successful dribble, foul, etc.) unless it is clearly visible within a single frame. Do not invent narrative continuity. If you are inferring rather than observing, hedge ("appears to", "is positioned as if"). You are looking at a tiny sample of one moment in a match — be appropriately humble.

HOW TO CALIBRATE
Rate the player WITHIN their stated skill level, not against professionals. A strong beginner and a developing advanced player can both score well on their own scale. Lead with genuine strengths and frame weaknesses as growth opportunities — but never flatter or invent strengths that aren't visible. Honesty builds trust.

PERSONALIZING DRILLS
Every drill must suit the player's POSITION and SKILL LEVEL and require only common equipment (ball, cones, wall, partner). Tie each drill to a specific observed weakness where possible and explain plainly why it helps that player in that position. A goalkeeper gets keeper-specific drills, never outfield dribbling drills.

SKILL RATINGS
You will be given the EXACT set of skill keys to rate for this player's position. Rate only those keys, each 0-10 on the player's own skill-level scale. Do not add, remove, or rename keys.

OUTPUT
Return your analysis by calling the submit_analysis tool. Populate every required field. Put honest, clip-specific limitations in the caveats array (e.g. player only clearly visible in a few frames, lighting/angle made assessment hard, cannot assess sprint speed from stills). Keep language warm, concrete, and free of jargon a young player wouldn't understand.`;

// JSON Schema for the forced tool call. Forced tool_use guarantees Claude
// returns exactly this shape (kept in sync with src/types/analysis.ts).
const ANALYSIS_TOOL_SCHEMA = {
  type: 'object',
  required: [
    'schema_version', 'player', 'overall_summary', 'overall_rating', 'confidence',
    'frames_analyzed', 'strengths', 'weaknesses', 'drills', 'skill_ratings', 'caveats',
  ],
  properties: {
    schema_version: { type: 'string' },
    player: {
      type: 'object',
      required: ['position', 'skill_level', 'jersey_number', 'jersey_color', 'pitch_side'],
      properties: {
        position: { type: 'string', enum: ['gk', 'defender', 'midfielder', 'forward'] },
        skill_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
        jersey_number: { type: ['integer', 'null'] },
        jersey_color: { type: ['string', 'null'] },
        pitch_side: { type: 'string', enum: ['left', 'center', 'right'] },
      },
    },
    overall_summary: { type: 'string', description: '2-4 encouraging-but-honest sentences grounded only in what the frames show.' },
    overall_rating: { type: 'number', minimum: 0, maximum: 10 },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    frames_analyzed: { type: 'integer', minimum: 0 },
    strengths: {
      type: 'array', minItems: 1, maxItems: 5,
      items: {
        type: 'object', required: ['title', 'detail'],
        properties: { title: { type: 'string' }, detail: { type: 'string' } },
      },
    },
    weaknesses: {
      type: 'array', minItems: 1, maxItems: 5,
      items: {
        type: 'object', required: ['title', 'detail', 'severity'],
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          severity: { type: 'string', enum: ['minor', 'moderate', 'major'] },
        },
      },
    },
    drills: {
      type: 'array', minItems: 2, maxItems: 6,
      items: {
        type: 'object',
        required: ['name', 'description', 'why_it_helps', 'reps_or_duration', 'difficulty', 'targets_weakness'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          why_it_helps: { type: 'string' },
          reps_or_duration: { type: 'string' },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          targets_weakness: { type: ['string', 'null'] },
        },
      },
    },
    skill_ratings: {
      type: 'object',
      description: 'Only the position-specific keys you were given, each 0-10.',
      additionalProperties: { type: 'number', minimum: 0, maximum: 10 },
    },
    caveats: { type: 'array', items: { type: 'string' } },
  },
};

type Frame = { tSeconds: number; base64: string };

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
  const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

  if (!ANTHROPIC_API_KEY) {
    return json({ error: 'Server is not configured: ANTHROPIC_API_KEY secret is missing.' }, 500);
  }

  // --- Parse input -----------------------------------------------------------
  let video_id: string | undefined;
  let frames: Frame[] = [];
  try {
    const body = await req.json();
    video_id = body.video_id;
    frames = Array.isArray(body.frames) ? body.frames : [];
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }
  if (!video_id) return json({ error: 'Missing video_id.' }, 400);
  if (frames.length === 0) return json({ error: 'No frames supplied to analyze.' }, 400);

  // --- Verify caller ---------------------------------------------------------
  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: 'Unauthorized.' }, 401);

  // service_role client bypasses RLS for the reads/writes below.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // --- Load video + ownership check -----------------------------------------
  const { data: video, error: vErr } = await admin
    .from('videos')
    .select('id, user_id, position_played, jersey_number, jersey_color, pitch_side')
    .eq('id', video_id)
    .single();
  if (vErr || !video) return json({ error: 'Video not found.' }, 404);
  if (video.user_id !== user.id) return json({ error: 'Forbidden.' }, 403);

  // Player's skill level lives on their profile (not the video row).
  const { data: profile } = await admin
    .from('profiles')
    .select('skill_level')
    .eq('id', video.user_id)
    .single();
  const skillLevel: string = profile?.skill_level ?? 'intermediate';
  const position = (video.position_played ?? 'midfielder') as Position;
  const skillKeys = SKILL_KEYS_BY_POSITION[position] ?? SKILL_KEYS_BY_POSITION.midfielder;

  // --- Create the analysis row (client polls/reads this) ---------------------
  const { data: analysis, error: aErr } = await admin
    .from('analyses')
    .insert({ video_id: video.id, user_id: video.user_id, status: 'processing', model_used: ANALYSIS_MODEL })
    .select('id')
    .single();
  if (aErr || !analysis) return json({ error: 'Could not create analysis row.' }, 500);
  await admin.from('videos').update({ status: 'analyzing' }).eq('id', video.id);

  // --- Call Claude -----------------------------------------------------------
  try {
    const contextText = [
      'TARGET PLAYER TO ANALYZE:',
      `- Position: ${position}`,
      `- Skill level: ${skillLevel}`,
      `- Jersey number: ${video.jersey_number ?? 'unknown'}`,
      `- Jersey color: ${video.jersey_color ?? 'unknown'}`,
      `- Plays on the ${video.pitch_side} side of the pitch`,
      '',
      `Rate EXACTLY these skill_ratings keys for this position (0-10 each): ${skillKeys.join(', ')}.`,
      `Set schema_version to "${SCHEMA_VERSION}" and echo the player fields above into the player object.`,
      '',
      'The frames below are in chronological order with their timestamps. Analyze only the player above.',
    ].join('\n');

    const content: unknown[] = [{ type: 'text', text: contextText }];
    for (const f of frames) {
      content.push({ type: 'text', text: `Frame at ${f.tSeconds.toFixed(1)}s:` });
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: f.base64 },
      });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANALYSIS_MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: [{
          name: 'submit_analysis',
          description: 'Return the structured soccer coaching analysis for the target player.',
          input_schema: ANALYSIS_TOOL_SCHEMA,
        }],
        tool_choice: { type: 'tool', name: 'submit_analysis' },
        messages: [{ role: 'user', content }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const toolUse = (data.content ?? []).find((b: { type: string }) => b.type === 'tool_use');
    if (!toolUse?.input) throw new Error('Claude did not return a structured analysis.');
    const result = toolUse.input;

    // --- Persist success -----------------------------------------------------
    const completed_at = new Date().toISOString();
    await admin
      .from('analyses')
      .update({ status: 'complete', result, model_used: ANALYSIS_MODEL, completed_at })
      .eq('id', analysis.id);
    await admin.from('videos').update({ status: 'complete' }).eq('id', video.id);

    const { data: row } = await admin.from('analyses').select('*').eq('id', analysis.id).single();
    return json(row ?? { id: analysis.id, status: 'complete', result });
  } catch (e) {
    // --- Persist failure -----------------------------------------------------
    const message = e instanceof Error ? e.message : String(e);
    await admin
      .from('analyses')
      .update({ status: 'failed', error: message, completed_at: new Date().toISOString() })
      .eq('id', analysis.id);
    await admin.from('videos').update({ status: 'error' }).eq('id', video.id);
    return json({ error: 'Analysis failed. Please try again.', detail: message }, 500);
  }
});
