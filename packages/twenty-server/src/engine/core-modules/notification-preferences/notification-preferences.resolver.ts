import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { NotificationPreferencesDTO } from 'src/engine/core-modules/notification-preferences/dtos/notification-preferences.dto';
import { UpdateNotificationPreferencesInput } from 'src/engine/core-modules/notification-preferences/dtos/update-notification-preferences.input';
import { NotificationPreferencesService } from 'src/engine/core-modules/notification-preferences/notification-preferences.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@CoreResolver()
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class NotificationPreferencesResolver {
  constructor(
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  @Query(() => NotificationPreferencesDTO)
  @UseGuards(UserAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
  async notificationPreferences(
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<NotificationPreferencesDTO> {
    return this.notificationPreferencesService.getNotificationPreferences({
      userId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => NotificationPreferencesDTO)
  @UseGuards(UserAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
  async updateNotificationPreferences(
    @Args('input') input: UpdateNotificationPreferencesInput,
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<NotificationPreferencesDTO> {
    return this.notificationPreferencesService.updateNotificationPreferences({
      userId,
      workspaceId: workspace.id,
      input,
    });
  }
}
