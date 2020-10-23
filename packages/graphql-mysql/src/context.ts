export interface Context {
  query(sql: string): Promise<any[]>;
}
