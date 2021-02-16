import { Transaction } from "./Transaction"
import { WebSQLiteDatabase, SqlJsDatabase } from "./WebSQLiteDatabase"
import { Result } from "./Result"

export class WebSQLiteTransaction extends Transaction {

  private queries: [string, any][]
  private commitListeners: Array<() => void>
  private rollbackListeners: Array<() => void>

  private db?: SqlJsDatabase
  private worker?: Worker
  
  public constructor(
    db?: SqlJsDatabase,
    worker?: Worker
  ){
    super()
    this.db = db
    this.worker = worker
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

        this.beginTransaction();

        transactionStarted = true
        this.executeQueries();

        await this.commit()

        resolve();
      } catch (error){
        if (transactionStarted === true) {
          await this.rollback();
        }
        else {
          reject(error)
        }
      }
    })
  }

  public beginTransaction(): void {
    if (typeof this.worker !== 'undefined') {
      this.worker.postMessage({ action: "exec", sql: "BEGIN TRANSACTION;" })
    } else if (typeof this.db !== 'undefined') {
      this.db.run("BEGIN TRANSACTION;")
    }
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
      while (index < this.queries.length) {
        const [ statement, params ] = this.queries[index]

        if (typeof this.worker !== 'undefined') {
          this.worker.postMessage({ action: "exec", sql: statement, params })
        } else if (typeof this.db !== 'undefined') {
          this.db.run(statement, params);
        }
        index++;
      }
    }
  }

  private rollback(): Promise<void> {
    return new Promise((resolve, reject): void => {
      try {
        if (typeof this.worker !== 'undefined') {
          const onRollback = (): void => {
            if (typeof this.worker !== 'undefined') {
              this.worker.removeEventListener("message", onRollback);
            }
            resolve();
            this.rollbackListeners.forEach(callback => callback())
          }

          this.worker.onmessage = onRollback;
          this.worker.postMessage({ action: "exec", sql: "ROLLBACK;" })

        } else if (typeof this.db !== 'undefined') {
          this.db.run("ROLLBACK;");
          resolve()
          this.rollbackListeners.forEach(callback => callback())
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  private commit(): Promise<void> {
    return new Promise((resolve, reject): void => {
      try {
        if (typeof this.worker !== 'undefined') {
          const onCommit = (): void => {
            if (typeof this.worker !== 'undefined') {
              this.worker.removeEventListener("message", onCommit);
            }
            resolve();
            this.commitListeners.forEach(callback => callback())
          }

          this.worker.onmessage = onCommit;
          this.worker.postMessage({ action: "exec", sql: "COMMIT;" })

        } else if (typeof this.db !== 'undefined') {
          this.db.run("COMMIT;");
          resolve()
          this.commitListeners.forEach(callback => callback())
        }

      } catch (error) {
        reject(error)
      }
    })
  }
}
