import { WebSQLiteDatabase, SqlJsStatic } from "./WebSQLiteDatabase"
import { SQLiteAdapter } from "./SQLiteAdapter"
import type initSqlJs from "sql.js"

export class WebSQLite extends SQLiteAdapter {

  private initSql: typeof initSqlJs
  private sqlite?: SqlJsStatic
  private workerScriptFile?: string

  public constructor(initSql: typeof initSqlJs) {
    super()
    this.initSql = initSql;
  }

  public async useDefault(config?: Partial<EmscriptenModule>): Promise<void> {
    this.sqlite = await this.initSql(config)
  }

  public useWorker(workerScriptFile: string): void {
    this.workerScriptFile = workerScriptFile
  }

  public createDatabase(): WebSQLiteDatabase {
    return new WebSQLiteDatabase(this.sqlite, this.workerScriptFile);
  }
}

