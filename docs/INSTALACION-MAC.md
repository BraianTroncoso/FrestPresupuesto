# Instalación en Mac - Freest Travel

## Crear el paquete de distribución

### Desde el proyecto (Windows/WSL):

1. **Dar permisos al script:**
```bash
chmod +x INICIAR.command
```

2. **Crear el ZIP con PowerShell:**
```powershell
Compress-Archive -Path 'INICIAR.command','README-CLIENTE.txt','index.html','server.js','config.js','package.json','package-lock.json','css','js','assets' -DestinationPath 'FreestPresupuestos.zip' -Force
```

### Archivos incluidos en el ZIP:
```
FreestPresupuestos/
├── INICIAR.command      # Script de inicio (doble-click)
├── README-CLIENTE.txt   # Instrucciones para el usuario
├── index.html
├── server.js
├── config.js            # Con API keys configuradas
├── package.json
├── package-lock.json
├── css/
├── js/
└── assets/
```

### Archivos NO incluidos:
- `node_modules/` (se instala automáticamente)
- `.git/`
- `temp/`
- `tests/`
- `CONTEXT.md`
- `config.example.js`

---

## Instalación en Mac del cliente

### Primera vez:

1. **Descomprimir** el ZIP en el Escritorio

2. **Abrir Terminal** y ejecutar:
```bash
cd ~/Desktop/FreestPresupuestos
xattr -d com.apple.quarantine INICIAR.command
chmod +x INICIAR.command
```

3. **Doble-click** en `INICIAR.command`

4. Si pide instalar **Node.js**:
   - Se abre automáticamente https://nodejs.org
   - Descargar versión **LTS**
   - Instalar y volver a ejecutar `INICIAR.command`

5. **Esperar** ~2-3 minutos (solo la primera vez)
   - Instala dependencias (npm install)
   - Instala Chrome para PDF (puppeteer)

6. El navegador se abre automáticamente en `http://localhost:3000`

---

## Uso diario

1. Doble-click en `INICIAR.command`
2. En ~3 segundos se abre el sistema
3. Para cerrar: cerrar la ventana de Terminal

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| "No se puede abrir porque es de un desarrollador no identificado" | Ejecutar en Terminal: `xattr -d com.apple.quarantine INICIAR.command` |
| "Permiso denegado" | Ejecutar en Terminal: `chmod +x INICIAR.command` |
| El navegador no abre | Ir manualmente a `http://localhost:3000` |
| Error de Node.js | Instalar desde https://nodejs.org (versión LTS) |

---

## Comandos útiles en Terminal (Mac)

```bash
# Ir a la carpeta del proyecto
cd ~/Desktop/FreestPresupuestos

# Quitar bloqueo de seguridad
xattr -d com.apple.quarantine INICIAR.command

# Dar permisos de ejecución
chmod +x INICIAR.command

# Ejecutar manualmente
bash INICIAR.command

# Ver si el servidor está corriendo
lsof -i :3000

# Matar el servidor si quedó colgado
kill $(lsof -t -i :3000)
```

---

## Notas técnicas

- El script `INICIAR.command` detecta si ya están instaladas las dependencias
- Primera ejecución: ~2-3 minutos (instala todo)
- Siguientes ejecuciones: ~3 segundos (solo levanta servidor)
- El archivo `.command` en Mac se ejecuta con doble-click (abre Terminal automáticamente)
- Chrome de Puppeteer se guarda en `~/.cache/puppeteer`

---

## Fecha
2025-11-25
