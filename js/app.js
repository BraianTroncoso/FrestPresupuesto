// Variable para almacenar presupuestos cargados
let presupuestosCargados = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initForm();
    initFirebase();
});

function initForm() {
    // Cargar datos estáticos del agente
    document.getElementById('emailAgente').value = CONFIG.AGENTE.email;
    document.getElementById('cadastur').value = CONFIG.AGENTE.cadastur;

    // Fecha de presupuesto por defecto: hoy
    document.getElementById('fechaPresupuesto').valueAsDate = new Date();

    // Número de presupuesto incremental
    inicializarNumeroPresupuesto();

    // Agregar hotel por defecto (vuelos se agregan según tipo de viaje)
    agregarHotel();

    // Listener para recalcular valor total cuando cambia cantidad de pasajeros
    document.getElementById('cantidadPasajeros').addEventListener('input', calcularValorTotal);
}

// Número de presupuesto incremental
function inicializarNumeroPresupuesto() {
    const input = document.getElementById('numeroPresupuesto');
    let ultimoNumero = localStorage.getItem('freest_ultimo_presupuesto') || 0;
    let nuevoNumero = parseInt(ultimoNumero) + 1;

    // Formatear con ceros a la izquierda (01, 02, etc.)
    input.value = String(nuevoNumero).padStart(2, '0');

    // Guardar el nuevo número
    localStorage.setItem('freest_ultimo_presupuesto', nuevoNumero);
}

// Habilitar edición manual del número de presupuesto
function habilitarEdicionPresupuesto(input) {
    input.readOnly = false;
    input.focus();
    input.select();

    // Al perder foco, volver a readonly
    input.onblur = function() {
        input.readOnly = true;
        // Validar que sea un número válido
        let valor = parseInt(input.value) || 1;
        input.value = String(valor).padStart(2, '0');
    };
}

// Toggle simple para opciones Si/No (sin mostrar/ocultar contenido)
function toggleOpcion(btn, inputId, valor) {
    const hiddenInput = document.getElementById(inputId);
    const buttons = btn.parentElement.querySelectorAll('.toggle-btn');

    // Actualizar estado de botones
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Actualizar valor hidden
    hiddenInput.value = valor;
}

// Calcular valor total automáticamente
function calcularValorTotal() {
    const valorPorPersona = parseFloat(document.getElementById('valorPorPersona').value) || 0;
    const cantidadPasajeros = parseInt(document.getElementById('cantidadPasajeros').value) || 1;
    const valorTotal = valorPorPersona * cantidadPasajeros;

    document.getElementById('valorTotal').value = valorTotal > 0 ? valorTotal.toFixed(2) : '';
}

// Contadores para numeración
let vueloCount = 0;
let hotelCount = 0;

// Agregar vuelo dinámico
function agregarVuelo(label = null) {
    vueloCount++;
    const container = document.getElementById('vuelosContainer');
    const template = document.getElementById('vueloTemplate');
    const clone = template.content.cloneNode(true);

    // Usar label personalizado o número
    const itemNumber = clone.querySelector('.item-number');
    itemNumber.textContent = label || vueloCount;

    // Configurar fecha mínima (hoy) - mantener disabled
    const fechaInput = clone.querySelector('.vuelo-fecha');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
    fechaInput.disabled = true;

    // Asegurar que el botón esté deshabilitado
    const btnBuscar = clone.querySelector('.btn-buscar-vuelo');
    btnBuscar.disabled = true;

    container.appendChild(clone);
}

// Limpiar todos los vuelos
function limpiarVuelos() {
    const container = document.getElementById('vuelosContainer');
    container.innerHTML = '';
    vueloCount = 0;
}

