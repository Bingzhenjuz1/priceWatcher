# PriceWatcher MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user web MVP that searches product candidates, ranks them by price and trust, creates price watches, refreshes watched prices, and shows in-app alerts.

**Architecture:** Use a Next.js App Router full-stack application with server-side services for search orchestration, platform adapters, trust scoring, matching, persistence, and scheduled refresh logic. Keep platform data behind adapter interfaces; the MVP uses deterministic sample adapters so the full product workflow is testable before real platform integrations are added.

**Tech Stack:** TypeScript, Next.js, React, Prisma, SQLite, Vitest, Testing Library, Playwright, Recharts, Tailwind CSS.

---

## Scope Decision

This plan implements one coherent MVP slice:

- Web search and results UI.
- Backend API routes.
- Adapter contract and 3 deterministic sample platform adapters.
- Trust score, match score, ranking, and price parsing.
- SQLite persistence with Prisma.
- Watch creation, manual refresh endpoint, alert creation, alert read state, and price history.
- Unit, API, and end-to-end tests.

Real marketplace scraping is intentionally not implemented in this first plan. The adapter interface and sample adapters make the workflow stable and testable; real adapters can replace sample adapters in a later plan without changing the UI or orchestration contracts.

## File Structure

Create or modify these files:

- `package.json`: scripts and dependencies.
- `next.config.ts`: Next.js config.
- `tsconfig.json`: TypeScript config.
- `postcss.config.mjs`: PostCSS config.
- `tailwind.config.ts`: Tailwind config.
- `vitest.config.ts`: unit and API test config.
- `playwright.config.ts`: end-to-end test config.
- `.gitignore`: generated files and local database ignores.
- `prisma/schema.prisma`: SQLite schema for searches, candidates, watches, snapshots, alerts, and platform status.
- `src/app/layout.tsx`: app shell.
- `src/app/page.tsx`: search page and recent state entry point.
- `src/app/search/[id]/page.tsx`: comparison results page.
- `src/app/watch/[id]/page.tsx`: watch detail page.
- `src/app/alerts/page.tsx`: alert center.
- `src/app/globals.css`: base styles.
- `src/app/api/search/route.ts`: create search sessions.
- `src/app/api/search/[id]/route.ts`: read search session and candidates.
- `src/app/api/watches/route.ts`: create and list watches.
- `src/app/api/watches/[id]/route.ts`: read or update a watch.
- `src/app/api/watches/[id]/refresh/route.ts`: refresh one watch.
- `src/app/api/alerts/route.ts`: list alerts.
- `src/app/api/alerts/[id]/read/route.ts`: mark alert as read.
- `src/lib/db.ts`: Prisma client singleton.
- `src/lib/types.ts`: shared domain types.
- `src/lib/money.ts`: price parsing and normalization helpers.
- `src/lib/scoring/trustScore.ts`: trust score calculation.
- `src/lib/scoring/matchScore.ts`: product match score calculation.
- `src/lib/scoring/rankCandidates.ts`: recommended ranking.
- `src/lib/adapters/platformAdapter.ts`: adapter contract.
- `src/lib/adapters/sampleData.ts`: deterministic sample catalog.
- `src/lib/adapters/jdAdapter.ts`: sample JD adapter.
- `src/lib/adapters/pddAdapter.ts`: sample PDD adapter.
- `src/lib/adapters/taobaoAdapter.ts`: sample Taobao adapter.
- `src/lib/adapters/index.ts`: enabled adapter registry.
- `src/lib/search/searchService.ts`: search orchestration and persistence.
- `src/lib/watch/watchService.ts`: watch creation, refresh, snapshots, and alert logic.
- `src/components/SearchBox.tsx`: reusable search form.
- `src/components/ResultCard.tsx`: candidate card.
- `src/components/SortControl.tsx`: result sorting control.
- `src/components/TrustBadge.tsx`: trust score display.
- `src/components/WatchForm.tsx`: target price watch form.
- `src/components/PriceHistoryChart.tsx`: watch history chart.
- `src/components/AlertList.tsx`: alert list.
- `tests/unit/money.test.ts`: price parsing tests.
- `tests/unit/trustScore.test.ts`: trust scoring tests.
- `tests/unit/matchScore.test.ts`: matching tests.
- `tests/unit/rankCandidates.test.ts`: ranking tests.
- `tests/unit/watchService.test.ts`: alert trigger tests.
- `tests/api/search.test.ts`: search API tests.
- `tests/api/watch.test.ts`: watch and refresh API tests.
- `tests/e2e/price-watcher.spec.ts`: browser workflow test.

---

