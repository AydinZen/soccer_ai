import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { OptionGroup } from '@/components/ui/option-group';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthProvider';
import { saveProfile, uploadAvatar } from '@/lib/profiles';
import {
  POSITION_LABELS,
  POSITIONS,
  SKILL_LABELS,
  SKILL_LEVELS,
  type Position,
  type Profile,
  type SkillLevel,
} from '@/types/profile';
import { useTheme } from '@/hooks/use-theme';

const positionOptions = POSITIONS.map((value) => ({ value, label: POSITION_LABELS[value] }));
const skillOptions = SKILL_LEVELS.map((value) => ({ value, label: SKILL_LABELS[value] }));

type Errors = { fullName?: string; position?: string; skill?: string; age?: string };

/**
 * The profile editing form, shared by the one-time profile-setup screen and the
 * "Edit profile" view on the Profile tab. Calls `refreshProfile()` after a
 * successful save so the auth gate (hasProfile) updates immediately.
 */
export function ProfileForm({
  initial,
  submitLabel,
  onSaved,
}: {
  initial: Profile | null;
  submitLabel: string;
  onSaved: () => void;
}) {
  const theme = useTheme();
  const { user, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(initial?.full_name ?? '');
  const [age, setAge] = useState(initial?.age != null ? String(initial.age) : '');
  const [position, setPosition] = useState<Position | null>(initial?.position ?? null);
  const [skill, setSkill] = useState<SkillLevel | null>(initial?.skill_level ?? null);
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(initial?.avatar_url ?? null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  async function pickAvatar() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to choose a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setAvatarChanged(true);
    }
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = 'Name is required';
    if (!position) next.position = 'Pick your position';
    if (!skill) next.skill = 'Pick your skill level';
    if (age.trim()) {
      const n = Number(age);
      if (!Number.isInteger(n) || n < 0 || n > 119) next.age = 'Enter a valid age';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!user || !validate()) return;
    setSaving(true);
    try {
      let avatar_url = initial?.avatar_url ?? null;
      if (avatarChanged && avatarUri) {
        try {
          avatar_url = await uploadAvatar(user.id, avatarUri);
        } catch {
          Alert.alert('Avatar upload failed', 'Your profile will be saved without the new picture.');
        }
      }
      await saveProfile(user.id, {
        full_name: fullName.trim(),
        age: age.trim() ? Number(age) : null,
        position,
        skill_level: skill,
        bio: bio.trim() || null,
        avatar_url,
      });
      await refreshProfile();
      onSaved();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Please try again.';
      Alert.alert('Could not save profile', message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <Pressable onPress={pickAvatar} style={styles.avatarWrap} accessibilityRole="button">
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View
            style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" themeColor="textSecondary">
              Add photo
            </ThemedText>
          </View>
        )}
      </Pressable>

      <TextField
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="e.g. Alex Morgan"
        autoCapitalize="words"
        error={errors.fullName}
      />
      <TextField
        label="Age (optional)"
        value={age}
        onChangeText={setAge}
        placeholder="e.g. 17"
        keyboardType="number-pad"
        maxLength={3}
        error={errors.age}
      />
      <OptionGroup
        label="Position"
        options={positionOptions}
        value={position}
        onChange={setPosition}
        error={errors.position}
      />
      <OptionGroup
        label="Skill level"
        options={skillOptions}
        value={skill}
        onChange={setSkill}
        error={errors.skill}
      />
      <TextField
        label="Bio (optional)"
        value={bio}
        onChangeText={setBio}
        placeholder="A short note about your game"
        multiline
        style={styles.bio}
      />

      <Button title={submitLabel} onPress={handleSubmit} loading={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three },
  avatarWrap: { alignSelf: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  bio: { height: 96, paddingTop: Spacing.three, textAlignVertical: 'top' },
});
