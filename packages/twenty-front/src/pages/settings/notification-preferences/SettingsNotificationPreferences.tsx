import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useNotificationPreferences } from '@/settings/notification-preferences/hooks/useNotificationPreferences';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';

export const SettingsNotificationPreferences = () => {
  const { t } = useLingui();
  const { notificationPreferences, loading, updating, updateNotificationPreferences } =
    useNotificationPreferences();

  if (loading) {
    return null;
  }

  const handleNewRecordAssignmentsChange = (checked: boolean) => {
    updateNotificationPreferences({ newRecordAssignments: checked });
  };

  const handleTaskDueDateRemindersChange = (checked: boolean) => {
    updateNotificationPreferences({ taskDueDateReminders: checked });
  };

  const handleWeeklyActivityDigestChange = (checked: boolean) => {
    updateNotificationPreferences({ weeklyActivityDigest: checked });
  };

  return (
    <SubMenuTopBarContainer
      title={t`Notifications`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: <Trans>Notifications</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Email Notifications`}
            description={t`Choose which email notifications you want to receive`}
          />
          <Card>
            <SettingsOptionCardContentToggle
              title={t`New record assignments`}
              description={t`Receive an email when a record is assigned to you`}
              checked={notificationPreferences?.newRecordAssignments ?? true}
              onChange={handleNewRecordAssignmentsChange}
              disabled={updating}
              divider
            />
            <SettingsOptionCardContentToggle
              title={t`Task due date reminders`}
              description={t`Receive reminders before your tasks are due`}
              checked={notificationPreferences?.taskDueDateReminders ?? true}
              onChange={handleTaskDueDateRemindersChange}
              disabled={updating}
              divider
            />
            <SettingsOptionCardContentToggle
              title={t`Weekly activity digest`}
              description={t`Get a weekly summary of your CRM activity`}
              checked={notificationPreferences?.weeklyActivityDigest ?? true}
              onChange={handleWeeklyActivityDigestChange}
              disabled={updating}
            />
          </Card>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
