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
const sqlite3 = require("sqlite3");
const SQLiteDatabase_1 = require("./SQLiteDatabase");
const NodeSQLiteTransaction_1 = require("./NodeSQLiteTransaction");
class NodeSQLiteDatabase extends SQLiteDatabase_1.SQLiteDatabase {
    open(name) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.db = new sqlite3.Database(name);
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
                this.db.serialize(() => {
                    this.db.run("BEGIN TRANSACTION", () => {
                        scope(new NodeSQLiteTransaction_1.NodeSQLiteTransaction(this.db));
                        this.db.run("COMMIT", (error) => {
                            if (error) {
                                this.db.run("ROLLBACK", () => {
                                    reject(error);
                                });
                            }
                            else {
                                resolve();
                            }
                        });
                    });
                });
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    close() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.db.close((error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    executeSql(statement, params) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.db.all(statement, params, (error, rows) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve({ rows });
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        }));
    }
}
exports.NodeSQLiteDatabase = NodeSQLiteDatabase;
//# sourceMappingURL=NodeSQLiteDatabase.js.map