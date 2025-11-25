# Contexto del Proyecto - Freest Travel

## Descripción
Sistema de presupuestos de viaje para la agencia Freest Travel. Genera presupuestos en PDF y Excel con historial en Firebase.

## Stack
- HTML/CSS/JavaScript vanilla
- Node.js + Express (servidor)
- Puppeteer (PDF de alta calidad)
- jsPDF (fallback PDF)
- SheetJS para exportar Excel
- Firebase Firestore (historial de presupuestos)
- AeroDataBox API (RapidAPI) para buscar vuelos

## Estructura de Archivos
```
FrestPresupuesto/
├── index.html              # Formulario principal
├── server.js               # Servidor Express + endpoint PDF
├── config.js               # Configuración (API keys, Firebase) - EN .gitignore
├── config.example.js       # Template de configuración
├── package.json            # Dependencias Node
├── css/
│   └── styles.css          # Estilos del formulario + validación
├── js/
│   ├── app.js              # Lógica del formulario + validación
│   ├── flights.js          # Búsqueda de vuelos (API)
│   ├── firebase-db.js      # CRUD Firebase
│   ├── pdf-export.js       # Exportación PDF (jsPDF fallback)
│   ├── pdf-puppeteer.js    # Exportación PDF (Puppeteer - alta calidad)
│   └── excel-export.js     # Exportación a Excel
├── assets/
│   ├── Logo.png            # Logo Freest Travel
│   ├── Usuario.png         # Icono usuario para PDF
│   ├── Cotizacion.png      # Icono cotización
│   ├── Plazo.png           # Icono plazo
│   └── image-to-test.jpg   # Imagen de prueba para hoteles
└── tests/
    └── generar_pdf.js      # Script para generar PDF de prueba
```

## Instalación
```bash
npm install
npx puppeteer browsers install chrome  # IMPORTANTE
cp config.example.js config.js          # Completar con API keys
node server.js                          # http://localhost:3000
```

## Paleta de Colores
- **Naranja principal:** #ed6e1a
- **Azul:** #435c91
- **Texto primario:** #1e293b
- **Texto secundario:** #64748b
- **Borde:** #e2e8f0
- **Fondo claro:** #f4f4f4
- **Danger (errores):** #ef4444

## Sistema de Validación (Nuevo)

### Mensajes de Error Amigables
En `app.js` hay un diccionario `ERRORES_AMIGABLES` que traduce errores técnicos a mensajes para usuarios no técnicos:
- `Failed to fetch` → "Sin conexión al servidor"
- `413 Payload Too Large` → "Imagen demasiado grande"
- `Unexpected end of JSON` → "Respuesta incompleta del servidor"
- Errores de Firebase (permission-denied, unavailable, quota-exceeded)

### Función mostrarErrorAmigable()
Reemplaza `alert()` con un modal bonito que tiene:
- Título del error
- Mensaje descriptivo
- Tip de ayuda para el usuario

### Validación de Campos
- Nombre cliente (requerido)
- Nombre agente (requerido)
- Tipo de viaje (requerido)
- Cantidad pasajeros (>= 1)
- Valor por persona (> 0)

Los campos con error se marcan con borde rojo y mensaje debajo.

## Sistema de Vuelos

### Tipos de Viaje
| Tipo | Comportamiento |
|------|----------------|
| **Solo ida** | Sección "Vuelos de Ida" + botón "+ Agregar Ida" |
| **Ida y vuelta** | 2 secciones separadas: "Ida" y "Vuelta" con botones |
| **Multi-destino** | Sección única + selector Ida/Vuelta en cada vuelo |

### Tipo de Tarifa (Nuevo)
Select en "Datos del Presupuesto" después de tipo de viaje:
- **Basic** - Solo mochila
- **Light** - Mochila + Carry on
- **Full** - Mochila + Carry on + Valija 23kg

Se muestra en el PDF arriba de los vuelos de forma sutil.

### Visualización en PDF
- **IDA**: `COR 11:00 ✈→ BUZ 14:35` (origen + horaSalida izq, destino + horaLlegada der)
- **VUELTA**: `COR 21:30 ←✈ BUZ 16:00` (destino + horaLlegada izq, origen + horaSalida der)

Para vuelta se invierten CÓDIGOS y HORAS para que el flujo visual tenga sentido.

### Indicador +1 (día siguiente)
Cuando un vuelo llega al día siguiente (horaLlegada < horaSalida), se muestra `+1` en naranja.

### Escalas
- Si es **Directo**: muestra "Directo" en naranja
- Si tiene **escalas**: NO muestra nada (se oculta)

### Lógica en pdf-puppeteer.js
```javascript
const esIda = vuelo.tipo === 'ida' || !vuelo.tipo;
const izqCodigo = esIda ? vuelo.origen : vuelo.destino;
const izqHora = esIda ? vuelo.horaSalida : vuelo.horaLlegada;
const derCodigo = esIda ? vuelo.destino : vuelo.origen;
const derHora = esIda ? vuelo.horaLlegada : vuelo.horaSalida;

// Escalas: solo mostrar "Directo"
${(!vuelo.escalas || vuelo.escalas.toLowerCase() === 'directo') ? 'Directo' : ''}
```

