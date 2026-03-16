import type { QueryRunner } from 'typeorm';

export const extractSequences = async (
  queryRunner: QueryRunner,
  schemaName: string,
): Promise<string[]> => {
  const rows: { ddl: string }[] = await queryRunner.query(
    `SELECT
      'CREATE SEQUENCE "' || n.nspname || '"."' || c.relname || '"' ||
      ' AS ' || format_type(s.seqtypid, NULL) ||
      ' INCREMENT BY ' || s.seqincrement ||
      ' MINVALUE ' || s.seqmin ||
      ' MAXVALUE ' || s.seqmax ||
      ' START WITH ' || s.seqstart ||
      CASE WHEN s.seqcycle THEN ' CYCLE' ELSE ' NO CYCLE' END ||
      ';' AS ddl
    FROM pg_sequence s
    JOIN pg_class c ON c.oid = s.seqrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = $1
      AND NOT EXISTS (
        SELECT 1 FROM pg_depend d
        WHERE d.objid = s.seqrelid
          AND d.deptype = 'i'
      )
    ORDER BY c.relname`,
    [schemaName],
  );

  return rows.map((row) => row.ddl);
};
