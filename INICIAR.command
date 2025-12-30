#!/bin/bash

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🧳 Freest Travel - Sistema de Presupuestos          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Ir al directorio del script
cd "$(dirname "$0")"

# 1. Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo ""
    echo "Por favor instala Node.js antes de continuar:"
    echo "1. Visita: https://nodejs.org"
    echo "2. Descarga la versión LTS (recomendada)"
    echo "3. Ejecuta el instalador"
    echo "4. Vuelve a ejecutar este script"
    echo ""
    read -p "Presiona Enter para abrir la página de descarga..."
    open "https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js:${NC} $(node -v)"

# 2. Verificar si ya están instaladas las dependencias
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}📦 Primera ejecución - Instalando dependencias...${NC}"
    echo -e "${BLUE}   (Esto solo ocurre una vez)${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencias:${NC} Ya instaladas"
fi

# 3. Verificar Chrome de Puppeteer
CHROME_PATH="$HOME/.cache/puppeteer"
if [ ! -d "$CHROME_PATH" ]; then
    echo ""
    echo -e "${YELLOW}🌐 Instalando Chrome para generación de PDF...${NC}"
    echo -e "${BLUE}   (Esto solo ocurre una vez)${NC}"
    npx puppeteer browsers install chrome
else
    echo -e "${GREEN}✅ Chrome PDF:${NC} Ya instalado"
fi

# 4. Iniciar servidor
echo ""
echo -e "${GREEN}🚀 Iniciando servidor...${NC}"
node server.js &
SERVER_PID=$!

# 5. Esperar que el servidor arranque y abrir navegador
sleep 2
open "http://localhost:3000"

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ ¡Sistema listo!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "   🌐 Navegador: http://localhost:3000"
echo ""
echo "   Para cerrar: Cierra esta ventana o presiona Ctrl+C"
echo ""
echo -e "${BLUE}────────────────────────────────────────────────────────────${NC}"

# Mantener el script corriendo
wait $SERVER_PID
