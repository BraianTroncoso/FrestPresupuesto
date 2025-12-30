// Módulo de búsqueda de vuelos con AeroDataBox (RapidAPI)

// Habilitar fecha cuando hay código de vuelo
function habilitarFechaVuelo(input) {
    const vueloItem = input.closest('.vuelo-item');
    const fechaInput = vueloItem.querySelector('.vuelo-fecha');
    const btnBuscar = vueloItem.querySelector('.btn-buscar-vuelo');
    const codigo = input.value.trim();

    if (codigo.length >= 3) {
        fechaInput.disabled = false;
        btnBuscar.disabled = false;
    } else {
        fechaInput.disabled = true;
        btnBuscar.disabled = true;
    }
}

// Buscar vuelo al hacer click en botón
function buscarVueloBtn(button) {
    const vueloItem = button.closest('.vuelo-item');
    buscarVuelo(vueloItem);
}

// Buscar vuelo automáticamente
async function buscarVuelo(vueloItem) {
    const numeroVuelo = vueloItem.querySelector('.vuelo-numero').value.trim().toUpperCase();
    const fechaVuelo = vueloItem.querySelector('.vuelo-fecha').value;
    const inputNumero = vueloItem.querySelector('.vuelo-numero');

    if (!numeroVuelo) {
        showToast('Ingresa un número de vuelo', 'error');
        return;
    }

    if (!CONFIG.RAPIDAPI_KEY) {
        showToast('Configura tu API key en config.js', 'error');
        return;
    }

    // Estado loading
    inputNumero.disabled = true;
    vueloItem.classList.add('loading');

    try {
        const resultado = await obtenerInfoVuelo(numeroVuelo, fechaVuelo);

        // Si hay múltiples tramos, mostrar selector
        if (resultado.multiples) {
            inputNumero.disabled = false;
            vueloItem.classList.remove('loading');
            mostrarSelectorTramos(vueloItem, resultado.tramos, fechaVuelo);
            return;
        }

        const infoVuelo = resultado;
        if (infoVuelo) {
            llenarDatosVuelo(vueloItem, infoVuelo, fechaVuelo);
            showToast('Vuelo encontrado');
        }
    } catch (error) {
        console.error('Error buscando vuelo:', error);
        showToast(error.message || 'Error al buscar vuelo', 'error');
    } finally {
        inputNumero.disabled = false;
        vueloItem.classList.remove('loading');
    }
}

// Llenar datos del vuelo en el formulario
function llenarDatosVuelo(vueloItem, infoVuelo, fechaVuelo) {
    vueloItem.querySelector('.vuelo-origen').value = infoVuelo.origen || '';
    vueloItem.querySelector('.vuelo-destino').value = infoVuelo.destino || '';
    vueloItem.querySelector('.vuelo-aerolinea').value = infoVuelo.aerolinea || '';
    vueloItem.querySelector('.vuelo-duracion').value = infoVuelo.duracion || '';
    vueloItem.querySelector('.vuelo-escalas').value = infoVuelo.escalas || 'Directo';
    vueloItem.querySelector('.vuelo-hora-salida').value = infoVuelo.horaSalida || '';
    vueloItem.querySelector('.vuelo-hora-llegada').value = infoVuelo.horaLlegada || '';

    if (infoVuelo.fecha && !fechaVuelo) {
        vueloItem.querySelector('.vuelo-fecha').value = infoVuelo.fecha;
    }

    mostrarResumenVuelo(vueloItem, infoVuelo);
}

// Mostrar modal para seleccionar tramo cuando hay múltiples
function mostrarSelectorTramos(vueloItem, tramos, fechaVuelo) {
    // Remover modal existente si hay
    const modalExistente = document.getElementById('modalSelectorTramos');
    if (modalExistente) modalExistente.remove();

    const modal = document.createElement('div');
    modal.id = 'modalSelectorTramos';
    // Estilos inline para forzar centrado
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;

    let tramosHTML = tramos.map((tramo, index) => `
        <div class="tramo-opcion" data-index="${index}">
            <div class="tramo-ruta">
                <strong>${tramo.origen}</strong> → <strong>${tramo.destino}</strong>
            </div>
            <div class="tramo-horario">
                ${tramo.horaSalida} - ${tramo.horaLlegada} (${tramo.duracion})
            </div>
            <div class="tramo-aerolinea">${tramo.aerolinea}</div>
        </div>
    `).join('');

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>Seleccionar Tramo</h2>
                <button class="modal-close" onclick="cerrarSelectorTramos()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 15px; color: #64748b;">Este vuelo tiene múltiples tramos. Seleccioná el que corresponde:</p>
                <div class="tramos-lista">
                    ${tramosHTML}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Agregar estilos si no existen
    if (!document.getElementById('estilosSelectorTramos')) {
        const estilos = document.createElement('style');
        estilos.id = 'estilosSelectorTramos';
        estilos.textContent = `
            #modalSelectorTramos {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            #modalSelectorTramos .modal-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                max-height: 80vh;
                overflow-y: auto;
            }
            .tramos-lista { display: flex; flex-direction: column; gap: 10px; }
            .tramo-opcion {
                padding: 15px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .tramo-opcion:hover {
                border-color: #435c91;
                background: #f8fafc;
            }
            .tramo-ruta { font-size: 16px; margin-bottom: 5px; }
            .tramo-horario { color: #64748b; font-size: 14px; }
            .tramo-aerolinea { color: #ed6e1a; font-size: 12px; margin-top: 5px; }
        `;
        document.head.appendChild(estilos);
    }

    // Event listeners para selección
    modal.querySelectorAll('.tramo-opcion').forEach(opcion => {
        opcion.addEventListener('click', () => {
            const index = parseInt(opcion.dataset.index);
            const tramoSeleccionado = tramos[index];
            llenarDatosVuelo(vueloItem, tramoSeleccionado, fechaVuelo);
            cerrarSelectorTramos();
            showToast('Tramo seleccionado');
        });
    });
}

