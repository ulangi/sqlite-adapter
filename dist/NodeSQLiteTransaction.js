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
const Transaction_1 = require("./Transaction");
class NodeSQLiteTransaction extends Transaction_1.Transaction {
    constructor(db) {
        super();
        this.db = db;
    }
    executeSql(statement, params) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.db.all(statement, params, (error, rows) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(this);
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        }));
    }
}
exports.NodeSQLiteTransaction = NodeSQLiteTransaction;
//# sourceMappingURL=NodeSQLiteTransaction.js.map