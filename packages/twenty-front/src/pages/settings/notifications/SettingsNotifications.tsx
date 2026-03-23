import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsNotificationPreferencesSection } from '@/settings/notifications/components/SettingsNotificationPreferencesSection';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsNotifications = () => {
  const { t } = useLingui();

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
        <SettingsNotificationPreferencesSection />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
