import { DataQuery, DataSourceJsonData } from '@grafana/data';

// keep same as the loki data source
export interface MyQuery extends DataQuery {
  expr: string;
  maxLines?: number;

  // other options
  tenant?: string;
  cluster?: string;
  logTypes?: string;
  pod?: string;
  searchText?: string;
  filters?: string;
}

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  promDataSourceName: string;
  lokiDataSourceName: string;
}