## Barra Destino en PDF
- 60% naranja + 40% azul con diagonal blanca (usando `skewX(-15deg)`)
- **Origen**: `primerVuelo.origen`
- **Destino**: `cliente.destinoFinal` o fallback a `ultimoVuelo.destino`

## Datos del Cliente en PDF
- Grid de 2 columnas
- Columna derecha (Ciudad, Teléfono) alineada a la derecha
- Formato fecha: DD/MM/YYYY (es-AR)

## Fechas de Vuelo
- Si es **solo ida** (misma fecha inicio y fin): muestra solo una fecha
- Si es **ida y vuelta**: muestra rango "03/12/2025 al 10/12/2025" (o "a" en portugués)

## Sistema de Idiomas (Multi-idioma)

### Switch de Banderas
- Ubicación: Header del formulario (esquina superior derecha)
- Banderas: 🇦🇷 (Español - default) | 🇧🇷 (Portugués)
- Persiste en `localStorage` con clave `idioma`

### Implementación en Formulario (app.js)
```javascript
let idiomaActual = localStorage.getItem('idioma') || 'es';

const TRADUCCIONES = {
    es: { presupuesto: 'Presupuesto', deViaje: 'de Viaje', ... },
    pt: { presupuesto: 'Orçamento', deViaje: 'de Viagem', ... }
};

function cambiarIdioma(idioma) {
    idiomaActual = idioma;
    localStorage.setItem('idioma', idioma);
    // Actualiza UI con data-i18n attributes
}
```

### Implementación en PDF (pdf-puppeteer.js)
```javascript
const TRADUCCIONES_PDF = {
    es: {
        datosCliente: 'Datos del cliente',
        nombre: 'Nombre', ciudad: 'Ciudad', fecha: 'Fecha', telefono: 'Teléfono',
        agente: 'Agente', email: 'Email', al: 'al',
        trechosAereos: 'Trechos aéreos', hospedaje: 'Hospedaje',
        hotel: 'Hotel', cuarto: 'Cuarto', entrada: 'Entrada', salida: 'Salida', regimen: 'Regimen',
        masInfo: 'Más información', cotizacion: 'Cotización', plazo: 'Plazo de la propuesta',
        valorPorPersona: 'VALOR POR PERSONA', valorTotal: 'VALOR TOTAL',
        adulto: 'adulto', adultos: 'adultos',
        transfer: 'Transfer', seguroViaje: 'Seguro de Viaje', alquilerVehiculo: 'Alquiler de Vehículo',
        directo: 'Directo',
        mediaPension: 'Media Pensión', pensionCompleta: 'Pensión Completa', ...
    },
    pt: {
        datosCliente: 'Dados do cliente',
        nombre: 'Nome', ciudad: 'Cidade', fecha: 'Data', telefono: 'Telefone',
        agente: 'Agente', email: 'E-mail', al: 'a',
        trechosAereos: 'Trechos aéreos', hospedaje: 'Hospedagem',
        hotel: 'Hotel', cuarto: 'Quarto', entrada: 'Entrada', salida: 'Saída', regimen: 'Regime',
        masInfo: 'Mais informações', cotizacion: 'Cotação', plazo: 'Prazo da proposta',
        valorPorPersona: 'VALOR POR PESSOA', valorTotal: 'VALOR TOTAL',
        adulto: 'adulto', adultos: 'adultos',
        transfer: 'Transfer', seguroViaje: 'Seguro Viagem', alquilerVehiculo: 'Aluguel de Veículo',
        directo: 'Direto',
        mediaPension: 'Meia Pensão', pensionCompleta: 'Pensão Completa', ...
    }
};

const idioma = datos.idioma || 'es';
const t = TRADUCCIONES_PDF[idioma];
```

### Tarifa Traducida
```javascript
formatearTarifa(tarifa, idioma) // Devuelve { nombre, descripcion } según idioma
// 'light' → { nombre: 'LIGHT', descripcion: 'Mochila + Bagagem de mão' } (pt)
```

### Elementos Traducidos
| Elemento | Español | Portugués |
|----------|---------|-----------|
| Header agente | Teléfono, Email | Telefone, E-mail |
| Datos cliente | Nombre, Ciudad, Fecha, Teléfono | Nome, Cidade, Data, Telefone |
| Secciones | Trechos aéreos, Hospedaje, Más información | Trechos aéreos, Hospedagem, Mais informações |
| Hotel | Cuarto, Salida, Regimen | Quarto, Saída, Regime |
| Regimen | Media Pensión, Desayuno | Meia Pensão, Café da Manhã |
| Servicios | Seguro de Viaje, Alquiler de Vehículo | Seguro Viagem, Aluguel de Veículo |
| Valores | VALOR POR PERSONA | VALOR POR PESSOA |
| Fechas | "al" | "a" |
| Vuelos | Directo | Direto |

