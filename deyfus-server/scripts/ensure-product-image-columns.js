import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  await prisma.$transaction(async (transaction) => {
    const tables = await transaction.$queryRaw`
      SELECT to_regclass('public."Product"')::text AS product_table
    `;

    if (!tables[0]?.product_table) {
      throw new Error('No existe la tabla Product; inicializa el esquema de la base de datos antes de iniciar el servidor.');
    }

    const existingColumns = await transaction.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Product'
        AND column_name IN (
          'imageCredit',
          'imageSourceUrl',
          'imageSearchAttemptedAt',
          'imageLicense',
          'imageLicenseUrl'
        )
    `;

    if (existingColumns.length === 5) {
      console.log('Las columnas de metadatos de imágenes ya están listas.');
      return;
    }

    await transaction.$executeRawUnsafe(`
      ALTER TABLE "Product"
        ADD COLUMN IF NOT EXISTS "imageCredit" TEXT,
        ADD COLUMN IF NOT EXISTS "imageSourceUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "imageSearchAttemptedAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "imageLicense" TEXT,
        ADD COLUMN IF NOT EXISTS "imageLicenseUrl" TEXT
    `);
    await transaction.$executeRawUnsafe(`
      UPDATE "Product"
      SET "imageSearchAttemptedAt" = NULL
      WHERE "imageUrl" IS NULL
    `);

    console.log('Se agregaron las columnas faltantes para las imágenes de productos.');
  });
} catch (error) {
  console.error('No se pudo preparar el esquema de metadatos de imágenes:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
