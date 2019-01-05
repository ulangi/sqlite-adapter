import { Transaction } from "./Transaction"
import { Result } from "./Result"
import { ConnectionOptions } from "./ConnectionOptions"

export abstract class SQLiteDatabase {
  public abstract open(name: string, options: ConnectionOptions): Promise<void>
  public abstract close(): Promise<void>
  public abstract transaction(scope: (tx: Transaction) => void): Promise<Transaction> 
  public abstract executeSql(statement: string, params?: any[]): Promise<Result>
}

