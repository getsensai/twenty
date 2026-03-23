import { gql } from '@apollo/client';

export const GET_NOTIFICATION_PREFERENCES = gql`
  query GetNotificationPreferences {
    getNotificationPreferences {
      newRecordAssignments
      taskDueDateReminders
      weeklyActivityDigest
    }
  }
`;
