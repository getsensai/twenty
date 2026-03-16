import { isDefined } from 'twenty-shared/utils';

const escapeString = (value: string): string =>
  `'${value.replace(/'/g, "''")}'`;

export const formatSqlValue = (value: unknown): string => {
  if (!isDefined(value)) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (value instanceof Date) return escapeString(value.toISOString());

  if (Array.isArray(value)) {
    if (value.length === 0) return "'{}'";

    if (typeof value[0] === 'object') {
      return escapeString(JSON.stringify(value));
    }

    const elements = value.map((element) =>
      typeof element === 'string'
        ? `"${element.replace(/"/g, '\\"')}"`
        : String(element),
    );

    return `'{${elements.join(',')}}'`;
  }

  if (typeof value === 'object') {
    return escapeString(JSON.stringify(value));
  }

  return escapeString(String(value));
};

export const generateInsertStatement = (
  schemaName: string,
  tableName: string,
  columnValues: Record<string, string>,
): string => {
  const columns = Object.keys(columnValues)
    .map((column) => `"${column}"`)
    .join(', ');

  const values = Object.values(columnValues).join(', ');

  return `INSERT INTO "${schemaName}"."${tableName}" (${columns}) VALUES (${values});\n`;
};
