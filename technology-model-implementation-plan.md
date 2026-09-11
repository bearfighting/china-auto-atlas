# China Auto Atlas — Technology Model 实施方案

**Status:** Implemented
**Scope:** Technology taxonomy、Technology schema、Powertrain Architecture、技术关系和页面上下文
**Date:** 2026-09-10

## 1. 目标与原则

将当前混合使用的 Technology 分类整理为可扩展的技术知识模型，同时保持稳定 ID、slug、Vehicle `technology_ids`、URL、repository API、search index 和 sitemap 兼容。

必须区分：

```text
Classification  这是什么车？
Architecture    系统怎么工作？
Technology      厂商使用了什么具体工程技术？
Family          它属于什么通用技术路线？
Category        它属于哪个技术领域？
Specification   它的性能参数是多少？
```

不把 BEV/PHEV/EREV、800V、5C、1000 kW、容量等直接建成 Technology；不把 Product Line、Production Line、Platform、Generation、Trim 混入 Technology taxonomy。

## 2. Taxonomy Foundation

新增独立 taxonomy 数据目录：

```text
data/taxonomy/
  technology-domains.yaml
  technology-categories.yaml
  technology-families.yaml
  powertrain-architectures.yaml
```

taxonomy 记录不是公开 entity，不进入 search index、sitemap 或独立路由。

第一版 Domain：

```text
energy-storage
electric-drive
powertrain
electrical-architecture
charging-energy
chassis-dynamics
vehicle-structure
thermal-management
computing-ee
adas-autonomous-driving
software
manufacturing
```

Category 是数据记录，并通过 `parent_id` 支持树形结构：

```yaml
id: battery-pack
type: technology_category
domain_id: energy-storage
parent_id: null
names:
  en: Battery Pack
  zh-CN: 电池包
```

第一批优先建立 battery-cell、battery-pack、battery-safety、integrated-electric-drive、plug-in-hybrid-system、high-voltage-architecture、active-suspension、structural-battery 和 integrated-casting。

Family 表示通用技术路线，Technology 可以关联多个 Family。完整方案包括 lfp、sodium-ion、solid-state、structural-cell、module-free-pack、highly-integrated-e-drive 和 series-parallel-hybrid-family；PR 1 首批只建立其中已冻结的最小集合。

所有 taxonomy ID 在四类 registry 之间也必须全局唯一；当 Category、Family 和 Architecture 的显示概念同名时，使用类型后缀消歧，例如 `structural-battery-family`、`series-parallel-hybrid-family` 和 `series-parallel-hybrid-architecture`。

## 3. Technology Schema

在现有 Technology 记录上增加可选字段：

```yaml
id: byd-blade-battery
type: technology
kind: branded
domain_ids:
  - energy-storage
category_ids:
  - battery-cell
  - battery-pack
family_ids:
  - lfp
```

`kind` 第一版支持 generic、branded、system、component、process，其中 generic 和 branded 是首批重点。

旧 `category` 字段继续保留。新字段迁移完成并验证前，不删除旧字段；Pipeline 检查新旧字段是否冲突。

## 4. 首批迁移映射

```text
BYD Blade Battery       energy-storage / battery-cell + battery-pack + battery-safety / lfp
BYD CTB / CTC           energy-storage + vehicle-structure / battery-pack + structural-battery
BYD DM-i / DM-p / DMO   powertrain / plug-in-hybrid-system / series-parallel-hybrid-family（需来源支持）
BYD DiSus-P / DiSus-X   chassis-dynamics / active-suspension
Zeekr 800V System       electrical-architecture / high-voltage-architecture
Geely 11-in-1 E-Drive   electric-drive / integrated-electric-drive / highly-integrated-e-drive
```

迁移不改变现有 Vehicle → Technology 关系；来源不足时保留 unknown，不补猜测关系。

## 5. Powertrain Architecture

第一版不建立独立的 Powertrain Classification entity。现有 Vehicle `powertrain_types` 继续表示车型分类，并新增可选的 `powertrain_architecture_id` 与 `motor_positions`。

```yaml
powertrain_types:
  - phev
powertrain_architecture_id: series-parallel-hybrid-architecture
motor_positions:
  - p1
  - p3
```

