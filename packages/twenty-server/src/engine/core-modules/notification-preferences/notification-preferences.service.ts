import { Injectable, NotFoundException } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type UpdateNotificationPreferencesInput } from 'src/engine/core-modules/notification-preferences/dtos/update-notification-preferences.input';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type WorkspaceMemberNotificationPreferences,
  WorkspaceMemberWorkspaceEntity,
} from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class NotificationPreferencesService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async getNotificationPreferences({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<WorkspaceMemberNotificationPreferences> {
    const authContext = buildSystemAuthContext(workspaceId);

    const workspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const repository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspaceId,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          return repository.findOne({ where: { userId } });
        },
        authContext,
      );

    if (!isDefined(workspaceMember)) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    return (
      workspaceMember.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES
    );
  }

  async updateNotificationPreferences({
    userId,
    workspaceId,
    input,
  }: {
    userId: string;
    workspaceId: string;
    input: UpdateNotificationPreferencesInput;
  }): Promise<WorkspaceMemberNotificationPreferences> {
    const authContext = buildSystemAuthContext(workspaceId);

    const updatedPreferences =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const repository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspaceId,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          const workspaceMember = await repository.findOne({
            where: { userId },
          });

          if (!isDefined(workspaceMember)) {
            throw new NotFoundException('Workspace member not found');
          }

          const currentPreferences =
            workspaceMember.notificationPreferences ??
            DEFAULT_NOTIFICATION_PREFERENCES;

          const newPreferences: WorkspaceMemberNotificationPreferences = {
            ...currentPreferences,
            ...(isDefined(input.newRecordAssignments) && {
              newRecordAssignments: input.newRecordAssignments,
            }),
            ...(isDefined(input.taskDueDateReminders) && {
              taskDueDateReminders: input.taskDueDateReminders,
            }),
            ...(isDefined(input.weeklyActivityDigest) && {
              weeklyActivityDigest: input.weeklyActivityDigest,
            }),
          };

          await repository.update(workspaceMember.id, {
            notificationPreferences: newPreferences,
          });

          return newPreferences;
        },
        authContext,
      );

    return updatedPreferences;
  }
}
