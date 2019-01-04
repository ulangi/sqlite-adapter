import * as sqlite3 from "sqlite3";
import { Transaction } from "./Transaction";
export declare class NodeSQLiteTransaction extends Transaction {
    private db;
    constructor(db: sqlite3.Database);
    executeSql(statement: string, params?: any[]): Promise<Transaction>;
}
