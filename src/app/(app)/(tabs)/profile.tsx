import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { ProfileForm } from '@/components/profile-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthProvider';
import { POSITION_LABELS, SKILL_LABELS } from '@/types/profile';
import { useTheme } from '@/hooks/use-theme';

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

  return (
    <Screen>
      <View style={styles.head}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="title" style={styles.avatarInitial}>
              {(profile?.full_name?.[0] ?? '⚽').toUpperCase()}
            </ThemedText>
          </View>
        )}
        <ThemedText type="subtitle">{profile?.full_name ?? 'Player'}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {user?.email}
        </ThemedText>
      </View>

      <ThemedView type="backgroundElement" style={styles.card}>
        <Row label="Position" value={profile?.position ? POSITION_LABELS[profile.position] : '—'} />
        <Row label="Skill level" value={profile?.skill_level ? SKILL_LABELS[profile.skill_level] : '—'} />
        <Row label="Age" value={profile?.age != null ? String(profile.age) : '—'} />
        {profile?.bio ? <Row label="Bio" value={profile.bio} /> : null}
      </ThemedView>

      <Button title="Edit profile" onPress={() => setEditing(true)} />
      <Button title="Sign out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.rowValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.two },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 36, lineHeight: 44 },
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
  rowValue: { flexShrink: 1, textAlign: 'right' },
});
