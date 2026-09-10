# China Auto Atlas — Content Expansion Work Plan

> Status: Working plan
> Phase: Post-MVP / Content Foundation
> Last updated: 2026-09

## 1. Objective

将 China Auto Atlas 从“工程骨架已经可用”推进到“第一批中国汽车知识网络可以持续查询、追溯和维护”。

本阶段的核心交付不是单纯增加实体数量，而是完成少数企业链条的纵向闭环：

```text
Manufacturer → Brand → Vehicle → Platform / Technology
                                      ↓
                                    Event
                                      ↓
                                  News → Source
```

所有新增内容都应遵守仓库现有的稳定 ID、来源追溯、时间语义、证据状态和 YAML → build pipeline 约定。

## 2. Current baseline

截至本计划建立时，数据构建结果为：

```text
Entities              45
Events                51
Sources               89
Relationships         31
Market specifications 15
Technologies          12
Platforms              4
Vehicles              10
News documents         5
```

当前验证与构建命令均已通过：

```bash
python3 scripts/data_pipeline.py validate
python3 scripts/data_pipeline.py build
```

因此不再重复执行一个独立的“Technology Foundation”阶段。下一步直接进入数据闭环、实体完整性和模型问题记录。

## 3. Quality gates

### 3.1 Entity completeness

主要实体应尽量具备以下信息：

```text
identity
localized names
description
relevant parent / ownership relationship
related vehicle / platform / technology relationships
at least one authoritative source
evidence status
```

并非每个字段都必须存在。未知事实应保留为 `null` 或显式的 `unknown` / `pending`，不得为了满足关系图而推测。

### 3.2 Technology completeness

已发布或已确认的技术，优先回答：

```text
What is it?
Why was it developed?
How does it work?
What is different?
Advantages
Limitations
Developer / supplier where confirmed
Known applications
Known historical events
Sources
```

“每个技术必须有事件”不是绝对规则。若首次公布时间无法可靠确认，应保留技术记录，并明确标记日期未知。

### 3.3 Event completeness

事件应具有长期历史价值，能够回答类似：

```text
When was this vehicle launched?
When did this technology appear?
When did this brand or ownership structure change?
When did this market entry or production milestone happen?
```

普通营销活动、没有长期参考价值的短期新闻，不单独建立 Event。

### 3.4 Source coverage

来源数量不再作为主要目标。新增来源应优先覆盖关键 factual claims：

```text
launch / production / market dates
technology definition and application
developer / supplier / platform relationship
price and market specification
ownership or corporate structure
```

优先使用制造商、供应商、政府/监管机构、交易所文件、年报和技术文档；媒体来源用于补充和交叉核对。

## 4. Work sequence

### Sprint 0 — Data audit and model issue log

Priority: P0

目标：建立后续扩充的基线，不新增大批实体。

任务：

1. 创建并维护 `data-model-issues.md`。
2. 对现有实体建立完整性检查表。
3. 标记没有 `event_ids` 的技术记录，并判断是“日期未知”还是“事件缺失”。
4. 检查 `developer_ids` / `supplier_ids` 与关系文件是否存在语义重复。
5. 检查 `pending_reference_ids` 和 `reference_status: pending`，逐项判断是否应补充组织记录或关系来源。
6. 复核 `event_type` 的实际使用，整理 reveal、debut、launch、market entry 等类型的边界。

验收标准：

```text
每个主要实体都有审计结果
所有已知问题都有 P0–P3 分类
不因为审计而猜测或强行补关系
```

### Sprint 1 — BYD vertical slice

Priority: P0

目标：先完成一条真正可浏览、可追溯的 BYD 知识链。

建议范围：

```text
BYD Company
→ BYD / DENZA / YANGWANG / FANGCHENGBAO
→ SEAL / D9 / U8 / BAO 5
→ e-Platform 3.0 / Blade Battery / DM-i / DMO / DiSus / e⁴ / CTB
→ launch / market / production events
→ related news
→ source list
```

任务重点：

- 补齐品牌与制造商关系的有效时间和来源说明。
- 使主要车型都能找到品牌、平台/技术、事件和来源。
- 区分 CTB、CTC、DMO、e⁴ 等相近但不等价的概念。
- 对制造商声明与独立验证保持明确区分。

验收标准：

```text
从 BYD 页面可以进入品牌、车型、技术、事件和来源
主要车型至少有一个长期有效事件
主要技术有明确应用车型或明确的 unknown 状态
不存在无来源的新增 canonical fact
```

### Sprint 2 — Geely / Zeekr vertical slice

Priority: P0

建议范围：

```text
Geely Holding
→ Geely Auto / Zeekr / Galaxy where confirmed
→ Zeekr 001 / 007 / 7X / 009 / Geely EX5 / Galaxy E5 or E8
→ SEA / GEA / Golden Battery / Short Blade Battery / 800V / 11-in-1 e-drive
```

任务重点：

