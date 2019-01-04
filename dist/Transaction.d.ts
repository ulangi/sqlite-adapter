export declare abstract class Transaction {
    abstract executeSql(statement: string, params?: any[]): Promise<Transaction>;
}
