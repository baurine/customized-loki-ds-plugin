import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  promDS: DataSourceApi | null = null;
  lokiDS: DataSourceApi | null = null;

  constructor(private instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // Return a constant for each query.
    const data = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      return new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'Time', values: [from, to], type: FieldType.time },
          { name: 'Value', values: [query.constant, query.constant], type: FieldType.number },
        ],
      });
    });

    return { data };
  }

  async testDatasource() {
    const {
      jsonData: { lokiDataSourceUid, promDataSourceUid },
    } = this.instanceSettings;

    if (!promDataSourceUid) {
      throw new Error('Promethues datasource is empty!');
    }
    if (!lokiDataSourceUid) {
      throw new Error('Loki datasource is empty!');
    }

    const dataSourceSrv = getDataSourceSrv();
    const promDsSetting = dataSourceSrv.getInstanceSettings(promDataSourceUid);
    if (!promDsSetting) {
      throw new Error(`Target promethues datasource doesn't exist anymore !`);
    }
    const lokiDsSetting = dataSourceSrv.getInstanceSettings(lokiDataSourceUid);
    if (!lokiDsSetting) {
      throw new Error(`Target loki datasource doesn't exist anymore !`);
    }

    const promDs = await dataSourceSrv.get(promDsSetting.name);
    this.promDS = promDs as any;
    const promRes = await promDs.testDatasource();
    if (promRes.status === 'error') {
      return promRes;
    }

    const lokiDs = await dataSourceSrv.get(lokiDsSetting.name);
    this.lokiDS = lokiDs as any;
    const lokiRes = await lokiDs.testDatasource();
    if (lokiRes.status === 'error') {
      return lokiRes;
    }

    return {
      status: 'success',
      message: 'Both prometheus and loki data source are working',
    };
  }
}
