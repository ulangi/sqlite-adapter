"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const reactnativesqlite = require("react-native-sqlite-storage");
const SQLiteDatabase_1 = require("./SQLiteDatabase");
const ReactNativeSqliteTransaction_1 = require("./ReactNativeSqliteTransaction");
class ReactNativeSQLiteDatabase extends SQLiteDatabase_1.SQLiteDatabase {
    open(name) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.db = yield reactnativesqlite.openDatabase({ name, location: "default" });
                resolve();
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    close() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.close();
                resolve();
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    transaction(scope) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.transaction(tx => new ReactNativeSqliteTransaction_1.ReactNativeSQLiteTransaction(tx));
                resolve();
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    executeSql(statement, params) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const [resultSet] = yield this.db.executeSql(statement, params);
                const rows = [];
                for (let i = 0; i < resultSet.rows.length; i++) {
                    const item = resultSet.rows.item(i);
                    rows.push(item);
                }
                resolve({ rows });
            }
            catch (error) {
                reject(error);
            }
        }));
    }
}
exports.ReactNativeSQLiteDatabase = ReactNativeSQLiteDatabase;
//# sourceMappingURL=ReactNativeSQLiteDatabase.js.map