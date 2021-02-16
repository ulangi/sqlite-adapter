import { WebSQLiteDatabase, SqlJsStatic } from "./WebSQLiteDatabase"
import { SQLiteAdapter } from "./SQLiteAdapter"
import type initSqlJs from "sql.js"

export class WebSQLite extends SQLiteAdapter {

  private sqlite?: SqlJsStatic
  private workerScriptFile?: string

  public async useDefault(initSql: typeof initSqlJs, config?: Partial<EmscriptenModule>): Promise<void> {
    this.sqlite = await initSql(config)
  }

  public useWorker(workerScriptFile: string): void {
    this.workerScriptFile = workerScriptFile
  }

  public createDatabase(): WebSQLiteDatabase {
    return new WebSQLiteDatabase(this.sqlite, this.workerScriptFile);
  }
}