- 先明确 Geely Holding、Geely Auto Group、Zeekr Group、Zeekr brand 的层级语义。
- 不把 SEA、GEA 与某个单一技术重复建模。
- 对 Short Blade Battery 与 Golden Short Blade Battery 保留版本/品牌演化的可能性。
- 对 800V 相关描述区分车辆架构、充电能力、电池系统和基础设施。

验收标准：与 BYD slice 相同，并且至少有一条车型 → 平台 → 技术 → 事件 → 来源的完整链路。

### Sprint 3 — Changan / Deepal / Avatr vertical slice

Priority: P0

建议范围：

```text
Changan Automobile
→ Deepal / AVATR
→ Deepal S07 / L07 / AVATR 07 / 11 / 12
→ CHN / SDA / EREV / 800V SiC
→ Huawei / CATL relationship records where evidence supports them
```

任务重点：

- 明确制造商、运营主体、品牌和战略合作方的区别。
- 不将 Huawei 的 DriveONE、ADS、座舱等能力自动归为 AVATR 自有技术。
- 只有在来源支持时，才使用 `developer`、`supplier`、`jointly_developed_by` 或 `strategic_partner_of`。
- 对 AVATR 的历史股权与当前控制关系保持有效日期和证据状态。

验收标准：至少完成一条能表达 manufacturer / developer / supplier / partner 差异的真实关系链。

### Sprint 4 — Event and news consolidation

Priority: P1

目标：让 News 成为 Event 的发现入口，而不是孤立内容集合。

任务：

- 将新增新闻优先关联到已有实体和事件。
- 补充三条 vertical slice 的关键历史事件，而不是记录所有新闻。
- 统一事件类型命名和日期精度。
- 为重大事件补充相关文档或新闻链接。

阶段目标可参考：

```text
50–70 high-value events
15–25 news documents
每个主要事件至少一个来源
```

数量只是范围参考，来源质量和历史价值优先。

### Sprint 5 — Market specification review

Priority: P2

目标：使用少量车型验证模型，不建设全面价格数据库。

选择 3–5 个车型，覆盖：

```text
China / overseas market
different local names
different powertrains or variants
price effective dates
availability and unknown states
range test cycle where known
```

验收标准：完成一次模型问题记录，明确哪些情况现有 schema 可以表达，哪些需要未来升级。

### Sprint 6 — Data-driven UI review

Priority: P2

只根据真实数据暴露的问题调整 UI，重点观察：

- Technology 页面是否能同时展示定义、限制、应用车型、时间线和来源。
- Vehicle 页面是否能自然展示品牌、制造商、平台、技术、市场规格、事件和新闻。
- Manufacturer 页面是否能展示品牌、车型、技术和事件，而不混淆组织层级。
- Timeline 在事件数量增加后是否仍然清晰。
- unknown、pending、claimed、confirmed 是否有明确的视觉区别。

## 5. Milestone: Content Foundation Complete

达到以下条件后，才暂停内容扩张并进行 schema stabilization：

```text
3 coherent manufacturer / group slices
10+ brands
25+ vehicles as a reference range
15+ technologies
5+ platforms
50+ high-value events
80+ useful sources
15–25 news documents
```

更重要的质量条件是：

```text
主要实体具备关系和来源
关键事实可以追溯
未知信息没有被错误填充
事件和新闻没有大量孤立记录
三条 slice 都能完成 Entity → Fact → Event → Source 浏览路径
```

## 6. Schema stabilization review

完成三条 slice 后暂停大规模新增数据，复盘：

1. Technology 与 Platform 的边界是否稳定。
2. Developer、supplier、partner、operator、owner 是否需要统一关系模型。
3. 是否出现反复需要 claim-level evidence 的事实类型。
4. Event 是否需要更丰富的 subject、change 或 validity 表达。
5. Market specification 是否能表达名称、版本、价格和有效时间差异。
6. 哪些问题是个例，哪些问题已经重复出现并值得升级 schema。

只有在问题重复出现且影响实际内容维护时，才修改 canonical schema。

## 7. Explicitly deferred

在 Content Foundation 完成前，暂不投入主要开发资源于：

```text
database migration
CMS
user accounts
comments / community
GraphQL / public API
AI chatbot
semantic search
real-time price tracking
dealer database
massive automatic scraping infrastructure
mobile application
```

Deployment 属于发布任务，可单独完成，但不应打断数据闭环建设。

## 8. Required checks for every data batch

```bash
python3 scripts/data_pipeline.py validate
python3 scripts/data_pipeline.py build
```

涉及前端或展示逻辑时，还应运行项目已有的测试和 production build。提交前检查：

- 是否修改了已有 stable ID。
- 是否新增 canonical fact 却没有 source。
- 是否把 unknown 渲染成不存在或否定事实。
- 是否把 manufacturer claim 表述成 independently verified fact。
- 是否直接让 UI 读取 `data/` 文件。
- 是否注册了所有新增媒体资产。
