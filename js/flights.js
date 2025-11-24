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
        const infoVuelo = await obtenerInfoVuelo(numeroVuelo, fechaVuelo);

        if (infoVuelo) {
            // Llenar campos ocultos
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

            // Mostrar resumen
            mostrarResumenVuelo(vueloItem, infoVuelo);
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

    const vuelo = data[0];
    const departure = vuelo.departure || {};
    const arrival = vuelo.arrival || {};
    const airline = vuelo.airline || {};
    const aircraft = vuelo.aircraft || {};

    let duracion = '';
    if (departure.scheduledTime?.utc && arrival.scheduledTime?.utc) {
        const salida = new Date(departure.scheduledTime.utc);
        const llegada = new Date(arrival.scheduledTime.utc);
        const diffMs = llegada - salida;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duracion = `${hours}h ${minutes}m`;
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

    // Formatear origen y destino de forma más limpia
    const formatAirport = (airport) => {
        if (!airport) return '';
        const city = airport.municipalityName || airport.shortName || airport.name || '';
        const iata = airport.iata || '';
        return iata ? `${city} (${iata})` : city;
    };

    return {
        origen: formatAirport(departure.airport),
        destino: formatAirport(arrival.airport),
        aerolinea: airline.name || '',
        horaSalida: extractTime(departure.scheduledTime),
        horaLlegada: extractTime(arrival.scheduledTime),
        duracion: duracion,
        escalas: data.length > 1 ? `${data.length - 1} escala(s)` : 'Directo',
        fecha: extractDate(departure.scheduledTime),
        avion: aircraft.model || ''
    };
}
