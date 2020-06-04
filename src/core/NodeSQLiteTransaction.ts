import { Database as NodeDatabase } from "sqlite3"
import { Transaction } from "./Transaction"
import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"
import { Result } from "./Result"

export class NodeSQLiteTransaction extends Transaction {

  private queries: [string, any, ((result: Result) => void)?, ((error: any) => void)?][]
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

  private executeQueries(callback: (error: any) => void): void {
    let index = 0
    let done = this.queries.length !== 0
    let error = null

    while (done === false) {
      const [ statement, params, resultCallback, errorCallback ] = this.queries[index]

      this.db.all(statement, params, (err: any, rows: any[]): void => {
        if (err){
          if (typeof errorCallback !== 'undefined'){
            errorCallback(err)
          }

          error = err;
          done = true;
        }
        else {
          if (typeof resultCallback !== 'undefined'){
            resultCallback({ rows })
          }

          if(index === this.queries.length - 1){
            done = true;
          }
          else {
            index++;
          }
        }
      })
    }

    callback(error)
  }
}
