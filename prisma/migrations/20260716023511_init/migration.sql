-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "originalTitle" TEXT NOT NULL,
    "originalBody" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "summaryKo" TEXT,
    "translationKo" TEXT,
    "codeExample" TEXT,
    "finalDraft" TEXT,
    "seoTitleLen" INTEGER,
    "seoScore" INTEGER,
    "seoIssues" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COLLECTED',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PipelineRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "collected" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_sourceUrl_key" ON "Post"("sourceUrl");
