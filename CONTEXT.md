# FrestPresupuesto - Documentacion Completa

> Sistema de presupuestos de viaje para Freest Travel
> Ultima actualizacion: 18 de Diciembre 2025 (noche)

---

## Resumen Ejecutivo

Sistema web para generar presupuestos de viajes con:
- **Frontend**: HTML/CSS/JavaScript vanilla
- **Backend**: Vercel Serverless Functions (Node.js)
- **Base de datos**: Turso (SQLite distribuido)
- **Autenticacion**: Sistema propio con sesiones
- **PDFs**: jsPDF (generacion en cliente)

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
| **Admin** | `admin@freest.com` | `admin123` | Todo: ver todos los presupuestos, gestionar usuarios |
| **Agente** | `agente@freest.com` | `agente123` | Solo sus propios presupuestos |

> **IMPORTANTE**: Cambiar contrasenas en produccion

---

## Arquitectura del Sistema

```
+------------------------------------------------------------------+
|                         CLIENTE (Browser)                         |
+------------------------------------------------------------------+
|  public/                                                          |
|  +-- index.html          -> Aplicacion principal                  |
|  +-- login.html          -> Pagina de login                       |
|  +-- css/styles.css      -> Estilos                               |
|  +-- js/                                                          |
|      +-- app.js          -> Logica principal                      |
|      +-- api-client.js   -> Cliente REST API                      |
|      +-- pdf-generator.js -> Generacion de PDFs (jsPDF)           |
|      +-- traducciones.js -> i18n (ES/PT)                          |
|      +-- ...                                                      |
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
|  |   +-- index.js        -> GET /api/presupuestos                 |
|  |   +-- [id].js         -> GET/PUT/DELETE /api/presupuestos/:id  |
|  |   +-- create.js       -> POST /api/presupuestos/create         |
|  |   +-- duplicate.js    -> POST /api/presupuestos/duplicate      |
|  |   +-- next-number.js  -> GET /api/presupuestos/next-number     |
|  +-- usuarios/                                                    |
|      +-- index.js        -> GET /api/usuarios                     |
|      +-- [id].js         -> GET/PUT/DELETE /api/usuarios/:id      |
|      +-- create.js       -> POST /api/usuarios/create             |
+------------------------------------------------------------------+
|  lib/                                                             |
|  +-- db.js               -> Cliente Turso + CRUD                  |
|  +-- auth.js             -> Autenticacion + Middleware            |
+------------------------------------------------------------------+
                              |
                              | libsql (HTTPS)
                              v
+------------------------------------------------------------------+
|                      TURSO (SQLite Distribuido)                   |
+------------------------------------------------------------------+
|  URL: libsql://freest-presupuestos-braiantroncoso.aws-us-east-1   |
|                                                                   |
|  Tablas:                                                          |
|  +-- usuarios            -> Usuarios del sistema                  |
|  +-- sesiones            -> Tokens de sesion activos              |
|  +-- presupuestos        -> Datos principales de presupuestos     |
|  +-- vuelos              -> Vuelos asociados (1:N)                |
|  +-- hoteles             -> Hoteles asociados (1:N)               |
|  +-- configuracion       -> Settings globales (clave/valor)       |
+------------------------------------------------------------------+
```

---

## Estructura de Carpetas

```
FrestPresupuesto/
+-- .env                      # Variables de entorno (NO commitear)
+-- .vercel/                  # Configuracion local de Vercel
+-- vercel.json               # Configuracion de Vercel
+-- package.json              # Dependencias y scripts
|
+-- api/                      # Serverless Functions
|   +-- auth/
|   |   +-- login.js          # Iniciar sesion
|   |   +-- logout.js         # Cerrar sesion
|   |   +-- me.js             # Obtener usuario actual
|   +-- presupuestos/
|   |   +-- index.js          # Listar presupuestos
|   |   +-- [id].js           # CRUD por ID
|   |   +-- create.js         # Crear presupuesto
|   |   +-- duplicate.js      # Duplicar presupuesto
|   |   +-- next-number.js    # Siguiente numero
|   +-- usuarios/
|       +-- index.js          # Listar usuarios (admin)
|       +-- [id].js           # CRUD por ID (admin)
|       +-- create.js         # Crear usuario (admin)
|
+-- lib/                      # Librerias compartidas
|   +-- db.js                 # Cliente Turso + funciones CRUD
|   +-- auth.js               # Sistema de autenticacion
|
+-- public/                   # Archivos estaticos
|   +-- index.html            # Aplicacion principal
|   +-- login.html            # Pagina de login
|   +-- css/
|   |   +-- styles.css        # Estilos
|   +-- js/
|   |   +-- app.js            # Logica principal
|   |   +-- api-client.js     # Cliente API REST
|   |   +-- pdf-generator.js  # Generador PDF (jsPDF)
|   |   +-- traducciones.js   # Diccionario ES/PT
|   |   +-- form-handlers.js  # Manejo de formularios
|   |   +-- ui-helpers.js     # Utilidades UI
|   +-- assets/
|       +-- Logo.png          # Logo Freest
|       +-- Usuario.png       # Icono usuario
|       +-- ...               # Otros assets
|
+-- scripts/                  # Scripts de utilidad
    +-- setup-database.js     # Crear tablas en Turso
    +-- seed-users.js         # Crear usuarios iniciales
```

