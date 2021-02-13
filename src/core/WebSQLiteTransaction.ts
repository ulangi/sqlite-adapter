import { Transaction } from "./Transaction"
import { WebSQLiteDatabase, SqlJsDatabase } from "./WebSQLiteDatabase"
import { Result } from "./Result"

export class WebSQLiteTransaction extends Transaction {

  private queries: [string, any][]
  private commitListeners: Array<() => void>
  private rollbackListeners: Array<() => void>

  private db!: SqlJsDatabase
  
  public constructor(
    db: SqlJsDatabase
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

        scope(this)

        this.db.run("BEGIN TRANSACTION;")

        transactionStarted = true
        this.executeQueries();
        this.commit()

        resolve();
      } catch (error){
        if (transactionStarted === true) {
          this.rollback();
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

  private executeQueries(): void {
    if (this.queries.length > 0) {
      let index = 0
      let error: any = null

      while (index < this.queries.length) {
        const [ statement, params ] = this.queries[index]
        const isLastQuery = (index === this.queries.length - 1)

        this.db.run(statement, params);
        index++;
      }
    }
  }

  private rollback(): void {
    this.db.run("ROLLBACK;");
    this.rollbackListeners.forEach(callback => callback())
  }

  private commit(): void {
    this.db.run("COMMIT;");
    this.commitListeners.forEach(callback => callback())
  }
}
