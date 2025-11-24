# Contexto del Proyecto - Freest Travel

## Descripción
Sistema de presupuestos de viaje para la agencia Freest Travel. Genera presupuestos en PDF y Excel.

## Stack
- HTML/CSS/JavaScript vanilla
- jsPDF para exportar PDF
- SheetJS para exportar Excel
- AeroDataBox API (RapidAPI) para buscar vuelos

## Estructura de Archivos
```
/home/tincke/Desktop/test-travel/
├── index.html          # Formulario principal
├── pdf.html            # Preview de estilos PDF (para iterar rápido)
├── config.js           # Configuración (API keys, datos agente)
├── css/
│   └── styles.css      # Estilos del formulario
├── js/
│   ├── app.js          # Lógica del formulario
│   ├── flights.js      # Búsqueda de vuelos (API)
│   ├── pdf-export.js   # Exportación a PDF
│   └── excel-export.js # Exportación a Excel
├── assets/
│   ├── Logo.png        # Logo Freest Travel (1414x2000)
│   ├── Usuario.png     # Icono usuario para PDF (1414x2000)
│   ├── Cotizacion.png  # Icono cotización (sin tilde, renombrado)
│   └── Plazo.png       # Icono plazo
└── tests/
    └── generar_pdf.js  # Script Node para generar PDF de prueba (Puppeteer)
```

## Paleta de Colores
- **Naranja principal:** #ed6e1a
- **Azul:** #435c91
- **Texto primario:** #1e293b
- **Texto secundario:** #64748b
- **Borde:** #e2e8f0
- **Fondo claro:** #f4f4f4

## Estructura del PDF (Actualizada)
1. **Barra azul top** - full width, 4mm alto
2. **Header** - fondo blanco, logo izquierda, datos agente derecha (centrados verticalmente)
3. **Barra destino** - 60% naranja + 40% azul con diagonal blanca (20px), N° presupuesto en azul
4. **Datos del cliente** - icono usuario 70px + título "Datos del cliente" 14px negro + datos en grid
5. **Vuelos** - barra título naranja 14px + info vuelos con badge aerolínea + avión con dirección (ida/vuelta)
6. **Hospedaje** - barra título 14px + imagen hotel + datos
7. **Más información** - iconos Cotización y Plazo (40x40px) + texto 11px
8. **Valores** - caja naranja, ancho dinámico, posicionada 24mm desde el fondo
9. **Barra azul bottom** - full width, 4mm alto

## Flujo de Trabajo para Estilos
1. Editar `pdf.html` (preview con datos hardcodeados)
2. Ver cambios en navegador
3. Una vez aprobado, pasar estilos a `pdf-export.js`

## Estado Actual
- Formulario funcionando
- Toggle Si/No para Transfer/Seguro/Vehículo
- Auto-cálculo valor total (valor por persona × pasajeros)
- Switch USD/BRL
- PDF exporta con estilos finalizados
- `pdf.html` sincronizado con `pdf-export.js`

## Estilos Clave del PDF

### Barra Destino (diagonal)
```css
.destino-info { width: 60%; }
.destino-info::after {
    width: 20px;
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
}
.numero-presupuesto { width: 40%; }
.numero-presupuesto::before {
    width: 20px;
    clip-path: polygon(0 0, 100% 0, 0 100%);
}
```

### Sección Más Información
```css
.info-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
}
.info-item { font-size: 11px; }
```

### Valores Box
```css
.valores-box {
    position: absolute;
    bottom: 24mm;
    right: 0;
    width: auto;
}
```

## Último Cambio
- Diagonal blanca entre naranja y azul en barra destino (20px)
- Sección "Más información" (no "informaciones") con iconos 40x40px y texto 11px
- Valores-box posicionado 24mm desde el fondo, ancho dinámico
- Barra azul bottom agregada (4mm)
- Estilos sincronizados entre pdf.html y pdf-export.js
