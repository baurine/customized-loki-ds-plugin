import React, { useEffect, useState, useRef } from 'react';

import { ExploreQueryFieldProps, SelectableValue } from '@grafana/data';
import { InlineField, Input, QueryField, Select, TagList } from '@grafana/ui';

import { DataSource, ADD_FILTER_EVENT } from './datasource';
import { MyQuery, MyDataSourceOptions } from './types';

import './style.css';

export type Props = ExploreQueryFieldProps<DataSource, MyQuery, MyDataSourceOptions>;

export default function ExploreQueryEditor(props: Props) {
  const { query, datasource, onChange, onRunQuery } = props;

  const [tenantOptions, setTenantOptions] = useState<SelectableValue[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<SelectableValue | undefined>(undefined);
  const [loadingTenant, setLoadingTenant] = useState(false);

  const [clusterOptions, setClusterOptitons] = useState<SelectableValue[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<SelectableValue | undefined>(undefined);
  const [loadingCluster, setLoadingCluster] = useState(false);

  const [podOptions, setPodOptions] = useState<SelectableValue[]>([]);
  const [selectedPod, setSelectedPod] = useState<SelectableValue | undefined>(undefined);
  const [loadingPod, setLoadingPod] = useState(false);

  const logTypeOptions: SelectableValue[] = [
    { value: 'tidb', label: 'tidb' },
    { value: 'tikv', label: 'tikv' },
    { value: 'pd', label: 'pd' },
    { value: 'slowlog', label: 'slowlog' },
    { value: 'rocksdblog', label: 'rocksdblog' },
    { value: 'raftlog', label: 'raftlog' },
  ];
  const [selectedLogType, setSelectedLogType] = useState<SelectableValue | undefined>(logTypeOptions[0]);

  const [search, setSearch] = useState('');

  const [filters, setFilters] = useState<string[]>([]);

  const onFilterClick = (name: string) => {
    // remove filter
    setFilters(filters.filter((f) => f !== name));
    setTimeout(() => {
      runQueryRef.current!();
    }, 300);
  };

  const onQueryChange = (value: string, override?: boolean) => {
    if (onChange) {
      onChange({ ...query, expr: value });
      if (override && onRunQuery) {
        onRunQuery();
      }
    }
  };

  const onBlur = () => {};

  useEffect(() => {
    async function queryTenants() {
      const promDS = await datasource.getPromDS();
      const tenantsRes = await promDS.metricFindQuery!('dbaas_tenant_info{status="active"}');
      const tenaneIdSet = new Set<string>();
      const tenantOptions: SelectableValue[] = [];
      tenantsRes.forEach((res) => {
        const m = res.text.match(/.*name="([^"]*).*,tenant="([^"]*).*/);
        if (m) {
          const tenantName = m[1];
          const tenantId = m[2];
          if (!tenaneIdSet.has(tenantId)) {
            tenaneIdSet.add(tenantId);
            tenantOptions.push({ value: tenantId, label: tenantName, description: tenantId });
          }
        }
      });
      tenantOptions.sort((a, b) => {
        if (a.label! > b.label!) {
          return 1;
        } else if (a.label === b.label) {
          return a.value > b.value ? 1 : -1;
        } else {
          return -1;
        }
      });
      setTenantOptions(tenantOptions);
      if (tenantOptions.length > 0) {
        setSelectedTenant(tenantOptions[0]);
      }
    }

    async function fetch() {
      try {
        setLoadingTenant(true);
        await queryTenants();
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingTenant(false);
      }
    }

    fetch();
  }, [datasource]);

  useEffect(() => {
    async function queryClusters() {
      setClusterOptitons([]);
      setSelectedCluster(undefined);
      if (!selectedTenant) {
        return;
      }

      const selectedTenantId = selectedTenant.value;
      const promDS = await datasource.getPromDS();
      const clustersRes = await promDS.metricFindQuery!(`dbaas_tidb_cluster_info{tenant="${selectedTenantId}"}`);
      const clusterIdSet = new Set<string>();
      const clusterOptions: SelectableValue[] = [];
      clustersRes.forEach((res) => {
        const m = res.text.match(/.*cluster_id="([^"]*).*,name="([^"]*).*/);
        if (m) {
          const clusterId = m[1];
          const clusterName = m[2];
          if (!clusterIdSet.has(clusterId)) {
            clusterIdSet.add(clusterId);
            clusterOptions.push({ value: clusterId, label: clusterName, description: clusterId });
          }
        }
      });
      clusterOptions.sort((a, b) => {
        if (a.label! > b.label!) {
          return 1;
        } else if (a.label === b.label) {
          return a.value > b.value ? 1 : -1;
        } else {
          return -1;
        }
      });
      setClusterOptitons(clusterOptions);
      if (clusterOptions.length > 0) {
        setSelectedCluster(clusterOptions[0]);
      }
    }

    async function fetch() {
      try {
        setLoadingCluster(true);
        await queryClusters();
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingCluster(false);
      }
    }

    fetch();
  }, [datasource, selectedTenant]);

  useEffect(() => {
    async function queryPods() {
      setPodOptions([]);
      setSelectedPod(undefined);
      if (!selectedCluster) {
        return;
      }

      const selectedClusterId = selectedCluster.value;
      const promDS = await datasource.getPromDS();
      const podsRes = await promDS.metricFindQuery!(
        `kube_pod_info{namespace=~".*${selectedClusterId}",pod=~"db-tikv.*|db-pd.*|db-tidb.*|db-tiflash.*", pod!~"db-tidb-extra.*"}`
      );
      const podNames = new Set<string>();
      const podOptions: SelectableValue[] = [];
      podsRes.forEach((res) => {
        const m = res.text.match(/.*pod="([^"]*).*/);
        if (m) {
          const podName = m[1];
          if (!podNames.has(podName)) {
            podNames.add(podName);
            podOptions.push({ value: podName, label: podName });
          }
        }
      });
      podOptions.sort((a, b) => {
        return a.value > b.value ? 1 : -1;
      });
      setPodOptions(podOptions);
      if (podOptions.length > 0) {
        setSelectedPod(podOptions[0]);
      }
    }

    async function fetch() {
      try {
        setLoadingPod(true);
        await queryPods();
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingPod(false);
      }
    }

    fetch();
  }, [datasource, selectedCluster]);

  const runQueryRef = useRef<() => void>();
  runQueryRef.current = () => {
    onRunQuery();
  };

  useEffect(() => {
    function addFilter(event: Event) {
      const filter = (event as CustomEvent).detail;
      if (filters.indexOf(filter) < 0) {
        setFilters(filters.concat(filter));
        setTimeout(() => {
          runQueryRef.current!();
        }, 300);
      }
    }
    document.addEventListener(ADD_FILTER_EVENT, addFilter);
    return () => document.removeEventListener(ADD_FILTER_EVENT, addFilter);
  }, [filters]);

  const changeQueryRef = useRef<(expr: string) => void>();
  changeQueryRef.current = (expr: string) => {
    onChange?.({ ...query, expr });
  };

  useEffect(() => {
    let exprArr: string[] = [];
    if (selectedCluster) {
      exprArr.push(`namespace=~".*${selectedCluster.value}"`);
    } else {
      // if not select a target cluster, it is expected to return empty logs
      exprArr.push(`namespace="unknown"`);
    }

    if (selectedPod) {
      exprArr.push(`instance=~"${selectedPod.value}"`);
    }

    let logTypes = '';
    if (Array.isArray(selectedLogType)) {
      // when select multiple LogType
      logTypes = selectedLogType.map((item) => item.value).join('|');
    } else {
      logTypes = selectedLogType?.value || '';
    }
    if (logTypes) {
      exprArr.push(`container=~"${logTypes}"`);
    }

    filters.forEach((f) => exprArr.push(f));
    const finalExpr = `{${exprArr.join(', ')}} |~ "${search}"`;
    changeQueryRef.current!(finalExpr);
  }, [selectedCluster, selectedPod, selectedLogType, search, filters]);

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <InlineField label="Tenant">
          <Select
            isLoading={loadingTenant}
            isClearable
            width={16}
            onChange={setSelectedTenant}
            options={tenantOptions}
            value={selectedTenant}
          />
        </InlineField>
        <InlineField label="Cluster" tooltip="Repond to namespace label">
          <Select
            isLoading={loadingCluster}
            isClearable
            width={16}
            onChange={setSelectedCluster}
            options={clusterOptions}
            value={selectedCluster}
          />
        </InlineField>
        <InlineField label="Pod" tooltip="Repond to instance label">
          <Select
            isLoading={loadingPod}
            isClearable
            width={16}
            onChange={setSelectedPod}
            options={podOptions}
            value={selectedPod}
          />
        </InlineField>
        <InlineField label="LogType" tooltip="Repond to container label">
          <Select
            isClearable
            width={16}
            onChange={setSelectedLogType}
            options={logTypeOptions}
            value={selectedLogType}
            isMulti={true}
          />
        </InlineField>
        <InlineField label="Search">
          <Input value={search} onChange={(e) => setSearch(e.currentTarget.value)} css="" />
        </InlineField>
      </div>
      <div className="query-field">
        <QueryField
          portalOrigin="customized-loki"
          onChange={onQueryChange}
          onRunQuery={props.onRunQuery}
          onBlur={onBlur}
          query={query.expr || ''}
          placeholder="Enter a query"
        />
      </div>
      {filters.length > 0 && (
        <InlineField label="Filters" className="filters" tooltip="Click the filetr to remove it">
          <TagList tags={filters} className="tags" onClick={onFilterClick} />
        </InlineField>
      )}
    </div>
  );
}
