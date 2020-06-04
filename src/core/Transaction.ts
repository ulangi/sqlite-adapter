import { Result } from "./Result"

export abstract class Transaction {
  public abstract executeSql(
    statement: string,
    params?: any[],
  ): void

  public abstract onCommit(callback: () => void): void
  public abstract onRollback(callback: () => void): void
}

