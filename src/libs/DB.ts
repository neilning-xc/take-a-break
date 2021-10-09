/* eslint-disable @typescript-eslint/no-explicit-any */
import Database from './Database';
import StoreAdaptor from './StoreAdaptor';

interface DBFunc {
  (options?: Record<string, any>): Database;
}

const instance: Database | null = null;

/**
 * 数据库工厂方法
 * @returns
 */
const DB: DBFunc = () => {
  if (instance) {
    return instance;
  }
  return new StoreAdaptor();
};

export default DB;
