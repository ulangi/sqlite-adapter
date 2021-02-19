import type * as sqlite3 from "sqlite3"
import { Transaction } from "../core/Transaction"
import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"
import { Result } from "../core/Result"

export class NodeSQLiteTransaction extends Transaction {

  private queries: [string, any][]
  private commitListeners: Array<() => void>
  private rollbackListeners: Array<() => void>

  private db!: sqlite3.Database
  
  public constructor(
    db: sqlite3.Database
  ){
    super()
    this.db = db
    this.queries = []
    this.commitListeners = []
    this.rollbackListeners = []
  }

  public run(scope: (tx: Transaction) => void): Promise<void>{
    return new Promise(async(resolve, reject) => {
      let transactionStarted

      try {
        transactionStarted = false

        this.db.serialize(() => {
          scope(this)

          this.db.run("BEGIN TRANSACTION;")
          transactionStarted = true

          this.executeQueries((error): void => {
            if (error){
              this.rollback((): void => {
                reject(error)
              })
            }
            else {
              this.commit((): void => {
                resolve()
              })
            }
          })
        })
      } catch (error){
        if (transactionStarted === true) {
          this.rollback((): void => {
            reject(error)
          })
        }
        else {
          reject(error)
        }
      }
    })
  }

  public executeSql(
    statement: string,
    params?: any[],
  ): void {
    this.queries.push([statement, params]);
  }

  public onCommit(callback: () => void){
    this.commitListeners.push(callback)
  }

  public onRollback(callback: () => void){
    this.rollbackListeners.push(callback)
  }

  private executeQueries(callback: (error: any) => void): void {
    if (this.queries.length === 0) {
      callback(null);
    }
    else {
      let index = 0
      let error: any = null

      while (index < this.queries.length) {
        const [ statement, params ] = this.queries[index]
        const isLastQuery = (index === this.queries.length - 1)

        this.db.run(statement, params, (err: any): void => {
          if (err !== null && error === null) {
            error = err;
          }

          if (isLastQuery) {
            callback(error);
          }
        })

        index++;
      }
    }
  }

  private rollback(callback: () => void): void {
    this.db.run("ROLLBACK;", () => {
      callback();
      this.rollbackListeners.forEach(callback => callback())
    })
  }

  private commit(callback: () => void): void {
    this.db.run("COMMIT;", () => {
      callback();
      this.commitListeners.forEach(callback => callback())
    })
  }
}