---

## Base de Datos (Turso)

### Conexion

```javascript
// lib/db.js
import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});
```

### Variables de Entorno (.env)

```env
TURSO_DATABASE_URL=libsql://freest-presupuestos-braiantroncoso.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

### Esquema de Tablas

#### usuarios
```sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT DEFAULT 'agente',        -- 'admin' | 'agente'
    telefono TEXT DEFAULT '',
    cadastur TEXT DEFAULT '',
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### sesiones
```sql
CREATE TABLE sesiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

#### presupuestos
```sql
CREATE TABLE presupuestos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT NOT NULL,
    fecha TEXT,
    tipo_viaje TEXT DEFAULT 'idaVuelta',
    tipo_tarifa TEXT,

    -- Agente
    agente_id INTEGER,
    agente_nombre TEXT,
    agente_email TEXT,
    agente_telefono TEXT,
    agente_cadastur TEXT,

    -- Cliente
    cliente_nombre TEXT,
    cliente_telefono TEXT,
    cliente_ciudad TEXT,
    destino_final TEXT,
    cantidad_pasajeros INTEGER DEFAULT 1,

    -- Servicios incluidos
    incluye_transfer INTEGER DEFAULT 0,
    incluye_seguro INTEGER DEFAULT 0,
    incluye_vehiculo INTEGER DEFAULT 0,

    -- Valores
    moneda TEXT DEFAULT 'USD',
    valor_por_persona REAL DEFAULT 0,
    valor_total REAL DEFAULT 0,

    -- Metadata
    idioma TEXT DEFAULT 'es',
    estado TEXT DEFAULT 'activo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,

    FOREIGN KEY (agente_id) REFERENCES usuarios(id)
);
```

#### vuelos
```sql
CREATE TABLE vuelos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    presupuesto_id INTEGER NOT NULL,
    orden INTEGER DEFAULT 0,
    tipo TEXT DEFAULT 'ida',          -- 'ida' | 'vuelta'
    numero TEXT,
    origen TEXT,
    destino TEXT,
    fecha TEXT,
    hora_salida TEXT,
    hora_llegada TEXT,
    aerolinea TEXT,
    duracion TEXT,
    escalas TEXT DEFAULT 'Directo',
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id)
);
```

#### hoteles
```sql
CREATE TABLE hoteles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    presupuesto_id INTEGER NOT NULL,
    orden INTEGER DEFAULT 0,
    nombre TEXT,
    url TEXT,
    tipo_cuarto TEXT,
    fecha_entrada TEXT,
    fecha_salida TEXT,
    noches INTEGER DEFAULT 0,
    regimen TEXT,
    imagen_base64 TEXT,
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id)
);
```

#### configuracion
```sql
CREATE TABLE configuracion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clave TEXT UNIQUE NOT NULL,
    valor TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Valor inicial
INSERT INTO configuracion (clave, valor) VALUES ('ultimo_numero_presupuesto', '0');
```

---

## API Endpoints

### Autenticacion

| Metodo | Endpoint | Descripcion | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesion | `{email, password}` |
| POST | `/api/auth/logout` | Cerrar sesion | - |
| GET | `/api/auth/me` | Usuario actual | - |

#### Ejemplo Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@freest.com","password":"admin123"}'

# Response
{
  "success": true,
  "usuario": {
    "id": 1,
    "email": "admin@freest.com",
    "nombre": "Administrador",
    "rol": "admin",
    "telefono": "(11) 99999-9999",
    "cadastur": "37.286.620/0001-49"
  }
}
```

### Presupuestos

