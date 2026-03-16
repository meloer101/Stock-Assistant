# Product Requirements Document

## Feature Overview

- Feature name: Vine 投资研究助手（A 股个人投资者 v0.1）
- Owner: m（TBD）
- Date: 2026-03-16
- Related discovery artifacts:
  - `docs/discovery/2026-03-16_problem_discovery_brief.md`
  - `docs/discovery/2026-03-16_hypothesis_ledger.md`
  - `docs/discovery/2026-03-16_validation_pack_v0.md`
  - `docs/discovery/2026-03-16_eval_cases_v0.md`

## Problem Statement

- Problem:
  - A 股个人投资者在“价格波动触发的买不买决策”与“主题建仓前的系统性研究”两种模式间切换，当前依赖同花顺/Wind 等多工具与多来源信息，存在时间与信任双阈值：
    - 时间：轻量分析 1–3 分钟；主题深度研究 3–5 分钟；超时就可能放弃。
    - 信任：要求输出可核对；最低可接受引用粒度为“仅标题”（如“XX 年报某章节/某研报标题/某媒体报道标题”），并按年报/研报/媒体=4:4:2 对冲突证据裁决与综合打分。
  - 用户偏好以“乐观/基准/悲观三情景概率（明确数值）”组织研究，而不是单一结论；并希望看到反例与催化剂。
- Target user: A 股个人投资者（自助研究与决策）
- Evidence or assumption:
  - Evidence: 与用户共创的 Problem Discovery（2026-03-16，会话记录整理于 discovery artifacts）。
  - Assumption: v0.1 先聚焦 A 股与三大主题（AI 算力/低空经济/创新药），后续扩展其他主题与个股研究口径。

## Goals

- User goals:
  - 在可接受时间内获得可核对的主题/行业研究结果（情景概率先行，证据可核对）。
  - 在证据冲突时，能快速理解“为什么信某类证据”，减少反复核对。
  - 在不强制系统“给结论”的前提下，获得结构化要点（核心论点、证据、反例、催化剂、下一步核对清单）。
- Business goals:
  - 提升“研究任务完成率”与“重复使用率”（高频轻量场景拉动留存，高价值主题场景拉动口碑）。
  - 建立可评测、可回归的输出标准（以减少模型/工具变动导致的质量漂移）。

## Non-Goals（v0.1 不做）

- 不提供下单、交易执行、账户连接与资产管理。
- 不承诺收益或“正确率”；不输出确定性投资建议。
- 不做复杂的个性化画像与长期记忆（除会话内上下文外）。
- 不构建完整投研知识库（除用户上传 PDF 文档 RAG）。

## Personas & Usage Modes

- P1 价格波动触发（高频、低耐心）
  - 目标：快速判断“买不买”的关键变量与情景概率框架
  - 容忍：不确定性 OK；但不可“说反事实/无出处事实”
- P2 主题建仓研究（中频、高价值）
  - 目标：主题的系统性框架、龙头筛选逻辑、风险与催化剂
  - 期望：结构化输出与冲突证据裁决
- P3 文档核对（按需、强引用）
  - 目标：快速定位研报/年报中的关键信息，带页码引用
  - 偏好：“用完即删/不在界面留记录”（通过删除文档/删除会话满足）

## User Stories

- US1（主题研究）As an A 股个人投资者, I want to 让系统输出三情景概率并给可核对的标题引用, so that 我能在 3–5 分钟内完成主题建仓的可信判断。
- US2（冲突裁决）As an A 股个人投资者, I want to 在证据冲突时看到按年报/研报/媒体=4:4:2 的权重解释, so that 我能快速决定信谁而不反复核对。
- US3（结构化输出）As an A 股个人投资者, I want to 看到核心论点/证据/反例/催化剂/核对清单, so that 我能把研究结果转成行动与后续跟踪。
- US4（轻量研究入口）As an A 股个人投资者, I want to 只输入主题名或一句问题就能启动研究, so that 我不需要准备大量上下文。
- US5（文档问答）As a 用户, I want to 上传 PDF 并提问且答案带 [Source: filename, Page X], so that 我能核对原文位置。
- US6（隐私与清理）As a 用户, I want to 一键删除文档/会话, so that 我能做到“用完即删/不在界面留记录”。

## Functional Requirements

### FR0 — Unified Chat（现有能力，需保持）

- FR0.1 系统应提供统一聊天界面，支持会话创建、历史会话列表、会话消息回放。Acceptance: 前端能通过 `/api/chat` 流式获得模型输出；通过 `/api/sessions` 列表与删除会话。
- FR0.2 系统应在消息流中展示“当前正在执行的 agent”状态提示。Acceptance: 前端根据 SSE `author` 映射展示状态文案。

### FR1 — Intent Routing（现有能力 + 扩展）

- FR1.1 系统应按任务类型路由到对应 agent：
  - Stock Analysis → `stock_coordinator`
  - Quick Answer → `quick_answer_agent`
  - Theme Deep Research (Brief) → `theme_research_agent`
  - Deep Research Report → `deep_research_pipeline`
  - Document Q&A → `doc_qa_agent`
  Acceptance: root agent instruction 覆盖上述路由，并可在前端看到对应 `author` 流。

### FR2 — Theme Deep Research (Brief)（v0.1 核心新增能力）

#### FR2.1 输入
- FR2.1.1 用户可用自然语言提出主题研究问题（例如“主题深度研究：低空经济是否适合建仓”）。
- FR2.1.2 系统应支持低输入摩擦：仅主题名/一句问题即可。

