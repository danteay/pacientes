import Database from 'better-sqlite3';

/**
 * Database Driver Layer
 *
 * Responsible for:
 * - Low-level database operations
 * - Connection management
 * - Raw query execution
 * - Transaction management
 *
 * This layer provides a clean abstraction over the database library,
 * making it easier to swap implementations if needed.
 */
export class DatabaseDriver {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Execute a SELECT query and return all results
   */
  executeQuery<T = unknown>(query: string, params: unknown[] = []): T[] {
    const stmt = this.db.prepare(query);
    return stmt.all(...params) as T[];
  }

  /**
   * Execute a SELECT query and return a single result
   */
  executeQuerySingle<T = unknown>(query: string, params: unknown[] = []): T | undefined {
    const stmt = this.db.prepare(query);
    const result = stmt.get(...params);
    return result as T | undefined;
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE query
   * Returns information about the operation
   */
  executeCommand(query: string, params: unknown[] = []): Database.RunResult {
    const stmt = this.db.prepare(query);
    return stmt.run(...params);
  }

  /**
   * Execute multiple commands in a transaction
   * Automatically rolls back on error
   */
  executeTransaction<T>(callback: () => T): T {
    const transaction = this.db.transaction(callback);
    return transaction();
  }

  /**
   * Execute a raw SQL command (for migrations, etc.)
   */
  executeRaw(sql: string): void {
    this.db.exec(sql);
  }

  /**
   * Set a pragma value
   */
  setPragma(pragma: string, value: string | number): void {
    this.db.pragma(`${pragma} = ${value}`);
  }

  /**
   * Get a pragma value
   */
  getPragma(pragma: string): unknown {
    return this.db.pragma(pragma);
  }

  /**
   * Get the underlying database instance
   * Use sparingly - prefer using the driver methods
   */
  getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }

  /**
   * Check if the database is open
   */
  isOpen(): boolean {
    return this.db.open;
  }
}
