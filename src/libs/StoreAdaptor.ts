import ElectronStore from 'electron-store';
import Database from './Database';

const Store = require('electron-store');

export default class StoreAdaptor implements Database {
  private db: ElectronStore | null = null;

  private increment = 0;

  private records: Record<string, any>[] = [];

  private tableName = '';

  constructor() {
    this.db = this.instanceDB();
  }

  update(record: Record<string, any>): Record<string, any> {
    const { id } = record;
    const index = this.records.findIndex(
      (item: Record<string, any>) => item.id === id
    );
    this.records[index] = record;
    this.db?.set(this.tableName, this.records);
    return record;
  }

  findById(id: number): Record<string, any> | undefined {
    return this.records.find((item: Record<string, any>) => item.id === id);
  }

  findAll(): Record<string, any>[] {
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

  insert(record: Record<string, any>): number {
    // eslint-disable-next-line no-plusplus
    this.records.push({ id: ++this.increment, ...record });
    this.db?.set(this.tableName, this.records);
    return this.increment;
  }

  delete(id: number): boolean {
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
