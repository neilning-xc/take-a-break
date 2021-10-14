/* eslint-disable @typescript-eslint/no-explicit-any */
import ElectronStore from 'electron-store';
import Table, { IncrementTable, RawTableStruct } from './Table';

const Store = require('electron-store');

/**
 * electron-store的数据库实现类
 */
export default class StoreAdaptor<T extends IncrementTable>
  implements Table<T>
{
  /**
   * 第三方数据库实例
   */
  private db: ElectronStore | null = null;

  /**
   * 某表格的自增值
   */
  private increment = 0;

  private records: T[] = [];

  /**
   * 正在操作的数据库表
   */
  private tableName = '';

  constructor(tableName: string) {
    // TODO: db应该是单例模式，存储在全局对象中
    this.db = StoreAdaptor.instanceDB();
    this.table(tableName);
  }

  /**
   * 写入底层的数据表信息，所有对数据表有写操作的方法都要调用该方法
   */
  private writeTable() {
    this.db?.set(this.tableName, {
      data: this.records,
      autoIncrement: this.increment,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private static instanceDB() {
    const store = new Store();
    return store;
  }

  public update(record: T): T {
    const { id } = record;
    const index = this.records.findIndex((item: T) => item.id === id);
    this.records[index] = record;
    this.writeTable();
    return record;
  }

  public findById(id: number): T | undefined {
    return this.records.find((item: T) => item.id === id);
  }

  public findAll(): T[] {
    return this.records;
  }

  public table(tableName: string) {
    if (!this.db) {
      throw new Error('db does not exist');
    }

    if (!this.db.has(tableName)) {
      this.db.set(tableName, {
        data: [],
        autoIncrement: 0,
      });
    }
    this.tableName = tableName;
    const rawTableData = <RawTableStruct>this.db.get(tableName);
    this.records = rawTableData.data;
    this.increment = rawTableData.autoIncrement;
  }

  public insert(record: T): number {
    // eslint-disable-next-line no-plusplus
    this.records.push({ ...record, id: ++this.increment });
    this.writeTable();
    return this.increment;
  }

  public delete(id: number): boolean {
    const index = this.records.findIndex((item: T) => item.id === id);
    if (index !== -1) {
      this.records.splice(index, 1);
      this.writeTable();
      return true;
    }
    return false;
  }

  public count(): number {
    return this.records.length;
  }

  public first(): T {
    return this.records[0];
  }
}
