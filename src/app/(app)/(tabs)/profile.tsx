import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { ProfileForm } from '@/components/profile-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PopCard } from '@/components/ui/pop-card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { ACCENTS, PROFILE_GRADIENT, SHADOW } from '@/constants/ui';
import { useAuth } from '@/contexts/AuthProvider';
import { useTheme } from '@/hooks/use-theme';
import { POSITION_LABELS, SKILL_LABELS } from '@/types/profile';

export default function ProfileTab() {
  const { profile, user, signOut } = useAuth();
  const theme = useTheme();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Screen>
        <ThemedText type="subtitle">Edit profile</ThemedText>
        <ProfileForm initial={profile} submitLabel="Save changes" onSaved={() => setEditing(false)} />
        <Button title="Cancel" variant="secondary" onPress={() => setEditing(false)} />
      </Screen>
    );
  }

  const initial = (profile?.full_name?.[0] ?? '⚽').toUpperCase();

  return (
    <Screen maxWidth={760}>
      {/* Cover + avatar */}
      <PopCard style={[styles.coverCard, SHADOW]}>
        <LinearGradient
          colors={PROFILE_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cover}
        />
        <View style={styles.avatarBlock}>
          <View style={[styles.avatarRing, { backgroundColor: theme.background }]}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={PROFILE_GRADIENT} style={styles.avatar}>
                <ThemedText style={styles.avatarInitial}>{initial}</ThemedText>
              </LinearGradient>
            )}
          </View>
          <ThemedText type="subtitle" style={styles.name}>
            {profile?.full_name ?? 'Player'}
          </ThemedText>
          {user?.email ? (
            <ThemedText type="small" themeColor="textSecondary">
              {user.email}
            </ThemedText>
          ) : null}

          <View style={styles.chips}>
            {profile?.position ? (
              <Chip text={POSITION_LABELS[profile.position]} accent={ACCENTS.blue} />
            ) : null}
            {profile?.skill_level ? (
              <Chip text={SKILL_LABELS[profile.skill_level]} accent={ACCENTS.green} />
            ) : null}
            {profile?.age != null ? (
              <Chip text={`Age ${profile.age}`} accent={ACCENTS.orange} />
            ) : null}
          </View>
        </View>
      </PopCard>

      {/* Career stat tiles */}
      <View style={styles.statsRow}>
        <StatTile num="0" label="Clips" accent={ACCENTS.blue} delay={80} />
        <StatTile num="—" label="Avg Rating" accent={ACCENTS.violet} delay={140} />
        <StatTile num="0" label="Drills" accent={ACCENTS.pink} delay={200} />
      </View>

      {/* Bio */}
      {profile?.bio ? (
        <PopCard delay={240} style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" style={styles.cardLabel}>
            ABOUT
          </ThemedText>
          <ThemedText type="default">{profile.bio}</ThemedText>
        </PopCard>
      ) : null}

      {/* Detail rows */}
      <PopCard delay={280} style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" style={styles.cardLabel}>
          DETAILS
        </ThemedText>
        <DetailRow icon="📍" label="Position" value={profile?.position ? POSITION_LABELS[profile.position] : '—'} />
        <DetailRow icon="⭐" label="Skill level" value={profile?.skill_level ? SKILL_LABELS[profile.skill_level] : '—'} />
        <DetailRow icon="🎂" label="Age" value={profile?.age != null ? String(profile.age) : '—'} />
      </PopCard>

      <Button title="Edit profile" onPress={() => setEditing(true)} />
      <Button title="Sign out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}

function Chip({ text, accent }: { text: string; accent: { tint: string; deep: string } }) {
  return (
    <View style={[styles.chip, { backgroundColor: accent.tint }]}>
      <ThemedText style={[styles.chipText, { color: accent.deep }]}>{text}</ThemedText>
    </View>
  );
}

function StatTile({
  num,
  label,
  accent,
  delay,
}: {
  num: string;
  label: string;
  accent: { base: string; tint: string; deep: string };
  delay: number;
}) {
  return (
    <PopCard interactive delay={delay} style={[styles.statTile, { backgroundColor: accent.tint }, SHADOW]}>
      <ThemedText style={[styles.statNum, { color: accent.base }]}>{num}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: accent.deep }]}>{label}</ThemedText>
    </PopCard>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailIcon}>{icon}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  coverCard: { borderRadius: 24, overflow: 'hidden' },
  cover: { height: 120 },
  avatarBlock: { alignItems: 'center', paddingHorizontal: Spacing.four, paddingBottom: Spacing.four, marginTop: -48 },
  avatarRing: { padding: 5, borderRadius: 60, marginBottom: Spacing.two },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 40, fontWeight: '800', color: '#fff' },
  name: { textAlign: 'center' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one, justifyContent: 'center', marginTop: Spacing.two },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  chipText: { fontWeight: '700', fontSize: 13 },

  statsRow: { flexDirection: 'row', gap: Spacing.two },
  statTile: { flex: 1, borderRadius: 18, paddingVertical: Spacing.three, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  statLabel: { fontSize: 13, fontWeight: '600' },

  card: { borderRadius: 18, padding: Spacing.three, gap: Spacing.two },
  cardLabel: { letterSpacing: 0.5, opacity: 0.55 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  detailIcon: { fontSize: 18, width: 26, textAlign: 'center' },
});
