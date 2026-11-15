ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "imageLicense" TEXT,
ADD COLUMN IF NOT EXISTS "imageLicenseUrl" TEXT;

UPDATE "Product"
SET "imageSearchAttemptedAt" = NULL
WHERE "imageUrl" IS NULL;
