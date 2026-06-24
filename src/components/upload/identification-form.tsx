import { useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { OptionGroup } from '@/components/ui/option-group';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthProvider';
import { POSITION_LABELS, POSITIONS, type Position } from '@/types/profile';
import {
  PITCH_SIDE_LABELS,
  PITCH_SIDES,
  type PitchSide,
  type PlayerIdentification,
} from '@/types/video';

const positionOptions = POSITIONS.map((value) => ({ value, label: POSITION_LABELS[value] }));
const pitchSideOptions = PITCH_SIDES.map((value) => ({ value, label: PITCH_SIDE_LABELS[value] }));

type Errors = { color?: string; number?: string; position?: string; side?: string };

/** Step 2, Part A — tells the AI exactly which player in the footage is the user. */
export function IdentificationForm({
  initial,
  onSubmit,
}: {
  initial: PlayerIdentification | null;
  onSubmit: (data: PlayerIdentification) => void;
}) {
  const { profile } = useAuth();

  const [jerseyColor, setJerseyColor] = useState(initial?.jersey_color ?? '');
  const [jerseyNumber, setJerseyNumber] = useState(
    initial?.jersey_number != null ? String(initial.jersey_number) : '',
  );
  const [position, setPosition] = useState<Position | null>(
    initial?.position_played ?? profile?.position ?? null,
  );
  const [pitchSide, setPitchSide] = useState<PitchSide | null>(initial?.pitch_side ?? null);
  const [errors, setErrors] = useState<Errors>({});

  function handleNext() {
    const next: Errors = {};
    if (!jerseyColor.trim()) next.color = 'Enter your jersey color';
    if (!position) next.position = 'Pick the position you played';
    if (!pitchSide) next.side = 'Pick the side you played';
    if (jerseyNumber.trim()) {
      const n = Number(jerseyNumber);
      if (!Number.isInteger(n) || n < 0 || n > 99) next.number = 'Enter a number 0–99';
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || !position || !pitchSide) return;

    onSubmit({
      jersey_color: jerseyColor.trim(),
      jersey_number: jerseyNumber.trim() ? Number(jerseyNumber) : null,
      position_played: position,
      pitch_side: pitchSide,
    });
  }

  return (
    <View style={{ gap: Spacing.three }}>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">Which player are you?</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          This tells the AI exactly who to focus on in your footage.
        </ThemedText>
      </View>

      <TextField
        label="Jersey color"
        value={jerseyColor}
        onChangeText={setJerseyColor}
        placeholder="e.g. red"
        autoCapitalize="none"
        error={errors.color}
      />
      <TextField
        label="Jersey number (optional)"
        value={jerseyNumber}
        onChangeText={setJerseyNumber}
        placeholder="e.g. 7"
        keyboardType="number-pad"
        maxLength={2}
        error={errors.number}
      />
      <OptionGroup
        label="Position this match"
        options={positionOptions}
        value={position}
        onChange={setPosition}
        error={errors.position}
      />
      <OptionGroup
        label="Side of the pitch"
        options={pitchSideOptions}
        value={pitchSide}
        onChange={setPitchSide}
        error={errors.side}
      />

      <Button title="Continue" onPress={handleNext} />
    </View>
  );
}
