/* eslint-disable @typescript-eslint/no-explicit-any */
import ElectronStore from 'electron-store';
import Database from './Database';

const Store = require('electron-store');

/**
 * electron-store的数据库实现类
 */
export default class StoreAdaptor implements Database {
  /**
   * 第三方数据库实例
   */
  private db: ElectronStore | null = null;

  /**
   * 某表格的自增值
   */
  private increment = 0;

  private records: Record<string, any>[] = [];

  /**
   * 正在操作的数据库表
   */
  private tableName = '';

  constructor() {
    this.db = this.instanceDB();
  }

  public update(record: Record<string, any>): Record<string, any> {
    const { id } = record;
    const index = this.records.findIndex(
      (item: Record<string, any>) => item.id === id
    );
    this.records[index] = record;
    this.db?.set(this.tableName, this.records);
    return record;
  }

  public findById(id: number): Record<string, any> | undefined {
    return this.records.find((item: Record<string, any>) => item.id === id);
  }

  public findAll(): Record<string, any>[] {
    return this.records;
  }

  // eslint-disable-next-line class-methods-use-this
  private instanceDB() {
    const store = new Store();
    return store;
  }

  public table(tableName: string) {
    if (!this.db) {
      throw new Error('db does not exist');
    }

    if (!this.db.has(tableName)) {
      this.db.set(tableName, []);
    }
    this.tableName = tableName;
    this.records = this.db.get(tableName) as Record<string, any>[];

    this.increment = this.records.length;
    return this;
  }

  public insert(record: Record<string, any>): number {
    // eslint-disable-next-line no-plusplus
    this.records.push({ id: ++this.increment, ...record });
    this.db?.set(this.tableName, this.records);
    return this.increment;
  }

  public delete(id: number): boolean {
    const index = this.records.findIndex(
      (item: Record<string, any>) => item.id === id
    );
    if (index !== -1) {
      this.records.splice(index, 1);
      this.db?.set(this.tableName, this.records);
      return true;
    }
    return false;
  }
}
