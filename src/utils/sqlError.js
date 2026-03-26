/**
 * Shape a PostgreSQL / driver error for JSON responses (500 responses).
 */
function serializeSqlError(err) {
  return {
    name: err.name,
    message: err.message,
    code: err.code,
    detail: err.detail,
    hint: err.hint,
    position: err.position,
    internalPosition: err.internalPosition,
    internalQuery: err.internalQuery,
    where: err.where,
    schema: err.schema,
    table: err.table,
    column: err.column,
    dataType: err.dataType,
    constraint: err.constraint,
    file: err.file,
    line: err.line,
    routine: err.routine,
    stack: err.stack,
  };
}

module.exports = { serializeSqlError };
