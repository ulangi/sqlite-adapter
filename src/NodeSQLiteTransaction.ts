import { Database as NodeDatabase } from "sqlite3"
import { observable, when, IObservableValue } from "mobx"
import { Transaction } from "./Transaction"
import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"
import { ConnectionOptions } from "./ConnectionOptions"

export class NodeSQLiteTransaction extends Transaction {

  private hasError: boolean
  private lastError: any
  private remainingQueries: IObservableValue<number>

  private db!: NodeDatabase
  
  public constructor(
    private databaseName: string,
    private databaseEngine: { Database: new (name: string, callback: (error: any) => void) => NodeDatabase },
    private options: ConnectionOptions
  ){
    super()
    this.hasError = false
    this.remainingQueries = observable.box(0)
  }

  public beginTransaction(scope: (tx: Transaction) => void): Promise<void>{
    return new Promise(async(resolve, reject) => {
      try {
        // Because no isolation between operations on the same database connection,
        // For every transaction, we need to open a new connection
        const adapter = new NodeSQLiteDatabase(this.databaseEngine)
        await adapter.open(this.databaseName, this.options)

        this.db = adapter.getDb()
        this.db.serialize(() => {
          this.db.run("BEGIN TRANSACTION;")
          scope(this)
          when(
            () => this.remainingQueries.get() === 0,
            () => {
              if (this.hasError){
                this.db.run("ROLLBACK;", () => {
                  reject(this.lastError)
                })
              }
              else {
                this.db.run("COMMIT;", () => {
                  resolve()
                })
              }
              this.db.close()
            }
          )
        })
      }
      catch (error){
        reject(error)
      }
    })
  }

  public executeSql(statement: string, params?: any[] ): Promise<Transaction> {
    return new Promise(async(resolve, reject) => {
      try {
        this.remainingQueries.set(this.remainingQueries.get() + 1)
        this.db.run(statement, params, (error) => {
          if (error){
            this.hasError = true
            this.lastError = error
            reject(error)
          }
          else {
            resolve(this)
          }
          this.remainingQueries.set(this.remainingQueries.get() - 1)
        })
      }
      catch (error){
        reject(error)
      }
    })
  }
}
