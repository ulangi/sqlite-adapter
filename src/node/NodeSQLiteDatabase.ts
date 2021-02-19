import type * as sqlite3 from "sqlite3"
import { SQLiteDatabase } from "../core/SQLiteDatabase"
import { NodeSQLiteTransaction } from "./NodeSQLiteTransaction"
import { Transaction } from "../core/Transaction"
import { Result } from "../core/Result"
import * as semaphore from "semaphore"

export class NodeSQLiteDatabase extends SQLiteDatabase {

  private db!: sqlite3.Database
  private name!: string
  private sqlite: typeof sqlite3
  private concurrency: semaphore.Semaphore

  public constructor(
    sqlite: typeof sqlite3
  ){
    super()
    this.sqlite = sqlite;
    // Make queries are all executed in serial
    this.concurrency = semaphore(1)
  }

  public open(name: string): Promise<void>{
    return new Promise(async(resolve, reject) => {
      try {
        this.name = name
        this.db = new this.sqlite.Database(name, error => {
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

  public close(): Promise<void> {
    return new Promise(async(resolve, reject) => {
      this.concurrency.take((): void => {
        try {
          this.db.close((error) => {
            this.concurrency.leave();

            if (error){
              reject(error)
            }
            else {
              resolve()
            }
          })
        }
        catch (error){
          this.concurrency.leave();
          reject(error)
        }
      })
    })
  }

  public transaction(scope: (tx: Transaction) => void): Promise<void> {
    return new Promise(async(resolve, reject) => {
      this.concurrency.take(async (): Promise<void> => {
        try {
          await new NodeSQLiteTransaction(this.db).run(scope)
          this.concurrency.leave();
          resolve()
        }
        catch (error){
          this.concurrency.leave();
          reject(error)
        }
      })
    })
  }

  public executeSql(statement: string, params?: any[]): Promise<Result> {
    return new Promise(async (resolve, reject) => {
      this.concurrency.take(async(): Promise<void> => {
        try {
          this.db.all(statement, params, (error, rows) => {
            this.concurrency.leave();
            if (error){
              reject(error)
            }
            else {
              resolve({ rows })
            }
          })
        }
        catch(error){
          this.concurrency.leave();
          reject(error)
        }
      })
    })
  }

  public getDb(): sqlite3.Database {
    return this.db
  }
}
