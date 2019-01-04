import { ReactNativeSQLiteDatabase } from "./ReactNativeSQLiteDatabase"
import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"
import { SQLiteDatabase } from "./SQLiteDatabase"

export class DatabaseAdapter {

  public createDatabase(
    databaseType: "react-native-sqlite-storage" | "node-sqlite3"
  ): SQLiteDatabase {
    if (databaseType === "react-native-sqlite-storage"){
      return new ReactNativeSQLiteDatabase()
    }
    else {
      return new NodeSQLiteDatabase()
    }
  }

}

