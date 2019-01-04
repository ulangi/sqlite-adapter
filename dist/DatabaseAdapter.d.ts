import { SQLiteDatabase } from "./SQLiteDatabase";
export declare class DatabaseAdapter {
    createDatabase(databaseType: "react-native-sqlite-storage" | "node-sqlite3"): SQLiteDatabase;
}
