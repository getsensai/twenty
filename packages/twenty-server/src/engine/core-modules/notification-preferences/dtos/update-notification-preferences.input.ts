import { Field, InputType } from '@nestjs/graphql';

@InputType('UpdateNotificationPreferencesInput')
export class UpdateNotificationPreferencesInput {
  @Field(() => Boolean, { nullable: true })
  newRecordAssignments?: boolean;

  @Field(() => Boolean, { nullable: true })
  taskDueDateReminders?: boolean;

  @Field(() => Boolean, { nullable: true })
  weeklyActivityDigest?: boolean;
}
