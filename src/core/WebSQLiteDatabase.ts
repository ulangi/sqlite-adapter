import { SQLiteDatabase } from "./SQLiteDatabase"
import { WebSQLiteTransaction } from "./WebSQLiteTransaction"
import { Transaction } from "./Transaction"
import { Result } from "./Result"
import type initSqlJs from "sql.js"
import { PromiseType } from "utility-types"

export type SqlJsStatic = PromiseType<ReturnType<typeof initSqlJs>>
export type SqlJsDatabase = InstanceType<SqlJsStatic["Database"]>

export class WebSQLiteDatabase extends SQLiteDatabase {

  private db!: SqlJsDatabase
  private name!: string
  private sqlite: SqlJsStatic

  public constructor(
    sqlite: PromiseType<ReturnType<typeof initSqlJs>>
  ){
    super()
    this.sqlite = sqlite;
  }

  public open(name: string): Promise<void>{
    return new Promise(async(resolve, reject) => {
      try {
        this.name = name
        this.db = new this.sqlite.Database()

        resolve();
      }
      catch(error){
        reject(error)
      }
    })
  }

  public close(): Promise<void> {
    return new Promise(async(resolve, reject) => {
      try {
        this.db.close();
        resolve()
      }
      catch (error){
        reject(error)
      }
    })
  }

  public transaction(scope: (tx: Transaction) => void): Promise<void> {
    return new Promise(async(resolve, reject) => {
      try {
        await new WebSQLiteTransaction(this.db).run(scope)
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
        const rows: any[] = [];
        this.db.each(statement, params || [], (row): void => {
          rows.push(row)
        }, (): void => {
          resolve({ rows })
        })
      }
      catch(error){
        reject(error)
      }
    })
  }

  public getDb(): SqlJsDatabase  {
    return this.db
  }
}