| Metodo | Endpoint | Descripcion | Permisos |
|--------|----------|-------------|----------|
| GET | `/api/presupuestos` | Listar | Admin: todos, Agente: propios |
| GET | `/api/presupuestos/[id]` | Obtener uno | Admin: cualquiera, Agente: propios |
| POST | `/api/presupuestos/create` | Crear | Todos |
| PUT | `/api/presupuestos/[id]` | Actualizar | Admin: cualquiera, Agente: propios |
| DELETE | `/api/presupuestos/[id]` | Eliminar (soft) | Admin: cualquiera, Agente: propios |
| POST | `/api/presupuestos/duplicate` | Duplicar | Admin: cualquiera, Agente: propios |
| GET | `/api/presupuestos/next-number` | Siguiente numero | Todos |

### Usuarios (Solo Admin)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/usuarios` | Listar todos |
| GET | `/api/usuarios/[id]` | Obtener uno |
| POST | `/api/usuarios/create` | Crear usuario |
| PUT | `/api/usuarios/[id]` | Actualizar |
| DELETE | `/api/usuarios/[id]` | Desactivar |

---

## Sistema de Autenticacion

### Flujo de Login

```
1. Usuario envia email/password -> POST /api/auth/login
2. Backend verifica credenciales contra DB
3. Si valido:
   - Crea token con nanoid(32)
   - Guarda sesion en tabla 'sesiones' (expira en 7 dias)
   - Setea cookie httpOnly 'auth_token'
   - Retorna datos del usuario
4. Frontend guarda usuario en sessionStorage
5. Redirige a index.html
```

### Middleware de Proteccion (lib/auth.js)

```javascript
export async function withAuth(req, requiredRole = null) {
    const token = getTokenFromRequest(req);
    const usuario = await verificarSesion(token);

    if (!usuario) {
        return { authenticated: false, error: 'No autenticado' };
    }

    if (requiredRole && usuario.rol !== requiredRole && usuario.rol !== 'admin') {
        return { authenticated: false, error: 'Sin permisos suficientes' };
    }

    return { authenticated: true, usuario };
}
```

### Permisos por Rol

| Accion | Admin | Agente |
|--------|:-----:|:------:|
| Ver todos los presupuestos | SI | NO |
| Ver presupuestos propios | SI | SI |
| Crear presupuesto | SI | SI |
| Editar cualquier presupuesto | SI | NO |
| Editar presupuesto propio | SI | SI |
| Eliminar cualquier presupuesto | SI | NO |
| Eliminar presupuesto propio | SI | SI |
| Gestionar usuarios | SI | NO |

---

## Dependencias

### package.json

```json
{
  "name": "freest-presupuesto",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "db:setup": "node scripts/setup-database.js",
    "db:seed": "node scripts/seed-users.js"
  },
  "dependencies": {
    "@libsql/client": "^0.14.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.4.7",
    "nanoid": "^5.0.9"
  },
  "devDependencies": {
    "vercel": "^50.1.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Comandos Utiles

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar base de datos (crear tablas)
npm run db:setup

# Crear usuarios iniciales
npm run db:seed

# Iniciar servidor de desarrollo
npx vercel dev

# Servidor disponible en http://localhost:3000
```

### Turso CLI

```bash
# Login (en WSL usar --headless)
turso auth login --headless

# Crear base de datos
turso db create freest-presupuestos

# Obtener URL
turso db show freest-presupuestos --url

# Crear token
turso db tokens create freest-presupuestos

# Shell SQL
turso db shell freest-presupuestos
```

### Vercel CLI

```bash
# Login
npx vercel login

# Vincular proyecto
npx vercel link --yes --project freest-presupuesto

# Desarrollo local
npx vercel dev

# Deploy a produccion
npx vercel --prod

# Variables de entorno
npx vercel env add TURSO_DATABASE_URL
npx vercel env add TURSO_AUTH_TOKEN
```

---

## Configuracion de Vercel

### vercel.json

```json
{
  "version": 2,
  "name": "freest-presupuesto",
  "framework": null,
  "buildCommand": null,
  "outputDirectory": "public",
  "rewrites": [
    { "source": "/login", "destination": "/login.html" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type,Authorization" }
      ]
    }
  ]
}
```

---

## Generacion de PDFs

El sistema usa **jsPDF** para generar PDFs en el cliente (navegador).

### Archivo: `public/js/pdf-generator.js`

- Carga imagenes como base64
- Soporta traducciones ES/PT
- Genera layout similar al diseno original

