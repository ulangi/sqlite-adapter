import { Database as NodeDatabase } from "sqlite3"
import { SQLiteDatabase } from "./SQLiteDatabase"
import { NodeSQLiteTransaction } from "./NodeSQLiteTransaction"
import { Transaction } from "./Transaction"
import { Result } from "./Result"
import { SerializedQueue } from "./SerializedQueue"

export class NodeSQLiteDatabase extends SQLiteDatabase {

  private db!: NodeDatabase
  private name!: string
  private queue: SerializedQueue

  public constructor(
    private engine: { Database: new (name: string, callback: (error: any) => void) => NodeDatabase }
  ){
    super()
    this.queue = new SerializedQueue()
  }

  public open(name: string): Promise<void>{
    return new Promise(async(resolve, reject) => {
      try {
        this.name = name
        this.db = new this.engine.Database(name, error => {
          if (error){
            reject(error)
          }
          else {
            resolve()
          }
        })
      }
      catch(error){
        reject(error)
      }
    })
  }

  public close(): Promise<void> {
    return new Promise(async(resolve, reject) => {
      try {
        await this.queue.enqueue()

        this.db.close((error) => {
          this.queue.dequeue()

          if (error){
            reject(error)
          }
          else {
            resolve()
          }
        })
      }
      catch (error){
        this.queue.dequeue()
        reject(error)
      }
    })
  }

  public transaction(scope: (tx: Transaction) => void): Promise<void> {
    return new Promise(async(resolve, reject) => {
      try {
        await this.queue.enqueue()
        await new NodeSQLiteTransaction(this.db).run(scope)
        this.queue.dequeue()
        resolve()
      }
      catch (error){
        this.queue.dequeue()
        reject(error)
      }
    })
  }

  public executeSql(statement: string, params?: any[]): Promise<Result> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.queue.enqueue()

        this.db.all(statement, params, (error, rows) => {
          this.queue.dequeue()

          if (error){
            reject(error)
          }
          else {
            resolve({ rows })
          }
        })
      }
      catch(error){
        this.queue.dequeue()
        reject(error)
      }
    })
  }

  public getDb(){
    return this.db
  }
}
