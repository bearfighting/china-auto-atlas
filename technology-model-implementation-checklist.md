# China Auto Atlas — Technology Model 执行清单

**Status:** PR 3 implemented; PR 4 pending
**Related design:** `technology-model-implementation-plan.md`  
**Scope:** Technology taxonomy、Powertrain Architecture、Technology relations、repository、页面和测试  
**Last updated:** 2026-09-11

本文是 `technology-model-implementation-plan.md` 的执行版。设计方案定义模型边界，本文按照 PR 划分具体工作项、文件范围和验收条件。

## 使用规则

- 每个 PR 保持可独立验证；合并前完成本 PR 的 checklist。
- 不直接编辑 `build/`；所有生成文件由 `data_pipeline.py build` 产生。
- 不改变现有 Technology ID、slug、Vehicle `technology_ids` 或公开 Technology URL。
- 新增或改变的事实必须有 `source_ids`；没有足够证据时保留 `null` 或 unknown。
- taxonomy 是运行时可读取的数据，但不是公开 entity，不进入搜索、sitemap 或独立路由。
- 迁移完成前保留旧的 `category` 和 `secondary_categories` 字段。

## PR 0 — 方案冻结与基线

### 目标

确认现有数据、构建索引、页面和测试基线，避免后续把既有问题误认为本次回归。

### Checklist

- [x] 阅读并确认 `technology-model-implementation-plan.md`。
- [x] 阅读 `data-schema.md`、`content-model.md`、`data-access-architecture.md` 和 `ui-design.md` 中相关章节。
- [x] 确认当前 Technology 文件数量、ID、slug 和 Vehicle 引用没有重复。
- [x] 记录当前 generated index 数量，作为迁移后的回归基线。
- [x] 执行 `python3 scripts/data_pipeline.py validate`。
- [x] 执行 `python3 scripts/data_pipeline.py build`。
- [x] 执行现有 `pnpm test`、`pnpm typecheck`、`pnpm lint` 和 `pnpm build`。
- [x] 确认工作区中没有需要保留的无关用户修改；已有的未跟踪执行清单已保留。

### 预期不变项

- [x] Technology 仍然有独立实体列表和现有详情页。
- [x] `search-index.json` 中仍只有公开搜索类型。
- [x] sitemap 中仍只有 `/technologies` 和 `/technologies/:slug`。

## PR 1 — Taxonomy 数据层与生成索引

### 目标

建立 Domain、Category、Family 和 Powertrain Architecture 的独立数据来源，并让应用通过 `data-index.json` 读取它们。

### 新增文件

- [x] `data/taxonomy/technology-domains.yaml`
- [x] `data/taxonomy/technology-categories.yaml`
- [x] `data/taxonomy/technology-families.yaml`
- [x] `data/taxonomy/powertrain-architectures.yaml`

### 数据内容

- [x] 建立第一版 Domain：`energy-storage`、`electric-drive`、`powertrain`、`electrical-architecture`、`chassis-dynamics`、`vehicle-structure`。
- [x] 建立首批 Category：`battery-cell`、`battery-pack`、`battery-safety`、`integrated-electric-drive`、`plug-in-hybrid-system`、`high-voltage-architecture`、`active-suspension`、`structural-battery`、`integrated-casting`。
- [x] 建立首批 Family：`lfp`、`structural-battery-family`、`module-free-pack`、`highly-integrated-e-drive`、`series-parallel-hybrid-family`。
- [x] 建立首批 Architecture：`ice`、`battery-electric`、`series-hybrid`、`parallel-hybrid`、`series-parallel-hybrid-architecture`、`power-split-hybrid`、`range-extended-electric`、`fuel-cell-electric`。
- [x] 所有 taxonomy 记录包含稳定 `id`、`type`、`names`。
- [x] Category 包含 `domain_id`，可选 `parent_id`。
- [x] 每个新增分类的定义和关系均有对应来源，或明确标记为模型定义而非事实断言。

### 代码修改