### Secciones del PDF

1. Barra azul superior
2. Header con logo + datos del agente
3. Barra de destino (naranja/azul con diagonal)
4. Datos del cliente (2 columnas)
5. Informacion de vuelos con icono direccional
6. Hoteles con imagen
7. Seccion "Mas informacion" (transfer, seguro, vehiculo)
8. Caja de valores (naranja)
9. Barra azul inferior

---

## Flujo de la Aplicacion

### 1. Login

```
Usuario -> login.html -> POST /api/auth/login -> Cookie + Redirect -> index.html
```

### 2. Cargar Presupuestos

```
index.html -> GET /api/auth/me -> Verificar sesion
           -> GET /api/presupuestos -> Listar segun rol
```

### 3. Crear Presupuesto

```
Formulario -> POST /api/presupuestos/create -> Guardar en Turso -> Actualizar lista
```

### 4. Generar PDF

```
Datos del formulario -> pdf-generator.js -> jsPDF -> Descargar PDF
```

---

## Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Naranja principal | `#ed6e1a` | Botones, acentos, barra destino |
| Azul | `#435c91` | Header, footer, enlaces |
| Texto primario | `#1e293b` | Texto principal |
| Texto secundario | `#64748b` | Labels, texto secundario |
| Borde | `#e2e8f0` | Bordes de inputs |
| Fondo claro | `#f4f4f4` | Background |
| Danger | `#ef4444` | Errores |

---

## Sistema de Idiomas (Multi-idioma)

### Switch de Banderas
- Ubicacion: Header del formulario (esquina superior derecha)
- Banderas: AR (Espanol - default) | BR (Portugues)
- Persiste en `localStorage` con clave `idioma`

### Elementos Traducidos
| Elemento | Espanol | Portugues |
|----------|---------|-----------|
| Header agente | Telefono, Email | Telefone, E-mail |
| Datos cliente | Nombre, Ciudad, Fecha, Telefono | Nome, Cidade, Data, Telefone |
| Secciones | Trechos aereos, Hospedaje, Mas informacion | Trechos aereos, Hospedagem, Mais informacoes |
| Hotel | Cuarto, Salida, Regimen | Quarto, Saida, Regime |
| Regimen | Media Pension, Desayuno | Meia Pensao, Cafe da Manha |
| Servicios | Seguro de Viaje, Alquiler de Vehiculo | Seguro Viagem, Aluguel de Veiculo |
| Valores | VALOR POR PERSONA | VALOR POR PESSOA |
| Fechas | "al" | "a" |
| Vuelos | Directo | Direto |

---

## Sistema de Vuelos

### Tipos de Viaje
| Tipo | Comportamiento |
|------|----------------|
| **Solo ida** | Seccion "Vuelos de Ida" + boton "+ Agregar Ida" |
| **Ida y vuelta** | 2 secciones separadas: "Ida" y "Vuelta" con botones |
| **Multi-destino** | Seccion unica + selector Ida/Vuelta en cada vuelo |

### Tipo de Tarifa
- **Basic** - Solo mochila
- **Light** - Mochila + Carry on
- **Full** - Mochila + Carry on + Valija 23kg

### Visualizacion en PDF
- **IDA**: `COR 11:00 ->  BUZ 14:35` (origen + horaSalida izq, destino + horaLlegada der)
- **VUELTA**: `COR 21:30 <-  BUZ 16:00` (destino + horaLlegada izq, origen + horaSalida der)

### Indicador +1 (dia siguiente)
Cuando un vuelo llega al dia siguiente (horaLlegada < horaSalida), se muestra `+1` en naranja.

---

## Hospedaje

### Multiples Hoteles
- Se muestran en columnas (2 por fila)
- Si hay 1 solo hotel, ocupa todo el ancho

