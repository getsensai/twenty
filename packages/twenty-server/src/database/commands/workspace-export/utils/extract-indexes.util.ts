import type { QueryRunner } from 'typeorm';

export const extractIndexes = async (
  queryRunner: QueryRunner,
  schemaName: string,
): Promise<string[]> => {
  const rows: { ddl: string }[] = await queryRunner.query(
    `SELECT
      pg_get_indexdef(i.indexrelid) || ';' AS ddl
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = $1
      AND NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        WHERE con.conindid = i.indexrelid
      )
    ORDER BY c.relname`,
    [schemaName],
  );

  return rows.map((row) => row.ddl);
};
