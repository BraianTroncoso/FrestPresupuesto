// Variable para almacenar presupuestos cargados
let presupuestosCargados = [];

// ==================== SISTEMA DE IDIOMAS ====================
let idiomaActual = localStorage.getItem('idioma') || 'es';

const TRADUCCIONES = {
    es: {
        // Header
        presupuesto: 'Presupuesto',
        deViaje: 'de Viaje',
        // Secciones
        datosAgente: 'Datos del Agente',
        datosCliente: 'Datos del Cliente',
        datosPresupuesto: 'Datos del Presupuesto',
        // Labels Agente
        nombreAgente: 'Nombre del Agente',
        emailAgente: 'Email del Agente',
        telefonoAgente: 'Teléfono Agente',
        // Labels Cliente
        nombreCliente: 'Nombre del Cliente',
        telefonoCliente: 'Teléfono Cliente',
        ciudadCliente: 'Ciudad del Cliente',
        destinoFinal: 'Destino Final',
        cantidadPasajeros: 'Cantidad de Pasajeros',
        // Labels Presupuesto
        numeroPresupuesto: 'Número de Presupuesto',
        fechaPresupuesto: 'Fecha de Presupuesto',
        tipoViaje: 'Tipo de Viaje',
        tipoTarifa: 'Tipo de Tarifa',
        seleccionar: 'Seleccionar...',
        soloIda: 'Solo Ida',
        idaVuelta: 'Ida y Vuelta',
        multiDestino: 'Multi-destino',
        // Vuelos
        vuelosIda: 'Vuelos de Ida',
        vuelosVuelta: 'Vuelos de Vuelta',
        vuelos: 'Vuelos',
        agregarIda: '+ Agregar Ida',
        agregarVuelta: '+ Agregar Vuelta',
        agregarVuelo: '+ Agregar Vuelo',
        // Hospedaje
        hospedaje: 'Hospedaje',
        agregarHotel: '+ Agregar Hotel',
        // Servicios
        incluyeTransfer: '¿Incluye Transfer?',
        seguroViaje: 'Seguro de Viaje',
        incluyeSeguro: '¿Incluye Seguro?',
        alquilerVehiculo: 'Alquiler de Vehículo',
        incluyeVehiculo: '¿Incluye Alquiler de Vehículo?',
        si: 'Sí',
        no: 'No',
        // Valores
        valores: 'Valores',
        moneda: 'Moneda',
        valorPorPersona: 'Valor por Persona',
        valorTotal: 'Valor Total',
        // Botones
        guardar: 'Guardar',
        historial: 'Historial',
        exportarPDF: 'Exportar PDF',
        exportarExcel: 'Exportar Excel'
    },
    pt: {
        // Header
        presupuesto: 'Orçamento',
        deViaje: 'de Viagem',
        // Secciones
        datosAgente: 'Dados do Agente',
        datosCliente: 'Dados do Cliente',
        datosPresupuesto: 'Dados do Orçamento',
        // Labels Agente
        nombreAgente: 'Nome do Agente',
        emailAgente: 'Email do Agente',
        telefonoAgente: 'Telefone Agente',
        // Labels Cliente
        nombreCliente: 'Nome do Cliente',
        telefonoCliente: 'Telefone Cliente',
        ciudadCliente: 'Cidade do Cliente',
        destinoFinal: 'Destino Final',
        cantidadPasajeros: 'Quantidade de Passageiros',
        // Labels Presupuesto
        numeroPresupuesto: 'Número do Orçamento',
        fechaPresupuesto: 'Data do Orçamento',
        tipoViaje: 'Tipo de Viagem',
        tipoTarifa: 'Tipo de Tarifa',
        seleccionar: 'Selecionar...',
        soloIda: 'Só Ida',
        idaVuelta: 'Ida e Volta',
        multiDestino: 'Multi-destino',
        // Vuelos
        vuelosIda: 'Voos de Ida',
        vuelosVuelta: 'Voos de Volta',
        vuelos: 'Voos',
        agregarIda: '+ Adicionar Ida',
        agregarVuelta: '+ Adicionar Volta',
        agregarVuelo: '+ Adicionar Voo',
        // Hospedaje
        hospedaje: 'Hospedagem',
        agregarHotel: '+ Adicionar Hotel',
        // Servicios
        incluyeTransfer: 'Inclui Transfer?',
        seguroViaje: 'Seguro Viagem',
        incluyeSeguro: 'Inclui Seguro?',
        alquilerVehiculo: 'Aluguel de Veículo',
        incluyeVehiculo: 'Inclui Aluguel de Veículo?',
        si: 'Sim',
        no: 'Não',
        // Valores
        valores: 'Valores',
        moneda: 'Moeda',
        valorPorPersona: 'Valor por Pessoa',
        valorTotal: 'Valor Total',
        // Botones
        guardar: 'Salvar',
        historial: 'Histórico',
        exportarPDF: 'Exportar PDF',
        exportarExcel: 'Exportar Excel'
    }
};

