import gql from 'graphql-tag';

export const GET_NOTIFICATION_PREFERENCES = gql`
  query GetNotificationPreferences {
    notificationPreferences {
      newRecordAssignments
      taskDueDateReminders
      weeklyActivityDigest
    }
  }
`;
