import { Module } from '@nestjs/common';

import { NotificationPreferencesResolver } from 'src/engine/core-modules/notification-preferences/notification-preferences.resolver';
import { NotificationPreferencesService } from 'src/engine/core-modules/notification-preferences/notification-preferences.service';

@Module({
  providers: [NotificationPreferencesResolver, NotificationPreferencesService],
  exports: [NotificationPreferencesService],
})
export class NotificationPreferencesModule {}
