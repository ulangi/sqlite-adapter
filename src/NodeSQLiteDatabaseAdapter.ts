import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"
import { SQLiteDatabaseAdapter } from "./SQLiteDatabaseAdapter"

export class NodeSQLiteDatabaseAdapter extends SQLiteDatabaseAdapter {

  public createDatabase() {
    return new NodeSQLiteDatabase()
  }

}

