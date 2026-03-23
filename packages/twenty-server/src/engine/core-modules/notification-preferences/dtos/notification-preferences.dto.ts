import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('NotificationPreferences')
export class NotificationPreferencesDTO {
  @Field(() => Boolean)
  newRecordAssignments: boolean;

  @Field(() => Boolean)
  taskDueDateReminders: boolean;

  @Field(() => Boolean)
  weeklyActivityDigest: boolean;
}
