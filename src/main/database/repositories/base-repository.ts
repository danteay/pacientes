import { DatabaseDriver } from '../driver/database-driver';

/**
 * Base Repository
 *
 * Provides common repository patterns and utilities
 * All specific repositories should extend this class
 */
export abstract class BaseRepository<T, TCreateInput, TUpdateInput> {
  protected driver: DatabaseDriver;
  protected tableName: string;

  constructor(driver: DatabaseDriver, tableName: string) {
    this.driver = driver;
    this.tableName = tableName;
  }

  /**
   * Find a record by ID
   */
  abstract findById(id: number): T | undefined;

  /**
   * Find all records
   */
  abstract findAll(): T[];

  /**
   * Create a new record
   */
  abstract create(data: TCreateInput): T;

  /**
   * Update a record
   */
  abstract update(data: TUpdateInput): T | undefined;

  /**
   * Delete a record
   */
  abstract delete(id: number): boolean;

  /**
   * Check if a record exists
   */
  exists(id: number): boolean {
    const query = `SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`;
    const result = this.driver.executeQuerySingle<{ 1: number }>(query, [id]);
    return result !== undefined;
  }

  /**
   * Count all records
   */
  count(): number {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const result = this.driver.executeQuerySingle<{ count: number }>(query);
    return result?.count ?? 0;
  }

  /**
   * Helper to map database row to entity
   */
  protected abstract mapRowToEntity(row: Record<string, unknown>): T;
}
