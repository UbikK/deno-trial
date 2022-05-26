import { Database, PostgresConnector } from "../deps.ts";

class DbManager {
  private static _manager: Database;
  private constructor(){
    const connection = new PostgresConnector({
      host: '127.0.0.1',
      username: 'user',
      password: 'example',
      database: 'default',
      port: 5432
    });
    DbManager._manager = new Database({connector: connection, debug: true});
  }

  static getManager() {
      if(!DbManager._manager) {
        new DbManager();
      }
      return DbManager._manager;
  }
}

export const getManager = DbManager.getManager


