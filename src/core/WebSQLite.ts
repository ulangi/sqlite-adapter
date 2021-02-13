import { WebSQLiteDatabase, SqlJsStatic } from "./WebSQLiteDatabase"
import { SQLiteAdapter } from "./SQLiteAdapter"
import init from "sql.js"

export class WebSQLite extends SQLiteAdapter {

  private initSql: typeof init
  private sqlite?: SqlJsStatic

  public constructor(websql: typeof init) {
    super()
    this.initSql = init;
  }

  public async init(): Promise<void> {
    this.sqlite = await this.initSql()
  }

  public createDatabase(): WebSQLiteDatabase {
    if (typeof this.sqlite !== 'undefined') {
      return new WebSQLiteDatabase(this.sqlite);
    } else {
      throw new Error("Sql.js is not initialized. Please call init() first.")
    }
  }
}

