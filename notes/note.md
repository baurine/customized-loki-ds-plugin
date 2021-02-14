# 增强 Grafana Loki Data Source Plugin

(先暂时简单的记个流水账)

## 背景介绍

[Loki](https://grafana.com/oss/loki/) 是 Grafana 团队开发的一款水平可扩展，高可用性，多租户的日志聚合系统。它从 Prometheus 受到启发，"Like Prometheus, but for logs"，它不为日志内容编制索引，而是为每个日志流编制一组标签，因此经济高效且易于操作。

我们使用 Loki 将多个使用 k8s 布署的 TiDB 集群的日志进行统一收集，并使用 Grafana 来查询、搜索和显示收集的日志。

Grafana 为了支持对 Loki 日志的查询及显示，提供了两种插件：

1. Panel Plugin - Logs，用来显示日志
1. DataSource Plugin - Loki，用来从 Loki 服务中查询日志

![grafana-plugins-logs](./assets/grafana-plugins-logs.png)

在我的一篇旧文 - [如何开发一个 Grafana Panel Plugin](https://baurine.netlify.app/2019/11/14/how-make-a-grafana-panel-plugin/) 中解释了 Panel Plugin 和 DataSource Plugin 两种插件的区别。

Grafana 的插件有三种：

- DataSource: 数据的生产者。定义数据从何获处，如何获取，委托 Grafana 后端从实际数据源处获取原始数据后，将其转换成统一的格式，再由 Grafana 传递到 Panel 显示
- Panel: 数据的消费者。从 DataDource 处获得约定格式的数据进行展示
- App: DataSource + Panel

![grafan-arch-1](./assets/grafana-arch-1.png)

![grafan-arch-2](./assets/grafana-arch-2.png)

那在 Grafana 中我们如何使用 Loki 