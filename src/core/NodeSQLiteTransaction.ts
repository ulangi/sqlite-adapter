import { Database as NodeDatabase } from "sqlite3"
import { Transaction } from "./Transaction"
import { NodeSQLiteDatabase } from "./NodeSQLiteDatabase"

export class NodeSQLiteTransaction extends Transaction {

  private errors: any[]
  private queries: [string, any][]
  private committedListeners: Array<() => void>

  private db!: NodeDatabase
  
  public constructor(
    private databaseName: string,
    private databaseEngine: { Database: new (name: string, callback: (error: any) => void) => NodeDatabase },
  ){
    super()
    this.errors = []
    this.queries = []
    this.committedListeners = []
  }

  public beginTransaction(transactionScope: (tx: Transaction) => void): Promise<void>{
    return new Promise(async(resolve, reject) => {
      try {
        // Currently, we open a new connection for each transaction
        // TODO: Reuse the database connection
        const adapter = new NodeSQLiteDatabase(this.databaseEngine)
        await adapter.open(this.databaseName)

        this.db = adapter.getDb()

        this.db.serialize(() => {
          this.db.run("BEGIN TRANSACTION;")

          transactionScope(this)
          this.executeQueries((done): void => {
            if (done) {
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
            }
          })
        })
      }
      catch (error){
        reject(error)
      }
    })
  }

  public executeSql(statement: string, params?: any[] ): void {
    this.queries.push([statement, params]);
  }

  public onCommitted(callback: () => void){
    this.committedListeners.push(callback)
  }

  private executeQueries(callback: (done: boolean) => void): void {
    this.queries.forEach(([statement, params], index): void => {
      this.db.run(statement, params, (error: any): void => {
        if (error){
          this.errors.push(error)
        }

        callback(index === this.queries.length - 1)
      })
    })
  }
}
