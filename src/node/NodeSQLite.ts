import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"
import { SQLiteAdapter } from "../core/SQLiteAdapter"

import type * as sqlite3 from "sqlite3"

export class NodeSQLite extends SQLiteAdapter {

  private sqlite: typeof sqlite3

  public constructor(sqlite: typeof sqlite3){
    super()
    this.sqlite = sqlite
  }

  public createDatabase(): NodeSQLiteDatabase {
    return new NodeSQLiteDatabase(this.sqlite)
  }
}