function cambiarIdioma(idioma) {
    idiomaActual = idioma;
    localStorage.setItem('idioma', idioma);

    // Actualizar clases de banderas
    document.querySelectorAll('.bandera').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.idioma === idioma);
    });

    // Traducir todos los elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (TRADUCCIONES[idioma][key]) {
            el.textContent = TRADUCCIONES[idioma][key];
        }
    });
}

// Aplicar idioma guardado al cargar
function aplicarIdiomaGuardado() {
    const idioma = localStorage.getItem('idioma') || 'es';
    cambiarIdioma(idioma);
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await initForm();
    // initFirebase() ya no es necesario - usamos api-client.js
    aplicarIdiomaGuardado();
    cargarDatosUsuario();
});

// Cargar datos del usuario logueado
function cargarDatosUsuario() {
    const usuario = getUsuarioActual();
    if (usuario) {
        // Mostrar nombre en el header
        const nombreSpan = document.getElementById('usuarioNombre');
        if (nombreSpan) {
            nombreSpan.textContent = usuario.nombre || usuario.email;
        }

        // Cargar datos del agente desde el usuario
        document.getElementById('nombreAgente').value = usuario.nombre || '';
        document.getElementById('emailAgente').value = usuario.email || '';
        document.getElementById('telefonoAgente').value = usuario.telefono || '';
        document.getElementById('cadastur').value = usuario.cadastur || '37.286.620/0001-49';
    }
}

