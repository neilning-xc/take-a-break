import Database from './Database';
import StoreAdaptor from './StoreAdaptor';

interface DBFunc {
  (options?: Record<string, any>): Database;
}

const instance: Database | null = null;

const DB: DBFunc = () => {
  if (instance) {
    return instance;
  }
  return new StoreAdaptor();
};

export default DB;
