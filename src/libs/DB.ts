/* eslint-disable @typescript-eslint/no-explicit-any */
import StoreAdaptor from './StoreAdaptor';

const instanceMap: Record<string, any> = {};

/**
 * 数据库工厂方法
 * @param table 表名
 * @returns
 */
const DB = (table: string) => {
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
