import * as reactnativesqlite from "react-native-sqlite-storage"
import { Transaction } from "./Transaction"

export class ReactNativeSQLiteTransaction extends Transaction {

  public constructor(
    private transaction: reactnativesqlite.Transaction
  ){
    super()
  }

  public executeSql(statement: string, params?: any[] ): Promise<Transaction> {
    return new Promise(async(resolve, reject) => {
      try {
        const [ tx ] = await this.transaction.executeSql(statement, params)
        resolve(new ReactNativeSQLiteTransaction(tx))
      }
      catch (error){
        reject(error)
      }
    })
  }
}
