import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType('NotificationPreferences')
export class NotificationPreferencesDTO {
  @Field({ nullable: false, defaultValue: true })
  newRecordAssignments: boolean;

  @Field({ nullable: false, defaultValue: true })
  taskDueDateReminders: boolean;

  @Field({ nullable: false, defaultValue: true })
  weeklyActivityDigest: boolean;
}

@InputType()
export class UpdateNotificationPreferencesInput {
  @Field({ nullable: true })
  newRecordAssignments?: boolean;

  @Field({ nullable: true })
  taskDueDateReminders?: boolean;

  @Field({ nullable: true })
  weeklyActivityDigest?: boolean;
}
