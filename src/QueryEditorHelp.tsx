import React, { useEffect, useState } from 'react';
import { QueryEditorHelpProps, DataQuery } from '@grafana/data';

import { DataSource } from './datasource';

export default function QueryEditorHelp(props: QueryEditorHelpProps) {
  const { datasource } = props;

  function renderExpression(expr: string) {
    const { onClickExample } = props;
    return (
      <div className="cheat-sheet-item__example" onClick={(e) => onClickExample({ refId: 'A', expr } as DataQuery)}>
        <code>{expr}</code>
      </div>
    );
  }

  const [clusterId, setClusterId] = useState('1356074555092766720');
  useEffect(() => {
    async function queryClusterId() {
      const myDS = datasource as DataSource;
      const promDS = await myDS.getPromDS();
      const clusterIds = await promDS.metricFindQuery!(
        'label_values(dbaas_tidb_cluster_info{status="normal"},cluster_id)'
      );
      if (clusterIds.length > 0) {
        setClusterId(clusterIds[0].text);
      }
    }
    queryClusterId();
  }, [datasource]);

  return (
    <div>
      <h2>Basic Usage</h2>
      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">To view all TiDB logs</div>
        <div className="cheat-sheet-item__label">
          Select target <b>Tenant</b>, target <b>Cluster</b>, and <code>tidb</code> <b>LogType</b>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb"}`)}
        <div className="cheat-sheet-item__label">
          To view TiDB logs of an individual TiDB instance, continue to select target <b>Instance</b> which starts with
          <code>db-tidb-</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb", instance="db-tidb-0"}`)}
        <div className="cheat-sheet-item__label">
          To search TiDB logs by keywords, input the keywords (for example <code>error</code>) in the <b>Search</b>{' '}
          input box.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb", instance="db-tidb-0"} |= "error"`)}
      </div>

      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">To view all TiKV/PD/TiFlash logs</div>
        <div className="cheat-sheet-item__label">
          Same as view all TiDB logs, but with <code>tikv</code>, <code>pd</code> and <code>tiflash</code>{' '}
          <b>LogType</b>, and the target <b>Instance</b> should start with <code>db-tikv-</code>, <code>db-pd-</code>{' '}
          and <code>db-tiflash-</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tikv"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="tikv", instance="db-tikv-0"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="tikv", instance="db-tikv-0"} |= "error"`)}
      </div>

      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">To view all Slow logs</div>
        <div className="cheat-sheet-item__label">
          Same as view all TiDB logs, but with <code>slowlog</code> <b>LogType</b>, and the target <b>Instance</b>{' '}
          should start with <code>db-tidb-</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="slowlog"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="slowlog", instance="db-tidb-0"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="slowlog", instance="db-tidb-0"} |= "Plan"`)}
      </div>

      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">To view all RocksDB/Raft logs</div>
        <div className="cheat-sheet-item__label">
          Same as view all TiDB logs, but with <code>rocksdblog</code> and <code>raftlog</code> <b>LogType</b>, and the
          target <b>Instance</b> should start with <code>db-tikv-</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="rocksdblog"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="rocksdblog", instance="db-tikv-0"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="rocksdblog", instance="db-tikv-0"} |= "error"`)}
      </div>

      <br />
      <h2>Advanced Usage</h2>
      <div>
        The query expression syntax is defined by{' '}
        <a href="https://grafana.com/docs/loki/latest/logql/" target="logql" style={{ color: 'blue' }}>
          Loki LogQL
        </a>
        , get detail from its document.
      </div>
    </div>
  );
}
