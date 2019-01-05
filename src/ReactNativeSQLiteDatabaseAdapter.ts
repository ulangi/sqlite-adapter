import { ReactNativeSQLiteDatabase } from "./ReactNativeSQLiteDatabase"
import { SQLiteDatabaseAdapter } from "./SQLiteDatabaseAdapter"

export class ReactNativeSQLiteDatabaseAdapter extends SQLiteDatabaseAdapter {

  public createDatabase() {
    return new ReactNativeSQLiteDatabase()
  }

}

