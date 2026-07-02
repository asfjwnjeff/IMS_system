declare module 'sql.js' {
  interface SqlJsStatic {
    Database: new (data?: Buffer | ArrayBuffer | Uint8Array) => Database;
  }

  interface Database {
    run(sql: string, params?: unknown[]): void;
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  interface Statement {
    bind(params?: unknown[]): boolean;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): void;
  }

  interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }

  function initSqlJs(config?: { locateFile?: () => string }): Promise<SqlJsStatic>;
  export default initSqlJs;
}