// Actualizar vuelos según tipo de viaje seleccionado
function actualizarVuelosPorTipo() {
    const tipoViaje = document.getElementById('tipoViaje').value;
    const seccionVuelos = document.getElementById('seccionVuelos');
    const btnAgregar = document.getElementById('btnAgregarVuelo');

    // Limpiar vuelos existentes
    limpiarVuelos();

    if (!tipoViaje) {
        // Sin selección: ocultar sección
        seccionVuelos.style.display = 'none';
        return;
    }

    // Mostrar sección de vuelos
    seccionVuelos.style.display = 'block';

    switch (tipoViaje) {
        case 'ida':
            // Solo ida: 1 vuelo, sin botón agregar
            agregarVuelo('Ida');
            btnAgregar.style.display = 'none';
            break;

        case 'idaVuelta':
            // Ida y vuelta: 2 vuelos, sin botón agregar
            agregarVuelo('Ida');
            agregarVuelo('Vuelta');
            btnAgregar.style.display = 'none';
            break;

        case 'multiDestino':
            // Multi-destino: 2 vuelos iniciales + botón agregar
            agregarVuelo();
            agregarVuelo();
            btnAgregar.style.display = 'inline-flex';
            break;
    }
}

// Agregar hotel dinámico
function agregarHotel() {
    hotelCount++;
    const container = document.getElementById('hospedajeContainer');
    const template = document.getElementById('hotelTemplate');
    const clone = template.content.cloneNode(true);

    clone.querySelector('.item-number').textContent = hotelCount;

    // Auto-calcular noches cuando cambian las fechas
    const item = clone.querySelector('.hotel-item');
    container.appendChild(clone);

    const lastItem = container.lastElementChild;
    const fechaEntrada = lastItem.querySelector('.hotel-fecha-entrada');
    const fechaSalida = lastItem.querySelector('.hotel-fecha-salida');
    const noches = lastItem.querySelector('.hotel-noches');

    const calcularNoches = () => {
        if (fechaEntrada.value && fechaSalida.value) {
            const entrada = new Date(fechaEntrada.value);
            const salida = new Date(fechaSalida.value);
            const diff = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
            if (diff > 0) {
                noches.value = diff;
            }
        }
    };

    fechaEntrada.addEventListener('change', calcularNoches);
    fechaSalida.addEventListener('change', calcularNoches);
}


// Remover item dinámico
function removerItem(button) {
    const item = button.closest('.dynamic-item');
    item.remove();
    renumerarItems();
}

// Renumerar items después de eliminar
function renumerarItems() {
    document.querySelectorAll('.vuelo-item').forEach((item, index) => {
        item.querySelector('.item-number').textContent = index + 1;
    });
    document.querySelectorAll('.hotel-item').forEach((item, index) => {
        item.querySelector('.item-number').textContent = index + 1;
    });
}

// Recolectar todos los datos del formulario
function recolectarDatos() {
    const datos = {
        agente: {
            nombre: document.getElementById('nombreAgente').value,
            email: document.getElementById('emailAgente').value,
            cadastur: document.getElementById('cadastur').value,
            telefono: document.getElementById('telefonoAgente').value
        },
        cliente: {
            nombre: document.getElementById('nombreCliente').value,
            telefono: document.getElementById('telefonoCliente').value,
            ciudad: document.getElementById('ciudadCliente').value,
            destinoFinal: document.getElementById('destinoFinal').value,
            cantidadPasajeros: document.getElementById('cantidadPasajeros').value
        },
        presupuesto: {
            numero: document.getElementById('numeroPresupuesto').value,
            fecha: document.getElementById('fechaPresupuesto').value,
            tipoViaje: document.getElementById('tipoViaje').value
        },
        vuelos: [],
        hoteles: [],
        // Secciones opcionales (solo Si/No)
        incluyeTransfer: document.getElementById('incluyeTransfer').value === 'si',
        incluyeSeguro: document.getElementById('incluyeSeguro').value === 'si',
        incluyeVehiculo: document.getElementById('incluyeVehiculo').value === 'si',
        // Moneda y valores
        moneda: document.getElementById('moneda').value,
        valores: {
            porPersona: document.getElementById('valorPorPersona').value,
            total: document.getElementById('valorTotal').value
        }
    };

    // Recolectar vuelos
    document.querySelectorAll('.vuelo-item').forEach(item => {
        datos.vuelos.push({
            numero: item.querySelector('.vuelo-numero').value,
            origen: item.querySelector('.vuelo-origen').value,
            destino: item.querySelector('.vuelo-destino').value,
            fecha: item.querySelector('.vuelo-fecha').value,
            horaSalida: item.querySelector('.vuelo-hora-salida').value,
            horaLlegada: item.querySelector('.vuelo-hora-llegada').value,
            aerolinea: item.querySelector('.vuelo-aerolinea').value,
            duracion: item.querySelector('.vuelo-duracion').value,
            escalas: item.querySelector('.vuelo-escalas').value
        });
    });

    // Recolectar hoteles
    document.querySelectorAll('.hotel-item').forEach(item => {
        datos.hoteles.push({
            nombre: item.querySelector('.hotel-nombre').value,
            url: item.querySelector('.hotel-url').value,
            tipoCuarto: item.querySelector('.hotel-tipo-cuarto').value,
            fechaEntrada: item.querySelector('.hotel-fecha-entrada').value,
            fechaSalida: item.querySelector('.hotel-fecha-salida').value,
            noches: item.querySelector('.hotel-noches').value,
            regimen: item.querySelector('.hotel-regimen').value
        });
    });

    return datos;
}

