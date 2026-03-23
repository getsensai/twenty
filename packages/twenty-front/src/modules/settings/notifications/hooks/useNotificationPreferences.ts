import { useMutation, useQuery } from '@apollo/client';

import { GET_NOTIFICATION_PREFERENCES } from '@/settings/notifications/graphql/queries/getNotificationPreferences';
import { UPDATE_NOTIFICATION_PREFERENCES } from '@/settings/notifications/graphql/mutations/updateNotificationPreferences';

type NotificationPreferences = {
  newRecordAssignments: boolean;
  taskDueDateReminders: boolean;
  weeklyActivityDigest: boolean;
};

type UpdateNotificationPreferencesInput = Partial<NotificationPreferences>;

export const useNotificationPreferences = () => {
  const { data, loading } = useQuery<{
    getNotificationPreferences: NotificationPreferences;
  }>(GET_NOTIFICATION_PREFERENCES);

  const [updatePreferences, { loading: updating }] = useMutation<
    { updateNotificationPreferences: NotificationPreferences },
    { input: UpdateNotificationPreferencesInput }
  >(UPDATE_NOTIFICATION_PREFERENCES);

  const preferences: NotificationPreferences =
    data?.getNotificationPreferences ?? {
      newRecordAssignments: true,
      taskDueDateReminders: true,
      weeklyActivityDigest: true,
    };

  const updateNotificationPreferences = async (
    input: UpdateNotificationPreferencesInput,
  ) => {
    await updatePreferences({
      variables: { input },
      optimisticResponse: {
        updateNotificationPreferences: {
          ...preferences,
          ...input,
        },
      },
      update: (cache, { data: mutationData }) => {
        if (!mutationData) return;
        cache.writeQuery({
          query: GET_NOTIFICATION_PREFERENCES,
          data: {
            getNotificationPreferences:
              mutationData.updateNotificationPreferences,
          },
        });
      },
    });
  };

  return {
    preferences,
    loading,
    updating,
    updateNotificationPreferences,
  };
};
