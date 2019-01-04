import { SQLiteDatabase } from "./SQLiteDatabase";
import { Transaction } from "./Transaction";
import { Result } from "./Result";
export declare class NodeSQLiteDatabase extends SQLiteDatabase {
    private db;
    open(name: string): Promise<void>;
    transaction(scope: (tx: Transaction) => void): Promise<Transaction>;
    close(): Promise<void>;
    executeSql(statement: string, params?: any[]): Promise<Result>;
}
