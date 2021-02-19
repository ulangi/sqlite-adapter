import { SQLiteDatabase } from "../core/SQLiteDatabase"
import { Transaction } from "../core/Transaction"
import { Result } from "../core/Result"
import { CordovaSQLiteTransaction } from "./CordovaSQLiteTransaction"

/// <reference path="cordova-sqlite-storage />

export class CordovaSQLiteDatabase extends SQLiteDatabase {

  private db!: SQLitePlugin.Database

  public constructor(
    private engine: typeof sqlitePlugin
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
        await new CordovaSQLiteTransaction(this.db).run(scope)
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
