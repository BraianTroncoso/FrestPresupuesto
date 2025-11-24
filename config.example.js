// Archivo de ejemplo - Copiar a config.js y completar con tus credenciales
// NO subir config.js a git (ya está en .gitignore)

const CONFIG = {
    // AeroDataBox API (RapidAPI) - para búsqueda de vuelos
    // Obtener en: https://rapidapi.com/aedbx-aedbx/api/aerodatabox
    RAPIDAPI_KEY: 'TU_RAPIDAPI_KEY_AQUI',
    RAPIDAPI_HOST: 'aerodatabox.p.rapidapi.com',

    // Firebase - para historial de presupuestos
    // Obtener en: https://console.firebase.google.com
    FIREBASE: {
        apiKey: "TU_FIREBASE_API_KEY",
        authDomain: "TU_PROJECT.firebaseapp.com",
        projectId: "TU_PROJECT_ID",
        storageBucket: "TU_PROJECT.appspot.com",
        messagingSenderId: "TU_SENDER_ID",
        appId: "TU_APP_ID"
    },

    // Datos del agente (pre-cargados en el formulario)
    AGENTE: {
        email: 'tu-email@ejemplo.com',
        cadastur: 'tu-cadastur'
    }
};
