export abstract class Transaction {
  public abstract executeSql(statement: string, params?: any[] ): Promise<Transaction>
}

