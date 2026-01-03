# FrestPresupuesto - Documentacion Completa

> Sistema de presupuestos de viaje para Freest Travel
> Ultima actualizacion: 2 de Enero 2026

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
|   +-- app.js                # Logica principal + traducciones + toggleVendido()
|   +-- api-client.js         # Cliente REST API
|   +-- pdf-generator.js      # Llama a /api/generar-pdf
|   +-- flights.js            # Busqueda vuelos API + selector tramos multiples
|
+-- index.html                # App principal
+-- login.html                # Redirect por rol
+-- admin.html                # Landing + Dashboard
+-- vercel.json               # Config Vercel
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

### Desarrollo Local
```bash
npx vercel dev
# http://localhost:3000
```

Esto levanta el proyecto con todas las serverless functions funcionando, incluyendo la generacion de PDFs.

### Test de PDF en Produccion
```
https://frest-presupuesto.vercel.app
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

## Estado Actual (2 Ene 2026)

### Completado
- [x] Dashboard Admin con estadisticas de ventas
- [x] Sistema "Marcar Vendido" en presupuestos
- [x] Generacion PDF con Puppeteer en Vercel
- [x] Traducciones ES/PT
- [x] Vuelos separados en "IDA" y "VUELTA" en PDF
- [x] Tarifas sin "Basic/Light/Full" (solo muestra equipaje)
- [x] Aviones SVG en PDF (compatibilidad Vercel)
- [x] Sin cotizacion en PDFs portugues (brasileros pagan en Real)
- [x] Selector de tramos para vuelos con multiples segmentos
- [x] Eliminacion de archivos duplicados (centralizado en api/generar-pdf.js)
- [x] Nuevo logo azul (logo-azul.png) reducido 20%
- [x] Fix sobreposicion recuadro valores con texto "Mas informacion"

### Pendiente
- [ ] Cambiar contrasenas de produccion
- [ ] Configurar dominio personalizado (opcional)

---

## Historial de Actualizaciones

### 2026-01-02
- **Nuevo logo**:
  - Cambiado de `Logo.png` a `logo-azul.png`
  - Reducido 20% (de 18mm a 14.4mm de altura)
- **Fix PDF sobreposicion**:
  - El recuadro naranja de "Valor por persona / Valor total" se superponia con el texto de "Plazo de la propuesta" cuando habia muchos vuelos
  - Solucion: padding-right de 55mm en `.info-container` para dejar espacio al recuadro de valores

### 2025-12-30
- **PDF Vuelos mejorado**:
  - Vuelos separados en secciones "IDA" y "VUELTA" con titulos
  - Aviones ahora usan SVG (emoji no renderizaba en Vercel)
  - Rotacion: ida apunta derecha, vuelta apunta izquierda
- **Tarifas simplificadas**:
  - Eliminado "Basic/Light/Full", solo muestra equipaje: "Solo mochila", "Mochila + Carry on", etc.
  - Traducciones ES/PT actualizadas
- **PDF Portugues**:
  - Eliminada seccion "Cotizacion" (brasileros pagan solo en Real, no necesitan referencia dolar)
- **Selector de tramos**:
  - Cuando un vuelo tiene multiples segmentos (ej: LA777 con escala), aparece modal para elegir cual tramo
  - Evita confusion con vuelos que usan mismo numero para diferentes tramos
- **Limpieza de codigo**:
  - Eliminados archivos duplicados: `js/pdf-export.js`, `js/pdf-puppeteer.cjs`, `server.cjs`
  - Todo centralizado en `api/generar-pdf.js` (unico archivo que genera PDFs)
- **Testing local**: Usar `npx vercel dev` (ya no existe server.cjs)

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
