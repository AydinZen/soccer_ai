export const POSITIONS = ['gk', 'defender', 'midfielder', 'forward'] as const;
export type Position = (typeof POSITIONS)[number];

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const POSITION_LABELS: Record<Position, string> = {
  gk: 'Goalkeeper',
  defender: 'Defender',
  midfielder: 'Midfielder',
  forward: 'Forward',
};

export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** A row of the `public.profiles` table (see supabase/migrations/0001_profiles.sql). */
export type Profile = {
  id: string;
  full_name: string | null;
  age: number | null;
  position: Position | null;
  skill_level: SkillLevel | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
