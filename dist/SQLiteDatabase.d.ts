import { Transaction } from "./Transaction";
import { Result } from "./Result";
export declare abstract class SQLiteDatabase {
    abstract open(name: string): Promise<void>;
    abstract close(): Promise<void>;
    abstract transaction(scope: (tx: Transaction) => void): Promise<Transaction>;
    abstract executeSql(statement: string, params?: any[]): Promise<Result>;
}
