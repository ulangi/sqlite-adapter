import { SQLiteDatabase } from "./SQLiteDatabase"
import { WebSQLiteTransaction } from "./WebSQLiteTransaction"
import { Transaction } from "./Transaction"
import { Result } from "./Result"
import type initSqlJs from "sql.js"
import { PromiseType } from "utility-types"
import * as semaphore from "semaphore"

export type SqlJsStatic = PromiseType<ReturnType<typeof initSqlJs>>
export type SqlJsDatabase = InstanceType<SqlJsStatic["Database"]>

export class WebSQLiteDatabase extends SQLiteDatabase {

  private name!: string
  private sqlite?: SqlJsStatic
  private db?: SqlJsDatabase
  private workerScriptFile?: string
  private worker?: Worker
  private concurrency: semaphore.Semaphore

  public constructor(
    sqlite?: PromiseType<ReturnType<typeof initSqlJs>>,
    workerScriptFile?: string
  ){
    super()
    this.sqlite = sqlite;
    this.workerScriptFile = workerScriptFile

    // Make queries are all executed in serial
    this.concurrency = semaphore(1)
  }

  public open(name: string): Promise<void>{
    return new Promise(async(resolve, reject) => {
      try {
        this.name = name;

        if (typeof this.workerScriptFile !== "undefined") {
          this.worker = new Worker(this.workerScriptFile)

          const onOpen = (): void => {
            if (typeof this.worker !== 'undefined') {
              this.worker.removeEventListener("message", onOpen)
            }
            resolve();
          }

          this.worker.onmessage = onOpen
          this.worker.postMessage({ action: "open" })

        } else if (typeof this.sqlite !== 'undefined') {
          this.db = new this.sqlite.Database()
          resolve();
        }
      }
      catch(error){
        reject(error)
      }
    })
  }

  public close(): Promise<void> {
    return new Promise(async(resolve, reject) => {
      this.concurrency.take((): void => {
        try {
          if (typeof this.worker !== 'undefined') {
            const onClose = (): void => {
              if (typeof this.worker !== 'undefined') {
                this.worker.removeEventListener("message", onClose)
              }
              this.concurrency.leave()
              resolve();
            }

            this.worker.onmessage = onClose
            this.worker.postMessage({ action: "close" })
          } else if (typeof this.db !== 'undefined') {
            this.db.close();
            this.concurrency.leave()
            resolve()
          }
        }
        catch (error){
          reject(error)
        }
      })
    })
  }

  public transaction(scope: (tx: Transaction) => void): Promise<void> {
    return new Promise(async(resolve, reject) => {
      this.concurrency.take(async (): Promise<void> => {
        try {
          await new WebSQLiteTransaction(this.db, this.worker).run(scope)
          this.concurrency.leave();
          resolve()
        }
        catch (error){
          this.concurrency.leave();
          reject(error)
        }
      })
    })
  }

  public executeSql(statement: string, params?: any[]): Promise<Result> {
    return new Promise(async (resolve, reject) => {
      this.concurrency.take(async(): Promise<void> => {
        try {
          const rows: any[] = [];

          if (typeof this.worker !== 'undefined') {
            const onEach = (event: any): void => {
              var { row, finished } = event.data;

              if (typeof row !== 'undefined') {
                rows.push(row);
              } else if (finished === true) {
                if (typeof this.worker !== 'undefined') {
                  this.worker.removeEventListener("message", onEach);
                }
                this.concurrency.leave();
                resolve({ rows })
              }
            }

            this.worker.postMessage({ action: 'each', sql: statement, params });
          } else if (typeof this.db !== 'undefined') {
            this.db.each(statement, params || [], (row): void => {
              rows.push(row)
            }, (): void => {
              this.concurrency.leave();
              resolve({ rows })
            })
          }
        }
        catch(error){
          reject(error)
        }
      })
    })
  }

  public getDb(): undefined | SqlJsDatabase  {
    return this.db
  }
}
