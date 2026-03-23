import { gql } from '@apollo/client';

export const UPDATE_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateNotificationPreferences(
    $input: UpdateNotificationPreferencesInput!
  ) {
    updateNotificationPreferences(input: $input) {
      newRecordAssignments
      taskDueDateReminders
      weeklyActivityDigest
    }
  }
`;
