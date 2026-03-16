import type { QueryRunner } from 'typeorm';

export const extractEnumTypes = async (
  queryRunner: QueryRunner,
  schemaName: string,
): Promise<string[]> => {
  const rows: { ddl: string }[] = await queryRunner.query(
    `SELECT
      'CREATE TYPE "' || n.nspname || '"."' || t.typname || '" AS ENUM (' ||
      string_agg(
        '''' || e.enumlabel || '''',
        ', ' ORDER BY e.enumsortorder
      ) || ');' AS ddl
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = $1
    GROUP BY n.nspname, t.typname`,
    [schemaName],
  );

  return rows.map((row) => row.ddl);
};
