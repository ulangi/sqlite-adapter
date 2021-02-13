import { ReactNativeSQLiteDatabase } from "./ReactNativeSQLiteDatabase"
import { SQLiteAdapter } from "./SQLiteAdapter"
import * as RNSQLite from "react-native-sqlite-storage"

export class ReactNativeSQLite extends SQLiteAdapter {

  private sqlite: typeof RNSQLite

  public constructor(sqlite: typeof RNSQLite){
    super()
    this.sqlite = sqlite
  }

  public createDatabase(): ReactNativeSQLiteDatabase {
    return new ReactNativeSQLiteDatabase(this.sqlite)
  }
}

