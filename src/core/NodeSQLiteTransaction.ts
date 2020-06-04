import { Database as NodeDatabase } from "sqlite3"
import { Transaction } from "./Transaction"
import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"
import { Result } from "./Result"

export class NodeSQLiteTransaction extends Transaction {

  private errors: any[]
  private queries: [string, any, ((result: Result) => void)?, ((error: any) => void)?][]
  private commitListeners: Array<() => void>
  private rollbackListeners: Array<() => void>

  private db!: NodeDatabase
  
  public constructor(
    db: NodeDatabase
  ){
    super()
    this.db = db
    this.errors = []
    this.queries = []
    this.commitListeners = []
    this.rollbackListeners = []
  }

  public run(scope: (tx: Transaction) => void): Promise<void>{
    return new Promise(async(resolve, reject) => {
      try {
        // Currently, we open a new connection for each transaction
        // TODO: Reuse the database connection

        this.db.serialize(() => {
          scope(this)

          this.db.run("BEGIN TRANSACTION;")
          this.executeQueries((done): void => {
            if (done) {
              if (this.errors.length > 0){
                this.db.run("ROLLBACK;", () => {
                  reject(this.errors.length === 1 ? this.errors[0] : this.errors)
                  this.rollbackListeners.forEach(callback => callback())
                })
              }
              else {
                this.db.run("COMMIT;", () => {
                  resolve()
                  this.commitListeners.forEach(callback => callback())
                })
              }
              this.queries = []
            }
          })
        })
      }
      catch (error){
        reject(error)
      }
    })
  }

  public executeSql(
    statement: string,
    params?: any[],
    resultCallback?: (result: Result) => void,
    errorCallback?: (error: any) => void
  ): void {
    this.queries.push([statement, params, resultCallback, errorCallback]);
  }

  public onCommit(callback: () => void){
    this.commitListeners.push(callback)
  }

  public onRollback(callback: () => void){
    this.rollbackListeners.push(callback)
  }

  private executeQueries(callback: (done: boolean) => void): void {
    if (this.queries.length === 0) {
      callback(true)
    } else {
      this.queries.forEach(([statement, params, resultCallback, errorCallback], index): void => {
        this.db.all(statement, params, (error: any, rows: any[]): void => {
          if (error){
            this.errors.push(error)
            if (typeof errorCallback !== 'undefined'){
              errorCallback(error)
            }
          }

          if (typeof resultCallback !== 'undefined'){
            resultCallback({ rows })
          }

          callback(index === this.queries.length - 1)
        })
      })
    }
  }
}
