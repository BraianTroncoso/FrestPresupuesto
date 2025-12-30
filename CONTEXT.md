# FrestPresupuesto - Documentacion Completa

> Sistema de presupuestos de viaje para Freest Travel
> Ultima actualizacion: 18 de Diciembre 2025 (madrugada)

---

## Resumen Ejecutivo

Sistema web para generar presupuestos de viajes con:
- **Frontend**: HTML/CSS/JavaScript vanilla
- **Backend**: Vercel Serverless Functions (Node.js)
- **Base de datos**: Turso (SQLite distribuido)
- **Autenticacion**: Sistema propio con sesiones
- **PDFs**: Puppeteer + @sparticuz/chromium (generacion en servidor)

### URLs del Proyecto

| Ambiente | URL |
|----------|-----|
| **Produccion** | https://frest-presupuesto.vercel.app |
| **Repositorio** | https://github.com/BraianTroncoso/FrestPresupuesto |
| **Rama principal** | `dev` (produccion), `main` (backup) |

---

## Credenciales de Acceso

### Ambiente de Desarrollo/Produccion

| Rol | Email | Password | Permisos |
|-----|-------|----------|----------|
| **Admin** | `admin@freest.com` | `admin123` | Todo: ver todos los presupuestos, gestionar usuarios, dashboard |
| **Agente** | `agente@freest.com` | `agente123` | Solo sus propios presupuestos |

> **IMPORTANTE**: Cambiar contrasenas en produccion

---

## Arquitectura del Sistema

```
+------------------------------------------------------------------+
|                         CLIENTE (Browser)                         |
+------------------------------------------------------------------+
|  Paginas HTML:                                                    |
|  +-- index.html          -> Aplicacion principal (presupuestos)   |
|  +-- login.html          -> Pagina de login                       |
|  +-- admin.html          -> Landing admin + Dashboard ventas      |
|  +-- test-pdf.html       -> Testing de generacion PDF             |
|                                                                   |
|  js/                                                              |
|  +-- app.js              -> Logica principal                      |
|  +-- api-client.js       -> Cliente REST API                      |
|  +-- pdf-generator.js    -> Llama al endpoint /api/generar-pdf    |
|  +-- traducciones.js     -> i18n (ES/PT)                          |
+------------------------------------------------------------------+
                              |
                              | HTTPS (REST API)
                              v
+------------------------------------------------------------------+
|                    VERCEL SERVERLESS FUNCTIONS                    |
+------------------------------------------------------------------+
|  api/                                                             |
|  +-- auth/                                                        |
|  |   +-- login.js        -> POST /api/auth/login                  |
|  |   +-- logout.js       -> POST /api/auth/logout                 |
|  |   +-- me.js           -> GET /api/auth/me                      |
|  +-- presupuestos/                                                |
|  |   +-- index.js        -> GET/POST /api/presupuestos            |
|  |   +-- [id].js         -> GET/PUT/PATCH/DELETE /api/presupuestos/:id |
|  |   +-- duplicate.js    -> POST /api/presupuestos/duplicate      |
|  |   +-- next-number.js  -> GET /api/presupuestos/next-number     |
|  +-- usuarios/                                                    |
|  |   +-- index.js        -> GET /api/usuarios                     |
|  |   +-- [id].js         -> GET/PUT/DELETE /api/usuarios/:id      |
|  |   +-- create.js       -> POST /api/usuarios/create             |
|  +-- estadisticas/                                                |
|  |   +-- ventas.js       -> GET /api/estadisticas/ventas          |
|  +-- generar-pdf.js      -> POST /api/generar-pdf (Puppeteer)     |
+------------------------------------------------------------------+
|  lib/                                                             |
|  +-- db.js               -> Cliente Turso + CRUD + marcarVendido  |
|  +-- auth.js             -> Autenticacion + Middleware            |
+------------------------------------------------------------------+
                              |
                              | libsql (HTTPS)
                              v
+------------------------------------------------------------------+
|                      TURSO (SQLite Distribuido)                   |
+------------------------------------------------------------------+
|  Tablas:                                                          |
|  +-- usuarios            -> Usuarios del sistema                  |
|  +-- sesiones            -> Tokens de sesion activos              |
|  +-- presupuestos        -> Datos principales + vendido/fecha_venta |
|  +-- vuelos              -> Vuelos asociados (1:N)                |
|  +-- hoteles             -> Hoteles asociados (1:N)               |
|  +-- configuracion       -> Settings globales (clave/valor)       |
+------------------------------------------------------------------+
```

