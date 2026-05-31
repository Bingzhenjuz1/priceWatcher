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
