import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';

export default function Progress() {
  return (
    <Screen scroll={false} contentStyle={{ justifyContent: 'center', alignItems: 'center', gap: Spacing.two }}>
      <ThemedText type="title" style={{ textAlign: 'center' }}>
        Progress
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={{ textAlign: 'center' }}>
        Your rating trends and stats will appear here once you have analyses (Step 6).
      </ThemedText>
    </Screen>
  );
}
