import { Transaction } from "./Transaction"
import { Result } from "./Result"

export abstract class SQLiteDatabase {
  public abstract open(name: string): Promise<void>
  public abstract close(): Promise<void>
  public abstract transaction(scope: (tx: Transaction) => void): Promise<void> 
  public abstract executeSql(statement: string, params?: any[]): Promise<Result>
}

