import type * as RNSQLite from "react-native-sqlite-storage"
import { Transaction } from "../core/Transaction"
import { Result } from "../core/Result"

export class ReactNativeSQLiteTransaction extends Transaction {

  private tx!: RNSQLite.Transaction
  private errors: any[]
  private commitListeners: Array<() => void>
  private rollbackListeners: Array<() => void>

  public constructor(
    private db: RNSQLite.SQLiteDatabase
  ){
    super()
    this.errors = []
    this.commitListeners = []
    this.rollbackListeners = []
  }

  public run(scope: (tx: Transaction) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          this.tx = tx
          scope(this)
        },
        (error) => {
          reject(error)
        },
        () => {
          if (this.errors.length > 0){
            reject(this.errors.length === 1 ? this.errors[0] : this.errors)
            this.rollbackListeners.forEach(callback => callback())
          }
          else {
            resolve()
            this.commitListeners.forEach(callback => callback())
          }
        }
      )
    })
  }

  public executeSql(
    statement: string,
    params?: any[],
  ): void {
    this.tx.executeSql(statement, params,
      () => {},
      (error) => {
        this.errors.push(error)
      }
    )
  }

  public onCommit(callback: () => void){
    this.commitListeners.push(callback)
  }

  public onRollback(callback: () => void){
    this.rollbackListeners.push(callback)
  }
}
