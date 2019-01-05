import { SQLiteDatabase as RNSQLiteDatabase} from "react-native-sqlite-storage"
import { SQLiteDatabase, } from "./SQLiteDatabase"
import { ReactNativeSQLiteTransaction } from "./ReactNativeSqliteTransaction"
import { Transaction } from "./Transaction"
import { Result } from "./Result"

export class ReactNativeSQLiteDatabase extends SQLiteDatabase {

  public constructor(
    private engine: {
      openDatabase: (param: { name: string, location: string }) => Promise<RNSQLiteDatabase>
    }
  ){
    super()
  }

  private db!: RNSQLiteDatabase

  public open(name: string): Promise<void> {
    return new Promise(async(resolve, reject) => {
      try {
        this.db = await this.engine.openDatabase({ name, location: "default" })
        resolve()
      }
      catch (error){
        reject(error)
      }
    })
  }

  public close(): Promise<void> {
    return new Promise(async(resolve, reject) => {
      try {
        await this.db.close()
        resolve()
      }
      catch (error){
        reject(error)
      }
    })
  }

  public transaction(scope: (tx: Transaction) => void): Promise<Transaction> {
    return new Promise(async(resolve, reject) => {
      try {
        await this.db.transaction(tx => new ReactNativeSQLiteTransaction(tx))
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
        const [ resultSet ] = await this.db.executeSql(statement, params)
        const rows = []
        for (let i = 0; i < resultSet.rows.length; i++){
          const item = resultSet.rows.item(i)
          rows.push(item)
        }
        resolve({ rows })
      }
      catch(error){
        reject(error)
      }
    })
  }
}
