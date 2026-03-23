import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import {
  NotificationPreferencesDTO,
  UpdateNotificationPreferencesInput,
} from 'src/engine/core-modules/user/dtos/notification-preferences.dto';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@MetadataResolver(() => NotificationPreferencesDTO)
export class NotificationPreferencesResolver {
  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  @Query(() => NotificationPreferencesDTO)
  @UseGuards(UserAuthGuard, WorkspaceAuthGuard)
  async getNotificationPreferences(
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<NotificationPreferencesDTO> {
    return this.userWorkspaceService.getNotificationPreferences(
      userId,
      workspace.id,
    );
  }

  @Mutation(() => NotificationPreferencesDTO)
  @UseGuards(UserAuthGuard, WorkspaceAuthGuard)
  async updateNotificationPreferences(
    @Args('input') input: UpdateNotificationPreferencesInput,
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<NotificationPreferencesDTO> {
    return this.userWorkspaceService.updateNotificationPreferences(
      userId,
      workspace.id,
      input,
    );
  }
}
