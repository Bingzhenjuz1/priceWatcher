-- CreateTable
CREATE TABLE "SearchSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "queryType" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "platformStatuses" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProductCandidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchSessionId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "shopName" TEXT NOT NULL,
    "shopType" TEXT NOT NULL,
    "salesCount" INTEGER,
    "rating" REAL,
    "reviewCount" INTEGER,
    "productUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "matchScore" INTEGER NOT NULL,
    "trustScore" INTEGER NOT NULL,
    "trustReasons" TEXT NOT NULL,
    "rawMetadata" TEXT NOT NULL,
    "collectedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductCandidate_searchSessionId_fkey" FOREIGN KEY ("searchSessionId") REFERENCES "SearchSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WatchItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceCandidateId" TEXT,
    "query" TEXT NOT NULL,
    "targetPrice" INTEGER NOT NULL,
    "checkInterval" INTEGER NOT NULL DEFAULT 3600,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" DATETIME,
    CONSTRAINT "WatchItem_sourceCandidateId_fkey" FOREIGN KEY ("sourceCandidateId") REFERENCES "ProductCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "watchItemId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "candidateTitle" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "productUrl" TEXT NOT NULL,
    "trustScore" INTEGER NOT NULL,
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceSnapshot_watchItemId_fkey" FOREIGN KEY ("watchItemId") REFERENCES "WatchItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlertEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "watchItemId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "triggerPrice" INTEGER NOT NULL,
    "targetPrice" INTEGER NOT NULL,
    "productUrl" TEXT NOT NULL,
    "triggeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    CONSTRAINT "AlertEvent_watchItemId_fkey" FOREIGN KEY ("watchItemId") REFERENCES "WatchItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlatformStatus" (
    "platform" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSuccessAt" DATETIME,
    "lastFailureAt" DATETIME,
    "lastErrorCode" TEXT,
    "lastErrorMessage" TEXT,
    "averageLatencyMs" INTEGER
);

-- CreateIndex
CREATE INDEX "ProductCandidate_searchSessionId_idx" ON "ProductCandidate"("searchSessionId");

-- CreateIndex
CREATE INDEX "ProductCandidate_platform_externalId_idx" ON "ProductCandidate"("platform", "externalId");

-- CreateIndex
CREATE INDEX "WatchItem_sourceCandidateId_idx" ON "WatchItem"("sourceCandidateId");

-- CreateIndex
CREATE INDEX "WatchItem_enabled_lastCheckedAt_idx" ON "WatchItem"("enabled", "lastCheckedAt");

-- CreateIndex
CREATE INDEX "PriceSnapshot_watchItemId_collectedAt_idx" ON "PriceSnapshot"("watchItemId", "collectedAt");

-- CreateIndex
CREATE INDEX "AlertEvent_watchItemId_readAt_idx" ON "AlertEvent"("watchItemId", "readAt");
