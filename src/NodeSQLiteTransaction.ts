import * as sqlite3 from "sqlite3"
import { Transaction } from "./Transaction"

export class NodeSQLiteTransaction extends Transaction {

  public constructor(
    private db: sqlite3.Database
  ){
    super()
  }

  public executeSql(statement: string, params?: any[] ): Promise<Transaction> {
    return new Promise(async(resolve, reject) => {
      try {
        this.db.run(statement, params, (error) => {
          if (error){
            reject(error)
          }
          else {
            resolve(this)
          }
        })
      }
      catch (error){
        reject(error)
      }
    })
  }
}
