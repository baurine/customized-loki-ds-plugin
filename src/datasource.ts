import { Observable, of } from 'rxjs';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  LoadingState,
  LogRowModel,
} from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions } from './types';

export const ADD_FILTER_EVENT = 'customized-loki-add-filter';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  promDS: DataSourceApi | null = null;
  lokiDS: DataSourceApi | null = null;

  constructor(private instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.getLokiDS();
  }

  getLokiDS(): Promise<DataSourceApi> {
    if (this.lokiDS) {
      return Promise.resolve(this.lokiDS);
    }
    const {
      jsonData: { lokiDataSourceName },
    } = this.instanceSettings;
    const dataSourceSrv = getDataSourceSrv();
    // It seems this step is redundant, because `lokiDsSetting.name` equals `lokiDataSourceName`.
    // It is true because we used `lokiDataSourceUid` instead of `lokiDataSourceName` before.
    // Keep this logic in case we will use `lokiDataSourceUid` back in the future.
    const lokiDsSetting = dataSourceSrv.getInstanceSettings(lokiDataSourceName);
    if (lokiDsSetting) {
      return dataSourceSrv.get(lokiDsSetting.name).then((ds) => {
        this.lokiDS = ds as any;
        return ds as any;
      });
    }
    throw Error('Has no loki datasource');
  }

  getPromDS(): Promise<DataSourceApi> {
    if (this.promDS) {
      return Promise.resolve(this.promDS);
    }
    const {
      jsonData: { promDataSourceName },
    } = this.instanceSettings;
    const dataSourceSrv = getDataSourceSrv();
    const promDsSetting = dataSourceSrv.getInstanceSettings(promDataSourceName);
    if (promDsSetting) {
      return dataSourceSrv.get(promDsSetting.name).then((ds) => {
        this.promDS = ds as any;
        return ds as any;
      });
    }
    throw Error('Has no prometheus datasource');
  }

  query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> | Observable<DataQueryResponse> {
    if (this.lokiDS === null) {
      return of({
        data: [],
        state: LoadingState.Done,
      });
    }
    return this.lokiDS.query(options);
  }

  async testDatasource() {
    const {
      jsonData: { lokiDataSourceName, promDataSourceName },
    } = this.instanceSettings;

    if (!promDataSourceName) {
      throw new Error('Promethues datasource is empty!');
    }
    if (!lokiDataSourceName) {
      throw new Error('Loki datasource is empty!');
    }

    const dataSourceSrv = getDataSourceSrv();
    const promDsSetting = dataSourceSrv.getInstanceSettings(promDataSourceName);
    if (!promDsSetting) {
      throw new Error(`Target promethues datasource doesn't exist anymore !`);
    }
    const lokiDsSetting = dataSourceSrv.getInstanceSettings(lokiDataSourceName);
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

  showContextToggle(row?: LogRowModel) {
    return this.lokiDS!.showContextToggle!(row);
  }

  getLogRowContext = (row: LogRowModel, options?: any) => {
    return this.lokiDS!.getLogRowContext!(row, options);
  };

  modifyQuery(query: MyQuery, action: any): MyQuery {
    let filter = '';
    switch (action.type) {
      case 'ADD_FILTER': {
        filter = `${action.key}="${action.value}"`;
        break;
      }
      case 'ADD_FILTER_OUT': {
        filter = `${action.key}!="${action.value}"`;
        break;
      }
      default:
        break;
    }
    if (filter !== '') {
      // send event
      const event = new CustomEvent(ADD_FILTER_EVENT, { detail: filter });
      document.dispatchEvent(event);
    }
    // hack, set the expr to empty, to prevent the meaningless query
    // return query
    return { ...query, expr: '' };
  }
}
