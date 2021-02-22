import React, { useEffect, useState } from 'react';

import { InlineLabel, Select } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { MyDataSourceOptions } from './types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

export default function ConfigEditor(props: Props) {
  const [dsList, setDsList] = useState<SelectableValue[]>([]);
  const {
    options: {
      id: selfId, // plugin self id
      jsonData: { promDataSourceName, lokiDataSourceName },
    },
  } = props;

  useEffect(() => {
    const dsSrv = getDataSourceSrv();
    const allDS = dsSrv.getList();
    const dsList: SelectableValue[] = allDS
      .filter((ds) => ds.uid !== undefined && ds.id !== selfId)
      .map((ds) => ({
        label: ds.name,
        value: ds.name,
      }));
    setDsList(dsList);
  }, [selfId]);

  const onPromDSChange = (v: SelectableValue) => {
    const { onOptionsChange, options } = props;
    const jsonData = {
      ...options.jsonData,
      promDataSourceName: v?.value || '',
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onLokiDSChange = (v: SelectableValue) => {
    const { onOptionsChange, options } = props;
    const jsonData = {
      ...options.jsonData,
      lokiDataSourceName: v?.value || '',
    };
    onOptionsChange({ ...options, jsonData });
  };

  return (
    <div className="gf-form-group">
      <div className="gf-form">
        <InlineLabel width={16} tooltip="Select a Prometheus DataSource">
          Prometheus
        </InlineLabel>
        <Select isClearable={true} options={dsList} value={promDataSourceName} onChange={onPromDSChange} width={36} />
      </div>

      <div className="gf-form">
        <InlineLabel width={16} tooltip="Select a Loki DataSource">
          Loki
        </InlineLabel>
        <Select isClearable={true} options={dsList} value={lokiDataSourceName} onChange={onLokiDSChange} width={36} />
      </div>
    </div>
  );
}
