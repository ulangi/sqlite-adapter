import { CordovaSQLiteDatabase } from "./CordovaSQLiteDatabase"
import { SQLiteAdapter } from "../core/SQLiteAdapter"

/// <reference path="cordova-sqlite-storage />

export class CordovaSQLite extends SQLiteAdapter {

  private sqlite: typeof sqlitePlugin

  public constructor(sqlite: typeof sqlitePlugin){
    super()
    this.sqlite = sqlite
  }

  public createDatabase(): CordovaSQLiteDatabase {
    return new CordovaSQLiteDatabase(this.sqlite)
  }
}

