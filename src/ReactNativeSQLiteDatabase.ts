import { SQLiteDatabase as RNSQLiteDatabase} from "react-native-sqlite-storage"
import { SQLiteDatabase, } from "./SQLiteDatabase"
import { ReactNativeSQLiteTransaction } from "./ReactNativeSqliteTransaction"
import { Transaction } from "./Transaction"
import { ConnectionOptions } from "./ConnectionOptions"
import { Result } from "./Result"

export class ReactNativeSQLiteDatabase extends SQLiteDatabase {

  private db!: RNSQLiteDatabase

  public constructor(
    private engine: {
      openDatabase: (
        param: { name: string, location: string },
        successCB: () => void,
        errorCB: (error?: any) => void
      ) => RNSQLiteDatabase
    }
  ){
    super()
  }

  public open(name: string, options: ConnectionOptions): Promise<void> {
    return new Promise(async(resolve, reject) => {
      try {
        this.db = this.engine.openDatabase({ name, location: "default" }, () => {
          resolve()
        }, (error) => {
          reject(error)
        })
      }
      catch (error){
        reject(error)
      }
    }).then(async() => {
      if (options.enable_foreign_keys === true){
        await this.executeSql("PRAGMA foreign_keys = ON;")
      }
    })
  }

  public close(): Promise<void> {
    return new Promise(async(resolve, reject) => {
      try {
        this.db.close(() => {
          resolve()
        }, error => {
          reject(error)
        })
      }
      catch (error){
        reject(error)
      }
    })
  }

  public transaction(scope: (tx: Transaction) => void): Promise<Transaction> {
    return new Promise(async(resolve, reject) => {
      try {
        const transaction = new ReactNativeSQLiteTransaction(this.db)
        await transaction.beginTransaction(scope)
        resolve(transaction)
      }
      catch (error){
        reject(error)
      }
    })
  }

  public executeSql(statement: string, params?: any[]): Promise<Result> {
    return new Promise(async (resolve, reject) => {
      try {
        this.db.executeSql(statement, params, 
          (resultSet: any) => {
            const rows = []
            for (let i = 0; i < resultSet.rows.length; i++){
              const item = resultSet.rows.item(i)
              rows.push(item)
            }
            resolve({ rows })
          },
          error => {
            reject(error)
          }
        )
      }
      catch(error){
        reject(error)
      }
    })
  }
}
