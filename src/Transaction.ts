export abstract class Transaction {
  public abstract executeSql(statement: string, params?: any[] ): void
  public abstract onCommitted(callback: () => void): void
}

