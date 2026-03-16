import type { QueryRunner } from 'typeorm';

export const extractConstraints = async (
  queryRunner: QueryRunner,
  schemaName: string,
): Promise<string[]> => {
  const rows: { ddl: string }[] = await queryRunner.query(
    `SELECT
      'ALTER TABLE "' || n.nspname || '"."' || c.relname ||
      '" ADD CONSTRAINT "' || con.conname || '" ' ||
      pg_get_constraintdef(con.oid, true) || ';' AS ddl
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = $1
      AND con.contype IN ('p', 'u', 'f', 'c')
    ORDER BY
      CASE con.contype
        WHEN 'p' THEN 1
        WHEN 'u' THEN 2
        WHEN 'c' THEN 3
        WHEN 'f' THEN 4
      END,
      c.relname, con.conname`,
    [schemaName],
  );

  return rows.map((row) => row.ddl);
};
