import { DataSourcePlugin } from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';
import { DataSource } from './datasource';
import ConfigEditor from './ConfigEditor';
import QueryEditor from './QueryEditor';
import ExploreQueryEditor from './ExploreQueryEditor';
import CheatSheet from './QueryEditorHelp';

export const plugin = new DataSourcePlugin<DataSource, MyQuery, MyDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor)
  .setExploreQueryField(ExploreQueryEditor)
  .setQueryEditorHelp(CheatSheet);
