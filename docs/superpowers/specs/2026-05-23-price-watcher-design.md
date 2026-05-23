# PriceWatcher Design / PriceWatcher 设计文档

## 中文版本

### 目标

PriceWatcher 是一个单用户 Web MVP，用于在少数主流购物平台之间比较商品价格。用户可以通过关键词或商品链接搜索商品，查看候选商品价格、可信度评分，并创建价格监控；当价格低于目标价时，系统生成站内提醒。

第一版重点跑通完整闭环：

1. 搜索商品。
2. 从 2-3 个平台适配器获取候选商品。
3. 标准化价格和商品信息。
4. 计算可信度和商品匹配度。
5. 展示排序后的比价结果。
6. 允许用户设置目标价并创建监控。
7. 后台定时刷新监控商品。
8. 价格达到目标价时触发站内提醒。

### 非目标

第一版不做：

- 复杂账号登录或多用户权限。
- 浏览器插件。
- 手机 App。
- 支付、下单或返利流程。
- 全平台覆盖。
- 绕过登录墙或强反爬保护。
- 基于机器学习的匹配或评分。
- 短信、邮件、微信、App 推送等外部提醒渠道。

### 产品范围

MVP 是一个 Web 应用。它先按单用户产品使用，但代码结构要为未来账号体系预留空间，把监控、提醒、搜索历史等用户数据独立建模。

数据来源采用混合策略：

- 优先使用稳定的公开页面数据。
- 所有平台都封装在可替换的平台适配器后面。
- 后续可把某个平台适配器替换成官方 API 或第三方数据服务。

第一批支持的平台应以数据可获取性和稳定性为准，而不是追求覆盖数量。无法在不登录的情况下获取有效公开数据的平台，第一版应暂缓支持。

### 用户流程

1. 用户打开 Web 应用，输入商品关键词或商品链接。
2. 后端创建一次搜索会话，并请求已启用的平台适配器。
3. 每个平台适配器返回标准化候选商品，或返回平台级失败状态。
4. 后端计算匹配分、可信度分、价格优势和最终排序。
5. 前端展示平台、图片、标题、价格、店铺、销量或评价信号、可信度分、评分解释、采集时间和商品外链。
6. 用户可以按综合推荐、最低价、可信度或销量排序。
7. 用户从某个结果或搜索条件创建监控，并设置目标价。
8. 后台任务定时刷新启用中的监控。
9. 如果刷新到的价格小于或等于目标价，系统创建提醒事件。
10. 用户在站内提醒中心查看降价提醒。

### 页面

#### 搜索页

搜索页包含一个主搜索框，支持输入关键词或商品 URL。可以展示最近搜索和正在监控的商品，但第一版应保持简洁。

#### 比价结果页

结果页展示标准化后的商品候选项。每个结果包含：

- 平台。
- 商品图片。
- 商品标题。
- 当前价格。
- 店铺名称和店铺类型。
- 销量、评分和评价数。
- 可信度分。
- 简短可信度解释。
- 必要时展示匹配解释。
- 采集时间。
- 商品链接。
- 创建监控并设置目标价的操作。

默认排序是综合推荐。用户可以切换到最低价、可信度或销量排序。

#### 监控详情页

监控详情页展示：

- 被监控的商品或搜索条件。
- 目标价。
- 当前最优价。
- 各平台价格。
- 近期价格历史。
- 最近检查时间。
- 提醒状态。

第一版可以用简单折线图或表格展示历史价格快照。

#### 提醒中心

提醒中心展示已触发的降价提醒：

- 商品标题。
- 平台。
- 触发价格。
- 目标价。
- 触发时间。
- 已读/未读状态。
- 商品链接。

### 架构

应用分为四层。

#### Web 前端

前端负责搜索输入、结果展示、排序控件、创建监控、价格历史和提醒展示。前端不包含平台采集逻辑或评分逻辑。

#### 后端 API

后端提供接口用于：

- 创建搜索会话。
- 读取搜索结果。
- 创建和更新监控。
- 读取价格历史。
- 读取提醒事件并标记已读。
- 读取平台适配器状态。

后端负责流程编排、数据标准化、评分、持久化和提醒判断。

#### 平台适配器层

每个平台使用独立适配器，例如 `JDAdapter`、`PDDAdapter`、`TaobaoAdapter`。所有适配器实现同一契约：

- 接收关键词搜索或标准化后的源商品。
- 返回标准化候选商品。
- 返回平台状态和结构化错误。

标准化候选商品字段：

- `platform`
- `externalId`
- `title`
- `price`
- `currency`
- `shopName`
- `shopType`
- `salesCount`
- `rating`
- `reviewCount`
- `productUrl`
- `imageUrl`
- `rawMetadata`
- `collectedAt`

