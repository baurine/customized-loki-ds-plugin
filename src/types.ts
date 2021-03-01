import { DataQuery, DataSourceJsonData } from '@grafana/data';

// keep same as the loki data source
export interface MyQuery extends DataQuery {
  expr: string;
  maxLines?: number;
}

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  promDataSourceName: string;
  lokiDataSourceName: string;
}
