import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type Edge = 'top' | 'bottom' | 'left' | 'right';

type Props = {
  children: ReactNode;
  /** Wrap content in a ScrollView (default) vs a fixed full-height View. */
  scroll?: boolean;
  edges?: readonly Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  /** Override the centered content max width (forms keep the default; wide
   * dashboard screens pass a larger value to fill desktop space). */
  maxWidth?: number;
};

/**
 * Standard themed screen wrapper: safe-area aware, keyboard-avoiding, centered
 * to a max content width. Used by every auth/profile screen for consistency.
 */
export function Screen({
  children,
  scroll = true,
  edges = ['top', 'bottom'],
  contentStyle,
  maxWidth = MaxContentWidth,
}: Props) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={edges}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {scroll ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.content, { maxWidth }, contentStyle]}
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.content, { maxWidth }, styles.flex, contentStyle]}>{children}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