#### FR2.2 输出结构（严格、可回归）
- FR2.2.1 系统输出必须为 markdown，且必须包含并按顺序出现以下一级标题（严格字符串匹配）：
  - `## 情景概率`
  - `## 核心论点`
  - `## 证据（仅标题）`
  - `## 反例`
  - `## 催化剂`
  - `## 核对清单`
  - `## 免责声明`
  Acceptance: 用例评测（`docs/discovery/2026-03-16_eval_cases_v0.md`）可人工检查通过。

#### FR2.3 情景概率（先于证据）
- FR2.3.1 `## 情景概率` 下必须包含三行：
  - `- 乐观：<number>`
  - `- 基准：<number>`
  - `- 悲观：<number>`
  且三者合计=100。Acceptance: 人工核对合计=100；缺失/不合计即 Fail。

#### FR2.4 核心论点（带 ID）
- FR2.4.1 `## 核心论点` 下必须包含三个二级标题：`### 乐观`、`### 基准`、`### 悲观`。
- FR2.4.2 每条论点必须以 `(L#)/(B#)/(S#)` 形式的 ID 开头（例如 `(L1)`）。Acceptance: 评测用例结构检查通过。

#### FR2.5 证据（仅标题 + 类型/权重 + 关联 ID）
- FR2.5.1 `## 证据（仅标题）` 下每条证据必须以如下格式开头：
  - `- [年报|权重4] <title> — 支撑：(L1)`
  - `- [研报|权重4] <title> — 支撑：(B1)`
  - `- [媒体|权重2] <title> — 支撑：(S1)`
- FR2.5.2 “关键断言”必须有标题引用；若无法找到可核对标题，必须将该断言降级标注为 **待核对/假设**，且不得作为事实使用。Acceptance: R1 Pass。
- FR2.5.3 证据冲突时，系统必须解释权重 4:4:2 如何影响裁决与综合。Acceptance: 在冲突用例中可读到“按权重偏向/降低置信”的解释。

#### FR2.6 反例与催化剂（含引用或待核对）
- FR2.6.1 `## 反例` 至少 2 条，每条以 `(C#)` 开头。
- FR2.6.2 `## 催化剂` 至少 2 条，每条以 `(K#)` 开头。
- FR2.6.3 若反例/催化剂含关键断言，必须在证据区提供标题引用；无法引用则标注待核对。Acceptance: R5/R6 得分可达 ≥1。

#### FR2.7 核对清单（可执行）
- FR2.7.1 `## 核对清单` 必须是行动清单（去哪里核对、核对什么），不写长文。Acceptance: Reviewer 能据此执行下一步核对。

#### FR2.8 搜索与引用约束（防止“编造标题”）
- FR2.8.1 系统必须调用 `tavily_search` 获取证据；最多 2 次搜索。
- FR2.8.2 系统只允许引用“出现在搜索结果中的标题”。Acceptance: 评测时抽查标题可在检索结果中找到（需要工具侧日志/可观测性支持；v0.1 可先人工抽查）。

### FR3 — Stock Analysis（现有能力，需对齐 A 股）

- FR3.1 系统应支持用户以 A 股代码/公司名发起个股分析（当前提示示例偏美股 ticker）。Acceptance: 更新示例与提示文案；并能对 A 股输入进行确认与继续（策略细节可后续迭代）。
- FR3.2 输出必须包含标准免责声明。Acceptance: 输出末尾包含免责声明段。

### FR4 — Document Q&A（现有能力，需满足“用完即删”体验）

- FR4.1 系统应支持上传 PDF 到语料库，并可列出/删除已上传文档。Acceptance: `/api/corpus/upload`、`/api/corpus`、`/api/corpus/{doc_id}` 可用。
- FR4.2 文档问答答案必须引用到文件名与页码（格式由现有 prompt 规定）。Acceptance: 回答中存在形如 `[Source: filename, Page X]` 的引用。
- FR4.3 系统应提供“界面不留记录”的可操作路径：用户可删除文档与删除会话。Acceptance: 前端提供删除入口，删除后列表不再出现。

## Edge Cases

- See: `docs/prd/2026-03-16_edge_case_matrix.md`

## Non-Functional Requirements

- NFR1 性能（主题研究）：
  - p95 端到端响应：≤ 5 分钟（主题研究），≤ 3 分钟（轻量研究/快速问答）。
  - 渐进输出：应尽早开始流式返回（≤10s 首 token，Assumption: 取决于模型与网络）。
- NFR2 可靠性：
  - 当 Tavily 不可用或无结果时，系统应返回“未找到可核对标题证据”的降级输出，并给出核对清单（而非编造）。
- NFR3 安全与隐私：
  - 上传 PDF 不用于训练（Assumption: 基础设施策略）；用户可删除文档块（`delete_document` 生效）。
  - 会话可删除（删除后不在前端可见；后端存储策略需明确：删除是否物理删除或逻辑删除，TBD）。
- NFR4 限制：
  - PDF 单文件大小上限：TBD（建议 20–50MB，需压测）
  - 单次对话最大 token/LLM 调用次数：由 RunConfig `max_llm_calls` 限制（现为 30）。

## Success Metrics

- See: `docs/prd/2026-03-16_metrics_table.csv`

## Open Questions（工程/产品需共同确认）

- OQ1 “仅标题引用”的可核对性：是否需要同时保存“搜索结果原文片段”作为审计证据？（否则标题仍可能被误写）
- OQ2 “权威文件/公告/政策原文”在年报/研报/媒体 4:4:2 体系中如何映射？
- OQ3 A 股数据源策略：是否允许依赖公开网页搜索，还是必须接入 Wind/同花顺数据接口？（影响可核对与时效）
- OQ4 主题研究与深度研究报告（deep_research_pipeline）如何区分入口与体验，避免用户误触“先计划再审批”的长流程？