function initForm() {
    // Los datos del agente se cargan desde el usuario logueado en cargarDatosUsuario()

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
function agregarVuelo(tipo = 'ida') {
    vueloCount++;
    const template = document.getElementById('vueloTemplate');
    const clone = template.content.cloneNode(true);

    // Determinar contenedor y label según tipo
    let container;
    let labelTexto;

    if (tipo === 'ida') {
        container = document.getElementById('vuelosIdaContainer');
        labelTexto = 'Ida ' + (document.querySelectorAll('#vuelosIdaContainer .vuelo-item').length + 1);
    } else if (tipo === 'vuelta') {
        container = document.getElementById('vuelosVueltaContainer');
        labelTexto = 'Vuelta ' + (document.querySelectorAll('#vuelosVueltaContainer .vuelo-item').length + 1);
    } else { // multi
        container = document.getElementById('vuelosMultiContainer');
        labelTexto = document.querySelectorAll('#vuelosMultiContainer .vuelo-item').length + 1;
        // Mostrar selector de tipo en multi-destino
        clone.querySelector('.vuelo-tipo-selector').style.display = 'flex';
    }

    // Asignar label y tipo
    clone.querySelector('.item-number').textContent = labelTexto;
    clone.querySelector('.vuelo-tipo').value = tipo === 'multi' ? 'ida' : tipo;

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

// Actualizar tipo de vuelo cuando cambia el selector (multi-destino)
function actualizarTipoVuelo(select) {
    const vueloItem = select.closest('.vuelo-item');
    vueloItem.querySelector('.vuelo-tipo').value = select.value;
}

// Limpiar todos los vuelos
function limpiarVuelos() {
    document.getElementById('vuelosIdaContainer').innerHTML = '';
    document.getElementById('vuelosVueltaContainer').innerHTML = '';
    document.getElementById('vuelosMultiContainer').innerHTML = '';
    vueloCount = 0;
}

// Actualizar vuelos según tipo de viaje seleccionado
function actualizarVuelosPorTipo() {
    const tipoViaje = document.getElementById('tipoViaje').value;
    const seccionVuelos = document.getElementById('seccionVuelos');

    // Ocultar todas las sub-secciones
    document.getElementById('seccionVuelosIda').style.display = 'none';
    document.getElementById('seccionVuelosVuelta').style.display = 'none';
    document.getElementById('seccionVuelosMulti').style.display = 'none';

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
            // Solo ida: sección de ida con botón agregar
            document.getElementById('seccionVuelosIda').style.display = 'block';
            agregarVuelo('ida');
            break;

        case 'idaVuelta':
            // Ida y vuelta: dos secciones separadas
            document.getElementById('seccionVuelosIda').style.display = 'block';
            document.getElementById('seccionVuelosVuelta').style.display = 'block';
            agregarVuelo('ida');
            agregarVuelo('vuelta');
            break;

        case 'multiDestino':
            // Multi-destino: sección única con selector de tipo por vuelo
            document.getElementById('seccionVuelosMulti').style.display = 'block';
            agregarVuelo('multi');
            agregarVuelo('multi');
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

    // Listener para convertir imagen a base64
    const imagenInput = lastItem.querySelector('.hotel-imagen');
    if (imagenInput) {
        imagenInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    // Guardar base64 en un data attribute
                    imagenInput.dataset.base64 = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
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
            tipoViaje: document.getElementById('tipoViaje').value,
            tipoTarifa: document.getElementById('tipoTarifa').value
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
        },
        // Idioma
        idioma: idiomaActual
    };

    // Recolectar vuelos
    document.querySelectorAll('.vuelo-item').forEach(item => {
        datos.vuelos.push({
            tipo: item.querySelector('.vuelo-tipo').value,
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
        const imagenInput = item.querySelector('.hotel-imagen');
        datos.hoteles.push({
            nombre: item.querySelector('.hotel-nombre').value,
            url: item.querySelector('.hotel-url').value,
            tipoCuarto: item.querySelector('.hotel-tipo-cuarto').value,
            fechaEntrada: item.querySelector('.hotel-fecha-entrada').value,
            fechaSalida: item.querySelector('.hotel-fecha-salida').value,
            noches: item.querySelector('.hotel-noches').value,
            regimen: item.querySelector('.hotel-regimen').value,
            imagen: imagenInput ? imagenInput.dataset.base64 || '' : ''
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
    // Validar formulario antes de guardar
    if (typeof validarFormulario === 'function') {
        // Para guardar, solo validamos nombre del cliente (menos estricto que exportar)
        const nombreCliente = document.getElementById('nombreCliente').value.trim();
        if (!nombreCliente) {
            mostrarErrorCampo('nombreCliente', 'Ingresá el nombre del cliente para guardar');
            return;
        }
    }

    const datos = recolectarDatos();
    const presupuestoId = document.getElementById('presupuestoId').value;

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
            if (typeof mostrarErrorAmigable === 'function') {
                mostrarErrorAmigable(resultado.error);
            } else {
                showToast('Error al guardar el presupuesto', 'error');
            }
        }
    } catch (error) {
        console.error('Error guardando presupuesto:', error);
        if (typeof mostrarErrorAmigable === 'function') {
            mostrarErrorAmigable(error.message || error.toString());
        } else {
            showToast('Error al guardar. Verificá tu conexión e intentá de nuevo.', 'error');
        }
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

    // Tipo de tarifa
    document.getElementById('tipoTarifa').value = presupuesto.presupuesto?.tipoTarifa || '';

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

// ==================== SISTEMA DE VALIDACIÓN ====================

// Mensajes de error amigables para errores técnicos
const ERRORES_AMIGABLES = {
    // Errores de red/servidor
    'Failed to fetch': {
        titulo: 'Sin conexión al servidor',
        mensaje: 'No se pudo conectar con el servidor para generar el PDF.',
        tip: 'Verificá que el servidor esté corriendo (node server.js) y que tengas conexión a internet.'
    },
    'NetworkError': {
        titulo: 'Error de conexión',
        mensaje: 'Hubo un problema de red al intentar procesar tu solicitud.',
        tip: 'Revisá tu conexión a internet o intentá de nuevo en unos segundos.'
    },
    'json': {
        titulo: 'Error al procesar la respuesta',
        mensaje: 'El servidor no pudo procesar correctamente los datos del presupuesto.',
        tip: 'Verificá que todos los campos estén completos y volvé a intentar.'
    },
    'Unexpected end of JSON': {
        titulo: 'Respuesta incompleta del servidor',
        mensaje: 'El servidor no pudo completar la operación.',
        tip: 'Es posible que el servidor se haya reiniciado. Esperá unos segundos y volvé a intentar.'
    },
    '413': {
        titulo: 'Imagen demasiado grande',
        mensaje: 'La imagen del hotel que subiste es muy pesada.',
        tip: 'Intentá subir una imagen más pequeña (menos de 5MB) o reducí su tamaño.'
    },
    '500': {
        titulo: 'Error del servidor',
        mensaje: 'Ocurrió un error interno al procesar tu solicitud.',
        tip: 'Revisá que todos los datos estén correctos. Si el problema persiste, reiniciá el servidor.'
    },
    'timeout': {
        titulo: 'Tiempo de espera agotado',
        mensaje: 'El servidor tardó demasiado en responder.',
        tip: 'Puede que el servidor esté ocupado. Esperá un momento y volvé a intentar.'
    },
    // Errores de Firebase
    'firestore': {
        titulo: 'Error al guardar datos',
        mensaje: 'No se pudo guardar el presupuesto en la base de datos.',
        tip: 'Verificá tu conexión a internet. Si el problema persiste, recargá la página.'
    },
    'permission-denied': {
        titulo: 'Sin permiso para guardar',
        mensaje: 'No tenés permisos para realizar esta acción.',
        tip: 'Verificá que estés usando la configuración correcta de Firebase.'
    },
    'unavailable': {
        titulo: 'Servicio no disponible',
        mensaje: 'El servicio de base de datos no está disponible temporalmente.',
        tip: 'Esperá unos segundos e intentá de nuevo. El servicio se recuperará pronto.'
    },
    'quota-exceeded': {
        titulo: 'Límite alcanzado',
        mensaje: 'Se alcanzó el límite de operaciones de la base de datos.',
        tip: 'Esperá un momento antes de intentar nuevamente.'
    },
    // Errores de validación
    'invalid': {
        titulo: 'Datos incorrectos',
        mensaje: 'Algunos datos del formulario no son válidos.',
        tip: 'Revisá los campos marcados en rojo y corregí los errores.'
    }
};

// Mostrar alerta de error amigable (reemplaza alert())
function mostrarErrorAmigable(error) {
    // Buscar mensaje amigable
    let errorInfo = null;
    const errorStr = error.toString().toLowerCase();

    for (const [key, value] of Object.entries(ERRORES_AMIGABLES)) {
        if (errorStr.includes(key.toLowerCase())) {
            errorInfo = value;
            break;
        }
    }

    // Si no encontramos un mensaje específico, usar uno genérico
    if (!errorInfo) {
        errorInfo = {
            titulo: 'Algo salió mal',
            mensaje: 'Ocurrió un error inesperado al procesar tu solicitud.',
            tip: 'Verificá que todos los campos estén completos y volvé a intentar. Si el problema persiste, reiniciá la página.'
        };
    }

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'error-overlay';

    // Crear alerta
    const alert = document.createElement('div');
    alert.className = 'error-alert';
    alert.innerHTML = `
        <div class="error-alert-header">
            <span class="error-icon">⚠️</span>
            <h3>${errorInfo.titulo}</h3>
        </div>
        <div class="error-alert-body">
            <p>${errorInfo.mensaje}</p>
            <div class="error-alert-tip">${errorInfo.tip}</div>
        </div>
        <div class="error-alert-footer">
            <button class="error-alert-close">Entendido</button>
        </div>
    `;

    // Agregar al DOM
    document.body.appendChild(overlay);
    document.body.appendChild(alert);

    // Cerrar al hacer click
    const cerrar = () => {
        alert.remove();
        overlay.remove();
    };

    alert.querySelector('.error-alert-close').addEventListener('click', cerrar);
    overlay.addEventListener('click', cerrar);

    // Cerrar con Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            cerrar();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Log del error original para debugging
    console.error('Error original:', error);
}

// Validaciones de campos
const VALIDACIONES = {
    nombreCliente: {
        requerido: true,
        mensaje: 'Ingresá el nombre del cliente para continuar'
    },
    nombreAgente: {
        requerido: true,
        mensaje: 'Ingresá tu nombre como agente'
    },
    tipoViaje: {
        requerido: true,
        mensaje: 'Seleccioná el tipo de viaje (ida, ida y vuelta, o multi-destino)'
    },
    cantidadPasajeros: {
        requerido: true,
        mensaje: 'Indicá cuántos pasajeros viajan',
        validar: (valor) => {
            const num = parseInt(valor);
            if (isNaN(num) || num < 1) {
                return 'La cantidad de pasajeros debe ser al menos 1';
            }
            return null;
        }
    },
    valorPorPersona: {
        requerido: true,
        mensaje: 'Ingresá el valor por persona del presupuesto',
        validar: (valor) => {
            const num = parseFloat(valor);
            if (isNaN(num) || num <= 0) {
                return 'El valor debe ser mayor a 0';
            }
            return null;
        }
    }
};

// Mostrar error en un campo específico
function mostrarErrorCampo(inputId, mensaje) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    // Agregar clase de error
    formGroup.classList.add('has-error');

    // Buscar o crear mensaje de error
    let errorMsg = formGroup.querySelector('.error-message');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        formGroup.appendChild(errorMsg);
    }

    errorMsg.textContent = mensaje;

    // Hacer scroll al primer error
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus();
}

// Limpiar error de un campo
function limpiarErrorCampo(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    formGroup.classList.remove('has-error');
}

// Limpiar todos los errores
function limpiarTodosLosErrores() {
    document.querySelectorAll('.form-group.has-error').forEach(group => {
        group.classList.remove('has-error');
    });
}

// Validar formulario completo
function validarFormulario() {
    limpiarTodosLosErrores();

    let primerError = null;

    for (const [campo, config] of Object.entries(VALIDACIONES)) {
        const input = document.getElementById(campo);
        if (!input) continue;

        const valor = input.value.trim();

        // Validar campo requerido
        if (config.requerido && !valor) {
            if (!primerError) primerError = { campo, mensaje: config.mensaje };
            mostrarErrorCampo(campo, config.mensaje);
            continue;
        }

        // Validación personalizada
        if (config.validar && valor) {
            const error = config.validar(valor);
            if (error) {
                if (!primerError) primerError = { campo, mensaje: error };
                mostrarErrorCampo(campo, error);
            }
        }
    }

    // Validaciones adicionales

    // Verificar que haya al menos un vuelo con datos
    const tipoViaje = document.getElementById('tipoViaje').value;
    if (tipoViaje) {
        const vuelos = document.querySelectorAll('.vuelo-item');
        let tieneVueloValido = false;

        vuelos.forEach(vuelo => {
            const origen = vuelo.querySelector('.vuelo-origen')?.value;
            const destino = vuelo.querySelector('.vuelo-destino')?.value;
            if (origen && destino) tieneVueloValido = true;
        });

        if (!tieneVueloValido && vuelos.length > 0) {
            showToast('Completá al menos un vuelo con origen y destino', 'error');
            if (!primerError) {
                primerError = { campo: 'vuelos', mensaje: 'Completar vuelos' };
            }
        }
    }

    return primerError === null;
}

// Agregar listeners para limpiar errores cuando el usuario escribe
function inicializarValidacionEnTiempoReal() {
    for (const campo of Object.keys(VALIDACIONES)) {
        const input = document.getElementById(campo);
        if (input) {
            input.addEventListener('input', () => limpiarErrorCampo(campo));
            input.addEventListener('change', () => limpiarErrorCampo(campo));
        }
    }
}

// Inicializar validación cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarValidacionEnTiempoReal, 500);
});