---

## Nuevas Funcionalidades (18 Dic 2025)

### 1. Dashboard Admin (`admin.html`)

Landing page para administradores con:
- **Card "Generar Presupuesto"**: Navega a index.html
- **Card "Dashboard"**: Muestra estadisticas de ventas

#### Dashboard de Ventas
- Filtro por periodo: Hoy | 7 dias | Mes | Año | Todos
- Tabla de tracking por agente:
  - Total presupuestos
  - Total vendidos
  - Monto USD/BRL
- Detalle expandible con presupuestos vendidos
- Gestion de usuarios (crear, editar, dar de baja)
- Soporte multi-idioma (ES/PT)

### 2. Sistema "Marcar Vendido"

En `index.html`:
- Boton "Marcar Vendido" (verde) para presupuestos no vendidos
- Badge "VENDIDO" para presupuestos ya vendidos
- PATCH a `/api/presupuestos/:id` con `{ vendido: true }`

### 3. Generacion PDF con Puppeteer

Reemplazo de jsPDF por Puppeteer + @sparticuz/chromium:
- Endpoint: `POST /api/generar-pdf`
- Genera PDF identico al diseño original
- Funciona en Vercel serverless
- Descarga directa (no requiere window.print)

---

## Estructura de Carpetas Actualizada

```
FrestPresupuesto/
+-- api/                      # Serverless Functions (12 max en Hobby)
|   +-- auth/
|   |   +-- login.js
|   |   +-- logout.js
|   |   +-- me.js
|   +-- presupuestos/
|   |   +-- index.js          # GET (listar) + POST (crear)
|   |   +-- [id].js           # GET/PUT/PATCH/DELETE
|   |   +-- duplicate.js
|   |   +-- next-number.js
|   +-- usuarios/
|   |   +-- index.js
|   |   +-- [id].js
|   |   +-- create.js
|   +-- estadisticas/
|   |   +-- ventas.js         # Dashboard stats
|   +-- generar-pdf.js        # Puppeteer PDF generation
|
+-- lib/
|   +-- db.js                 # + marcarVendido()
|   +-- auth.js
|
+-- js/
|   +-- app.js                # + toggleVendido(), actualizarUIVendido()
|   +-- api-client.js         # + marcarVendido(), obtenerEstadisticasVentas()
|   +-- pdf-generator.js      # Llama a /api/generar-pdf
|   +-- pdf-puppeteer.cjs     # Generador local (CommonJS)
|
+-- index.html                # + boton vendido, badge vendido
+-- login.html                # Redirect por rol
+-- admin.html                # Landing + Dashboard (NUEVO)
+-- test-pdf.html             # Testing PDF (NUEVO)
+-- server.cjs                # Servidor local con Puppeteer
+-- vercel.json               # + config memoria para generar-pdf
```

---

## Base de Datos - Campos Nuevos

### presupuestos (campos agregados)

```sql
ALTER TABLE presupuestos ADD COLUMN vendido INTEGER DEFAULT 0;
ALTER TABLE presupuestos ADD COLUMN fecha_venta TEXT;
```

---

## API Endpoints