// Mostrar notificación toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Formatear fecha para mostrar
function formatearFecha(fecha) {
    if (!fecha) return '';
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Formatear moneda (usa la moneda seleccionada)
function formatearMoneda(valor, moneda = null) {
    if (!valor) return '';
    const currency = moneda || document.getElementById('moneda')?.value || 'USD';
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency
    }).format(valor);
}

// ==================== GUARDAR PRESUPUESTO ====================

async function guardarPresupuestoActual() {
    const datos = recolectarDatos();
    const presupuestoId = document.getElementById('presupuestoId').value;

    // Validación básica
    if (!datos.cliente.nombre) {
        showToast('Por favor ingresa el nombre del cliente', 'error');
        return;
    }

    try {
        let resultado;
        if (presupuestoId) {
            // Actualizar existente
            resultado = await actualizarPresupuesto(presupuestoId, datos);
            if (resultado.success) {
                showToast('Presupuesto actualizado correctamente', 'success');
            }
        } else {
            // Crear nuevo
            resultado = await guardarPresupuesto(datos);
            if (resultado.success) {
                document.getElementById('presupuestoId').value = resultado.id;
                showToast('Presupuesto guardado correctamente', 'success');
                activarModoEdicion();
            }
        }

        if (!resultado.success) {
            showToast('Error: ' + resultado.error, 'error');
        }
    } catch (error) {
        showToast('Error al guardar: ' + error.message, 'error');
    }
}

// ==================== HISTORIAL ====================

async function abrirHistorial() {
    const modal = document.getElementById('modalHistorial');
    const lista = document.getElementById('listaPresupuestos');

    modal.classList.add('active');
    lista.innerHTML = '';
    lista.classList.add('loading');

    try {
        const resultado = await obtenerPresupuestos({ estado: 'activo' });
        presupuestosCargados = resultado.data || [];
        renderizarListaPresupuestos(presupuestosCargados);
    } catch (error) {
        lista.innerHTML = '<div class="empty-state">Error al cargar presupuestos</div>';
    }

    lista.classList.remove('loading');
}

function cerrarHistorial() {
    document.getElementById('modalHistorial').classList.remove('active');
    document.getElementById('buscarCliente').value = '';
}

