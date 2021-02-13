import { SQLiteDatabase } from "./SQLiteDatabase"

export abstract class SQLiteAdapter {

  public abstract createDatabase(): SQLiteDatabase

}

