"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactNativeSQLiteDatabase_1 = require("./ReactNativeSQLiteDatabase");
const NodeSQLiteDatabase_1 = require("./NodeSQLiteDatabase");
class DatabaseAdapter {
    createDatabase(databaseType) {
        if (databaseType === "react-native-sqlite-storage") {
            return new ReactNativeSQLiteDatabase_1.ReactNativeSQLiteDatabase();
        }
        else {
            return new NodeSQLiteDatabase_1.NodeSQLiteDatabase();
        }
    }
}
exports.DatabaseAdapter = DatabaseAdapter;
//# sourceMappingURL=DatabaseAdapter.js.map