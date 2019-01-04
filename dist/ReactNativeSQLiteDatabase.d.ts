import { SQLiteDatabase } from "./SQLiteDatabase";
import { Transaction } from "./Transaction";
import { Result } from "./Result";
export declare class ReactNativeSQLiteDatabase extends SQLiteDatabase {
    private db;
    open(name: string): Promise<void>;
    close(): Promise<void>;
    transaction(scope: (tx: Transaction) => void): Promise<Transaction>;
    executeSql(statement: string, params?: any[]): Promise<Result>;
}
