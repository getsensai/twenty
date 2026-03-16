import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { createWriteStream, mkdirSync } from 'fs';
import type { WriteStream } from 'fs';

import { DataSource, type EntityMetadata, Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { getCoreEntityMetadatasWithWorkspaceId } from 'src/database/commands/workspace-export/utils/get-core-entity-metadatas-with-workspace-id.util';
import { extractEnumTypes } from 'src/database/commands/workspace-export/utils/extract-enum-types.util';
import { extractTableDefinitions } from 'src/database/commands/workspace-export/utils/extract-table-definitions.util';
import { extractConstraints } from 'src/database/commands/workspace-export/utils/extract-constraints.util';
import { extractIndexes } from 'src/database/commands/workspace-export/utils/extract-indexes.util';
import { extractSequences } from 'src/database/commands/workspace-export/utils/extract-sequences.util';
import { formatSqlValue, generateInsertStatement } from 'src/database/commands/workspace-export/workspace-export.utils';

const BATCH_SIZE = 5000;

type WorkspaceExportParams = {
  workspaceId: string;
  outputPath: string;
  tableFilter?: string[];
};

@Injectable()
export class WorkspaceExportService {
  private readonly logger = new Logger(WorkspaceExportService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async exportWorkspace({
    workspaceId,
    outputPath,
    tableFilter,
  }: WorkspaceExportParams): Promise<string> {
    const workspace = await this.dataSource
      .getRepository(WorkspaceEntity)
      .findOne({ where: { id: workspaceId } });

    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    this.logger.log(`Exporting workspace ${workspaceId} (${schemaName})`);

    mkdirSync(outputPath, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `${outputPath}/${workspaceId}-${timestamp}.sql`;
    const stream = createWriteStream(filePath);

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      stream.write("SET session_replication_role = 'replica';\n\n");

      await this.exportCoreEntities(workspaceId, stream);

      stream.write(`\nCREATE SCHEMA IF NOT EXISTS "${schemaName}";\n\n`);

      await this.exportWorkspaceDdl(schemaName, queryRunner, stream);

      await this.exportWorkspaceData(
        workspaceId,
        schemaName,
        tableFilter,
        queryRunner,
        stream,
      );

      await this.exportWorkspaceConstraintsAndIndexes(
        schemaName,
        queryRunner,
        stream,
      );

      stream.write("\nSET session_replication_role = 'origin';\n");
    } finally {
      await queryRunner.release();
      stream.end();
      await new Promise<void>((resolve) => stream.on('finish', resolve));
    }

    return filePath;
  }

  private async exportCoreEntities(
    workspaceId: string,
    stream: WriteStream,
  ): Promise<void> {
    const workspaceEntityMetadata = this.dataSource.entityMetadatas.find(
      (entityMetadata) => entityMetadata.tableName === 'workspace',
    );

    if (workspaceEntityMetadata) {
      await this.exportCoreEntity(
        workspaceEntityMetadata,
        'id',
        workspaceId,
        stream,
      );
    }

    const entityMetadatas = getCoreEntityMetadatasWithWorkspaceId(
      this.dataSource,
    );

    for (const entityMetadata of entityMetadatas) {
      try {
        await this.exportCoreEntity(
          entityMetadata,
          'workspaceId',
          workspaceId,
          stream,
        );
      } catch (error) {
        this.logger.warn(
          `${entityMetadata.tableName}: skipped (${error instanceof Error ? error.message : String(error)})`,
        );
      }
    }
  }

  private buildJsonColumnSet(entityMetadata: EntityMetadata): Set<string> {
    return new Set(
      entityMetadata.columns
        .filter(
          (column) => column.type === 'jsonb' || column.type === 'json',
        )
        .map((column) => column.databaseName),
    );
  }

  private async exportCoreEntity(
    entityMetadata: EntityMetadata,
    filterColumn: string,
    filterValue: string,
    stream: WriteStream,
  ): Promise<void> {
    const schema = entityMetadata.schema || 'core';
    const tableName = entityMetadata.tableName;
    const jsonColumns = this.buildJsonColumnSet(entityMetadata);

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const [{ count: totalCount }] = await queryRunner.query(
        `SELECT COUNT(*)::int as count FROM "${schema}"."${tableName}" WHERE "${filterColumn}" = $1`,
        [filterValue],
      );

      if (totalCount === 0) return;

      this.logger.log(`  ${tableName}: ${totalCount} rows`);

      for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
        const rows: Record<string, unknown>[] = await queryRunner.query(
          `SELECT * FROM "${schema}"."${tableName}" WHERE "${filterColumn}" = $1 LIMIT ${BATCH_SIZE} OFFSET ${offset}`,
          [filterValue],
        );

        for (const row of rows) {
          const columnValues: Record<string, string> = {};

          for (const [columnName, value] of Object.entries(row)) {
            columnValues[columnName] = formatSqlValue(
              value,
              jsonColumns.has(columnName),
            );
          }

          stream.write(
            generateInsertStatement(schema, tableName, columnValues),
          );
        }
      }
    } finally {
      await queryRunner.release();
    }
  }

  private async exportWorkspaceDdl(
    schemaName: string,
    queryRunner: ReturnType<DataSource['createQueryRunner']>,
    stream: WriteStream,
  ): Promise<void> {
    this.logger.log('Extracting workspace schema DDL...');

    const sequences = await extractSequences(queryRunner, schemaName);

    for (const ddl of sequences) {
      stream.write(ddl + '\n');
    }

    const enumTypes = await extractEnumTypes(queryRunner, schemaName);

    this.logger.log(`  ${enumTypes.length} enum types`);

    for (const ddl of enumTypes) {
      stream.write(ddl + '\n');
    }

    const tableDefinitions = await extractTableDefinitions(
      queryRunner,
      schemaName,
    );

    this.logger.log(`  ${tableDefinitions.length} tables`);

    for (const ddl of tableDefinitions) {
      stream.write(ddl + '\n\n');
    }
  }

  private async exportWorkspaceData(
    workspaceId: string,
    schemaName: string,
    tableFilter: string[] | undefined,
    queryRunner: ReturnType<DataSource['createQueryRunner']>,
    stream: WriteStream,
  ): Promise<void> {
    const objectMetadatas = await this.objectMetadataRepository.find({
      where: { workspaceId },
    });

    for (const objectMetadata of objectMetadatas) {
      if (!objectMetadata.isActive) continue;

      const tableName = computeTableName(
        objectMetadata.nameSingular,
        objectMetadata.isCustom,
      );

      if (tableFilter && !tableFilter.includes(objectMetadata.nameSingular)) {
        continue;
      }

      try {
        await this.exportWorkspaceTable(
          schemaName,
          tableName,
          objectMetadata.nameSingular,
          queryRunner,
          stream,
        );
      } catch (error) {
        this.logger.warn(
          `${objectMetadata.nameSingular}: skipped (${error instanceof Error ? error.message : String(error)})`,
        );
      }
    }
  }

  private async exportWorkspaceConstraintsAndIndexes(
    schemaName: string,
    queryRunner: ReturnType<DataSource['createQueryRunner']>,
    stream: WriteStream,
  ): Promise<void> {
    this.logger.log('Extracting constraints and indexes...');

    const constraints = await extractConstraints(queryRunner, schemaName);

    this.logger.log(`  ${constraints.length} constraints`);
    stream.write('\n');

    for (const ddl of constraints) {
      stream.write(ddl + '\n');
    }

    const indexes = await extractIndexes(queryRunner, schemaName);

    this.logger.log(`  ${indexes.length} indexes`);
    stream.write('\n');

    for (const ddl of indexes) {
      stream.write(ddl + '\n');
    }
  }

  private async exportWorkspaceTable(
    schemaName: string,
    tableName: string,
    displayName: string,
    queryRunner: ReturnType<DataSource['createQueryRunner']>,
    stream: WriteStream,
  ): Promise<void> {
    const [{ count: totalCount }] = await queryRunner.query(
      `SELECT COUNT(*)::int as count FROM "${schemaName}"."${tableName}"`,
    );

    if (totalCount === 0) return;

    this.logger.log(`  ${displayName}: ${totalCount} rows`);

    for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
      const rows: Record<string, unknown>[] = await queryRunner.query(
        `SELECT * FROM "${schemaName}"."${tableName}" LIMIT ${BATCH_SIZE} OFFSET ${offset}`,
      );

      for (const row of rows) {
        const columnValues: Record<string, string> = {};

        for (const [columnName, value] of Object.entries(row)) {
          columnValues[columnName] = formatSqlValue(value);
        }

        stream.write(
          generateInsertStatement(schemaName, tableName, columnValues),
        );
      }
    }
  }
}
