import React, { useEffect, useState } from 'react';
import { QueryEditorHelpProps, DataQuery } from '@grafana/data';

import { DataSource } from './datasource';

import './style.css';

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
        <div className="cheat-sheet-item__title">To view TiDB logs</div>
        <div className="cheat-sheet-item__label">
          To view all TiDB logs, select target <b>Tenant</b>, target <b>Cluster</b>, and <code>tidb</code>{' '}
          <b>LogType</b>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb"}`)}
        <div className="cheat-sheet-item__label">
          To view TiDB logs of an individual TiDB instance, continue to select target <b>Instance</b> which starts with
          <code>db-tidb-</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb", instance="db-tidb-0"}`)}
        <div className="cheat-sheet-item__label">
          To search TiDB logs by keywords, input the keywords in the <b>Search</b> input box.
        </div>
        <div className="cheat-sheet-item__label">
          The keywords support normal string, such as <code>error</code>, or regex, such as <code>/error\S/</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb", instance="db-tidb-0"} |= "error"`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb", instance="db-tidb-0"} |~ ` + '`error\\S`')}
      </div>

      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">To view TiKV/PD/TiFlash logs</div>
        <div className="cheat-sheet-item__label">
          Same as view TiDB logs, but with <code>tikv</code>, <code>pd</code> and <code>tiflash</code> <b>LogType</b>,
          and the target <b>Instance</b> should start with <code>db-tikv-</code>, <code>db-pd-</code> and{' '}
          <code>db-tiflash-</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tikv"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="tikv", instance="db-tikv-0"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="tikv", instance="db-tikv-0"} |= "error"`)}
      </div>

      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">To view Slow logs</div>
        <div className="cheat-sheet-item__label">
          Same as view TiDB logs, but with <code>slowlog</code> <b>LogType</b>, and the target <b>Instance</b> should
          start with <code>db-tidb-</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="slowlog"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="slowlog", instance="db-tidb-0"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="slowlog", instance="db-tidb-0"} |= "Plan"`)}
      </div>

      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">To view RocksDB/Raft logs</div>
        <div className="cheat-sheet-item__label">
          Same as view TiDB logs, but with <code>rocksdblog</code> and <code>raftlog</code> <b>LogType</b>, and the
          target <b>Instance</b> should start with <code>db-tikv-</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="rocksdblog"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="rocksdblog", instance="db-tikv-0"}`)}
        {renderExpression(`{namespace="tidb${clusterId}", container="rocksdblog", instance="db-tikv-0"} |= "error"`)}
      </div>

      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">To search logs by line filter expression</div>
        <div className="cheat-sheet-item__label">
          The resulting set of logs can be further filtered with a search expression. The search expression can be just
          text or regex.
        </div>
        <div className="cheat-sheet-item__label">
          These filter operators are supported: <code>|=</code>, <code>!=</code>, <code>|~</code>, <code>!~</code>, and
          they can be chained. See{' '}
          <a
            href="https://grafana.com/docs/loki/latest/logql/#line-filter-expression"
            target="logql"
            style={{ color: 'blue' }}
          >
            Log line filter expression detail
          </a>
          .
        </div>
        <div className="cheat-sheet-item__label">
          Match <code>uuid</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb"} |= "uuid"`)}
        <div className="cheat-sheet-item__label">
          Exclude <code>uuid</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb"} != "uuid"`)}
        <div className="cheat-sheet-item__label">
          Match regex.{' '}
          <span style={{ fontStyle: 'italic' }}>
            (Notice: use regex may lost logs context, see{' '}
            <a
              href="https://github.com/grafana/grafana/issues/31497"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'blue' }}
            >
              detail
            </a>
            .)
          </span>
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb"} |~ ` + '`uuid\\S`')}
        <div className="cheat-sheet-item__label">
          Match <code>uuid</code> <b>and</b> <code>regions</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb"} |= "uuid" |= "regions"`)}
        <div className="cheat-sheet-item__label">
          Match <code>uuid</code> <b>and exclude</b> <code>regions</code>.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb"} |= "uuid" != "regions"`)}
        <div className="cheat-sheet-item__label">
          Match <code>uuid</code> <b>or</b> <code>regions</code> by using regex.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb"} |~ "uuid|regions"`)}
        <div className="cheat-sheet-item__label">
          Match <code>uuid</code> case-insensitively by using regex.
        </div>
        {renderExpression(`{namespace="tidb${clusterId}", container="tidb"} |~ "(?i)UUID"`)}
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

      <br />
      <h2>Export logs</h2>
      <div className="logcli-help-desc">
        Logcli is a command line tool for exporting logs to local. View below links to learn how to use it.
        <ul>
          <li>
            <a
              href="https://docs.google.com/document/d/11XFTJkhDsGf0GEqipnC2ZRoNysXK2Hajlo8wrU21NQc/edit#heading=h.w4uka2ohevsq"
              target="logcli"
              style={{ color: 'blue' }}
            >
              Internal handbook
            </a>
          </li>
          <li>
            <a
              href="https://grafana.com/docs/loki/latest/getting-started/logcli/"
              target="logcli"
              style={{ color: 'blue' }}
            >
              Logcli official document
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
