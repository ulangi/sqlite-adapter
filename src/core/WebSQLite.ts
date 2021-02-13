import { WebSQLiteDatabase, SqlJsStatic } from "./WebSQLiteDatabase"
import { SQLiteAdapter } from "./SQLiteAdapter"
import type initSqlJs from "sql.js"

export class WebSQLite extends SQLiteAdapter {

  private initSql: typeof initSqlJs
  private sqlite?: SqlJsStatic

  public constructor(initSql: typeof initSqlJs) {
    super()
    this.initSql = initSql;
  }

  public async init(config?: Partial<EmscriptenModule>): Promise<void> {
    this.sqlite = await this.initSql(config)
  }

  public createDatabase(): WebSQLiteDatabase {
    if (typeof this.sqlite !== 'undefined') {
      return new WebSQLiteDatabase(this.sqlite);
    } else {
      throw new Error("Sql.js is not initialized. Please call init() first.")
    }
  }
}

