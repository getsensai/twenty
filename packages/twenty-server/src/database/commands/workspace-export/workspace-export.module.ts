import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceExportCommand } from 'src/database/commands/workspace-export/workspace-export.command';
import { WorkspaceExportService } from 'src/database/commands/workspace-export/workspace-export.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectMetadataEntity])],
  providers: [WorkspaceExportCommand, WorkspaceExportService],
})
export class WorkspaceExportModule {}