### Task 1: Project Bootstrap

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.gitignore`
- Create: `src/app/globals.css`

- [ ] **Step 1: Initialize git repository**

Run:

```bash
git init
```

Expected: repository initialized in the project root.

- [ ] **Step 2: Create `package.json`**

Use this file content:

```json
{
  "name": "price-watcher",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "db:reset": "prisma migrate reset --force"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "clsx": "^2.1.1",
    "next": "^14.2.18",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.13.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.2",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@types/node": "^22.9.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.18",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.47",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 3: Create framework config files**

Use these file contents:

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

```js
// postcss.config.mjs
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#5e6b76",
        line: "#d9e1e8",
        panel: "#f7f9fb",
        accent: "#157f72",
        danger: "#b42318"
      }
    }
  },
  plugins: []
};

export default config;
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ]
});
```

- [ ] **Step 4: Create `.gitignore` and global CSS**

Use these file contents:

```gitignore
node_modules
.next
coverage
playwright-report
test-results
.env
.env.local
prisma/dev.db
prisma/dev.db-journal
```

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color: #17202a;
  background: #f7f9fb;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 5: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules` and `package-lock.json` are created.

- [ ] **Step 6: Run baseline checks**

Run:

```bash
npm run test
```

Expected: Vitest reports no test files or zero tests without TypeScript config errors.

- [ ] **Step 7: Commit bootstrap**

Run:

```bash
git add .
git commit -m "chore: bootstrap price watcher app"
```

Expected: commit succeeds.

---

### Task 2: Database Schema and Prisma Client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Create: `.env`

- [ ] **Step 1: Create Prisma schema**

Use this file content:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model SearchSession {
  id               String             @id @default(cuid())
  query            String
  queryType        QueryType
  resultCount      Int                @default(0)
  platformStatuses Json
  createdAt        DateTime           @default(now())
  candidates       ProductCandidate[]
}

model ProductCandidate {
  id              String        @id @default(cuid())
  searchSessionId String
  platform        String
  externalId      String
  title           String
  price           Int
  currency        String        @default("CNY")
  shopName        String
  shopType        ShopType
  salesCount      Int?
  rating          Float?
  reviewCount     Int?
  productUrl      String
  imageUrl        String?
  matchScore      Int
  trustScore      Int
  trustReasons    Json
  rawMetadata     Json
  collectedAt     DateTime
  searchSession   SearchSession @relation(fields: [searchSessionId], references: [id], onDelete: Cascade)
  watches         WatchItem[]

  @@index([searchSessionId])
  @@index([platform, externalId])
}

model WatchItem {
  id                String          @id @default(cuid())
  sourceCandidateId String?
  query             String
  targetPrice       Int
  checkInterval     Int             @default(3600)
  enabled           Boolean         @default(true)
  createdAt         DateTime        @default(now())
  lastCheckedAt     DateTime?
  sourceCandidate   ProductCandidate? @relation(fields: [sourceCandidateId], references: [id], onDelete: SetNull)
  snapshots         PriceSnapshot[]
  alerts            AlertEvent[]
}

model PriceSnapshot {
  id             String    @id @default(cuid())
  watchItemId    String
  platform       String
  candidateTitle String
  price          Int
  currency       String    @default("CNY")
  productUrl     String
  trustScore     Int
  collectedAt    DateTime  @default(now())
  watchItem      WatchItem @relation(fields: [watchItemId], references: [id], onDelete: Cascade)

  @@index([watchItemId, collectedAt])
}

model AlertEvent {
  id           String     @id @default(cuid())
  watchItemId  String
  platform     String
  triggerPrice Int
  targetPrice  Int
  productUrl   String
  triggeredAt  DateTime   @default(now())
  readAt       DateTime?
  watchItem    WatchItem  @relation(fields: [watchItemId], references: [id], onDelete: Cascade)

  @@index([watchItemId, readAt])
}

model PlatformStatus {
  platform         String    @id
  enabled          Boolean   @default(true)
  lastSuccessAt    DateTime?
  lastFailureAt    DateTime?
  lastErrorCode    String?
  lastErrorMessage String?
  averageLatencyMs Int?
}

enum QueryType {
  KEYWORD
  URL
}

enum ShopType {
  SELF_OPERATED
  FLAGSHIP
  BRAND
  MARKETPLACE
  UNKNOWN
}
```

- [ ] **Step 2: Create `.env`**

Use this file content:

```bash
DATABASE_URL="file:./dev.db"
```

- [ ] **Step 3: Create Prisma singleton**

Use this file content:

```ts
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 4: Generate database migration**

Run:

```bash
npm run prisma:migrate -- --name init
```

Expected: SQLite database and Prisma migration are created.

- [ ] **Step 5: Run Prisma generate**

Run:

```bash
npm run prisma:generate
```

Expected: Prisma client generates without schema errors.

- [ ] **Step 6: Commit schema**

Run:

```bash
git add prisma src/lib/db.ts .env package-lock.json package.json
git commit -m "feat: add price watcher database schema"
```

Expected: commit succeeds.

---

### Task 3: Domain Types and Price Helpers

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/money.ts`
- Create: `tests/unit/money.test.ts`

- [ ] **Step 1: Write price parsing tests**

Use this file content:

```ts
// tests/unit/money.test.ts
import { describe, expect, it } from "vitest";
import { formatCny, parsePriceToCents } from "@/lib/money";

describe("money helpers", () => {
  it("parses plain yuan prices to cents", () => {
    expect(parsePriceToCents("1299")).toBe(129900);
    expect(parsePriceToCents("1299.50")).toBe(129950);
  });

  it("parses prices with currency symbols and separators", () => {
    expect(parsePriceToCents("¥5,499.00")).toBe(549900);
    expect(parsePriceToCents("￥89.9")).toBe(8990);
  });

  it("returns null for invalid prices", () => {
    expect(parsePriceToCents("到手价咨询客服")).toBeNull();
    expect(parsePriceToCents("")).toBeNull();
  });

  it("formats cents as CNY", () => {
    expect(formatCny(549900)).toBe("¥5,499.00");
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm run test -- tests/unit/money.test.ts
```

Expected: FAIL because `src/lib/money.ts` does not exist.

- [ ] **Step 3: Create shared types**

Use this file content:

```ts
// src/lib/types.ts
export type QueryType = "KEYWORD" | "URL";

export type ShopType =
  | "SELF_OPERATED"
  | "FLAGSHIP"
  | "BRAND"
  | "MARKETPLACE"
  | "UNKNOWN";

export type PlatformCandidate = {
  platform: string;
  externalId: string;
  title: string;
  price: number;
  currency: "CNY";
  shopName: string;
  shopType: ShopType;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  productUrl: string;
  imageUrl?: string;
  rawMetadata: Record<string, unknown>;
  collectedAt: Date;
};

export type AdapterResult = {
  platform: string;
  candidates: PlatformCandidate[];
  status: PlatformAdapterStatus;
};

export type PlatformAdapterStatus = {
  platform: string;
  ok: boolean;
  latencyMs: number;
  errorCode?: string;
  errorMessage?: string;
};

export type ScoredCandidate = PlatformCandidate & {
  matchScore: number;
  trustScore: number;
  trustReasons: string[];
  recommendedScore: number;
};
```

- [ ] **Step 4: Create money helpers**

Use this file content:

```ts
// src/lib/money.ts
export function parsePriceToCents(input: string): number | null {
  const cleaned = input.replace(/[¥￥,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }

  return Math.round(Number(cleaned) * 100);
}

export function formatCny(cents: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY"
  }).format(cents / 100);
}
```

- [ ] **Step 5: Run the test**

Run:

```bash
npm run test -- tests/unit/money.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit domain helpers**

Run:

```bash
git add src/lib/types.ts src/lib/money.ts tests/unit/money.test.ts
git commit -m "feat: add money parsing helpers"
```

Expected: commit succeeds.

---

### Task 4: Scoring and Ranking

**Files:**
- Create: `src/lib/scoring/trustScore.ts`
- Create: `src/lib/scoring/matchScore.ts`
- Create: `src/lib/scoring/rankCandidates.ts`
- Create: `tests/unit/trustScore.test.ts`
- Create: `tests/unit/matchScore.test.ts`
- Create: `tests/unit/rankCandidates.test.ts`

- [ ] **Step 1: Write trust score tests**

Use this file content:

```ts
// tests/unit/trustScore.test.ts
import { describe, expect, it } from "vitest";
import { calculateTrustScore } from "@/lib/scoring/trustScore";
import type { PlatformCandidate } from "@/lib/types";

const baseCandidate: PlatformCandidate = {
  platform: "JD",
  externalId: "jd-1",
  title: "iPhone 16 256G 黑色",
  price: 599900,
  currency: "CNY",
  shopName: "Apple 京东自营旗舰店",
  shopType: "SELF_OPERATED",
  salesCount: 50000,
  rating: 4.9,
  reviewCount: 20000,
  productUrl: "https://example.com/jd-1",
  imageUrl: "https://example.com/jd-1.jpg",
  rawMetadata: {},
  collectedAt: new Date("2026-05-23T00:00:00.000Z")
};

describe("calculateTrustScore", () => {
  it("scores complete self-operated products highly", () => {
    const result = calculateTrustScore(baseCandidate, 610000);
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.reasons).toContain("自营或旗舰店");
  });

  it("downgrades very low prices compared with median", () => {
    const result = calculateTrustScore({ ...baseCandidate, price: 299900 }, 610000);
    expect(result.score).toBeLessThan(85);
    expect(result.reasons).toContain("价格显著低于同类中位价");
  });

  it("downgrades sparse review information", () => {
    const result = calculateTrustScore(
      { ...baseCandidate, shopType: "UNKNOWN", rating: undefined, reviewCount: undefined, salesCount: undefined },
      610000
    );
    expect(result.score).toBeLessThan(70);
    expect(result.reasons).toContain("评价信息不足");
  });
});
```

- [ ] **Step 2: Write match score tests**

Use this file content:

```ts
// tests/unit/matchScore.test.ts
import { describe, expect, it } from "vitest";
import { calculateMatchScore } from "@/lib/scoring/matchScore";

describe("calculateMatchScore", () => {
  it("scores exact keyword overlap highly", () => {
    expect(calculateMatchScore("iPhone 16 256G 黑色", "Apple iPhone 16 256G 黑色 官方正品")).toBeGreaterThanOrEqual(80);
  });

  it("scores unrelated products low", () => {
    expect(calculateMatchScore("iPhone 16 256G", "小米空气净化器滤芯")).toBeLessThan(30);
  });
});
```

- [ ] **Step 3: Write ranking tests**

Use this file content:

```ts
// tests/unit/rankCandidates.test.ts
import { describe, expect, it } from "vitest";
import { rankCandidates } from "@/lib/scoring/rankCandidates";
import type { ScoredCandidate } from "@/lib/types";

function candidate(title: string, price: number, trustScore: number, matchScore: number): ScoredCandidate {
  return {
    platform: title,
    externalId: title,
    title,
    price,
    currency: "CNY",
    shopName: title,
    shopType: "UNKNOWN",
    productUrl: `https://example.com/${title}`,
    rawMetadata: {},
    collectedAt: new Date("2026-05-23T00:00:00.000Z"),
    trustScore,
    matchScore,
    trustReasons: [],
    recommendedScore: 0
  };
}

describe("rankCandidates", () => {
  it("does not rank a suspicious cheap result first by recommendation", () => {
    const ranked = rankCandidates([
      candidate("trusted", 580000, 92, 90),
      candidate("suspicious", 300000, 35, 90)
    ]);

    expect(ranked[0].title).toBe("trusted");
    expect(ranked[0].recommendedScore).toBeGreaterThan(ranked[1].recommendedScore);
  });
});
```

- [ ] **Step 4: Run failing tests**

Run:

```bash
npm run test -- tests/unit/trustScore.test.ts tests/unit/matchScore.test.ts tests/unit/rankCandidates.test.ts
```

Expected: FAIL because scoring modules do not exist.

- [ ] **Step 5: Create scoring modules**

Use these file contents:

```ts
// src/lib/scoring/matchScore.ts
function tokenize(input: string): string[] {
  const normalized = input.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ");
  const latinTokens = normalized.split(/\s+/).filter(Boolean);
  const compact = normalized.replace(/\s+/g, "");
  const cjkTokens = compact.match(/[\p{Script=Han}]{2,}/gu) ?? [];
  return Array.from(new Set([...latinTokens, ...cjkTokens]));
}

export function calculateMatchScore(query: string, title: string): number {
  const queryTokens = tokenize(query);
  const titleText = title.toLowerCase();

  if (queryTokens.length === 0) {
    return 0;
  }

  const hits = queryTokens.filter((token) => titleText.includes(token));
  return Math.min(100, Math.round((hits.length / queryTokens.length) * 100));
}
```

```ts
// src/lib/scoring/trustScore.ts
import type { PlatformCandidate } from "@/lib/types";

export function calculateTrustScore(candidate: PlatformCandidate, medianPrice: number): { score: number; reasons: string[] } {
  let score = 45;
  const reasons: string[] = [];

  if (candidate.shopType === "SELF_OPERATED" || candidate.shopType === "FLAGSHIP") {
    score += 20;
    reasons.push("自营或旗舰店");
  } else if (candidate.shopType === "BRAND") {
    score += 14;
    reasons.push("品牌店铺");
  }

  if ((candidate.reviewCount ?? 0) >= 1000 && (candidate.rating ?? 0) >= 4.7) {
    score += 15;
    reasons.push("评价数量和评分较好");
  } else if (candidate.reviewCount == null || candidate.rating == null) {
    score -= 12;
    reasons.push("评价信息不足");
  }

  if ((candidate.salesCount ?? 0) >= 10000) {
    score += 10;
    reasons.push("销量较高");
  } else if (candidate.salesCount == null) {
    score -= 6;
    reasons.push("销量信息不足");
  }

  if (candidate.price < medianPrice * 0.65) {
    score -= 25;
    reasons.push("价格显著低于同类中位价");
  } else if (candidate.price <= medianPrice) {
    score += 5;
    reasons.push("价格不高于同类中位价");
  }

  if (candidate.imageUrl && candidate.shopName && candidate.productUrl) {
    score += 5;
    reasons.push("商品信息完整");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons
  };
}
```

```ts
// src/lib/scoring/rankCandidates.ts
import type { ScoredCandidate } from "@/lib/types";

export function rankCandidates(candidates: ScoredCandidate[]): ScoredCandidate[] {
  if (candidates.length === 0) {
    return [];
  }

  const lowestPrice = Math.min(...candidates.map((candidate) => candidate.price));

  return candidates
    .map((candidate) => {
      const priceAdvantage = Math.min(100, Math.round((lowestPrice / candidate.price) * 100));
      const recommendedScore = Math.round(
        candidate.trustScore * 0.45 + candidate.matchScore * 0.35 + priceAdvantage * 0.2
      );

      return { ...candidate, recommendedScore };
    })
    .sort((a, b) => b.recommendedScore - a.recommendedScore);
}
```

- [ ] **Step 6: Run scoring tests**

Run:

```bash
npm run test -- tests/unit/trustScore.test.ts tests/unit/matchScore.test.ts tests/unit/rankCandidates.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit scoring**

Run:

```bash
git add src/lib/scoring tests/unit
git commit -m "feat: add product scoring and ranking"
```

Expected: commit succeeds.

---

### Task 5: Platform Adapter Contract and Sample Adapters

**Files:**
- Create: `src/lib/adapters/platformAdapter.ts`
- Create: `src/lib/adapters/sampleData.ts`
- Create: `src/lib/adapters/jdAdapter.ts`
- Create: `src/lib/adapters/pddAdapter.ts`
- Create: `src/lib/adapters/taobaoAdapter.ts`
- Create: `src/lib/adapters/index.ts`

- [ ] **Step 1: Create adapter contract**

Use this file content:

```ts
// src/lib/adapters/platformAdapter.ts
import type { AdapterResult } from "@/lib/types";

export type PlatformAdapter = {
  platform: string;
  search(query: string): Promise<AdapterResult>;
};
```

- [ ] **Step 2: Create sample catalog**

Use this file content:

```ts
// src/lib/adapters/sampleData.ts
import type { PlatformCandidate } from "@/lib/types";

type SampleItem = Omit<PlatformCandidate, "collectedAt">;

export const sampleCatalog: Record<string, SampleItem[]> = {
  JD: [
    {
      platform: "JD",
      externalId: "jd-iphone-16-256-black",
      title: "Apple iPhone 16 256G 黑色 京东自营",
      price: 599900,
      currency: "CNY",
      shopName: "Apple 京东自营旗舰店",
      shopType: "SELF_OPERATED",
      salesCount: 50000,
      rating: 4.9,
      reviewCount: 23000,
      productUrl: "https://example.com/jd/iphone-16-256-black",
      imageUrl: "https://placehold.co/320x240?text=JD+iPhone",
      rawMetadata: { source: "sample" }
    }
  ],
  PDD: [
    {
      platform: "PDD",
      externalId: "pdd-iphone-16-256-black",
      title: "Apple iPhone16 256G 黑色 百亿补贴",
      price: 569900,
      currency: "CNY",
      shopName: "品牌好货店",
      shopType: "MARKETPLACE",
      salesCount: 18000,
      rating: 4.6,
      reviewCount: 7200,
      productUrl: "https://example.com/pdd/iphone-16-256-black",
      imageUrl: "https://placehold.co/320x240?text=PDD+iPhone",
      rawMetadata: { source: "sample" }
    }
  ],
  Taobao: [
    {
      platform: "Taobao",
      externalId: "tb-iphone-16-256-black",
      title: "Apple iPhone 16 256GB 黑色 天猫旗舰店",
      price: 609900,
      currency: "CNY",
      shopName: "Apple Store 官方旗舰店",
      shopType: "FLAGSHIP",
      salesCount: 32000,
      rating: 4.9,
      reviewCount: 15000,
      productUrl: "https://example.com/taobao/iphone-16-256-black",
      imageUrl: "https://placehold.co/320x240?text=Taobao+iPhone",
      rawMetadata: { source: "sample" }
    }
  ]
};
```

- [ ] **Step 3: Create sample adapter factory and platform adapters**

Use these file contents:

```ts
// src/lib/adapters/jdAdapter.ts
import { sampleCatalog } from "@/lib/adapters/sampleData";
import type { PlatformAdapter } from "@/lib/adapters/platformAdapter";

export const jdAdapter: PlatformAdapter = {
  platform: "JD",
  async search() {
    const startedAt = Date.now();
    return {
      platform: "JD",
      candidates: sampleCatalog.JD.map((item) => ({ ...item, collectedAt: new Date() })),
      status: { platform: "JD", ok: true, latencyMs: Date.now() - startedAt }
    };
  }
};
```

```ts
// src/lib/adapters/pddAdapter.ts
import { sampleCatalog } from "@/lib/adapters/sampleData";
import type { PlatformAdapter } from "@/lib/adapters/platformAdapter";

export const pddAdapter: PlatformAdapter = {
  platform: "PDD",
  async search() {
    const startedAt = Date.now();
    return {
      platform: "PDD",
      candidates: sampleCatalog.PDD.map((item) => ({ ...item, collectedAt: new Date() })),
      status: { platform: "PDD", ok: true, latencyMs: Date.now() - startedAt }
    };
  }
};
```

```ts
// src/lib/adapters/taobaoAdapter.ts
import { sampleCatalog } from "@/lib/adapters/sampleData";
import type { PlatformAdapter } from "@/lib/adapters/platformAdapter";

export const taobaoAdapter: PlatformAdapter = {
  platform: "Taobao",
  async search() {
    const startedAt = Date.now();
    return {
      platform: "Taobao",
      candidates: sampleCatalog.Taobao.map((item) => ({ ...item, collectedAt: new Date() })),
      status: { platform: "Taobao", ok: true, latencyMs: Date.now() - startedAt }
    };
  }
};
```

```ts
// src/lib/adapters/index.ts
import { jdAdapter } from "@/lib/adapters/jdAdapter";
import { pddAdapter } from "@/lib/adapters/pddAdapter";
import { taobaoAdapter } from "@/lib/adapters/taobaoAdapter";

export const enabledAdapters = [jdAdapter, pddAdapter, taobaoAdapter];
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 5: Commit adapters**

Run:

```bash
git add src/lib/adapters
git commit -m "feat: add platform adapter contract"
```

Expected: commit succeeds.

---

### Task 6: Search Service and API

**Files:**
- Create: `src/lib/search/searchService.ts`
- Create: `src/app/api/search/route.ts`
- Create: `src/app/api/search/[id]/route.ts`
- Create: `tests/api/search.test.ts`

- [ ] **Step 1: Write API test**

Use this file content:

```ts
// tests/api/search.test.ts
import { describe, expect, it } from "vitest";
import { createSearchSession, getSearchSession } from "@/lib/search/searchService";

describe("search service", () => {
  it("creates a search session with ranked candidates", async () => {
    const session = await createSearchSession("iPhone 16 256G");
    expect(session.query).toBe("iPhone 16 256G");
    expect(session.candidates.length).toBe(3);
    expect(session.candidates[0].recommendedScore).toBeGreaterThan(0);
    expect(session.platformStatuses.length).toBe(3);

    const fetched = await getSearchSession(session.id);
    expect(fetched?.id).toBe(session.id);
    expect(fetched?.candidates.length).toBe(3);
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm run test -- tests/api/search.test.ts
```

Expected: FAIL because search service does not exist.

- [ ] **Step 3: Create search service**

Use this file content:

```ts
// src/lib/search/searchService.ts
import { prisma } from "@/lib/db";
import { enabledAdapters } from "@/lib/adapters";
import { calculateMatchScore } from "@/lib/scoring/matchScore";
import { calculateTrustScore } from "@/lib/scoring/trustScore";
import { rankCandidates } from "@/lib/scoring/rankCandidates";
import type { PlatformCandidate, QueryType, ScoredCandidate } from "@/lib/types";

function detectQueryType(query: string): QueryType {
  return /^https?:\/\//i.test(query) ? "URL" : "KEYWORD";
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

function scoreCandidates(query: string, candidates: PlatformCandidate[]): ScoredCandidate[] {
  const medianPrice = median(candidates.map((candidate) => candidate.price));
  return rankCandidates(
    candidates.map((candidate) => {
      const trust = calculateTrustScore(candidate, medianPrice);
      return {
        ...candidate,
        matchScore: calculateMatchScore(query, candidate.title),
        trustScore: trust.score,
        trustReasons: trust.reasons,
        recommendedScore: 0
      };
    })
  );
}

export async function createSearchSession(query: string) {
  const adapterResults = await Promise.all(enabledAdapters.map((adapter) => adapter.search(query)));
  const candidates = scoreCandidates(
    query,
    adapterResults.flatMap((result) => result.candidates)
  );

  const session = await prisma.searchSession.create({
    data: {
      query,
      queryType: detectQueryType(query),
      resultCount: candidates.length,
      platformStatuses: adapterResults.map((result) => result.status),
      candidates: {
        create: candidates.map((candidate) => ({
          platform: candidate.platform,
          externalId: candidate.externalId,
          title: candidate.title,
          price: candidate.price,
          currency: candidate.currency,
          shopName: candidate.shopName,
          shopType: candidate.shopType,
          salesCount: candidate.salesCount,
          rating: candidate.rating,
          reviewCount: candidate.reviewCount,
          productUrl: candidate.productUrl,
          imageUrl: candidate.imageUrl,
          matchScore: candidate.matchScore,
          trustScore: candidate.trustScore,
          trustReasons: candidate.trustReasons,
          rawMetadata: candidate.rawMetadata,
          collectedAt: candidate.collectedAt
        }))
      }
    },
    include: { candidates: true }
  });

  return {
    ...session,
    platformStatuses: adapterResults.map((result) => result.status),
    candidates: session.candidates.map((candidate) => ({
      ...candidate,
      recommendedScore: candidates.find((item) => item.externalId === candidate.externalId)?.recommendedScore ?? 0
    }))
  };
}

export async function getSearchSession(id: string) {
  const session = await prisma.searchSession.findUnique({
    where: { id },
    include: {
      candidates: {
        orderBy: [{ trustScore: "desc" }, { price: "asc" }]
      }
    }
  });

  if (!session) {
    return null;
  }

  return {
    ...session,
    candidates: session.candidates.map((candidate) => ({ ...candidate, recommendedScore: 0 }))
  };
}
```

- [ ] **Step 4: Create API routes**

Use these file contents:

```ts
// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSearchSession } from "@/lib/search/searchService";

const requestSchema = z.object({
  query: z.string().trim().min(1)
});

export async function POST(request: Request) {
  const body = requestSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "请输入商品关键词或链接" }, { status: 400 });
  }

  const session = await createSearchSession(body.data.query);
  return NextResponse.json(session);
}
```

```ts
// src/app/api/search/[id]/route.ts
import { NextResponse } from "next/server";
import { getSearchSession } from "@/lib/search/searchService";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const session = await getSearchSession(context.params.id);
  if (!session) {
    return NextResponse.json({ error: "搜索记录不存在" }, { status: 404 });
  }

  return NextResponse.json(session);
}
```

- [ ] **Step 5: Run search tests**

Run:

```bash
npm run test -- tests/api/search.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit search API**

Run:

```bash
git add src/lib/search src/app/api/search tests/api/search.test.ts
git commit -m "feat: add search orchestration api"
```

Expected: commit succeeds.

---

### Task 7: Watch Service, Refresh, and Alerts

**Files:**
- Create: `src/lib/watch/watchService.ts`
- Create: `src/app/api/watches/route.ts`
- Create: `src/app/api/watches/[id]/route.ts`
- Create: `src/app/api/watches/[id]/refresh/route.ts`
- Create: `src/app/api/alerts/route.ts`
- Create: `src/app/api/alerts/[id]/read/route.ts`
- Create: `tests/unit/watchService.test.ts`
- Create: `tests/api/watch.test.ts`

- [ ] **Step 1: Write watch service tests**

Use this file content:

```ts
// tests/unit/watchService.test.ts
import { describe, expect, it } from "vitest";
import { createSearchSession } from "@/lib/search/searchService";
import { createWatch, refreshWatch } from "@/lib/watch/watchService";

describe("watch service", () => {
  it("creates snapshots and alert when refreshed price is below target", async () => {
    const session = await createSearchSession("iPhone 16 256G");
    const candidate = session.candidates[0];
    const watch = await createWatch({
      sourceCandidateId: candidate.id,
      query: session.query,
      targetPrice: candidate.price + 10000
    });

    const refreshed = await refreshWatch(watch.id);
    expect(refreshed.snapshots.length).toBeGreaterThan(0);
    expect(refreshed.alerts.length).toBe(1);
    expect(refreshed.alerts[0].triggerPrice).toBeLessThanOrEqual(watch.targetPrice);
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm run test -- tests/unit/watchService.test.ts
```

Expected: FAIL because watch service does not exist.

- [ ] **Step 3: Create watch service**

Use this file content:

```ts
// src/lib/watch/watchService.ts
import { prisma } from "@/lib/db";
import { createSearchSession } from "@/lib/search/searchService";

export type CreateWatchInput = {
  sourceCandidateId?: string;
  query: string;
  targetPrice: number;
};

export async function createWatch(input: CreateWatchInput) {
  return prisma.watchItem.create({
    data: {
      sourceCandidateId: input.sourceCandidateId,
      query: input.query,
      targetPrice: input.targetPrice
    }
  });
}

export async function listWatches() {
  return prisma.watchItem.findMany({
    orderBy: { createdAt: "desc" },
    include: { snapshots: { orderBy: { collectedAt: "desc" }, take: 1 }, alerts: { where: { readAt: null } } }
  });
}

export async function getWatch(id: string) {
  return prisma.watchItem.findUnique({
    where: { id },
    include: {
      snapshots: { orderBy: { collectedAt: "asc" } },
      alerts: { orderBy: { triggeredAt: "desc" } }
    }
  });
}

export async function refreshWatch(id: string) {
  const watch = await prisma.watchItem.findUnique({ where: { id } });
  if (!watch || !watch.enabled) {
    throw new Error("监控不存在或未启用");
  }

  const session = await createSearchSession(watch.query);
  const best = [...session.candidates].sort((a, b) => a.price - b.price)[0];

  const snapshot = await prisma.priceSnapshot.create({
    data: {
      watchItemId: watch.id,
      platform: best.platform,
      candidateTitle: best.title,
      price: best.price,
      currency: best.currency,
      productUrl: best.productUrl,
      trustScore: best.trustScore
    }
  });

  const existingUnreadAlert = await prisma.alertEvent.findFirst({
    where: { watchItemId: watch.id, readAt: null, targetPrice: watch.targetPrice }
  });

  if (best.price <= watch.targetPrice && !existingUnreadAlert) {
    await prisma.alertEvent.create({
      data: {
        watchItemId: watch.id,
        platform: best.platform,
        triggerPrice: best.price,
        targetPrice: watch.targetPrice,
        productUrl: best.productUrl
      }
    });
  }

  await prisma.watchItem.update({
    where: { id: watch.id },
    data: { lastCheckedAt: new Date() }
  });

  return prisma.watchItem.findUniqueOrThrow({
    where: { id: watch.id },
    include: {
      snapshots: { orderBy: { collectedAt: "desc" } },
      alerts: { orderBy: { triggeredAt: "desc" } }
    }
  });
}

export async function listAlerts() {
  return prisma.alertEvent.findMany({
    orderBy: { triggeredAt: "desc" },
    include: { watchItem: true }
  });
}

export async function markAlertRead(id: string) {
  return prisma.alertEvent.update({
    where: { id },
    data: { readAt: new Date() }
  });
}
```

- [ ] **Step 4: Create API routes**

Use these file contents:

```ts
// src/app/api/watches/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createWatch, listWatches } from "@/lib/watch/watchService";

const createWatchSchema = z.object({
  sourceCandidateId: z.string().optional(),
  query: z.string().min(1),
  targetPrice: z.number().int().positive()
});

export async function GET() {
  return NextResponse.json(await listWatches());
}

export async function POST(request: Request) {
  const body = createWatchSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "监控参数无效" }, { status: 400 });
  }

  return NextResponse.json(await createWatch(body.data), { status: 201 });
}
```

```ts
// src/app/api/watches/[id]/route.ts
import { NextResponse } from "next/server";
import { getWatch } from "@/lib/watch/watchService";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const watch = await getWatch(context.params.id);
  if (!watch) {
    return NextResponse.json({ error: "监控不存在" }, { status: 404 });
  }

  return NextResponse.json(watch);
}
```

```ts
// src/app/api/watches/[id]/refresh/route.ts
import { NextResponse } from "next/server";
import { refreshWatch } from "@/lib/watch/watchService";

export async function POST(_request: Request, context: { params: { id: string } }) {
  try {
    return NextResponse.json(await refreshWatch(context.params.id));
  } catch {
    return NextResponse.json({ error: "刷新监控失败" }, { status: 400 });
  }
}
```

```ts
// src/app/api/alerts/route.ts
import { NextResponse } from "next/server";
import { listAlerts } from "@/lib/watch/watchService";

export async function GET() {
  return NextResponse.json(await listAlerts());
}
```

```ts
// src/app/api/alerts/[id]/read/route.ts
import { NextResponse } from "next/server";
import { markAlertRead } from "@/lib/watch/watchService";

export async function POST(_request: Request, context: { params: { id: string } }) {
  return NextResponse.json(await markAlertRead(context.params.id));
}
```

- [ ] **Step 5: Write watch API test**

Use this file content:

```ts
// tests/api/watch.test.ts
import { describe, expect, it } from "vitest";
import { createSearchSession } from "@/lib/search/searchService";
import { createWatch, listAlerts, markAlertRead, refreshWatch } from "@/lib/watch/watchService";

describe("watch api service functions", () => {
  it("creates alert and marks it read", async () => {
    const session = await createSearchSession("iPhone 16 256G");
    const candidate = session.candidates[0];
    const watch = await createWatch({
      sourceCandidateId: candidate.id,
      query: session.query,
      targetPrice: candidate.price + 5000
    });

    await refreshWatch(watch.id);
    const alerts = await listAlerts();
    const alert = alerts.find((item) => item.watchItemId === watch.id);
    expect(alert).toBeDefined();

    const read = await markAlertRead(alert!.id);
    expect(read.readAt).toBeTruthy();
  });
});
```

- [ ] **Step 6: Run watch tests**

Run:

```bash
npm run test -- tests/unit/watchService.test.ts tests/api/watch.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit watch APIs**

Run:

```bash
git add src/lib/watch src/app/api/watches src/app/api/alerts tests/unit/watchService.test.ts tests/api/watch.test.ts
git commit -m "feat: add price watch and alert services"
```

Expected: commit succeeds.

---

### Task 8: Core UI Pages and Components

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/search/[id]/page.tsx`
- Create: `src/app/watch/[id]/page.tsx`
- Create: `src/app/alerts/page.tsx`
- Create: `src/components/SearchBox.tsx`
- Create: `src/components/ResultCard.tsx`
- Create: `src/components/SortControl.tsx`
- Create: `src/components/TrustBadge.tsx`
- Create: `src/components/WatchForm.tsx`
- Create: `src/components/PriceHistoryChart.tsx`
- Create: `src/components/AlertList.tsx`

- [ ] **Step 1: Create app layout**

Use this file content:

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PriceWatcher",
  description: "Compare prices and watch target prices"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b border-line bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-semibold text-ink">PriceWatcher</Link>
            <div className="flex gap-4 text-sm text-muted">
              <Link href="/">搜索</Link>
              <Link href="/alerts">提醒中心</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create search box**

Use this file content:

```tsx
// src/components/SearchBox.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const session = await response.json();
    router.push(`/search/${session.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-3">
      <input
        aria-label="商品关键词或链接"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="min-h-12 flex-1 rounded-md border border-line px-4 text-base"
      />
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-md bg-accent px-5 font-medium text-white disabled:opacity-60"
      >
        {loading ? "搜索中" : "搜索"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create display components**

Use these file contents:

```tsx
// src/components/TrustBadge.tsx
export function TrustBadge({ score, reasons }: { score: number; reasons: string[] }) {
  const tone = score >= 80 ? "bg-emerald-50 text-emerald-700" : score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700";
  return (
    <div className={`rounded-md px-3 py-2 text-sm ${tone}`}>
      <div className="font-semibold">可信度 {score}</div>
      <div className="mt-1 text-xs">{reasons.slice(0, 2).join(" / ") || "信息较少"}</div>
    </div>
  );
}
```

```tsx
// src/components/ResultCard.tsx
import { formatCny } from "@/lib/money";
import { TrustBadge } from "@/components/TrustBadge";
import { WatchForm } from "@/components/WatchForm";

type CandidateView = {
  id: string;
  platform: string;
  title: string;
  price: number;
  shopName: string;
  salesCount: number | null;
  rating: number | null;
  reviewCount: number | null;
  productUrl: string;
  imageUrl: string | null;
  trustScore: number;
  matchScore: number;
  trustReasons: unknown;
};

export function ResultCard({ candidate, query }: { candidate: CandidateView; query: string }) {
  const reasons = Array.isArray(candidate.trustReasons) ? candidate.trustReasons.map(String) : [];
  return (
    <article className="grid gap-4 rounded-md border border-line bg-white p-4 md:grid-cols-[160px_1fr_220px]">
      <img
        src={candidate.imageUrl ?? "https://placehold.co/320x240?text=Product"}
        alt=""
        className="h-36 w-full rounded-md object-cover"
      />
      <div>
        <div className="text-sm font-medium text-accent">{candidate.platform}</div>
        <h2 className="mt-1 text-lg font-semibold text-ink">{candidate.title}</h2>
        <p className="mt-2 text-sm text-muted">{candidate.shopName}</p>
        <p className="mt-2 text-sm text-muted">
          销量 {candidate.salesCount ?? "未知"} · 评分 {candidate.rating ?? "未知"} · 评价 {candidate.reviewCount ?? "未知"} · 匹配 {candidate.matchScore}
        </p>
        <a href={candidate.productUrl} target="_blank" className="mt-3 inline-block text-sm text-accent">
          打开商品
        </a>
      </div>
      <div className="space-y-3">
        <div className="text-2xl font-bold text-ink">{formatCny(candidate.price)}</div>
        <TrustBadge score={candidate.trustScore} reasons={reasons} />
        <WatchForm candidateId={candidate.id} query={query} defaultPrice={candidate.price} />
      </div>
    </article>
  );
}
```

```tsx
// src/components/WatchForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WatchForm({ candidateId, query, defaultPrice }: { candidateId: string; query: string; defaultPrice: number }) {
  const router = useRouter();
  const [targetPrice, setTargetPrice] = useState(Math.floor(defaultPrice / 100));

  async function createWatch() {
    const response = await fetch("/api/watches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceCandidateId: candidateId,
        query,
        targetPrice: targetPrice * 100
      })
    });
    const watch = await response.json();
    router.push(`/watch/${watch.id}`);
  }

  return (
    <div className="space-y-2">
      <input
        type="number"
        value={targetPrice}
        onChange={(event) => setTargetPrice(Number(event.target.value))}
        className="h-10 w-full rounded-md border border-line px-3"
      />
      <button onClick={createWatch} className="h-10 w-full rounded-md bg-ink px-3 text-sm font-medium text-white">
        监控目标价
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create pages**

Use these file contents:

```tsx
// src/app/page.tsx
import { SearchBox } from "@/components/SearchBox";
import { listWatches } from "@/lib/watch/watchService";
import Link from "next/link";
import { formatCny } from "@/lib/money";

export default async function HomePage() {
  const watches = await listWatches();
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-ink">搜索商品，全网比价</h1>
        <SearchBox />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">正在监控</h2>
        <div className="grid gap-3">
          {watches.map((watch) => (
            <Link key={watch.id} href={`/watch/${watch.id}`} className="rounded-md border border-line bg-white p-4">
              <div className="font-medium">{watch.query}</div>
              <div className="mt-1 text-sm text-muted">目标价 {formatCny(watch.targetPrice)}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
```

```tsx
// src/app/search/[id]/page.tsx
import { ResultCard } from "@/components/ResultCard";
import { getSearchSession } from "@/lib/search/searchService";
import { notFound } from "next/navigation";

export default async function SearchResultsPage({ params }: { params: { id: string } }) {
  const session = await getSearchSession(params.id);
  if (!session) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">比价结果</h1>
        <p className="mt-1 text-sm text-muted">搜索：{session.query}</p>
      </div>
      <div className="space-y-4">
        {session.candidates.map((candidate) => (
          <ResultCard key={candidate.id} candidate={candidate} query={session.query} />
        ))}
      </div>
    </div>
  );
}
```

```tsx
// src/components/PriceHistoryChart.tsx
"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function PriceHistoryChart({ data }: { data: { collectedAt: Date; price: number }[] }) {
  const chartData = data.map((item) => ({
    time: new Date(item.collectedAt).toLocaleString("zh-CN"),
    price: item.price / 100
  }));

  return (
    <div className="h-72 rounded-md border border-line bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="time" hide />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#157f72" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

```tsx
// src/app/watch/[id]/page.tsx
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { formatCny } from "@/lib/money";
import { getWatch, refreshWatch } from "@/lib/watch/watchService";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export default async function WatchPage({ params }: { params: { id: string } }) {
  const watch = await getWatch(params.id);
  if (!watch) notFound();

  async function refresh() {
    "use server";
    await refreshWatch(params.id);
    revalidatePath(`/watch/${params.id}`);
  }

  const latest = watch.snapshots[watch.snapshots.length - 1];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{watch.query}</h1>
          <p className="mt-1 text-sm text-muted">目标价 {formatCny(watch.targetPrice)}</p>
          {latest && <p className="mt-1 text-sm text-muted">当前最优价 {formatCny(latest.price)}</p>}
        </div>
        <form action={refresh}>
          <button className="rounded-md bg-accent px-4 py-2 text-white">刷新价格</button>
        </form>
      </div>
      <PriceHistoryChart data={watch.snapshots} />
      <section className="rounded-md border border-line bg-white p-4">
        <h2 className="font-semibold">提醒记录</h2>
        <div className="mt-3 space-y-2">
          {watch.alerts.map((alert) => (
            <div key={alert.id} className="text-sm text-muted">
              {alert.platform} 在 {new Date(alert.triggeredAt).toLocaleString("zh-CN")} 触发，价格 {formatCny(alert.triggerPrice)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

```tsx
// src/components/AlertList.tsx
import { formatCny } from "@/lib/money";

type AlertView = {
  id: string;
  platform: string;
  triggerPrice: number;
  targetPrice: number;
  productUrl: string;
  triggeredAt: Date;
  readAt: Date | null;
  watchItem: { query: string };
};

export function AlertList({ alerts }: { alerts: AlertView[] }) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <article key={alert.id} className="rounded-md border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-ink">{alert.watchItem.query}</h2>
              <p className="mt-1 text-sm text-muted">
                {alert.platform} 价格 {formatCny(alert.triggerPrice)}，目标价 {formatCny(alert.targetPrice)}
              </p>
            </div>
            <span className="text-sm text-muted">{alert.readAt ? "已读" : "未读"}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
```

```tsx
// src/app/alerts/page.tsx
import { AlertList } from "@/components/AlertList";
import { listAlerts } from "@/lib/watch/watchService";

export default async function AlertsPage() {
  const alerts = await listAlerts();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-ink">提醒中心</h1>
      <AlertList alerts={alerts} />
    </div>
  );
}
```

- [ ] **Step 5: Create sort control component**

Use this file content:

```tsx
// src/components/SortControl.tsx
"use client";

export type SortMode = "recommended" | "price" | "trust" | "sales";

export function SortControl({ value, onChange }: { value: SortMode; onChange: (value: SortMode) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {[
        ["recommended", "综合推荐"],
        ["price", "最低价"],
        ["trust", "可信度"],
        ["sales", "销量"]
      ].map(([mode, label]) => (
        <button
          key={mode}
          onClick={() => onChange(mode as SortMode)}
          className={`rounded-md border px-3 py-2 text-sm ${value === mode ? "border-accent bg-accent text-white" : "border-line bg-white text-ink"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 7: Commit UI**

Run:

```bash
git add src/app src/components src/app/globals.css
git commit -m "feat: add price watcher web interface"
```

Expected: commit succeeds.

---

### Task 9: End-to-End Workflow Test

**Files:**
- Create: `tests/e2e/price-watcher.spec.ts`

- [ ] **Step 1: Write browser workflow test**

Use this file content:

```ts
// tests/e2e/price-watcher.spec.ts
import { expect, test } from "@playwright/test";

test("searches product and creates a price watch", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("商品关键词或链接").fill("iPhone 16 256G");
  await page.getByRole("button", { name: "搜索" }).click();

  await expect(page.getByRole("heading", { name: "比价结果" })).toBeVisible();
  await expect(page.getByText("Apple iPhone 16")).toBeVisible();
  await expect(page.getByText(/可信度/)).toBeVisible();

  await page.getByRole("button", { name: "监控目标价" }).first().click();
  await expect(page.getByRole("heading", { name: "iPhone 16 256G" })).toBeVisible();

  await page.getByRole("button", { name: "刷新价格" }).click();
  await expect(page.getByText("提醒记录")).toBeVisible();
});
```

- [ ] **Step 2: Run end-to-end test**

Run:

```bash
npm run test:e2e
```

Expected: PASS in Chromium.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run test
npm run build
npm run test:e2e
```

Expected: all commands PASS.

- [ ] **Step 4: Commit tests**

Run:

```bash
git add tests/e2e playwright.config.ts
git commit -m "test: cover price watcher workflow"
```

Expected: commit succeeds.

---

### Task 10: Final Polish and Documentation

**Files:**
- Create: `README.md`
- Modify: `src/app/search/[id]/page.tsx`
- Modify: `src/components/SortControl.tsx`

- [ ] **Step 1: Wire client-side sorting into results page**

Create a client component `src/components/SearchResults.tsx` with this content:

```tsx
// src/components/SearchResults.tsx
"use client";

import { useMemo, useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { SortControl, type SortMode } from "@/components/SortControl";

type CandidateView = {
  id: string;
  platform: string;
  title: string;
  price: number;
  shopName: string;
  salesCount: number | null;
  rating: number | null;
  reviewCount: number | null;
  productUrl: string;
  imageUrl: string | null;
  trustScore: number;
  matchScore: number;
  trustReasons: unknown;
};

export function SearchResults({ query, candidates }: { query: string; candidates: CandidateView[] }) {
  const [sort, setSort] = useState<SortMode>("recommended");
  const sorted = useMemo(() => {
    return [...candidates].sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "trust") return b.trustScore - a.trustScore;
      if (sort === "sales") return (b.salesCount ?? 0) - (a.salesCount ?? 0);
      return b.trustScore + b.matchScore - (a.trustScore + a.matchScore);
    });
  }, [candidates, sort]);

  return (
    <div className="space-y-4">
      <SortControl value={sort} onChange={setSort} />
      {sorted.map((candidate) => (
        <ResultCard key={candidate.id} candidate={candidate} query={query} />
      ))}
    </div>
  );
}
```

Then replace the result list in `src/app/search/[id]/page.tsx`:

```tsx
import { SearchResults } from "@/components/SearchResults";
import { getSearchSession } from "@/lib/search/searchService";
import { notFound } from "next/navigation";

export default async function SearchResultsPage({ params }: { params: { id: string } }) {
  const session = await getSearchSession(params.id);
  if (!session) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">比价结果</h1>
        <p className="mt-1 text-sm text-muted">搜索：{session.query}</p>
      </div>
      <SearchResults query={session.query} candidates={session.candidates} />
    </div>
  );
}
```

- [ ] **Step 2: Create README**

Use this file content:

```md
# PriceWatcher

PriceWatcher is a single-user web MVP for comparing product prices, scoring result trustworthiness, and watching target prices.

## Features

- Search by product keyword or product link.
- Compare deterministic sample platform results from JD, PDD, and Taobao adapters.
- Rank results by trust and match quality.
- Create target-price watches.
- Refresh watches manually.
- Store price snapshots.
- Show in-app alert records.

## Run Locally

```bash
npm install
npm run prisma:migrate -- --name init
npm run dev
```

Open `http://127.0.0.1:3000`.

## Verify

```bash
npm run test
npm run build
npm run test:e2e
```

## Adapter Boundary

Real platform integrations should replace files in `src/lib/adapters/` while keeping the `PlatformAdapter` contract unchanged.
```

- [ ] **Step 3: Run final verification**

Run:

```bash
npm run test
npm run build
npm run test:e2e
```

Expected: all commands PASS.

- [ ] **Step 4: Commit polish**

Run:

```bash
git add README.md src/app/search/[id]/page.tsx src/components/SearchResults.tsx src/components/SortControl.tsx
git commit -m "docs: add mvp usage notes"
```

Expected: commit succeeds.

---

## Self-Review Notes

Spec coverage:

- Search by keyword or URL is covered by `SearchBox`, query type detection, and search API.
- 2-3 platform adapters are covered by JD, PDD, and Taobao sample adapters.
- Normalized product metadata is covered by `PlatformCandidate`, Prisma fields, and adapter contract.
- Trust score, match score, and recommended ranking are covered by scoring modules and unit tests.
- Comparison results page is covered by `SearchResultsPage`, `SearchResults`, and `ResultCard`.
- Watch creation, refresh, price snapshots, and alert events are covered by `watchService` and API routes.
- Watch detail page and alert center are covered by `/watch/[id]` and `/alerts`.
- Platform failure isolation is represented in adapter status fields and search session persistence; active failure simulation is not included in this MVP plan because sample adapters always return success.
- External push notifications, real scraping, auth, browser extension, and mobile app are excluded as required by the spec.

Verification commands:

```bash
npm run test
npm run build
npm run test:e2e
```

Expected result: all commands pass before the implementation is considered complete.