### Nuevos Endpoints

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/estadisticas/ventas?periodo=mes` | Stats de ventas por agente |
| PATCH | `/api/presupuestos/[id]` | Marcar como vendido |
| POST | `/api/generar-pdf` | Generar PDF con Puppeteer |

### Endpoint de Estadisticas

```bash
curl https://frest-presupuesto.vercel.app/api/estadisticas/ventas?periodo=mes
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "agente_id": 1,
      "agente_nombre": "Admin",
      "total_presupuestos": 15,
      "total_vendidos": 8,
      "vendido_usd": 12000,
      "vendido_brl": 5000,
      "presupuestos": [...]
    }
  ],
  "totales": {
    "presupuestos": 25,
    "vendidos": 13,
    "usd": 20000,
    "brl": 5000
  }
}
```

### Endpoint de PDF

```bash
curl -X POST https://frest-presupuesto.vercel.app/api/generar-pdf \
  -H "Content-Type: application/json" \
  -d '{"cliente":{"nombre":"Test"},...}' \
  --output presupuesto.pdf
```

---

## Configuracion de Vercel

### vercel.json (actualizado)

```json
{
  "version": 2,
  "name": "freest-presupuesto",
  "framework": null,
  "outputDirectory": "public",
  "functions": {
    "api/generar-pdf.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/login", "destination": "/login.html" }
  ],
  "headers": [...]
}
```

---

## Dependencias Nuevas

```json
{
  "dependencies": {
    "@sparticuz/chromium": "^...",
    "puppeteer-core": "^...",
    "puppeteer": "^...",
    "express": "^...",
    "cors": "^..."
  }
}
```

- `@sparticuz/chromium`: Chromium optimizado para Lambda/Vercel
- `puppeteer-core`: Puppeteer sin Chromium bundled (usa @sparticuz)
- `puppeteer`: Para desarrollo local
- `express`, `cors`: Para server.cjs local

---

## Testing Local

### Con Vercel Dev (sin PDF local)
```bash
npx vercel dev
# http://localhost:3000
```

### Con Server.cjs (PDF funciona local)
```bash
node server.cjs
# http://localhost:3000/api/test-pdf
```

### Test de PDF en Produccion
```
https://frest-presupuesto.vercel.app/test-pdf.html
```

---

## Flujo de Navegacion

```
login.html
    |
    +-- rol=admin --> admin.html (landing)
    |                      |
    |                      +-- "Generar Presupuesto" --> index.html
    |                      |                              |
    |                      |                              +-- "Volver Admin" --> admin.html
    |                      |
    |                      +-- "Dashboard" --> seccion dashboard
    |
    +-- rol=agente --> index.html
```

---

## Limitaciones Vercel Hobby

| Recurso | Limite |
|---------|--------|
| Serverless Functions | **12** (actualmente usamos 12) |
| Timeout | 10s (PDF: 30s con config) |
| Memory | 1024MB para generar-pdf |
| Bundle size | 50MB (por eso @sparticuz/chromium) |

---

## Estado Actual (18 Dic 2025 - Madrugada)

### Completado
- [x] Dashboard Admin con estadisticas de ventas
- [x] Sistema "Marcar Vendido" en presupuestos
- [x] Generacion PDF con Puppeteer en Vercel
- [x] Traducciones ES/PT en admin.html
- [x] Test de PDF en produccion funcionando
- [x] Deploy a produccion exitoso

### Pendiente
- [ ] Cambiar contrasenas de produccion
- [ ] Configurar dominio personalizado (opcional)

---

## Historial de Actualizaciones

### 2025-12-18 (madrugada)
- **Dashboard Admin**: Landing page + estadisticas de ventas por agente
- **Marcar Vendido**: Boton en presupuestos + campos vendido/fecha_venta en BD
- **PDF con Puppeteer**: Reemplazo de jsPDF por Puppeteer + @sparticuz/chromium
- **Endpoint /api/generar-pdf**: Genera PDF identico al diseño original
- **Optimizacion**: Merge de create.js en index.js para cumplir limite 12 functions
- **Fix**: res.end() en lugar de res.send() para enviar PDF binario

### 2025-12-18 (noche)
- Bug de login resuelto (variables con \n)
- Nuevo proyecto Vercel: frest-presupuesto.vercel.app

### 2025-12-16
- Migracion a Vercel + Turso
- Sistema de autenticacion con roles

---

*Documento generado para el proyecto FrestPresupuesto - Freest Travel*
