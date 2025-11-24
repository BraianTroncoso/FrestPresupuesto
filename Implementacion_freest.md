# Sistema de Presupuestos de Viaje - Freest Travel

## Resumen del Proyecto
Sistema web básico para generación de presupuestos de viaje con exportación a PDF y Excel. Diseñado para agencia de viajes que trabaja con clientes argentinos y brasileños.

---

## Stack Tecnológico
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **PDF**: jsPDF + jspdf-autotable (CDN)
- **Excel**: SheetJS/xlsx (CDN)
- **API Vuelos**: AeroDataBox via RapidAPI

---

## Estructura de Archivos
```
test-travel/
├── index.html              # Formulario principal
├── config.js               # API keys (en .gitignore)
├── .gitignore              # Ignora config.js
├── Implementacion_freest.md # Esta documentación
├── css/
│   └── styles.css          # Estilos Freest branding
└── js/
    ├── app.js              # Lógica del formulario
    ├── flights.js          # Integración AeroDataBox
    ├── pdf-export.js       # Exportación PDF
    └── excel-export.js     # Exportación Excel
```

---

## Configuración (config.js)
```javascript
const CONFIG = {
    RAPIDAPI_KEY: 'tu-key-aqui',
    RAPIDAPI_HOST: 'aerodatabox.p.rapidapi.com',
    AGENTE: {
        email: 'contatofreest@gmail.com',
        cadastur: '37.286.620/0001-49'
    }
};
```

---

## Funcionalidades Implementadas

### 1. Formulario con Campos Estáticos
- Email del agente (pre-llenado, readonly)
- Cadastur (pre-llenado, readonly)

### 2. Secciones Dinámicas
- **Vuelos**: Controlados por "Tipo de Viaje"
- **Hoteles**: Agregar/eliminar múltiples hoteles
- **Transfers**: Agregar/eliminar múltiples transfers

### 3. Lógica de Tipo de Viaje → Vuelos
| Tipo de Viaje | Vuelos | Botón Agregar |
|---------------|--------|---------------|
| Solo Ida | 1 (etiqueta "Ida") | Oculto |
| Ida y Vuelta | 2 (etiquetas "Ida" y "Vuelta") | Oculto |
| Multi-destino | 2 iniciales (numerados) | Visible |

### 4. Búsqueda de Vuelos (AeroDataBox)
- **Flujo UX mejorado**:
  1. Calendario y botón "Buscar" **deshabilitados** por defecto
  2. Al escribir código de vuelo (mín 3 caracteres) → se habilitan
  3. Calendario no permite fechas anteriores a hoy
  4. Usuario selecciona fecha y click en "Buscar"
  5. Se muestra resumen compacto del vuelo
  6. Botón "Editar" para modificar datos si es necesario
- **Endpoint**: `GET /flights/number/{flightNumber}/{date}`
- **Límite**: 300 requests/mes (tier gratis)

### 5. Exportación PDF
- Documento formateado por secciones
- Incluye todos los datos del presupuesto
- Nombre: `presupuesto_{numero}_{cliente}.pdf`

### 6. Exportación Excel
- Una fila con todos los datos aplanados
- Sirve como historial/persistencia
- Nombre: `presupuesto_{numero}_{cliente}.xlsx`

---

## Branding Freest Travel

### Paleta de Colores
| Variable | Color | Uso |
|----------|-------|-----|
| `--primary-color` | #FF7F1E (Naranja) | Botones, acentos |
| `--secondary-color` | #187FE6 (Azul) | Títulos, enlaces |
| `--background` | #F4F4F4 | Fondo general |
| `--surface` | #FFFFFF | Cards, secciones |
| `--success-color` | #25d366 | WhatsApp, éxito |
| `--danger-color` | #ef4444 | Errores, eliminar |

### Tipografía
- **Fuente**: Sora (Google Fonts)
- **Pesos**: 400, 500, 600, 700

### Elementos de Diseño
- Logo Freest en header (fondo oscuro #1e293b)
- Título bicolor: "Presupuesto" (naranja) + "de Viaje" (azul)
- Bordes de sección con degradado naranja → azul
- Border-radius: 12px
- Sombras suaves

---

## APIs Probadas

### ❌ OpenAI (descartada)
- Requiere créditos ($5+ mínimo)
- No tiene datos de vuelos en tiempo real

### ❌ AviationStack (descartada)
- Tier gratis solo HTTP (no HTTPS)
- Incompatible con GitHub Pages (mixed content)

### ✅ AeroDataBox (implementada)
- 300 requests/mes gratis
- HTTPS incluido
- Datos reales de vuelos
- Funciona con LATAM, Aerolíneas Argentinas, GOL, etc.

---

## Ejemplo de Respuesta API (LA8059)
```
Vuelo: LA8059
Ruta: Jo'anna (JNB) → São Paulo (GRU)
Horario: 15:25 - 20:15 (9h 50m)
Aerolínea: LATAM
Avión: Boeing 787-9
```

---

## Pendientes / Próximas Iteraciones
- [ ] Mejoras en diseño del PDF (aplicar branding)
- [ ] Validaciones adicionales
- [ ] Deploy en GitHub Pages o Vercel

---

## Notas Técnicas
- `config.js` está en `.gitignore` - no se sube al repo
- Para deploy, hardcodear key o usar Vercel con variables de entorno
- El endpoint de vuelos requiere fecha para resultados precisos
- Sin fecha, usa el día más cercano con ese vuelo programado

---

## Última Actualización
2025-11-23