function renderizarListaPresupuestos(presupuestos) {
    const lista = document.getElementById('listaPresupuestos');

    if (!presupuestos || presupuestos.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No hay presupuestos guardados</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = presupuestos.map(p => {
        const fecha = p.presupuesto?.fecha ? formatearFecha(p.presupuesto.fecha) : 'Sin fecha';
        const moneda = p.moneda || 'USD';
        const valorTotal = p.valores?.total ? formatearMoneda(p.valores.total, moneda) : '-';

        return `
            <div class="presupuesto-item" data-id="${p.id}">
                <div class="presupuesto-info">
                    <div>
                        <span class="presupuesto-numero">#${p.presupuesto?.numero || '00'}</span>
                        <span class="presupuesto-cliente">${p.cliente?.nombre || 'Sin nombre'}</span>
                    </div>
                    <div class="presupuesto-fecha">${fecha}</div>
                </div>
                <div class="presupuesto-valor">${valorTotal}</div>
                <div class="presupuesto-actions">
                    <button class="btn-accion btn-editar" onclick="editarPresupuesto('${p.id}')">Editar</button>
                    <button class="btn-accion btn-duplicar" onclick="duplicarPresupuestoUI('${p.id}')">Duplicar</button>
                    <button class="btn-accion btn-eliminar" onclick="eliminarPresupuestoUI('${p.id}')">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

function filtrarHistorial() {
    const busqueda = document.getElementById('buscarCliente').value.toLowerCase();

    if (!busqueda) {
        renderizarListaPresupuestos(presupuestosCargados);
        return;
    }

    const filtrados = presupuestosCargados.filter(p =>
        p.cliente?.nombre?.toLowerCase().includes(busqueda) ||
        p.presupuesto?.numero?.includes(busqueda)
    );

    renderizarListaPresupuestos(filtrados);
}

// ==================== EDICIÓN ====================

async function editarPresupuesto(id) {
    try {
        const resultado = await obtenerPresupuestoPorId(id);

        if (!resultado.success) {
            showToast('Error al cargar presupuesto', 'error');
            return;
        }

        cargarPresupuestoEnFormulario(resultado.data);
        cerrarHistorial();
        showToast('Presupuesto cargado para edición', 'success');
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

function cargarPresupuestoEnFormulario(presupuesto) {
    // Guardar ID para actualización
    document.getElementById('presupuestoId').value = presupuesto.id;

    // Datos del agente
    document.getElementById('nombreAgente').value = presupuesto.agente?.nombre || '';
    document.getElementById('telefonoAgente').value = presupuesto.agente?.telefono || '';

    // Datos del cliente
    document.getElementById('nombreCliente').value = presupuesto.cliente?.nombre || '';
    document.getElementById('telefonoCliente').value = presupuesto.cliente?.telefono || '';
    document.getElementById('ciudadCliente').value = presupuesto.cliente?.ciudad || '';
    document.getElementById('destinoFinal').value = presupuesto.cliente?.destinoFinal || '';
    document.getElementById('cantidadPasajeros').value = presupuesto.cliente?.cantidadPasajeros || '';

    // Datos del presupuesto
    document.getElementById('numeroPresupuesto').value = presupuesto.presupuesto?.numero || '';
    document.getElementById('fechaPresupuesto').value = presupuesto.presupuesto?.fecha || '';

    // Tipo de viaje y vuelos
    const tipoViaje = presupuesto.presupuesto?.tipoViaje || '';
    document.getElementById('tipoViaje').value = tipoViaje;

    // Limpiar vuelos existentes y recrear según tipo
    limpiarVuelos();
    if (tipoViaje) {
        actualizarVuelosPorTipo();
        // Cargar datos de vuelos
        setTimeout(() => {
            const vueloItems = document.querySelectorAll('.vuelo-item');
            presupuesto.vuelos?.forEach((vuelo, index) => {
                if (vueloItems[index]) {
                    cargarDatosVuelo(vueloItems[index], vuelo);
                }
            });
        }, 100);
    }

    // Hoteles
    limpiarHoteles();
    presupuesto.hoteles?.forEach(hotel => {
        agregarHotel();
        const hotelItems = document.querySelectorAll('.hotel-item');
        const ultimoHotel = hotelItems[hotelItems.length - 1];
        cargarDatosHotel(ultimoHotel, hotel);
    });

    // Opciones toggle
    setToggleValue('incluyeTransfer', presupuesto.incluyeTransfer ? 'si' : 'no');
    setToggleValue('incluyeSeguro', presupuesto.incluyeSeguro ? 'si' : 'no');
    setToggleValue('incluyeVehiculo', presupuesto.incluyeVehiculo ? 'si' : 'no');
    setToggleValue('moneda', presupuesto.moneda || 'USD');

    // Valores
    document.getElementById('valorPorPersona').value = presupuesto.valores?.porPersona || '';
    document.getElementById('valorTotal').value = presupuesto.valores?.total || '';

    // Activar modo edición visual
    activarModoEdicion();
}

function cargarDatosVuelo(vueloItem, datos) {
    vueloItem.querySelector('.vuelo-numero').value = datos.numero || '';
    vueloItem.querySelector('.vuelo-fecha').value = datos.fecha || '';
    vueloItem.querySelector('.vuelo-origen').value = datos.origen || '';
    vueloItem.querySelector('.vuelo-destino').value = datos.destino || '';
    vueloItem.querySelector('.vuelo-hora-salida').value = datos.horaSalida || '';
    vueloItem.querySelector('.vuelo-hora-llegada').value = datos.horaLlegada || '';
    vueloItem.querySelector('.vuelo-aerolinea').value = datos.aerolinea || '';
    vueloItem.querySelector('.vuelo-duracion').value = datos.duracion || '';
    vueloItem.querySelector('.vuelo-escalas').value = datos.escalas || '';

    // Mostrar info si hay datos
    if (datos.origen && datos.destino) {
        const info = vueloItem.querySelector('.vuelo-info');
        info.style.display = 'block';
        info.querySelector('.vuelo-ruta').textContent = `${datos.origen} → ${datos.destino}`;
        info.querySelector('.vuelo-horario').textContent = `${datos.horaSalida || ''} - ${datos.horaLlegada || ''}`;
        info.querySelector('.vuelo-airline').textContent = datos.aerolinea || '';
    }
}

function cargarDatosHotel(hotelItem, datos) {
    hotelItem.querySelector('.hotel-nombre').value = datos.nombre || '';
    hotelItem.querySelector('.hotel-url').value = datos.url || '';
    hotelItem.querySelector('.hotel-tipo-cuarto').value = datos.tipoCuarto || '';
    hotelItem.querySelector('.hotel-fecha-entrada').value = datos.fechaEntrada || '';
    hotelItem.querySelector('.hotel-fecha-salida').value = datos.fechaSalida || '';
    hotelItem.querySelector('.hotel-noches').value = datos.noches || '';
    hotelItem.querySelector('.hotel-regimen').value = datos.regimen || '';
}

function limpiarHoteles() {
    document.getElementById('hospedajeContainer').innerHTML = '';
    hotelCount = 0;
}

function setToggleValue(inputId, valor) {
    const hiddenInput = document.getElementById(inputId);
    if (!hiddenInput) return;

    hiddenInput.value = valor;

    // Actualizar botones visuales
    const container = hiddenInput.closest('.toggle-siNo');
    if (container) {
        const buttons = container.querySelectorAll('.toggle-btn');
        buttons.forEach(btn => {
            const btnValor = btn.textContent.toLowerCase() === 'sí' ? 'si' :
                           btn.textContent.toLowerCase() === 'no' ? 'no' :
                           btn.textContent;
            btn.classList.toggle('active', btnValor === valor);
        });
    }
}

function activarModoEdicion() {
    document.body.classList.add('editing-mode');
}

function desactivarModoEdicion() {
    document.body.classList.remove('editing-mode');
    document.getElementById('presupuestoId').value = '';
}

// Nuevo presupuesto (limpiar formulario)
function nuevoPresupuesto() {
    if (confirm('¿Deseas crear un nuevo presupuesto? Se perderán los cambios no guardados.')) {
        desactivarModoEdicion();
        document.getElementById('budgetForm').reset();
        initForm();
    }
}

// ==================== DUPLICAR / ELIMINAR ====================

async function duplicarPresupuestoUI(id) {
    if (!confirm('¿Deseas duplicar este presupuesto?')) return;

    try {
        const resultado = await duplicarPresupuesto(id);
        if (resultado.success) {
            showToast('Presupuesto duplicado correctamente', 'success');
            // Recargar lista
            abrirHistorial();
        } else {
            showToast('Error al duplicar: ' + resultado.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function eliminarPresupuestoUI(id) {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return;

    try {
        const resultado = await eliminarPresupuesto(id);
        if (resultado.success) {
            showToast('Presupuesto eliminado', 'success');
            // Recargar lista
            abrirHistorial();
        } else {
            showToast('Error al eliminar: ' + resultado.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}
