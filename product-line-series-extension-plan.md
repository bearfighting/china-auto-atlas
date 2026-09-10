# China Auto Atlas — Product Line / Vehicle Series 扩展实施设计

**Status:** Proposed  
**Scope:** 小范围数据模型、索引和应用层扩展  
**Date:** 2026-09-10

## 1. 目标与范围

在不破坏现有 `Brand → Vehicle` 路径的前提下，为具有明确产品组织结构的品牌增加两个可选实体：

- `ProductLine`：品牌内部的产品线、产品阵营或官方产品体系；
- `VehicleSeries`：由多个具体 Vehicle Model 组成的长期车型家族。

目标结构：

```text
Manufacturer → Brand → ProductLine? → VehicleSeries? → Vehicle → Market Specification / Variant
```

以下路径都必须继续有效：

```text
Brand → Vehicle
Brand → ProductLine → Vehicle
Brand → VehicleSeries → Vehicle
Brand → ProductLine → VehicleSeries → Vehicle
```

本计划不要求所有品牌拥有这两个层级。

## 2. 术语和边界

### Product Line 不等于 Production Line

本计划使用 `ProductLine`，中文为“产品线”，例如 BYD Dynasty / Ocean。

`ProductionLine` 中文为“生产线”，表示 Factory 中的制造设施、装配线或产能。当前 `content-model.md` 已将生产线放在 Factory
语境中，因此不能把它作为 Brand 与 Vehicle 之间的实体，也不能用 `production_line` 表示产品线。

### VehicleSeries 不等于 Vehicle Model

`VehicleSeries` 是商业或产品家族，例如 Qin、Han、Seal、Sea Lion。`Vehicle` 继续表示可单独引用的 durable vehicle model，
例如 Qin L、Han、Seal、Sealion 7。

以下对象不属于 Vehicle Series：

- generation、facelift、model year；
- trim、variant、market specification；
- platform、technology。

一个家族只有一个已确认 Vehicle 时，不强制创建 Series。

## 3. Canonical source of truth

层级关系采用 Child → Parent 作为唯一 canonical 来源：

```text
ProductLine.brand_id
VehicleSeries.brand_id
VehicleSeries.product_line_id?
Vehicle.brand_id
Vehicle.product_line_id?
Vehicle.series_id?
```

ProductLine 不维护 `series_ids`，VehicleSeries 不维护 `vehicle_ids`。反向列表由 repository 从 child records 推导，避免重复数组
不同步。`Vehicle.brand_id` 保留，作为直接索引和一致性校验依据。

当 Vehicle 同时具有 `series_id` 和 `product_line_id` 时，后者必须与 Series 的 Product Line 一致。

## 4. Canonical record 设计

### ProductLine

目录：`data/entities/product-lines/`

```yaml
schema_version: 1
id: byd-dynasty
type: product_line
brand_id: byd
names:
  en: Dynasty
  zh-CN: 王朝
aliases:
  - Dynasty Network
  - 王朝网
description:
  en: BYD's Dynasty product line.
  zh-CN: 比亚迪王朝产品线。
introduced_at:
  value: "2012"
  precision: year
  evidence_status: confirmed
  source_ids:
    - src-example
status: active
source_ids:
  - src-example
evidence_status: confirmed
last_verified_at: "2026-09-10"
```

### VehicleSeries

目录：`data/entities/vehicle-series/`

```yaml
schema_version: 1
id: byd-qin-series
type: vehicle_series
brand_id: byd
product_line_id: byd-dynasty
names:
  en: Qin
  zh-CN: 秦
description:
  en: BYD Qin vehicle series.
  zh-CN: 比亚迪秦车型系列。
introduced_at:
  value: "2012"
  precision: year
  evidence_status: confirmed
  source_ids:
    - src-example
status: active
source_ids:
  - src-example
evidence_status: confirmed
last_verified_at: "2026-09-10"
```

`product_line_id` 可为空，以支持 `Brand → Series → Vehicle`。

Vehicle 只增加：

```yaml
brand_id: byd
product_line_id: byd-dynasty
series_id: byd-qin-series
```

现有 manufacturer、platform、technology、event、News、source 和 Market Specification 语义不变。

注意：字段命名必须遵循当前仓库约定，使用 `names`、`zh-CN`、现有 evidence status 枚举和带 `precision` 的日期结构；不使用
计划草案中的 `name` 或 `evidence_status: verified`。

## 5. Evidence 与验证规则

- 新 Product Line / Series 至少有一个 `source_id`。
- `brand_id`、`product_line_id`、`series_id` 必须引用稳定 ID。
- `ProductLine.brand_id` 必须引用 `brand`。
- `VehicleSeries.brand_id` 必须引用 `brand`。
- `VehicleSeries.product_line_id` 存在时必须引用 `product_line`。
- Series 与 Product Line 的 Brand 必须一致。
- Vehicle 的 Series、Product Line 和 Brand 必须一致。
- Vehicle 同时引用 Series 和 Product Line 时，两者的 Product Line ID 必须一致。
- 不要求上级记录维护反向 `vehicle_ids` / `series_ids`。
- 日期保留原始精度；无法确认时使用 unknown，不从车型名称或其他 Vehicle 事实推导层级关系。
- Product Line / Series 的描述、事件和 News 关系必须由其自身来源支持，不能自动继承 Vehicle 来源。
- 市场之间的产品组织差异先记录为 unknown 或 `data-model-issues.md`，不立即引入 market-scoped hierarchy。