## Hospedaje en PDF

### Múltiples Hoteles
- Se muestran en **columnas** (2 por fila)
- Si hay 1 solo hotel, ocupa todo el ancho
- Contenedor `.hoteles-container` con flexbox

### Datos del Hotel
- **Nombre**: clickeable si tiene URL (color azul #435c91)
- **Cuarto**: capitalizado
- **Entrada/Salida**: formato DD/MM/YYYY
- **Regimen**: formateado (mediaPension → "Media Pensión")

### Función formatearRegimen()
```javascript
const mapeo = {
    'mediaPension': 'Media Pensión',
    'pensionCompleta': 'Pensión Completa',
    'todoIncluido': 'Todo Incluido',
    'soloAlojamiento': 'Solo Alojamiento',
    'desayuno': 'Desayuno'
};
```

### Imagen del Hotel
- Input file convierte a base64
- Se guarda en `dataset.base64`
- Se muestra con `object-fit: cover` (40mm x 28mm cuando hay múltiples)

## Servicios Incluidos
Toggle Si/No, se muestran en barra destino:
- Transfer
- Seguro de Viaje
- Alquiler de Vehículo

## Estructura del PDF
1. **Barra azul top** - full width, 4mm alto
2. **Header** - logo izquierda, datos agente derecha
3. **Barra destino** - 60% naranja + 40% azul con diagonal blanca (skewX)
4. **Datos del cliente** - icono usuario + grid 2 columnas
5. **Trechos aéreos** - tarifa + vuelos con avión direccional
6. **Hospedaje** - hoteles en columnas con imagen y link
7. **Más información** - iconos Cotización y Plazo
8. **Valores** - caja naranja posicionada 24mm desde el fondo
9. **Barra azul bottom** - full width, 5mm alto

## Firebase
- Colección: `presupuestos`
- Operaciones: guardar, actualizar, obtener, eliminar (soft delete), duplicar
- Modal de historial con búsqueda por cliente

## Campos del Formulario
- **Agente**: nombre, email (readonly), cadastur (readonly), teléfono
- **Cliente**: nombre, teléfono, ciudad, destinoFinal, cantidadPasajeros
- **Presupuesto**: número (autoincremental), fecha, tipoViaje, **tipoTarifa**
- **Vuelos**: tipo, número, origen, destino, fecha, horaSalida, horaLlegada, aerolínea, duración, escalas
- **Hoteles**: nombre, url, tipoCuarto, fechaEntrada, fechaSalida, noches, regimen, imagen
- **Toggles**: incluyeTransfer, incluyeSeguro, incluyeVehiculo
- **Valores**: moneda (USD/BRL), valorPorPersona, valorTotal (auto-calculado)

## Servidor Express
- Puerto: 3000
- Límite payload: 50mb (para imágenes base64)
- Endpoints:
  - `POST /api/generar-pdf` - Genera PDF con datos del formulario
  - `GET /api/test-pdf` - Test con datos de Fortaleza (4 vuelos ida/vuelta)
  - `GET /api/test-pdf-2` - Test con datos de Porto Seguro
  - `GET /api/test-pdf-3` - Test con datos de San Andrés (vuelo +1)
  - `GET /api/test-pdf-4` - Test completo: ida/vuelta, tarifa, 2 hoteles, imagen

## Nota WSL/Windows
Si editás archivos desde WSL y el servidor corre en Windows, puede haber problemas de sincronización. Para forzar:
```powershell
(Get-Content .\archivo.js) | Set-Content .\archivo.js
```

## Estado Actual
- ✅ Formulario completo con todos los campos
- ✅ Sistema de vuelos flexible (ida/vuelta/multi)
- ✅ Tipo de tarifa (Basic/Light/Full)
- ✅ PDF con Puppeteer (alta calidad) + fallback jsPDF
- ✅ Avión direccional según tipo de vuelo
- ✅ Inversión visual de vuelos de vuelta (códigos Y horas)
- ✅ Indicador +1 para vuelos que llegan al día siguiente
- ✅ Escalas: solo muestra "Directo", oculta cuando tiene escalas
- ✅ Imagen del hotel en PDF (base64)
- ✅ URL del hotel clickeable (azul)
- ✅ Múltiples hoteles en columnas
- ✅ Formato régimen (Media Pensión, etc.)
- ✅ Firebase para historial
- ✅ Exportación Excel
- ✅ Búsqueda de vuelos con AeroDataBox API
- ✅ Sistema de validación con errores amigables
- ✅ Diagonal blanca en barra destino (sin líneas feas)
- ✅ **Multi-idioma (Español/Portugués)** con switch de banderas

## Última Actualización
2025-11-25
- **Sistema de idiomas (Multi-idioma)**: Switch 🇦🇷/🇧🇷 en header
- Traducciones completas en formulario (data-i18n) y PDF (TRADUCCIONES_PDF)
- Idioma persiste en localStorage
- Tarifa traducida (Basic/Light/Full con descripciones en ambos idiomas)
- test-pdf-4 ahora genera PDF en portugués para testing
