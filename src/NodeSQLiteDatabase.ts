import * as sqlite3 from "sqlite3"
import { SQLiteDatabase } from "./SQLiteDatabase"
import { NodeSQLiteTransaction } from "./NodeSQLiteTransaction"
import { Transaction } from "./Transaction"
import { Result } from "./Result"

export class NodeSQLiteDatabase extends SQLiteDatabase {

  private db!: sqlite3.Database

  public open(name: string): Promise<void>{
    return new Promise(async(resolve, reject) => {
      try {
        this.db = new sqlite3.Database(name)
        resolve()
      }
      catch(error){
        reject(error)
      }
    })
  }

  public transaction(scope: (tx: Transaction) => void): Promise<Transaction> {
    return new Promise(async(resolve, reject) => {
      try {
        this.db.serialize(() => {
          this.db.run("BEGIN TRANSACTION", () => {
            scope(new NodeSQLiteTransaction(this.db))
            this.db.run("COMMIT", (error) => {
              if (error){
                reject(error)
              }
              else {
                resolve()
              }
            })
          })
        })
      }
      catch (error){
        reject(error)
      }
    })
  }

  public close(): Promise<void> {
    return new Promise(async(resolve, reject) => {
      try {
        this.db.close((error) => {
          if (error){
            reject(error)
          }
          else {
            resolve()
          }
        })
      }
      catch (error){
        reject(error)
      }
    })
  }

  public executeSql(statement: string, params?: any[]): Promise<Result> {
    return new Promise(async (resolve, reject) => {
      try {
        this.db.all(statement, params, (error, rows) => {
          if (error){
            reject(error)
          }
          else {
            resolve({ rows })
          }
        })
      }
      catch(error){
        reject(error)
      }
    })
  }
}
