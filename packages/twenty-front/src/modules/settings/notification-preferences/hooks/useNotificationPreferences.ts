import { useMutation, useQuery } from '@apollo/client';

import { GET_NOTIFICATION_PREFERENCES } from '@/settings/notification-preferences/graphql/queries/getNotificationPreferences';
import { UPDATE_NOTIFICATION_PREFERENCES } from '@/settings/notification-preferences/graphql/mutations/updateNotificationPreferences';

// TODO: Replace these manually-declared types with auto-generated ones once
// the GraphQL schema is finalized and `npx nx run twenty-front:graphql:generate`
// has been executed. The generated types will live in
// `src/generated/graphql.ts` and should be imported from there to avoid drift.
type NotificationPreferences = {
  newRecordAssignments: boolean;
  taskDueDateReminders: boolean;
  weeklyActivityDigest: boolean;
};

// Derived from NotificationPreferences above; replace with the generated input type after codegen.
type UpdateNotificationPreferencesInput = Partial<NotificationPreferences>;

export const useNotificationPreferences = () => {
  const { data, loading } = useQuery<{
    notificationPreferences: NotificationPreferences;
  }>(GET_NOTIFICATION_PREFERENCES);

  const [updateNotificationPreferencesMutation, { loading: updating }] =
    useMutation<
      { updateNotificationPreferences: NotificationPreferences },
      { input: UpdateNotificationPreferencesInput }
    >(UPDATE_NOTIFICATION_PREFERENCES, {
      refetchQueries: [{ query: GET_NOTIFICATION_PREFERENCES }],
    });

  const notificationPreferences = data?.notificationPreferences;

  const updateNotificationPreferences = async (
    input: UpdateNotificationPreferencesInput,
  ) => {
    await updateNotificationPreferencesMutation({ variables: { input } });
  };

  return {
    notificationPreferences,
    loading,
    updating,
    updateNotificationPreferences,
  };
};
