import { Database as NodeDatabase } from "sqlite3"
import { SQLiteDatabase } from "./SQLiteDatabase"
import { NodeSQLiteTransaction } from "./NodeSQLiteTransaction"
import { Transaction } from "./Transaction"
import { Result } from "./Result"

export class NodeSQLiteDatabase extends SQLiteDatabase {

  private db!: NodeDatabase
  private name!: string

  public constructor(
    private engine: { Database: new (name: string, callback: (error: any) => void) => NodeDatabase }
  ){
    super()
  }

  public open(name: string): Promise<void>{
    return new Promise(async(resolve, reject) => {
      try {
        this.name = name
        this.db = new this.engine.Database(name, error => {
          if (error){
            reject(error)
          }
          else {
            resolve()
          }
        })
      }
      catch(error){
        reject(error)
      }
    })
  }

  public transaction(scope: (tx: Transaction) => void): Promise<Transaction> {
    return new Promise(async(resolve, reject) => {
      try {
        const transaction = new NodeSQLiteTransaction(this.db)
        await transaction.beginTransaction(scope)
        resolve(transaction)
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

  public getDb(){
    return this.db
  }
}
