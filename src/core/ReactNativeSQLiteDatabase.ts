import * as RNSQLite from "react-native-sqlite-storage"
import { SQLiteDatabase, } from "./SQLiteDatabase"
import { ReactNativeSQLiteTransaction } from "./ReactNativeSqliteTransaction"
import { Transaction } from "./Transaction"
import { Result } from "./Result"

export class ReactNativeSQLiteDatabase extends SQLiteDatabase {

  private db!: RNSQLite.SQLiteDatabase

  public constructor(
    private engine: typeof RNSQLite
  ){
    super()
  }

  public open(name: string): Promise<void> {
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

  public transaction(scope: (tx: Transaction) => void): Promise<void> {
    return new Promise(async(resolve, reject) => {
      try {
        await new ReactNativeSQLiteTransaction(this.db).run(scope)
        resolve()
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

            resolve({ ...resultSet, rows })
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