适配器内部可以使用公开页面抓取、官方 API 或第三方数据服务。调用方不应因为适配器内部实现变化而修改代码。

#### 后台任务层

后台任务层定时刷新启用中的监控，写入价格快照并创建提醒事件。任务失败要记录并在之后重试，不应导致整个应用不可用。

### 数据模型

#### `SearchSession`

表示一次用户搜索。

关键字段：

- `id`
- `query`
- `queryType`：关键词或 URL
- `createdAt`
- `resultCount`
- `platformStatuses`

#### `ProductCandidate`

表示搜索或监控刷新时发现的一个标准化商品。

关键字段：

- `id`
- `searchSessionId`
- `platform`
- `externalId`
- `title`
- `price`
- `currency`
- `shopName`
- `shopType`
- `salesCount`
- `rating`
- `reviewCount`
- `productUrl`
- `imageUrl`
- `matchScore`
- `trustScore`
- `trustReasons`
- `collectedAt`
- `rawMetadata`

#### `WatchItem`

表示一个被监控的商品结果或搜索条件。

关键字段：

- `id`
- `sourceCandidateId`
- `query`
- `targetPrice`
- `checkInterval`
- `enabled`
- `createdAt`
- `lastCheckedAt`

#### `PriceSnapshot`

表示某个监控项的一次价格观测。

关键字段：

- `id`
- `watchItemId`
- `platform`
- `candidateTitle`
- `price`
- `currency`
- `productUrl`
- `trustScore`
- `collectedAt`

#### `AlertEvent`

表示一次触发的降价提醒。

关键字段：

- `id`
- `watchItemId`
- `platform`
- `triggerPrice`
- `targetPrice`
- `productUrl`
- `triggeredAt`
- `readAt`

#### `PlatformStatus`

表示平台适配器健康状态。

关键字段：

- `platform`
- `enabled`
- `lastSuccessAt`
- `lastFailureAt`
- `lastErrorCode`
- `lastErrorMessage`
- `averageLatencyMs`

### 可信度评分

第一版使用透明的规则评分，分值范围为 0-100。评分需要附带解释，让用户理解为什么某个结果可信或被降权。

建议维度：

- 店铺可信度：自营、旗舰店、品牌店加分。
- 评价可信度：评分高且评价数多加分；评价过少降低可信度。
- 销量可信度：销量高加分，但采用递减收益，避免销量无限放大影响。
- 价格可信度：明显低于相似候选商品中位价的结果降权。
- 信息完整度：图片、店铺名、评分、评价数、销量、有效链接越完整越可信。
- 平台基础权重：平台可有少量基础权重，但不能压过商品自身证据。

默认综合推荐排序结合：

- 价格优势。
- 可信度分。
- 商品匹配分。

最低价排序仍然保留，但默认排序应避免把可疑低价商品排在最前。

### 商品匹配

第一版使用确定性匹配规则。

关键词搜索：

- 比较标题词、品牌词、型号词和规格词。
- 计算粗略匹配分。
- 展示足够的标题和规格信息，让用户判断候选商品是否真的可比。

商品链接搜索：

- 解析源商品标题和可用规格。
- 用提取出的标题、品牌、型号和规格词搜索其他平台。
- 按匹配分和可信度排序候选结果。

MVP 不承诺同款商品 100% 精准匹配。界面应诚实展示标题、规格、店铺和匹配原因。

### 错误处理

平台失败要互相隔离。

- 某个平台失败时，整次搜索不应失败。
- 结果页应显示哪个平台失败，同时保留其他平台成功结果。
- 缺少销量、评分或评价数字段时，不丢弃商品，只降低信息完整度。
- 无法解析价格的商品不进入价格排序，并记录错误便于排查。
- 监控刷新失败要记录，并在后续计划中重试。
- 同一个监控项不应因为同一次目标价穿越产生重复未读提醒。
- 如果平台页面变化导致适配器失效，该适配器状态应变为异常，但不影响其他适配器。

### 测试策略

#### 单元测试

覆盖：

- 价格解析和标准化。
- 可信度评分。
- 商品匹配分。
- 综合推荐排序。
- 提醒触发判断。

#### 适配器测试

适配器测试应使用保存的样例响应或模拟 provider 响应，不依赖真实平台实时页面。

#### API 测试

覆盖：

- 创建搜索和读取结果。
- 创建和更新监控。
- 读取价格历史。
- 创建提醒和标记已读。
- 平台失败状态上报。

#### 端到端测试

覆盖核心流程：

1. 搜索商品。
2. 查看比价结果。
3. 创建带目标价的监控。
4. 运行定时刷新。
5. 当价格达到目标价时创建并展示提醒。

