-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "MediaItem_uploadedBy_idx" ON "MediaItem"("uploadedBy");

-- CreateIndex
CREATE INDEX "NewsletterSend_status_idx" ON "NewsletterSend"("status");

-- CreateIndex
CREATE INDEX "Task_creatorId_idx" ON "Task"("creatorId");

-- CreateIndex
CREATE INDEX "WikiPage_parentId_idx" ON "WikiPage"("parentId");
