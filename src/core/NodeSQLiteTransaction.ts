import { Database as NodeDatabase } from "sqlite3"
import { Transaction } from "./Transaction"
import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"
import { Result } from "./Result"

export class NodeSQLiteTransaction extends Transaction {

  private queries: [string, any][]
  private commitListeners: Array<() => void>
  private rollbackListeners: Array<() => void>

  private db!: NodeDatabase
  
  public constructor(
    db: NodeDatabase
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
              throw error;
            }
            else {
              this.db.run("COMMIT;", () => {
                resolve()
                this.commitListeners.forEach(callback => callback())
              })
            }
          })
        })
      } catch (error){
        if (transactionStarted === true) {
          this.db.run("ROLLBACK;", () => {
            reject(error)
            this.rollbackListeners.forEach(callback => callback())
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
    let index = 0
    let error = null

    while (index < this.queries.length || error === null) {
      const [ statement, params ] = this.queries[index]

      this.db.all(statement, params, (err: any): void => {
        if (err){
          error = err;
        }
        else {
          index++;
        }
      })
    }

    callback(error)
  }
}
