-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('draft', 'needs_verification', 'verified', 'published');

-- CreateEnum
CREATE TYPE "ImpactDirection" AS ENUM ('rise', 'decline', 'mixed', 'flat');

-- CreateTable
CREATE TABLE "DatabaseEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "dateDisplay" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "deepDive" TEXT NOT NULL,
    "persistence" TEXT NOT NULL,
    "soWhat" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatabaseEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Era" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Era_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketImpact" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "assetClass" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "direction" "ImpactDirection" NOT NULL,
    "magnitude" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "mechanism" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MarketImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatedEvent" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "relatedEntryId" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RelatedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossaryTerm" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDefinition" TEXT NOT NULL,

    CONSTRAINT "GlossaryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterIssue" (
    "id" TEXT NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "teaser" TEXT NOT NULL,
    "currentEventSummary" TEXT NOT NULL,
    "essayBody" TEXT NOT NULL,
    "whatToWatch" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DatabaseEntryToEventType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DatabaseEntryToEventType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DatabaseEntryToRegion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DatabaseEntryToRegion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DatabaseEntryToEra" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DatabaseEntryToEra_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DatabaseEntryToGlossaryTerm" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DatabaseEntryToGlossaryTerm_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DatabaseEntryToNewsletterIssue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DatabaseEntryToNewsletterIssue_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatabaseEntry_slug_key" ON "DatabaseEntry"("slug");

-- CreateIndex
CREATE INDEX "DatabaseEntry_verificationStatus_idx" ON "DatabaseEntry"("verificationStatus");

-- CreateIndex
CREATE INDEX "DatabaseEntry_startDate_idx" ON "DatabaseEntry"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "EventType_name_key" ON "EventType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventType_slug_key" ON "EventType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Era_name_key" ON "Era"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Era_slug_key" ON "Era"("slug");

-- CreateIndex
CREATE INDEX "MarketImpact_entryId_idx" ON "MarketImpact"("entryId");

-- CreateIndex
CREATE INDEX "MarketImpact_assetClass_idx" ON "MarketImpact"("assetClass");

-- CreateIndex
CREATE INDEX "RelatedEvent_relatedEntryId_idx" ON "RelatedEvent"("relatedEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "RelatedEvent_entryId_relatedEntryId_key" ON "RelatedEvent"("entryId", "relatedEntryId");

-- CreateIndex
CREATE INDEX "Source_entryId_idx" ON "Source"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "GlossaryTerm_term_key" ON "GlossaryTerm"("term");

-- CreateIndex
CREATE UNIQUE INDEX "GlossaryTerm_slug_key" ON "GlossaryTerm"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterIssue_issueNumber_key" ON "NewsletterIssue"("issueNumber");

-- CreateIndex
CREATE INDEX "NewsletterIssue_publishDate_idx" ON "NewsletterIssue"("publishDate");

-- CreateIndex
CREATE INDEX "_DatabaseEntryToEventType_B_index" ON "_DatabaseEntryToEventType"("B");

-- CreateIndex
CREATE INDEX "_DatabaseEntryToRegion_B_index" ON "_DatabaseEntryToRegion"("B");

-- CreateIndex
CREATE INDEX "_DatabaseEntryToEra_B_index" ON "_DatabaseEntryToEra"("B");

-- CreateIndex
CREATE INDEX "_DatabaseEntryToGlossaryTerm_B_index" ON "_DatabaseEntryToGlossaryTerm"("B");

-- CreateIndex
CREATE INDEX "_DatabaseEntryToNewsletterIssue_B_index" ON "_DatabaseEntryToNewsletterIssue"("B");

-- AddForeignKey
ALTER TABLE "MarketImpact" ADD CONSTRAINT "MarketImpact_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DatabaseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedEvent" ADD CONSTRAINT "RelatedEvent_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DatabaseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedEvent" ADD CONSTRAINT "RelatedEvent_relatedEntryId_fkey" FOREIGN KEY ("relatedEntryId") REFERENCES "DatabaseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DatabaseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatabaseEntryToEventType" ADD CONSTRAINT "_DatabaseEntryToEventType_A_fkey" FOREIGN KEY ("A") REFERENCES "DatabaseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatabaseEntryToEventType" ADD CONSTRAINT "_DatabaseEntryToEventType_B_fkey" FOREIGN KEY ("B") REFERENCES "EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatabaseEntryToRegion" ADD CONSTRAINT "_DatabaseEntryToRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "DatabaseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatabaseEntryToRegion" ADD CONSTRAINT "_DatabaseEntryToRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatabaseEntryToEra" ADD CONSTRAINT "_DatabaseEntryToEra_A_fkey" FOREIGN KEY ("A") REFERENCES "DatabaseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatabaseEntryToEra" ADD CONSTRAINT "_DatabaseEntryToEra_B_fkey" FOREIGN KEY ("B") REFERENCES "Era"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatabaseEntryToGlossaryTerm" ADD CONSTRAINT "_DatabaseEntryToGlossaryTerm_A_fkey" FOREIGN KEY ("A") REFERENCES "DatabaseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatabaseEntryToGlossaryTerm" ADD CONSTRAINT "_DatabaseEntryToGlossaryTerm_B_fkey" FOREIGN KEY ("B") REFERENCES "GlossaryTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatabaseEntryToNewsletterIssue" ADD CONSTRAINT "_DatabaseEntryToNewsletterIssue_A_fkey" FOREIGN KEY ("A") REFERENCES "DatabaseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatabaseEntryToNewsletterIssue" ADD CONSTRAINT "_DatabaseEntryToNewsletterIssue_B_fkey" FOREIGN KEY ("B") REFERENCES "NewsletterIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