### 待实施计划决定的事项

这些内容留到实施计划阶段确定：

- 具体前端和后端框架。
- 第一批 2-3 个平台。
- 数据库选择。
- 定时任务机制。
- 具体抓取库或 API provider。

无论最终选择什么技术，这份设计要求必须保留平台适配器边界和可测试性。

---

## English Version

### Goal

PriceWatcher is a single-user web MVP for comparing prices across a small set of mainstream shopping platforms. A user can search for a product by keyword or product link, compare candidate prices, review a trust score, and create a price watch that triggers an in-app alert when the price drops below a target.

The first version focuses on proving the end-to-end workflow:

1. Search for a product.
2. Fetch candidate products from 2-3 platform adapters.
3. Normalize price and product metadata.
4. Score trustworthiness and match quality.
5. Show ranked comparison results.
6. Let the user create a watch with a target price.
7. Refresh watched items on a schedule.
8. Trigger an in-app alert when the target price is reached.

### Non-Goals

The first version will not include:

- Complex account login or multi-user permissions.
- Browser extension support.
- Mobile app support.
- Payment, checkout, or affiliate order flows.
- Full-platform coverage.
- Bypassing login walls or strong anti-bot protections.
- Machine-learning-based matching or scoring.
- External push channels such as SMS, email, WeChat, or app notifications.

### Product Scope

The MVP is a web application. It behaves like a single-user product, but the code should keep future account support in mind by separating user-owned records such as watches, alerts, and search history.

The data source strategy is mixed:

- Start with public page scraping where stable enough.
- Keep every platform behind a replaceable adapter interface.
- Allow specific adapters to be replaced later by official APIs or third-party data services.

The first supported platforms should be selected for practical data availability and stability rather than broad coverage. A platform that cannot provide useful public data without login should be deferred.

### User Flow

1. The user opens the web app and enters a product keyword or product link.
2. The backend creates a search session and asks enabled platform adapters for candidate products.
3. Each adapter returns normalized candidates or a platform-level failure state.
4. The backend computes match score, trust score, price advantage, and final ranking.
5. The frontend shows results with platform, image, title, price, shop, sales or review signals, trust score, score explanation, collection time, and outbound product link.
6. The user sorts by recommended, lowest price, trust score, or sales.
7. The user creates a watch from a result or search condition and sets a target price.
8. A background task refreshes active watches.
9. If a refreshed price is at or below the target price, the system creates an alert event.
10. The user sees triggered alerts in the in-app alert center.

### Pages

#### Search Page

The search page contains a primary search box that accepts either a keyword or a product URL. It can also show recent searches and currently active watches, but it should stay simple for the first version.

#### Comparison Results Page

The results page shows normalized product candidates. Each result includes:

- Platform.
- Product image.
- Product title.
- Current price.
- Shop name and shop type when available.
- Sales count, rating, and review count when available.
- Trust score.
- Short trust explanation.
- Match explanation when useful.
- Collection time.
- Product link.
- Action to create a watch and set a target price.

The default sort is recommended ranking. The user can switch to lowest price, trust score, or sales.

#### Watch Detail Page

The watch detail page shows:

- Watched product or search condition.
- Target price.
- Current best price.
- Prices by platform.
- Recent price history.
- Last checked time.
- Alert status.

The first version can use a simple line chart or table for historical price snapshots.

#### Alert Center

The alert center shows triggered price alerts:

- Product title.
- Platform.
- Trigger price.
- Target price.
- Trigger time.
- Read/unread state.
- Link to the product.

### Architecture

The application is split into four layers.

#### Web Frontend

The frontend handles search input, result display, sorting controls, watch creation, price history, and alerts. It should not contain platform-specific scraping or scoring logic.

#### Backend API

The backend exposes endpoints for:

- Creating a search session.
- Reading search results.
- Creating and updating watches.
- Reading price history.
- Reading and marking alert events.
- Reading platform adapter status.

The backend owns orchestration, normalization, scoring, persistence, and alert decisions.

#### Platform Adapter Layer

Each platform uses a separate adapter, such as `JDAdapter`, `PDDAdapter`, or `TaobaoAdapter`. Every adapter implements the same contract:

- Accept a keyword search or a normalized source product.
- Return normalized product candidates.
- Return platform status and structured errors.

Normalized candidate fields:

- `platform`
- `externalId`
- `title`
- `price`
- `currency`
- `shopName`
- `shopType`
- `salesCount`
- `rating`
- `reviewCount`
- `productUrl`
- `imageUrl`
- `rawMetadata`
- `collectedAt`

Adapter internals can use public page scraping, official APIs, or third-party data providers. Consumers should not need to change when an adapter implementation changes.

