ALTER TABLE "Product"
ADD COLUMN "imageLicense" TEXT,
ADD COLUMN "imageLicenseUrl" TEXT;

UPDATE "Product"
SET "imageSearchAttemptedAt" = NULL
WHERE "imageUrl" IS NULL;
