# FrestPresupuesto

Sistema de generación de presupuestos para la agencia de viajes Freest Travel.

## Características

- Creación de presupuestos de viaje personalizados
- Gestión de vuelos, hoteles y servicios adicionales
- Exportación a PDF y Excel
- Historial con Firebase
- Interfaz web intuitiva

## Tecnologías

- HTML/CSS/JavaScript
- Node.js + Express
- Puppeteer (generación de PDFs)
- Firebase Firestore (historial)
- AeroDataBox API (búsqueda de vuelos)

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/FrestPresupuesto.git
cd FrestPresupuesto

# 2. Instalar dependencias de Node
npm install

# 3. Instalar navegador para Puppeteer (REQUERIDO)
npx puppeteer browsers install chrome

# 4. Crear archivo config.js (ver config.example.js)
cp config.example.js config.js
# Editar config.js con tus API keys
```

## Configuración

Crear `config.js` en la raíz con:

```javascript
const CONFIG = {
    RAPIDAPI_KEY: 'tu-key-de-rapidapi',
    RAPIDAPI_HOST: 'aerodatabox.p.rapidapi.com',
    FIREBASE: {
        apiKey: "tu-firebase-api-key",
        authDomain: "tu-proyecto.firebaseapp.com",
        projectId: "tu-proyecto-id",
        storageBucket: "tu-proyecto.appspot.com",
        messagingSenderId: "tu-sender-id",
        appId: "tu-app-id"
    },
    AGENTE: {
        email: 'tu-email@ejemplo.com',
        cadastur: 'tu-cadastur'
    }
};
```

## Uso

```bash
# Iniciar servidor
node server.js

# Abrir en navegador
http://localhost:3000
```

## Estructura

```
FrestPresupuesto/
├── index.html          # Formulario principal
├── server.js           # Servidor Express
├── config.js           # Configuración (ignorado en git)
├── assets/             # Imágenes para PDF
├── css/styles.css      # Estilos
└── js/
    ├── app.js          # Lógica del formulario
    ├── flights.js      # API de vuelos
    ├── firebase-db.js  # Firebase
    ├── pdf-export.js   # Exportación PDF (fallback jsPDF)
    ├── pdf-puppeteer.js# Exportación PDF (Puppeteer)
    └── excel-export.js # Exportación Excel
```