#### Background Task Layer

The background task layer refreshes active watches on a schedule. It creates price snapshots and alert events. Task failures are recorded and retried later without disabling the whole application.

### Data Model

#### `SearchSession`

Represents one user search.

Key fields:

- `id`
- `query`
- `queryType`: keyword or URL
- `createdAt`
- `resultCount`
- `platformStatuses`

#### `ProductCandidate`

Represents one normalized product found during a search or watch refresh.

Key fields:

- `id`
- `searchSessionId`
- `platform`
- `externalId`
- `title`
- `price`
- `currency`
- `shopName`
- `shopType`
- `salesCount`
- `rating`
- `reviewCount`
- `productUrl`
- `imageUrl`
- `matchScore`
- `trustScore`
- `trustReasons`
- `collectedAt`
- `rawMetadata`

#### `WatchItem`

Represents a monitored product result or search condition.

Key fields:

- `id`
- `sourceCandidateId`
- `query`
- `targetPrice`
- `checkInterval`
- `enabled`
- `createdAt`
- `lastCheckedAt`

#### `PriceSnapshot`

Represents one observed price for a watched item.

Key fields:

- `id`
- `watchItemId`
- `platform`
- `candidateTitle`
- `price`
- `currency`
- `productUrl`
- `trustScore`
- `collectedAt`

#### `AlertEvent`

Represents one triggered price alert.

Key fields:

- `id`
- `watchItemId`
- `platform`
- `triggerPrice`
- `targetPrice`
- `productUrl`
- `triggeredAt`
- `readAt`

#### `PlatformStatus`

Represents adapter health.

Key fields:

- `platform`
- `enabled`
- `lastSuccessAt`
- `lastFailureAt`
- `lastErrorCode`
- `lastErrorMessage`
- `averageLatencyMs`

### Trust Score

The first version uses a transparent rule-based score from 0 to 100. The score should include explanations so the user can understand why a result is trusted or downgraded.

Suggested dimensions:

- Shop trust: self-operated, flagship, or brand shops get a boost.
- Review trust: high rating and many reviews get a boost; too few reviews reduce confidence.
- Sales trust: higher sales get a boost, with diminishing returns.
- Price trust: prices far below the median for similar candidates are downgraded.
- Information completeness: image, shop name, rating, review count, sales count, and valid URL improve confidence.
- Platform baseline: each platform can have a small baseline weight, but platform weight must not dominate the product-level evidence.

The default recommended ranking combines:

- Price advantage.
- Trust score.
- Product match score.

Lowest price sorting remains available, but the default should avoid ranking suspicious low-price results first.

### Product Matching

The first version uses deterministic matching.

For keyword searches:

- Compare title tokens, brand terms, model terms, and specification terms.
- Compute a rough match score.
- Show enough raw title and spec information for the user to judge whether candidates are truly comparable.

For product URLs:

- Parse the source product title and available specification data.
- Search other platforms using the extracted title, brand, model, and spec terms.
- Rank candidates by match score and trust score.

The MVP does not promise perfect same-product matching. It should be honest in the UI by showing titles, specs, shops, and match reasons.

### Error Handling

Platform failures should be isolated.

- If one platform fails, the whole search should not fail.
- The results page should show which platform failed and keep displaying successful platform results.
- Missing sales, rating, or review fields should not remove a candidate; they should reduce information completeness.
- Candidates with unparseable prices should be excluded from price ranking and logged for diagnosis.
- Watch refresh failures should be recorded and retried on a later schedule.
- The same watch should not trigger duplicate unread alerts for the same target-price crossing.
- If an adapter breaks because a platform page changed, its status should become unhealthy without affecting other adapters.

### Testing Strategy

#### Unit Tests

Cover:

- Price parsing and normalization.
- Trust score calculation.
- Product match score calculation.
- Recommended ranking.
- Alert trigger decisions.

#### Adapter Tests

Adapters should be tested against stored sample responses or mocked provider responses. Tests should not depend on live platform pages.

#### API Tests

Cover:

- Search creation and result retrieval.
- Watch creation and update.
- Price history retrieval.
- Alert creation and read state.
- Platform failure reporting.

#### End-to-End Tests

Cover the core workflow:

1. Search for a product.
2. View comparison results.
3. Create a watch with a target price.
4. Run a scheduled refresh.
5. Create and display an alert when the target price is reached.

### Open Implementation Choices

These are intentionally deferred to the implementation plan:

- Exact frontend and backend framework.
- Initial 2-3 platforms.
- Database choice.
- Scheduler mechanism.
- Specific scraping libraries or API providers.

The design requires these choices to preserve adapter boundaries and testability.