### Datos del Hotel
- **Nombre**: clickeable si tiene URL (color azul #435c91)
- **Cuarto**: capitalizado
- **Entrada/Salida**: formato DD/MM/YYYY
- **Regimen**: formateado (mediaPension -> "Media Pension")

### Imagen del Hotel
- Input file convierte a base64
- Se guarda en `dataset.base64`
- Se muestra con `object-fit: cover`

---

## Servicios Incluidos

Toggle Si/No, se muestran en barra destino:
- Transfer
- Seguro de Viaje
- Alquiler de Vehiculo

---

## Notas de Seguridad

- Las contrasenas se hashean con **bcryptjs** (10 rounds)
- Los tokens de sesion usan **nanoid** (32 caracteres)
- Las cookies son **httpOnly** (no accesibles desde JS)
- Sesiones expiran en **7 dias**
- Soft delete para presupuestos (estado = 'eliminado')

---

## Limitaciones del Plan Gratuito de Vercel

- Serverless functions: 10 segundos timeout
- 100GB bandwidth/mes
- Sin Puppeteer (limite 50MB, Chromium necesita ~300MB)

### Por que jsPDF en lugar de Puppeteer

Puppeteer requiere Chromium (~300MB) que excede el limite de Vercel Free (50MB).
jsPDF se ejecuta en el navegador del cliente, sin costo de servidor.

---

## Troubleshooting

### Error: "Cannot find module 'stream/web'"
- **Causa**: Node.js muy antiguo
- **Solucion**: Actualizar a Node.js 18+

### Error: "Cannot convert undefined or null to object"
- **Causa**: API de @libsql/client incorrecta
- **Solucion**: Usar `db.execute(sql, args)` no `db.execute({sql, args})`

### Error: "Project names must be lowercase"
- **Causa**: Nombre de carpeta tiene mayusculas
- **Solucion**: `npx vercel link --yes --project nombre-lowercase`

### Turso login falla en WSL
- **Causa**: No hay navegador disponible
- **Solucion**: `turso auth login --headless`

### Error "Invalid URL" en Vercel con Turso
- **Causa**: Variables de entorno con `\n` al final (causado por `echo`)
- **Solucion**: Usar `echo -n` al agregar variables:
  ```bash
  echo -n "valor_sin_newline" | npx vercel env add VARIABLE production
  ```

---

## Estado Actual (18 Dic 2025)

### Completado
- [x] Variables de entorno configuradas en Vercel (Production, Preview, Development)
- [x] Repositorio migrado a https://github.com/BraianTroncoso/FrestPresupuesto
- [x] Vercel conectado al nuevo repositorio
- [x] Base de datos Turso configurada con tablas y usuarios seed
- [x] Deploy a produccion realizado
- [x] **Login en produccion funcionando correctamente**

### Bug Resuelto: Login en Produccion

**Problema original**: El endpoint `/api/auth/login` retornaba "Error interno del servidor" con detalle "Invalid URL".

**Causas encontradas**:
1. El proyecto en Vercel apuntaba a una branch vieja de otro repositorio
2. Las variables de entorno tenian un `\n` al final (causado por usar `echo` sin `-n`)

**Solucion aplicada**:
1. Se recreo el proyecto en Vercel con la URL correcta: `frest-presupuesto.vercel.app`
2. Se eliminaron y re-agregaron las variables de entorno usando `echo -n` para evitar el newline:
   ```bash
   echo -n "valor" | npx vercel env add VARIABLE_NAME production
   ```

**Test de verificacion**:
```bash
# Retorna {success: true, usuario: {...}}
curl -X POST https://frest-presupuesto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@freest.com","password":"admin123"}'
```

---

## Proximos Pasos

1. [x] ~~**URGENTE**: Resolver error de login en produccion~~ (RESUELTO)
2. [ ] Cambiar contrasenas de produccion (admin123, agente123)
3. [ ] Configurar dominio personalizado (opcional)
4. [ ] Implementar gestion de usuarios en el frontend

---

## Historial de Actualizaciones

### 2025-12-18 (noche)
- **Bug de login resuelto**: El problema era doble:
  1. Vercel apuntaba a branch incorrecta de repo viejo
  2. Variables de entorno tenian `\n` al final por usar `echo` sin `-n`
- **Nuevo proyecto Vercel**: URL cambiada a `frest-presupuesto.vercel.app`
- **Sistema operativo**: Login y autenticacion funcionando en produccion

### 2025-12-18
- **Migracion de repositorio**: Fork eliminado, nuevo repo independiente creado
- **Vercel**: Variables de entorno configuradas, proyecto conectado a GitHub
- **Debug**: Agregado logging detallado en login para diagnosticar error en produccion

### 2025-12-16
- **Migracion a Vercel + Turso**: Sistema completo de autenticacion con roles
- **API REST**: Endpoints para auth, presupuestos y usuarios
- **jsPDF**: Reemplazo de Puppeteer para generacion de PDFs
- **Testing local**: Servidor funcionando en http://localhost:3000

---

*Documento generado para el proyecto FrestPresupuesto - Freest Travel*
