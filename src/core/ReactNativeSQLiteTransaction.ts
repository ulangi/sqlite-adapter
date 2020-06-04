import { SQLiteDatabase as RNSQLiteDatabase, Transaction as RNTransaction} from "react-native-sqlite-storage"
import { Transaction } from "./Transaction"
import { Result } from "./Result"

export class ReactNativeSQLiteTransaction extends Transaction {

  private tx!: RNTransaction
  private errors: any[]
  private commitListeners: Array<() => void>
  private rollbackListeners: Array<() => void>

  public constructor(
    private db: RNSQLiteDatabase
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
    resultCallback?: (result: Result) => void,
    errorCallback?: (error: any) => void
  ): void {
    this.tx.executeSql(statement, params,
      (_, resultSet) => {
        if (typeof resultCallback !== 'undefined') {
          const rows = []
          for (let i = 0; i < resultSet.rows.length; i++){
            const item = resultSet.rows.item(i)
            rows.push(item)
          }

          resultCallback({ rows })
        }
      },
      (error) => {
        this.errors.push(error)
        if (typeof errorCallback !== 'undefined') {
          errorCallback(error)
        }
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
