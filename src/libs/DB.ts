/* eslint-disable @typescript-eslint/no-explicit-any */
import StoreAdaptor from './StoreAdaptor';
import Table, { IncrementTable } from './Table';

const instanceMap: Record<string, Table<IncrementTable>> = {};

/**
 * 数据库工厂方法
 * @param table 表名
 * @returns
 */
const DB: (table: string) => Table<IncrementTable> = (table: string) => {
  if (instanceMap[table]) {
    return instanceMap[table];
  }

  switch (table) {
    case 'schedule':
      instanceMap[table] = new StoreAdaptor<Schedule>('schedule');
      return instanceMap[table];
    default:
      throw new Error('table does not define');
  }
};

export default DB;
