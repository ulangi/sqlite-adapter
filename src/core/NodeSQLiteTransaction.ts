import { Database as NodeDatabase } from "sqlite3"
import { observable, when, IObservableValue, IObservableArray } from "mobx"
import { Transaction } from "./Transaction"
import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"
import { ConnectionOptions } from "./ConnectionOptions"

export class NodeSQLiteTransaction extends Transaction {

  private errors: IObservableArray<any>
  private remainingQueries: IObservableValue<number>
  private committedListeners: Array<() => void>

  private db!: NodeDatabase
  
  public constructor(
    private databaseName: string,
    private databaseEngine: { Database: new (name: string, callback: (error: any) => void) => NodeDatabase },
    private options: ConnectionOptions
  ){
    super()
    this.errors = observable.array()
    this.remainingQueries = observable.box(0)
    this.committedListeners = []
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
          try {
            scope(this)
          } catch (error){
            this.errors.push(error)
          }

          when(
            () => this.remainingQueries.get() === 0 || this.errors.length > 0,
            () => {
              if (this.errors.length > 0){
                this.db.run("ROLLBACK;", () => {
                  reject(this.errors[0])
                })
              }
              else {
                this.db.run("COMMIT;", () => {
                  resolve()
                  this.committedListeners.forEach(callback => callback())
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

  public executeSql(statement: string, params?: any[] ): void {
    this.remainingQueries.set(this.remainingQueries.get() + 1)
    this.db.run(statement, params, (error) => {
      if (error){
        this.errors.push(error)
      }
      this.remainingQueries.set(this.remainingQueries.get() - 1)
    })
  }

  public onCommitted(callback: () => void){
    this.committedListeners.push(callback)
  }
}
