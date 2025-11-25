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
│   └── styles.css          # Estilos del formulario
├── js/
│   ├── app.js              # Lógica del formulario
│   ├── flights.js          # Búsqueda de vuelos (API)
│   ├── firebase-db.js      # CRUD Firebase
│   ├── pdf-export.js       # Exportación PDF (jsPDF fallback)
│   ├── pdf-puppeteer.js    # Exportación PDF (Puppeteer - alta calidad)
│   └── excel-export.js     # Exportación a Excel
├── assets/
│   ├── Logo.png            # Logo Freest Travel
│   ├── Usuario.png         # Icono usuario para PDF
│   ├── Cotizacion.png      # Icono cotización
│   └── Plazo.png           # Icono plazo
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

## Sistema de Vuelos (Actualizado)

### Tipos de Viaje
| Tipo | Comportamiento |
|------|----------------|
| **Solo ida** | Sección "Vuelos de Ida" + botón "+ Agregar Ida" |
| **Ida y vuelta** | 2 secciones separadas: "Ida" y "Vuelta" con botones |
| **Multi-destino** | Sección única + selector Ida/Vuelta en cada vuelo |

### Estructura HTML de Vuelos
```html
<section id="seccionVuelos">
    <div id="seccionVuelosIda">      <!-- Solo ida / Ida y vuelta -->
        <div id="vuelosIdaContainer"></div>
        <button onclick="agregarVuelo('ida')">+ Agregar Ida</button>
    </div>
    <div id="seccionVuelosVuelta">   <!-- Solo Ida y vuelta -->
        <div id="vuelosVueltaContainer"></div>
        <button onclick="agregarVuelo('vuelta')">+ Agregar Vuelta</button>
    </div>
    <div id="seccionVuelosMulti">    <!-- Solo Multi-destino -->
        <div id="vuelosMultiContainer"></div>
        <button onclick="agregarVuelo('multi')">+ Agregar Vuelo</button>
    </div>
</section>
```

### Campo tipo en cada vuelo
```html
<input type="hidden" class="vuelo-tipo" value="ida|vuelta">
```

### Visualización en PDF
- **IDA**: `COR 04:05 ✈→ GRU 07:10` (origen + horaSalida izq, destino + horaLlegada der)
- **VUELTA**: `GIG 17:00 ←✈ BPS 15:30` (destino + horaLlegada izq, origen + horaSalida der)

Para vuelta se invierten CÓDIGOS y HORAS para que el flujo visual tenga sentido.

### Indicador +1 (día siguiente)
Cuando un vuelo llega al día siguiente (horaLlegada < horaSalida), se muestra `+1` en naranja:
- `PTY 15:40 ✈→ COR 00:21⁺¹` (ida)
- `COR 00:21⁺¹ ←✈ PTY 15:40` (vuelta)

### Lógica en pdf-puppeteer.js (líneas 112-122)
```javascript
const esIda = vuelo.tipo === 'ida' || !vuelo.tipo;
const izqCodigo = esIda ? vuelo.origen : vuelo.destino;
const izqHora = esIda ? vuelo.horaSalida : vuelo.horaLlegada;
const derCodigo = esIda ? vuelo.destino : vuelo.origen;
const derHora = esIda ? vuelo.horaLlegada : vuelo.horaSalida;

const llegaSiguienteDia = vuelo.horaLlegada && vuelo.horaSalida && vuelo.horaLlegada < vuelo.horaSalida;
const izqMas1 = !esIda && llegaSiguienteDia ? '<sup>+1</sup>' : '';
const derMas1 = esIda && llegaSiguienteDia ? '<sup>+1</sup>' : '';
```

## Barra Destino en PDF
- **Origen**: `primerVuelo.origen` (de la API)
- **Destino**: `cliente.destinoFinal` (campo manual) o fallback a `ultimoVuelo.destino`

## Servicios Incluidos
Toggle Si/No para cada uno, se muestran en barra destino:
- Transfer (sin "IN / OUT", solo "Transfer")
- Seguro de Viaje
- Alquiler de Vehículo

Ejemplo: `2 adultos: Transfer + Seguro de Viaje + Alquiler de Vehículo`

## Estructura del PDF
1. **Barra azul top** - full width, 4mm alto
2. **Header** - logo izquierda, datos agente derecha
3. **Barra destino** - 60% naranja + 40% azul con diagonal blanca
4. **Datos del cliente** - icono usuario + grid de datos + campo Destino Final
5. **Trechos aéreos** - badge aerolínea + horarios + avión direccional + indicador +1
6. **Hospedaje** - imagen hotel (base64) + datos
7. **Más información** - iconos Cotización y Plazo
8. **Valores** - caja naranja posicionada 24mm desde el fondo
9. **Barra azul bottom** - full width, 4mm alto

## Imagen del Hotel
- El formulario tiene `<input type="file" class="hotel-imagen">`
- Al seleccionar imagen, se convierte a base64 y guarda en `dataset.base64`
- En `recolectarDatos()` se incluye el campo `imagen`
- El PDF muestra la imagen con `object-fit: cover` en un contenedor de 55mm x 35mm

## Firebase
- Colección: `presupuestos`
- Operaciones: guardar, actualizar, obtener, eliminar (soft delete), duplicar
- Modal de historial con búsqueda por cliente

## Campos del Formulario
- **Agente**: nombre, email (readonly), cadastur (readonly), teléfono
- **Cliente**: nombre, teléfono, ciudad, **destinoFinal**, cantidadPasajeros
- **Presupuesto**: número (autoincremental), fecha, tipoViaje
- **Vuelos**: tipo, número, origen, destino, fecha, horaSalida, horaLlegada, aerolínea, duración, escalas
- **Hoteles**: nombre, url, tipoCuarto, fechaEntrada, fechaSalida, noches, regimen, imagen
- **Toggles**: incluyeTransfer, incluyeSeguro, incluyeVehiculo
- **Valores**: moneda (USD/BRL), valorPorPersona, valorTotal (auto-calculado)

## Servidor Express
- Puerto: 3000
- Límite payload: 50mb (para imágenes base64)
- Endpoints:
  - `POST /api/generar-pdf` - Genera PDF con datos del formulario
  - `GET /api/test-pdf` - Test con datos de Fortaleza
  - `GET /api/test-pdf-2` - Test con datos de Porto Seguro
  - `GET /api/test-pdf-3` - Test con datos de San Andrés (vuelo +1)

## Nota WSL/Windows
Si editás archivos desde WSL y el servidor corre en Windows, puede haber problemas de sincronización. Para forzar:
```powershell
(Get-Content .\archivo.js) | Set-Content .\archivo.js
```

## Estado Actual
- ✅ Formulario completo con todos los campos
- ✅ Sistema de vuelos flexible (ida/vuelta/multi)
- ✅ PDF con Puppeteer (alta calidad) + fallback jsPDF
- ✅ Avión direccional según tipo de vuelo
- ✅ Inversión visual de vuelos de vuelta (códigos Y horas)
- ✅ Indicador +1 para vuelos que llegan al día siguiente
- ✅ Imagen del hotel en PDF (base64)
- ✅ Firebase para historial
- ✅ Exportación Excel
- ✅ Búsqueda de vuelos con AeroDataBox API

## Última Actualización
2025-11-25
- Fix inversión de vuelos de vuelta: ahora invierte códigos Y horas
- Indicador +1 en naranja para vuelos que cruzan medianoche
- Imagen del hotel se sube y muestra en el PDF
- Límite de payload aumentado a 50mb
- Endpoints de test para debugging rápido