- [x] 在 `scripts/data_pipeline.py` 中单独加载 taxonomy 文件。
- [x] 将 taxonomy 写入 `data-index.json` 的独立数组：`technology_domains`、`technology_categories`、`technology_families`、`powertrain_architectures`。
- [x] 确保 taxonomy 不写入 `entities`。
- [x] 确保 taxonomy 不写入 `search-index.json`。
- [x] 保持 `entities`、`relationships`、`events`、`sources` 等已有索引结构兼容。
- [x] 在 `src/lib/data/types.ts` 增加 taxonomy 类型和 `DataIndex` 字段。
- [x] 暂不让 taxonomy 参与 sitemap 或 Next.js static params。

### Pipeline 校验

- [x] taxonomy ID 不重复。
- [x] taxonomy `type` 必须是允许值。
- [x] `domain_id` 必须引用 Domain。
- [x] `parent_id` 必须引用 Category。
- [x] Category parent 关系不能形成循环。
- [x] taxonomy ID 不得与现有 entity、event、source、relationship ID 冲突。

### 测试与验收

- [x] 增加 taxonomy 加载和 build index 测试。
- [x] 增加无效 Domain、Category parent 和循环引用的失败测试。
- [x] 验证 taxonomy 不出现在 `loadDataIndex().entities`。
- [x] 验证 taxonomy 不出现在 `loadSearchIndex()`。
- [x] 执行 `pnpm data:test`。
- [x] 执行 `python3 scripts/data_pipeline.py validate`。
- [x] 执行 `python3 scripts/data_pipeline.py build`。
- [x] 执行 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm build`。

## PR 2 — Taxonomy Repository 与 Technology 类型

### 目标

让页面和应用服务可以通过 repository 获取 taxonomy，并扩展 Technology 的结构化字段。

### 代码修改

- [x] 在 `src/lib/data/types.ts` 增加 `TechnologyKind`：`generic`、`branded`、`system`、`component`、`process`。
- [x] 为 `Technology` 增加可选字段：`kind`、`domain_ids`、`category_ids`、`family_ids`。
- [x] 复用 PR 1 已增加的 `TechnologyDomain`、`TechnologyCategory`、`TechnologyFamily`、`PowertrainArchitecture` 类型。
- [x] 在 `src/lib/data/repositories.ts` 增加 taxonomy repositories：
  - [x] `technologyDomainRepository.list/getById`
  - [x] `technologyCategoryRepository.list/getById/getChildren`
  - [x] `technologyFamilyRepository.list/getById`
  - [x] `powertrainArchitectureRepository.list/getById`
- [x] Repository 对不存在的单条记录返回 `null`，集合查询返回 `[]`。
- [x] Repository 不读取 `data/` YAML，只读取 generated index。

### Technology 数据迁移

- [x] 为现有 15 个 Technology 添加 `kind`。
- [x] 为现有 15 个 Technology 添加 `domain_ids`。
- [x] 为现有 15 个 Technology 添加 `category_ids`。
- [x] 为证据足够的 Technology 添加 `family_ids`，证据不足的记录保持为空。
- [x] 保留 `category` 和 `secondary_categories`。
- [x] 不改变 `id`、`slug`、`vehicle_ids`、`event_ids`、`source_ids`。
- [x] 不把 800V、5C、1000 kW、容量或具体性能数字建成 Technology。
- [x] 不把 Platform、Generation、Trim 或 Product Line 直接加入 taxonomy。

### 首批迁移核对

- [x] 完成 15 个 Technology 的 `kind`、Domain 和 Category 迁移；保留旧分类字段。
- [x] `byd-blade-battery`、`geely-short-blade-battery`、`zeekr-golden-battery` → energy-storage / battery-cell + battery-pack + battery-safety / lfp。
- [x] `byd-ctb`、`byd-ctc` → energy-storage + vehicle-structure / battery-pack + structural-battery / structural-battery-family。
- [x] `byd-dm-i`、`byd-dm-p`、`byd-dmo` → powertrain / plug-in-hybrid-system；当前来源不足以强加 Family。
- [x] `byd-disus-p`、`byd-disus-x` → chassis-dynamics / active-suspension。
- [x] `zeekr-800v-system`、`avatr-800v-sic`、`byd-super-e-platform` → electrical-architecture / high-voltage-architecture。
- [x] `geely-11-in-1-electric-drive` → electric-drive / integrated-electric-drive；关联 `highly-integrated-e-drive`。
- [x] `byd-e4-platform` → electric-drive；暂不强加 `integrated-electric-drive` Category。

### Pipeline 校验

- [x] `kind` 只能使用受控值。
- [x] `domain_ids`、`category_ids`、`family_ids` 必须引用对应 taxonomy 类型。
- [x] 每个 Category 必须属于 Technology 声明的 Domain。
- [x] 新旧字段冲突时验证失败，并输出具体文件和 ID。
- [x] 旧 Technology 缺少新分类字段时仍能通过，直到迁移窗口结束。

### 测试与验收

- [x] 测试 taxonomy repository 的 `list/getById/getChildren`。
- [x] 测试 Technology 多 Domain、多 Category、多 Family。
- [x] 测试不存在的 taxonomy ID 返回 `null` 或 `[]`。
- [x] 测试旧 Technology 查询和 URL 不回归。
- [x] 验证 search index 数量和 ID 唯一性不变。

## PR 3 — Technology Relations 与 Vehicle Architecture

### 目标

增加有来源的 Technology 关系，并把 Vehicle 的车型分类、动力架构和具体技术明确分开。

### Technology Relations

- [x] 在现有 `data/relationships/` 下新增或扩展 Technology relationship 文件。
- [x] 支持关系类型：`uses`、`integrates`、`based_on`、`evolves_from`、`replaces`、`enables`、`complements`、`related_to`。
- [x] 关系继续使用 `from_id`、`to_id`，不在 Technology entity 内维护反向关系数组。
- [x] 每条关系包含 `source_ids` 和 `evidence_status`。
- [x] 只添加当前来源明确支持的关系；不根据营销文案推导等价关系。
- [x] 明确 CTB 与 CTC 仍是两个独立 ID。

### Relationship 类型矩阵

- [x] Technology → Technology：允许技术组合、演进、替代和相关关系。
- [x] Technology → Family：允许 `based_on` 或 `related_to`。
- [x] Technology → Category：只在确有必要时使用 `related_to`。
- [x] Vehicle → Powertrain Architecture：通过 `powertrain_architecture_id` 表达，不重复建普通关系。
- [x] 禁止未知类型两端的关系进入 build。

### Vehicle 字段

- [x] 在 `src/lib/data/types.ts` 增加 `powertrain_architecture_id?: string | null`。
- [x] 增加 `motor_positions?: MotorPosition[]`。
- [x] `MotorPosition` 使用受控值：`p0`、`p1`、`p2`、`p3`、`p4`、`e-axle`、`unknown`。
- [x] 保留现有 `powertrain_types` 和 `technology_ids`。
- [x] 为有来源的 Vehicle 添加 Architecture；来源不足时保持 `null` 或不添加。
- [x] 不在第一版建立复杂的 P0/P1/P2/P3 电机工程模型。

### Pipeline 校验

- [x] 关系两端 ID 必须存在于 entity 或 taxonomy 的统一 ID 集合。
- [x] 关系类型必须在允许集合中。
- [x] 关系两端类型必须符合关系矩阵。
- [x] 关系的 `source_ids` 必须引用 Source。
- [x] `powertrain_architecture_id` 必须引用 Architecture。
- [x] `motor_positions` 必须使用受控值。
- [x] `powertrain_types`、Architecture 和 Technology 之间不强制一一对应；当前校验拒绝 `battery-electric` 与 `phev/erev` 的明显冲突。

### Repository 与测试

- [x] 增加通用关系 resolver，按 `from_id/to_id` 查询关系。
- [x] 增加 `technologyRepository.getRelatedTechnologies(id)`。
- [x] 增加 `technologyRepository.getRelatedRelationships(id)`。
- [x] 增加 `vehicleRepository.getPowertrainArchitecture(id)`。
- [x] 测试 Technology → Technology、Technology → Family 关系。
- [x] 测试无效关系类型、无效端点和无来源关系会被拒绝。
- [x] 测试 Vehicle Architecture 缺失时返回 `null`。

## PR 4 — Technology 页面和 Vehicle 页面上下文

### 目标

把新模型呈现在页面中，同时保留已有页面结构、URL、SEO 和空状态行为。

### Technology 页面

修改：`src/app/technologies/[slug]/page.tsx`

- [ ] 显示 `kind`。
- [ ] 显示 Domain。
- [ ] 显示 Category。
- [ ] 显示 Family。
- [ ] 显示 Description、Technical features、Advantages、Limitations。
- [ ] 显示 Related technologies。
- [ ] 保留 Vehicles、Events、News、Sources。
- [ ] taxonomy 标签通过 repository 解析，不直接读取 YAML。
- [ ] taxonomy 缺失时显示 `Unknown` 或对应 `UnknownState`。
- [ ] Related technologies 没有结果时显示明确空状态。
- [ ] 保持现有 Technology URL、metadata、canonical 和 static params。

### Technology 列表页

修改：`src/app/technologies/page.tsx`

- [ ] 保持现有列表路由和卡片结构。
- [ ] 可在卡片 eyebrow 或辅助信息中显示 kind，但不强制增加复杂筛选。
- [ ] 不把 taxonomy 记录渲染成 Technology 卡片。
- [ ] 保持无数据时的 EmptyState。

### Vehicle 页面

修改：`src/app/vehicles/[slug]/page.tsx`

- [ ] 新增 Classification 区块，展示 `powertrain_types`。
- [ ] 新增 Architecture 区块，展示 Architecture 名称和 `motor_positions`。
- [ ] Technology 区块只展示具体 Technology。
- [ ] 缺少 Architecture 时显示 unknown，而不是“没有该架构”。
- [ ] 保持现有 Platform、Market specifications、Timeline、News、Sources 等区块。
- [ ] 确保移动端布局不产生横向溢出。
- [ ] 确保标签和链接具备键盘焦点状态和可理解文本。

### 页面验收

- [ ] Technology detail 页面能显示多个 Domain、Category、Family。
- [ ] CTB 能同时显示 Energy Storage 和 Vehicle Structure 上下文。
- [ ] Technology 页面能显示相关 Technology 关系。
- [ ] Vehicle 页面能分别显示 `PHEV`、`Series-Parallel Hybrid` 和 `BYD DM-i`。
- [ ] 缺失分类、关系和 Architecture 都有 intentional empty/unknown state。
- [ ] 运行移动端、键盘、reduced-motion 和 axe 检查。

## PR 5 — 文档、全量回归与完成迁移

### 文档

- [ ] 更新 `data-schema.md` 的 Technology、taxonomy、Vehicle Architecture 和 relationship 章节。
- [ ] 更新 `content-model.md`，明确 Classification、Architecture、Technology、Family、Category、Specification 的边界。
- [ ] 更新 `data-access-architecture.md`，记录 taxonomy repository 和关系 resolver。
- [ ] 更新 `data/docs/technology.md` 的迁移字段和编辑规则。
- [ ] 将本清单中已完成的事项标记为完成，或记录未完成原因。
- [ ] 当所有 Technology 完成迁移后，将 `technology-model-implementation-plan.md` 状态从 `Draft` 改为 `Implemented`。

### 全量验收命令

- [ ] `python3 scripts/data_pipeline.py validate`
- [ ] `python3 scripts/data_pipeline.py build`
- [ ] `pnpm test`
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm format:check`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`
- [ ] `pnpm quality:check`

### Definition of Done

- [ ] Blade Battery、DM-i、DiSus-P、ZEEKR 800V System、Geely 11-in-1 Electric Drive 均能用统一模型表达。
- [ ] Technology 可以关联多个 Domain、Category 和 Family。
- [ ] CTB 和 CTC 保持独立，同时可以表达结构集成语义。
- [ ] Vehicle 的 Classification、Architecture 和 Technology 在数据与页面上分离。
- [ ] Technology relation 有类型约束、来源和证据状态。
- [ ] taxonomy 不进入公开 entity、search index、sitemap 或独立路由。
- [ ] 现有 ID、URL、Vehicle technology references、搜索行为和反向 Vehicle 查询不回归。
- [ ] 缺失事实继续显示为 unknown，不被推断为否定事实。
- [ ] 完成迁移前旧 `category` 和 `secondary_categories` 未删除。

## 暂不纳入本次执行

- [ ] 独立 taxonomy 页面或 taxonomy 路由。
- [ ] taxonomy 搜索类型。
- [ ] 完整 Powertrain Classification entity graph。
- [ ] 复杂电机位置和动力流工程模型。
- [ ] 将规格参数拆成 Technology entity。
- [ ] 数据库、CMS、图数据库或批量抓取系统。
- [ ] 没有来源支持的 Technology、Architecture 或性能关系。
