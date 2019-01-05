import { SQLiteDatabase } from "./SQLiteDatabase"

export abstract class SQLiteDatabaseAdapter {

  public abstract createDatabase(): SQLiteDatabase 

}

