import React, { useEffect, useState } from 'react';

import { InlineLabel, Select } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { MyDataSourceOptions } from './types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const [dsList, setDsList] = useState<SelectableValue[]>([]);

  useEffect(() => {
    const { options } = props;
    const dsSrv = getDataSourceSrv();
    const allDS = dsSrv.getList();
    const dsList: SelectableValue[] = allDS
      .filter(ds => ds.uid !== undefined && ds.id !== options.id)
      .map(ds => ({
        label: ds.name,
        value: ds.uid,
      }));
    setDsList(dsList);
  }, []);

  const onPromDSChange = (v: SelectableValue) => {
    const { onOptionsChange, options } = props;
    const jsonData = {
      ...options.jsonData,
      promDataSourceUid: v?.value || '',
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onLokiDSChange = (v: SelectableValue) => {
    const { onOptionsChange, options } = props;
    const jsonData = {
      ...options.jsonData,
      lokiDataSourceUid: v?.value || '',
    };
    onOptionsChange({ ...options, jsonData });
  };

  const {
    options: {
      jsonData: { promDataSourceUid, lokiDataSourceUid },
    },
  } = props;
  return (
    <div className="gf-form-group">
      <div className="gf-form">
        <InlineLabel width={16} tooltip="Select a Prometheus DataSource">
          Prometheus
        </InlineLabel>
        <Select isClearable={true} options={dsList} value={promDataSourceUid} onChange={onPromDSChange} width={36} />
      </div>

      <div className="gf-form">
        <InlineLabel width={16} tooltip="Select a Loki DataSource">
          Loki
        </InlineLabel>
        <Select isClearable={true} options={dsList} value={lokiDataSourceUid} onChange={onLokiDSChange} width={36} />
      </div>
    </div>
  );
}
