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
- **IDA**: `COR 16:30 ✈→ GRU 20:00` (origen izq, destino der)
- **VUELTA**: `GRU 20:00 ←✈ FOR 16:30` (destino izq, origen der - INVERTIDO)

El avión apunta hacia donde "va" y los vuelos de vuelta se invierten visualmente para que tenga sentido el flujo del viaje completo.

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
5. **Trechos aéreos** - badge aerolínea + horarios + avión direccional
6. **Hospedaje** - imagen hotel + datos
7. **Más información** - iconos Cotización y Plazo
8. **Valores** - caja naranja posicionada 24mm desde el fondo
9. **Barra azul bottom** - full width, 4mm alto

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

## Estado Actual
- ✅ Formulario completo con todos los campos
- ✅ Sistema de vuelos flexible (ida/vuelta/multi)
- ✅ PDF con Puppeteer (alta calidad) + fallback jsPDF
- ✅ Avión direccional según tipo de vuelo
- ✅ Inversión visual de vuelos de vuelta
- ✅ Firebase para historial
- ✅ Exportación Excel
- ✅ Búsqueda de vuelos con AeroDataBox API

## Última Actualización
2025-11-24
- Sistema de vuelos flexible con múltiples idas/vueltas
- Inversión visual de vuelos de vuelta en PDF
- Campo destinoFinal para barra destino
- Servicios incluidos: Transfer + Seguro + Vehículo