## 6. Repository、Search 与 URL

增加两个领域 repository：

```text
productLineRepository.list()
productLineRepository.getById(id)
productLineRepository.getBySlug(slug)
productLineRepository.getByBrand(brandId)
productLineRepository.getSeries(productLineId)

vehicleSeriesRepository.list()
vehicleSeriesRepository.getById(id)
vehicleSeriesRepository.getBySlug(slug)
vehicleSeriesRepository.getByBrand(brandId)
vehicleSeriesRepository.getByProductLine(productLineId)
vehicleSeriesRepository.getVehicles(seriesId)
```

Vehicle repository 增加 `getProductLine(vehicleId)` 和 `getSeries(vehicleId)`；Brand repository 增加 `getProductLines(brandId)` 和
`getSeries(brandId)`。单条 miss 返回 `null`，集合 miss 返回空数组。

页面只消费生成的 index 和 repository，不直接读取 YAML。

建议使用稳定的 entity URL：

```text
/product-lines/byd-dynasty
/series/byd-qin-series
/vehicles/byd-qin-l
```

第一阶段先不做 UI；Search、Brand 分组、detail page、breadcrumb 和 sitemap 放在数据模型稳定后实施。

## 7. 第一批数据试点

只使用当前仓库已经存在且有来源的 Vehicle，不为填充树形结构创建新车型。

Product Lines：

```text
byd-dynasty
byd-ocean
```

Vehicle Series：

```text
byd-qin-series
byd-han-series
byd-tang-series
byd-song-series
byd-seal-series
byd-sea-lion-series
```

建议初始映射：

```text
Qin → Qin L
Han → Han
Tang → Tang
Song → Song L
Seal → Seal
Sea Lion → Sealion 7
```

`Qin PLUS`、`Seal 06`、`Sea Lion 05`、`Sea Lion 07`、`Dolphin` 当前不存在，不在本批次创建，除非另有数据任务和来源。

每个新增层级必须有名称/别名来源、parent reference 和 source；没有可靠来源就保持未建模。

## 8. 分批执行步骤

### Batch 0 — 术语和 schema 约定

- 确认使用 `product_line` 与 `vehicle_series`。
- 将 `content-model.md`、`data-schema.md` 与本计划的术语对齐。
- 确认 `names`、日期精度和 evidence status 遵循当前 canonical 约定。

### Batch 1 — Pipeline 与 TypeScript

- 扩展 Python pipeline 的允许 entity types 和生成索引。
- 增加 `ProductLine`、`VehicleSeries` 和 Vehicle optional fields 类型。
- 增加 parent reference 与 brand consistency validation。
- 增加 repository 查询，但暂不修改页面。

### Batch 2 — BYD 数据试点

- 新增两个 Product Line 和六个 Series 的来源支持记录。
- 只给现有 Vehicle 增加 `product_line_id` / `series_id`。
- 不在上级记录维护反向数组。
- 保留 unknown/pending，不为了完整树形结构猜测事实。

### Batch 3 — 回归测试和索引审计

- Brand → Vehicle 旧查询保持不变。
- ProductLine → Series → Vehicle 查询正确。
- 缺少可选层级时返回 null/空数组。
- 跨 Brand 的 Series/Product Line 引用失败。
- 生成 search index 不产生重复 ID。
- 新实体的 Event、News、Source 关系没有孤立记录。

### Batch 4 — UI 与搜索

只有 Batch 1–3 稳定后才实施：

- Product Line 和 Series detail page；
- Brand 分组展示和 All Vehicles；
- Vehicle breadcrumb；
- Search labels、filters、routes 和 sitemap。

## 9. 验收命令

每个数据或应用批次运行：

```bash
python3 scripts/data_pipeline.py validate
python3 scripts/data_pipeline.py build
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
```

涉及页面时再运行：

```bash
pnpm build
pnpm test:e2e
```

## 10. Definition of Done

必须能够表达：

```text
BYD → Dynasty → Qin → Qin L
BYD → Ocean → Sea Lion → Sealion 7
BYD → Vehicle
ZEEKR → Vehicle
```

并满足：

- Product Line 和 Vehicle Series 都是 optional；
- 现有 Brand → Vehicle 查询不回归；
- 反向层级列表由 repository 推导，不重复维护；
- 所有新增层级关系都有来源；
- unknown/pending 状态得到保留；
- Production Line、Platform、Generation、Trim 不混入本模型；
- pipeline、生成索引、repository 和测试通过；
- 第一批稳定后，再决定是否正式修改 `data-schema.md` 的 canonical schema。

## 11. 暂不纳入

- Factory Production Line 实体扩展；
- generation、facelift、model year、trim、variant hierarchy；
- 市场特定层级版本和 Series 迁移历史；
- 数据库、CMS、API、批量抓取和大范围 UI 重构。
