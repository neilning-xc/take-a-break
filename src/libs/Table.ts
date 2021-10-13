/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 本地简单的关系型数据库接口，用于保存用户配置信息
 * 用于统一其他第三方数据库的接口，所有的数据库实现类必须实现该接口，
 * 该接口约定所有的数据库表用id作为自增主键
 * Example: databaseInstance.table().findAll();
 */

export interface IncrementTable {
  id: number;
}

export default interface Table<T extends IncrementTable> {
  /**
   * 获取数据库表, 该方法必须返回数据库实例以便实现链式调用
   * @param tableName 表名
   */
  table(tableName: string): void;

  /**
   * 增加一条记录
   * @param record 新记录
   */
  insert(record: T): number;

  /**
   * 删除记录
   * @param id
   */
  delete(id: number): boolean;

  /**
   * 根据id查找记录
   * @param id
   */
  findById(id: number): T | undefined;

  /**
   * 获取所有记录
   */
  findAll(): T[];

  /**
   * 根据id更新记录
   * @param record
   */
  update(record: T): T;

  /**
   * 统计当前表格的记录数
   */
  count(): number;

  /**
   * 获取第一行数据
   */
  first(): T;
}
