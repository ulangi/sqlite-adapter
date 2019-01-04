import * as reactnativesqlite from "react-native-sqlite-storage";
import { Transaction } from "./Transaction";
export declare class ReactNativeSQLiteTransaction extends Transaction {
    private transaction;
    constructor(transaction: reactnativesqlite.Transaction);
    executeSql(statement: string, params?: any[]): Promise<Transaction>;
}
