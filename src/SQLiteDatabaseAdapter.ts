import { SQLiteDatabase } from "./SQLiteDatabase"
import { ReactNativeSQLiteDatabase } from "./ReactNativeSQLiteDatabase"
import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"

export abstract class SQLiteDatabaseAdapter {

  public constructor(
    private engine: any
  ){
  }

  public createDatabase(): SQLiteDatabase {
    if (typeof this.engine.openDatabase !== "undefined"){
      return new ReactNativeSQLiteDatabase(this.engine)
    }
    else {
      return new NodeSQLiteDatabase(this.engine)
    }
  }

}

