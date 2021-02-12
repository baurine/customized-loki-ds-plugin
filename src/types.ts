import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  expr: string; // keep same as the loki data source
}

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  promDataSourceUid: string;
  lokiDataSourceUid: string;
}
