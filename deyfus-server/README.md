# Deyfus - Backend

Este repositorio contiene el backend de Deyfus (Node.js + Express + Prisma + PostgreSQL).

## Requisitos
- Node.js 18+ (recomendado 20+)
- PostgreSQL
- npm

## Setup rápido (PowerShell)
1. Copia el ejemplo de variables de entorno y edita los valores:

```powershell
cd C:\Users\pc\Downloads\deyfus\deyfus-server
copy .env.example .env
# editar .env con credenciales reales
```

2. Instalar dependencias

```powershell
npm install
```

3. Generar Prisma Client (si modificas el schema)

```powershell
npx prisma generate
```

4. Aplicar migraciones (esto actualizará la base de datos a la versión del schema)

```powershell
npx prisma migrate dev --name init
```

5. (Opcional) Ejecutar seed si existe

```powershell
npm run seed
```

6. Levantar en desarrollo

```powershell
npm run dev
# o
node src/index.js
```

## Endpoints principales (resumen)
- POST /api/auth/register - Registrar usuario
- POST /api/auth/login - Login
- GET /api/branches - Listar sucursales
- POST /api/branches - Crear sucursal
- GET /api/products - Listar productos
- POST /api/products - Crear producto
- GET /api/inventory - Obtener inventario
- POST /api/inventory/update - Actualizar inventario (delta o ajuste)
- GET /api/sales - Obtener ventas
- POST /api/sales - Crear venta (recomendado dentro de transacción)
- GET /api/finances - Obtener transacciones (según filtros)

Todos los endpoints protegidos requieren el header `Authorization: Bearer <token>` (excepto auth/register y auth/login).

## Notas importantes
- Revisa `.env.example` y modifica `DATABASE_URL` con tu conexión a PostgreSQL.
- Si el puerto 4000 está ocupado, cambia `PORT` en `.env` o mata el proceso que lo usa.
- Después de cambiar `prisma/schema.prisma`, ejecuta `npx prisma migrate dev --name <descripcion>` para crear y aplicar migraciones.
- Las búsquedas automáticas de fotos usan Pexels. Crea una API key en Pexels y guárdala como `PEXELS_API_KEY` en el entorno del servidor; no la pongas en el frontend ni la subas a Git.
- En Render, agrega `PEXELS_API_KEY` en **Environment** para el servicio del backend y despliega el servidor.
- Aplica la migración existente en la base de datos de producción con `npx prisma migrate deploy` desde `deyfus-server` antes de usar la búsqueda de imágenes.
- En **Productos**, pulsa **Buscar imágenes** para buscar fotos de productos existentes sin imagen. Se procesan hasta 20 por intento; repite si quedan productos. Los productos nuevos buscan una imagen al guardarse.
- Las coincidencias de Pexels son ilustrativas y pueden no corresponder al modelo exacto. Los créditos enlazan a la foto y al fotógrafo en Pexels.

## Checklist para el frontend
- Usar `FRONTEND_URL` en `.env` para permitir CORS desde el frontend.
- Los endpoints de ejemplo están en `/api/*`.
- Para ventas, el backend espera `req.user.id` y `req.user.branchId` (debido al middleware de auth que extrae estos datos del token JWT).

Si quieres, puedo generar automáticamente una colección Postman con ejemplos de request para que el equipo frontend comience.
