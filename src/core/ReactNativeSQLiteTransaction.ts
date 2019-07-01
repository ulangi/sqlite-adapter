import { SQLiteDatabase as RNSQLiteDatabase, Transaction as RNTransaction} from "react-native-sqlite-storage"
import { Transaction } from "./Transaction"

export class ReactNativeSQLiteTransaction extends Transaction {

  private tx!: RNTransaction
  private errors: any[]
  private committedListeners: Array<() => void>

  public constructor(
    private db: RNSQLiteDatabase
  ){
    super()
    this.errors = []
    this.committedListeners = []
  }

  public beginTransaction(scope: (tx: Transaction) => void): Promise<void> {
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
            reject(this.errors[0])
          }
          else {
            resolve()
            this.committedListeners.forEach(callback => callback())
          }
        }
      )
    })
  }

  public executeSql(statement: string, params?: any[] ): void {
    this.tx.executeSql(statement, params,
      () => {},
      (error) => {
        this.errors.push(error)
      }
    )
  }

  public onCommitted(callback: () => void){
    this.committedListeners.push(callback)
  }
}
