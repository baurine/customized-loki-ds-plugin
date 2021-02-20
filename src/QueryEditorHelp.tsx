import React from 'react';
import { QueryEditorHelpProps, DataQuery } from '@grafana/data';

const LOGQL_EXAMPLES = [
  {
    title: 'Log pipeline',
    expression: '{container=~"pd|tidb|tikv"} |= "safe" | logfmt | duration > 10s',
    label:
      'This query targets the "pd|tidb|tikv" containers, filters logs that contain the word "safe" and parses each log line to extract more labels and filters with them.',
  },
  {
    title: 'Count over time',
    expression: 'count_over_time({container=~"pd|tidb|tikv"}[5m])',
    label: 'This query counts all the log lines within the last five minutes for the "pd|tidb|tikv" containers.',
  },
  {
    title: 'Rate',
    expression: 'rate(({container=~"pd|tidb|tikv"} |= "error" != "timeout")[10s])',
    label:
      'This query gets the per-second rate of all non-timeout errors within the last ten seconds for the "pd|tidb|tikv" containers.',
  },
  {
    title: 'Aggregate, count, and group',
    expression: 'sum(count_over_time({container=~"pd|tidb|tikv"}[5m])) by (instance)',
    label: 'Get the count of logs during the last five minutes, grouping by instance.',
  },
];

export default (props: QueryEditorHelpProps) => {
  function renderExpression(expr: string) {
    const { onClickExample } = props;
    return (
      <div className="cheat-sheet-item__example" onClick={e => onClickExample({ refId: 'A', expr } as DataQuery)}>
        <code>{expr}</code>
      </div>
    );
  }

  return (
    <div>
      <h2>Basic Usage</h2>
      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">See your logs</div>
        <div className="cheat-sheet-item__label">
          Start by selecting Tenant/Cluser/Pod/LogType options, inputing search keywords, it will auto generate the
          query expression.
        </div>
        <div className="cheat-sheet-item__label">
          The Cluster option reponds to the <code>namespace</code> label, the Pod option reponds to{' '}
          <code>instance</code> label, and the LogType option reponds to the <code>container</code> label.
        </div>
        <div className="cheat-sheet-item__label">
          Then, you can modify the expression manually or start querying directly.
        </div>
        {renderExpression(
          `{namespace=~".*1356074555092766720", instance=~"db-pd-0", container=~"pd|tidb|tikv"} |~ "safe"`
        )}
        <div>
          The query expression syntax is defined by{' '}
          <a href="https://grafana.com/docs/loki/latest/logql/" target="logql" style={{ color: 'blue' }}>
            Loki LogQL
          </a>
          .
        </div>
      </div>

      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">Log stream selectors</div>
        <div className="cheat-sheet-item__label">
          Log stream selectors, aka labels. You can use one or multiple labels. For example:
        </div>
        {renderExpression(`{container="slowlog"}`)}
        {renderExpression(`{container!="slowlog"}`)}
        {renderExpression(`{namespace=~".*1356074555092766720", container=~"pd|tidb|tikv"}`)}
        <div className="cheat-sheet-item__label">
          The operator after the label name supports
          <code>=</code>, <code>!=</code>, <code>=~</code>, <code>!~</code>.
        </div>
        <div className="cheat-sheet-item__label">
          The <code>=~</code> and <code>!~</code> can follow the regex expression. See{' '}
          <a
            href="https://grafana.com/docs/loki/latest/logql/#log-stream-selector"
            target="logql"
            style={{ color: 'blue' }}
          >
            Log stream selector detail
          </a>
          .
        </div>
      </div>

      <div className="cheat-sheet-item">
        <div className="cheat-sheet-item__title">Log filter</div>
        <div className="cheat-sheet-item__label">Logs can be filtered by search keywords. For example:</div>
        {renderExpression(`{container="slowlog"} |~ "Plan"`)}
        <div className="cheat-sheet-item__label">
          The operator for filtering supports
          <code>|=</code>, <code>!=</code>, <code>|~</code>, <code>!~</code>. And they can be chained.
        </div>
        <div className="cheat-sheet-item__label">
          The <code>|~</code> and <code>!~</code> can follow the regex expression. See{' '}
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
          Modify the query express manually if you want to use more complex filters. For example:
        </div>
        {renderExpression(`{container="slowlog"} |= "Plan"`)}
        {renderExpression(`{container="slowlog"} != "Plan"`)}
        {renderExpression('{container=~"pd|tidb|tikv"} |~ `error=\\w+`')}
        {renderExpression('{container=~"pd|tidb|tikv"} |~ `error=\\w+` != "timeout"')}
      </div>

      <br />
      <h2>Advanced Usage</h2>
      {LOGQL_EXAMPLES.map((item, index) => (
        <div className="cheat-sheet-item" key={index}>
          <div className="cheat-sheet-item__title">{item.title}</div>
          {item.expression && renderExpression(item.expression)}
          <div className="cheat-sheet-item__label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};