function cerrarSelectorTramos() {
    const modal = document.getElementById('modalSelectorTramos');
    if (modal) modal.remove();
}

// Mostrar resumen compacto del vuelo
function mostrarResumenVuelo(vueloItem, info) {
    const infoDiv = vueloItem.querySelector('.vuelo-info');
    const rutaSpan = vueloItem.querySelector('.vuelo-ruta');
    const horarioSpan = vueloItem.querySelector('.vuelo-horario');
    const airlineSpan = vueloItem.querySelector('.vuelo-airline');
    const btnEdit = vueloItem.querySelector('.btn-edit');

    rutaSpan.textContent = `${info.origen} → ${info.destino}`;
    horarioSpan.textContent = `${info.horaSalida || '--:--'} - ${info.horaLlegada || '--:--'} (${info.duracion || 'N/A'})`;
    airlineSpan.textContent = info.aerolinea || '';

    infoDiv.style.display = 'block';
    btnEdit.style.display = 'inline-block';
}

// Toggle edición de campos
function toggleEditarVuelo(button) {
    const vueloItem = button.closest('.vuelo-item');
    const camposEditables = vueloItem.querySelector('.vuelo-campos-editables');
    const isVisible = camposEditables.style.display !== 'none';

    if (isVisible) {
        camposEditables.style.display = 'none';
        button.textContent = 'Editar';
        // Actualizar resumen con nuevos valores
        actualizarResumenVuelo(vueloItem);
    } else {
        camposEditables.style.display = 'block';
        button.textContent = 'Guardar';
    }
}

// Actualizar resumen después de editar
function actualizarResumenVuelo(vueloItem) {
    const rutaSpan = vueloItem.querySelector('.vuelo-ruta');
    const horarioSpan = vueloItem.querySelector('.vuelo-horario');
    const airlineSpan = vueloItem.querySelector('.vuelo-airline');

    const origen = vueloItem.querySelector('.vuelo-origen').value;
    const destino = vueloItem.querySelector('.vuelo-destino').value;
    const horaSalida = vueloItem.querySelector('.vuelo-hora-salida').value;
    const horaLlegada = vueloItem.querySelector('.vuelo-hora-llegada').value;
    const duracion = vueloItem.querySelector('.vuelo-duracion').value;
    const aerolinea = vueloItem.querySelector('.vuelo-aerolinea').value;

    rutaSpan.textContent = `${origen} → ${destino}`;
    horarioSpan.textContent = `${horaSalida || '--:--'} - ${horaLlegada || '--:--'} (${duracion || 'N/A'})`;
    airlineSpan.textContent = aerolinea;
}

async function obtenerInfoVuelo(codigoVuelo, fecha) {
    // Construir URL - con o sin fecha
    let url = `https://aerodatabox.p.rapidapi.com/flights/number/${codigoVuelo}`;
    if (fecha) {
        url += `/${fecha}`;
    }
    url += '?withAircraftImage=false&withLocation=false';

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-host': CONFIG.RAPIDAPI_HOST,
            'x-rapidapi-key': CONFIG.RAPIDAPI_KEY
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Vuelo no encontrado para esa fecha');
        }
        if (response.status === 429) {
            throw new Error('Límite de consultas alcanzado');
        }
        throw new Error('Error al consultar la API');
    }

    const data = await response.json();

    if (!data || data.length === 0) {
        throw new Error('No se encontró información del vuelo');
    }

    const extractTime = (timeObj) => {
        if (timeObj?.local) {
            const match = timeObj.local.match(/(\d{2}:\d{2})/);
            return match ? match[1] : '';
        }
        return '';
    };

    const extractDate = (timeObj) => {
        if (timeObj?.local) {
            const match = timeObj.local.match(/(\d{4}-\d{2}-\d{2})/);
            return match ? match[1] : '';
        }
        return '';
    };

    const formatAirport = (airport) => {
        if (!airport) return '';
        const city = airport.municipalityName || airport.shortName || airport.name || '';
        const iata = airport.iata || '';
        return iata ? `${city} (${iata})` : city;
    };

    const calcularDuracion = (departure, arrival) => {
        if (departure.scheduledTime?.utc && arrival.scheduledTime?.utc) {
            const salida = new Date(departure.scheduledTime.utc);
            const llegada = new Date(arrival.scheduledTime.utc);
            const diffMs = llegada - salida;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        }
        return '';
    };

    const procesarVuelo = (vuelo) => {
        const departure = vuelo.departure || {};
        const arrival = vuelo.arrival || {};
        const airline = vuelo.airline || {};
        const aircraft = vuelo.aircraft || {};

        return {
            origen: formatAirport(departure.airport),
            destino: formatAirport(arrival.airport),
            aerolinea: airline.name || '',
            horaSalida: extractTime(departure.scheduledTime),
            horaLlegada: extractTime(arrival.scheduledTime),
            duracion: calcularDuracion(departure, arrival),
            escalas: 'Directo',
            fecha: extractDate(departure.scheduledTime),
            avion: aircraft.model || ''
        };
    };

    // Si hay múltiples tramos, devolver para selección
    if (data.length > 1) {
        const tramos = data.map(vuelo => procesarVuelo(vuelo));
        return {
            multiples: true,
            tramos: tramos
        };
    }

    // Si hay un solo tramo, devolver directamente
    return procesarVuelo(data[0]);
}
