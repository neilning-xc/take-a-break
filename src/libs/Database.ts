export default interface Database {
  table(tableName: string): any;
  insert(record: Record<string, any>): number;
  delete(id: number): boolean;
  findById(id: number): Record<string, any> | undefined;
  findAll(): Record<string, any>[];
  update(record: Record<string, any>): Record<string, any>;
}