第一批 Architecture：ice、battery-electric、series-hybrid、parallel-hybrid、series-parallel-hybrid-architecture、power-split-hybrid、range-extended-electric、fuel-cell-electric。

三者职责固定为：`powertrain_types` 表示 PHEV，`powertrain_architecture_id` 表示 Series-Parallel Hybrid，`technology_ids` 表示 BYD DM-i。

## 6. Technology Relations

Technology 关系复用现有 `data/relationships/`，不在 Technology entity 内维护反向关系数组。第一版支持 `uses`、`integrates`、`based_on`、`evolves_from`、`replaces`、`enables`、`complements`、`related_to`。

关系两端可以是 Technology、Technology Family 或 taxonomy record，但必须经过类型、关系类型和来源校验。

## 7. Pipeline、TypeScript 与 Repository

Pipeline 增加 taxonomy 加载、ID 存在性、Category parent 循环、Domain/Category/Family 一致性、Technology kind、Technology relation 和 Architecture 校验；保留现有 source、evidence、duplicate ID 和 cross-file 校验。

TypeScript 增加：

```text
TechnologyDomain
TechnologyCategory
TechnologyFamily
PowertrainArchitecture
Technology.kind / domain_ids / category_ids / family_ids
Vehicle.powertrain_architecture_id / motor_positions
```

Repository 增加：

```text
technologyDomainRepository.list/getById
technologyCategoryRepository.list/getById/getChildren
technologyFamilyRepository.list/getById
technologyRepository.getDomains/getCategories/getFamilies/getRelatedTechnologies
```

页面和组件只能通过 repository 获取 taxonomy，不直接读取 YAML。

## 8. 页面与边界

Technology 页面增加 kind、Domain、Category、Family 和 Related technologies，同时保留 Vehicles、Events、News、Sources。

Vehicle 页面将 Classification、Architecture 和 Technology 分开展示。

不新增 taxonomy 独立页面、路由、search 类型或 sitemap 项；现有 Technology URL 和搜索行为保持不变。

## 9. 执行批次

1. 创建 taxonomy 数据、类型、repository 和基础 pipeline 校验。
2. 为现有 Technology 增加 kind、domain_ids、category_ids、family_ids，并保留旧 category。
3. 增加有来源的 Technology relations 和 Vehicle Architecture。
4. 更新 Technology / Vehicle 页面、content-model.md、data-schema.md。
5. 完成迁移验证后，将本计划状态更新为 Implemented；在此之前不删除旧字段。

## 10. 测试与验收

必须覆盖：

- taxonomy 加载、list/get/children 查询；
- 无效 taxonomy ID、Category 循环、关系类型和 Architecture 被拒绝；
- Technology 支持多个 Domain、Category、Family；
- CTB 同时关联 Energy Storage 和 Vehicle Structure；
- 旧 Technology、Vehicle、Brand、Manufacturer 查询和 URL 不回归；
- taxonomy 不进入 search index 或 sitemap，search index ID 无重复；
- Technology 页面分类上下文和 Vehicle 页面动力分类分离；
- 缺失可选分类显示 unknown；
- 移动端、键盘、空状态、reduced-motion 和 axe 检查通过。

验收命令：

```bash
python3 scripts/data_pipeline.py validate
python3 scripts/data_pipeline.py build
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm test:e2e
pnpm quality:check
```

## 11. Definition of Done

- Blade Battery、DM-i、DiSus-P、800V System、11-in-1 Electric Drive 可在统一模型中表达；
- 新 Technology 分类可以通过 taxonomy 数据扩展；
- Classification、Architecture、Technology、Family、Category、Specification 语义不混淆；
- 现有 ID、URL、Vehicle technology references 和 search 行为不回归；
- 所有新增分类和关系有来源，未知事实保留 unknown；
- taxonomy 不进入公开 entity、search index 或 sitemap；
- 文档、类型、pipeline、repository、页面和测试同步完成；
- 完成迁移前不删除旧 `category` 字段。

## 12. 暂不纳入

- 全量新增品牌和技术数据；
- 独立 taxonomy 页面和路由；
- 完整 Powertrain Classification entity graph；
- 复杂 P0/P1/P2/P3 电机位置工程模型；
- 将每个规格参数建成 Technology；
- 数据库、CMS、图数据库和批量抓取；
- 未经来源支持的技术归类、Architecture 或性能关系。
