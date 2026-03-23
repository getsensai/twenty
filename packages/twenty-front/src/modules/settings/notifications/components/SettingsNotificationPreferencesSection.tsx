import { useNotificationPreferences } from '@/settings/notifications/hooks/useNotificationPreferences';
import { SettingsNotificationPreferencesSectionSkeletonLoader } from '@/settings/notifications/components/SettingsNotificationPreferencesSectionSkeletonLoader';
import { useLingui } from '@lingui/react/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { SettingsAccountsToggleSettingCard } from '@/settings/accounts/components/SettingsAccountsToggleSettingCard';

export const SettingsNotificationPreferencesSection = () => {
  const { t } = useLingui();
  const { preferences, loading, updateNotificationPreferences } =
    useNotificationPreferences();

  if (loading) {
    return <SettingsNotificationPreferencesSectionSkeletonLoader />;
  }

  return (
    <Section>
      <H2Title
        title={t`Email Notifications`}
        description={t`Choose which email notifications you want to receive`}
      />
      <SettingsAccountsToggleSettingCard
        parameters={[
          {
            value: preferences.newRecordAssignments,
            title: t`New record assignments`,
            description: t`Receive an email when a record is assigned to you`,
            onToggle: (value) =>
              updateNotificationPreferences({ newRecordAssignments: value }),
          },
          {
            value: preferences.taskDueDateReminders,
            title: t`Task due date reminders`,
            description: t`Receive an email reminder before a task is due`,
            onToggle: (value) =>
              updateNotificationPreferences({ taskDueDateReminders: value }),
          },
          {
            value: preferences.weeklyActivityDigest,
            title: t`Weekly activity digest`,
            description: t`Receive a weekly summary of activity in your workspace`,
            onToggle: (value) =>
              updateNotificationPreferences({ weeklyActivityDigest: value }),
          },
        ]}
      />
    </Section>
  );
};
