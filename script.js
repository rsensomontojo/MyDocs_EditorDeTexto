// Funciones básicas de edición
function formatearTexto(comando, valor = null) {
    document.execCommand(comando, false, valor);
}

// Funciones de documento
function nuevoDocumento() {
    if (confirm('¿Estás seguro de querer crear un nuevo documento? Se perderán los cambios no guardados.')) {
        document.getElementById('editor-texto').innerHTML = '';
    }
}

function abrirArchivo() {
    document.getElementById('entradaArchivo').click();
}

document.getElementById('entradaArchivo').addEventListener('change', function (e) {
    const archivo = e.target.files[0];
    const lector = new FileReader();

    lector.onload = function (e) {
        const contenido = e.target.result;
        document.getElementById('editor-texto').innerHTML = contenido;
    };

    if (archivo.name.endsWith('.txt')) {
        lector.readAsText(archivo);
    } else if (archivo.name.endsWith('.html')) {
        lector.readAsText(archivo);
    }
});

// Funciones de guardado
function guardarComoTexto() {
    const texto = document.getElementById('editor-texto').innerText;
    const nombreArchivo = prompt("Ingresa el nombre del archivo:", "documento.txt");
    if (nombreArchivo) {
        descargarArchivo(texto, nombreArchivo, 'text/plain');
    }
}

function guardarComoHtml() {
    const html = document.getElementById('editor-texto').innerHTML;
    const nombreArchivo = prompt("Ingresa el nombre del archivo:", "documento.html");
    if (nombreArchivo) {
        descargarArchivo(html, nombreArchivo, 'text/html');
    }
}

async function guardarComoPdf() {

    const { jsPDF } = window.jspdf;
    const editor = document.getElementById('editor-texto');

    try {
        // Crear un contenedor temporal que replique el estilo exacto del editor
        const contenedorDiv = document.createElement('div');
        contenedorDiv.innerHTML = editor.innerHTML;

        // Aplicar los estilos específicos que coinciden con tu CSS
        Object.assign(contenedorDiv.style, {
            width: '180mm',
            minHeight: '297mm',
            padding: '20mm',
            fontSize: '16px',
            lineHeight: '1.6',
            backgroundColor: 'white',
            fontFamily: 'Arial, sans-serif',
            position: 'absolute',
            left: '-9999px',
            border: '1px solid #ddd',
            boxSizing: 'border-box'
        });

        // Añadir estilos específicos para elementos internos
        const hojaEstilo = document.createElement('style');
        hojaEstilo.textContent = `
            table { border-collapse: collapse; width: 100%; margin: 10px 0; }
            td, th { border: 1px solid #ddd; padding: 8px; min-width: 50px; }
            ul, ol { margin-left: 20px; padding-left: 20px; }
            a { color: #007bff; text-decoration: none; }
            hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
        `;
        contenedorDiv.appendChild(hojaEstilo);

        document.body.appendChild(contenedorDiv);

        // Obtener la altura real del contenido
        const alturaContenido = contenedorDiv.scrollHeight;

        // Altura de página A4 en pixels (297mm)
        const alturaPagina = 1123; // 297mm convertido a pixels

        // Calcular el número de páginas necesarias
        const totalPaginas = Math.ceil(alturaContenido / alturaPagina);

        // Crear PDF con dimensiones A4
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        // Procesar cada página
        for (let pagina = 0; pagina < totalPaginas; pagina++) {
            // Si no es la primera página, añadir una nueva
            if (pagina > 0) {
                pdf.addPage();
            }

            // Configurar html2canvas para capturar solo la porción de esta página
            const lienzo = await html2canvas(contenedorDiv, {
                scale: 2,
                useCORS: true,
                logging: false,
                width: 677, // 180mm convertido a pixels
                height: alturaPagina,
                windowWidth: 677,
                backgroundColor: '#ffffff',
                y: pagina * alturaPagina, // Desplazamiento vertical para cada página
                scrollY: -pagina * alturaPagina
            });

            // Convertir el lienzo a imagen
            const imgData = lienzo.toDataURL('image/jpeg', 1.0);

            // Añadir la imagen al PDF
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        }

        // Limpiar
        document.body.removeChild(contenedorDiv);

        // Confirmar antes de guardar
        const nombreArchivo = prompt("Ingresa el nombre del archivo:", "documento.pdf");
        if (nombreArchivo) {
            // Advertir sobre el formato
            const confirmarGuardado = confirm(`El documento se guardará como PDF con ${totalPaginas} página(s). ¿Deseas continuar?`);
            if (confirmarGuardado) {
                pdf.save(nombreArchivo);
            }
        }
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
}
// Función auxiliar para aplicar estilos heredados
function obtenerEstilosComputados(elemento) {
    const estilos = window.getComputedStyle(elemento);
    return {
        'font-family': estilos.getPropertyValue('font-family'),
        'font-size': estilos.getPropertyValue('font-size'),
        'font-weight': estilos.getPropertyValue('font-weight'),
        'font-style': estilos.getPropertyValue('font-style'),
        'text-decoration': estilos.getPropertyValue('text-decoration'),
        'color': estilos.getPropertyValue('color'),
        'background-color': estilos.getPropertyValue('background-color'),
        'text-align': estilos.getPropertyValue('text-align'),
    };
}

function descargarArchivo(contenido, nombreArchivo, tipoContenido) {
    const blob = new Blob([contenido], { type: tipoContenido });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    URL.revokeObjectURL(url);
}

// Funciones de inserción
function insertarTabla() {
    const filas = prompt("Número de filas:", "3");
    const columnas = prompt("Número de columnas:", "3");

    if (filas && columnas) {
        let tabla = '<table border="1" style="border-collapse: collapse;">';
        for (let i = 0; i < filas; i++) {
            tabla += '<tr>';
            for (let j = 0; j < columnas; j++) {
                tabla += '<td style="padding: 5px;">Celda</td>';
            }
            tabla += '</tr>';
        }
        tabla += '</table>';

        document.execCommand('insertHTML', false, tabla);
    }
}

function insertarEnlace() {
    const url = prompt("Ingresa la URL:", "https://");
    if (url) {
        document.execCommand('createLink', false, url);
    }
}

// Funciones de historial
function deshacer() {
    document.execCommand('undo', false, null);
}

function rehacer() {
    document.execCommand('redo', false, null);
}
// Función para avisar que si se guarda un txt no se guardan las modificaciones de texto
function guardarComoTexto() {
    const texto = document.getElementById('editor-texto').innerText;
    const nombreArchivo = prompt("Ingresa el nombre del archivo:", "documento.txt");

    if (nombreArchivo) {
        // Mostrar una advertencia antes de guardar
        const confirmarGuardado = confirm("¿Estás seguro de querer guardar como TXT? Ten en cuenta que las modificaciones de formato (negrita, cursiva, etc.) no se guardarán en un archivo de texto plano.");

        if (confirmarGuardado) {
            descargarArchivo(texto, nombreArchivo, 'text/plain');
        }
    }
}
function formatearTexto(comando, valor = null) {
    document.execCommand(comando, false, valor);

    // Obtener el botón que se presionó (manejando tanto el clic en el botón como en el ícono)
    let boton = event.target;
    if (boton.tagName === 'I') {
        boton = boton.parentElement;
    }

    // Objeto que agrupa los comandos por categorías
    const gruposComandos = {
        texto: ['bold', 'italic', 'underline', 'strikeThrough'],
        alineacion: ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull']
    };

    // Efecto temporal para botones que no son de formato ni alineación
    if (!gruposComandos.texto.includes(comando) && !gruposComandos.alineacion.includes(comando)) {
        boton.classList.add('active');
        setTimeout(() => {
            boton.classList.remove('active');
        }, 200); // El efecto dura 200ms
        return;
    }

    // Manejar grupos de botones de alineación
    if (gruposComandos.alineacion.includes(comando)) {
        const botonesAlineacion = boton.parentElement.querySelectorAll('button');
        const estabaActivo = boton.classList.contains('active');

        // Primero, eliminar la clase active de todos los botones de alineación
        botonesAlineacion.forEach(btn => btn.classList.remove('active'));

        // Si el botón no estaba activo, activarlo
        if (!estabaActivo) {
            boton.classList.add('active');
        }
    }
    // Manejar botones de formato de texto (negrita, cursiva, etc.)
    else if (gruposComandos.texto.includes(comando)) {
        // Toggle del estado activo
        if (boton.classList.contains('active')) {
            boton.classList.remove('active');
        } else {
            boton.classList.add('active');
        }
    }
}

// Agregar un evento para sincronizar el estado de los botones cuando se selecciona texto
document.getElementById('editor-texto').addEventListener('mouseup', function () {
    // Sincronizar botones de formato
    ['bold', 'italic', 'underline', 'strikeThrough'].forEach(comando => {
        const boton = document.querySelector(`button[onclick="formatearTexto('${comando}')"]`);
        if (boton) {
            if (document.queryCommandState(comando)) {
                boton.classList.add('active');
            } else {
                boton.classList.remove('active');
            }
        }
    });

    // Sincronizar botones de alineación
    ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].forEach(comando => {
        const boton = document.querySelector(`button[onclick="formatearTexto('${comando}')"]`);
        if (boton) {
            if (document.queryCommandState(comando)) {
                const botonesAlineacion = boton.parentElement.querySelectorAll('button');
                botonesAlineacion.forEach(btn => btn.classList.remove('active'));
                boton.classList.add('active');
            }
        }
    });
});
// Agregar un evento para sincronizar el estado de los botones cuando se selecciona texto
document.getElementById('editor-texto').addEventListener('mouseup', function () {
    // Sincronizar botones de formato
    ['bold', 'italic', 'underline', 'strikeThrough'].forEach(comando => {
        const boton = document.querySelector(`button[onclick="formatearTexto('${comando}')"]`);
        if (boton) {
            if (document.queryCommandState(comando)) {
                boton.classList.add('active');
            } else {
                boton.classList.remove('active');
            }
        }
    });

    // Sincronizar botones de alineación
    ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].forEach(comando => {
        const boton = document.querySelector(`button[onclick="formatearTexto('${comando}')"]`);
        if (boton) {
            if (document.queryCommandState(comando)) {
                const botonesAlineacion = boton.parentElement.querySelectorAll('button');
                botonesAlineacion.forEach(btn => btn.classList.remove('active'));
                boton.classList.add('active');
            }
        }
    });
});

// Definimos las plantillas
const plantillas = {
    blanco: '',
    contratoImagen: `<h2>CONTRATO DE CESIÓN DE DERECHOS DE IMAGEN</h2>
<p>En _____________, a ___ de __________ de 20___</p>

<p><strong>REUNIDOS</strong></p>
<p>De una parte, D./Dña. _________________, mayor de edad, con DNI _____________,</p>

<p>y domicilio en _________________ (en adelante, el "Cedente").</p>

<p>Y de otra parte, D./Dña. _________________, mayor de edad, con DNI _____________,</p>

<p>en nombre y representación de _________________ (en adelante, el "Cesionario").</p>

<p><strong>ACUERDAN</strong></p>

<p>1. El Cedente autoriza al Cesionario a utilizar su imagen en material </p

<p>publicitario relacionado con ___________________.</p>

<p>2. La presente autorización tiene un ámbito territorial de _________________ y</p>
<p>un ámbito temporal de _________________.</p>

<p>3. La contraprestación por la presente cesión será de _________________ euros.</p>

<p><strong>FIRMAS</strong></p>
<p>El Cedente                                El Cesionario</p>
<p>____________                              ____________</p>`,

    cartaFormal: `<h2>CARTA FORMAL</h2>
<p style="text-align: right;">_________________, ___ de __________ de 20___</p>

<p>Estimado/a Sr./Sra. _________________,</p>

<p>Me dirijo a usted para _________________.</p>

<p>[Cuerpo de la carta]</p>

<p>Sin otro particular, reciba un cordial saludo,</p>

<p>Atentamente,</p>
<p>_________________</p>
<p>DNI: _________________</p>`,

    portadaProyecto: `<h2 style="text-align: center;">TÍTULO DEL PROYECTO</h2>
<h2 style="text-align: center;">Subtítulo</h2>

<div style="text-align: center; margin-top: 50px;">
    <p><strong>Autor:</strong> _________________</p>
    <p><strong>Asignatura:</strong> _________________</p>
    <p><strong>Profesor:</strong> _________________</p>
    <p><strong>Fecha:</strong> _________________</p>
</div>`,

    actaReunion: `<h2>ACTA DE REUNIÓN</h2>
<p><strong>Fecha:</strong> ___/___/___</p>
<p><strong>Hora:</strong> ___:___</p>
<p><strong>Lugar:</strong> _________________</p>

<p><strong>ASISTENTES:</strong></p>
<ul>
    <li>_________________</li>
    <li>_________________</li>
    <li>_________________</li>
</ul>

<p><strong>ORDEN DEL DÍA:</strong></p>
<ol>
    <li>_________________</li>
    <li>_________________</li>
    <li>_________________</li>
</ol>

<p><strong>ACUERDOS:</strong></p>
<p>_________________</p>

<p><strong>Firma del secretario:</strong> _________________</p>`,

    contratoArrendamiento: `<h2>CONTRATO DE ARRENDAMIENTO</h2>
<p>En _____________, a ___ de __________ de 20___</p>

<p><strong>REUNIDOS</strong></p>
<p>De una parte, D./Dña. _________________, mayor de edad, con DNI _____________,</p>
<p>y domicilio en _________________ (en adelante, el "Arrendador").</p>

<p>Y de otra parte, D./Dña. _________________, mayor de edad, con DNI _____________,</p>
<p>y domicilio en _________________ (en adelante, el "Arrendatario").</p>

<p><strong>ACUERDAN</strong></p>

<p>1. El Arrendador cede al Arrendatario el uso del inmueble situado en _________________.</p>

<p>2. El plazo de arrendamiento será de _________________ meses/años.</p>

<p>3. La renta mensual será de _________________ euros.</p>

<p><strong>FIRMAS</strong></p>
<p>El Arrendador                                El Arrendatario</p>
<p>____________                              ____________</p>`,

    renuncia: `<h2>CARTA DE RENUNCIA</h2>
<p style="text-align: right;">_________________, ___ de __________ de 20___</p>

<p>Estimado/a Sr./Sra. _________________,</p>

<p>Por medio de la presente, le comunico mi decisión de renunciar a mi puesto</p>
<p>de trabajo en _________________, efectiva a partir del ___ de __________ de 20___.</p>

<p>Agradezco la oportunidad que me han brindado y los aprendizajes</p>
<p>obtenidos durante mi tiempo en la empresa.</p>

<p>Sin otro particular, reciba un cordial saludo,</p>

<p>Atentamente,</p>
<p>_________________</p>
<p>DNI: _________________</p>`,

    presupuesto: `<h2>PRESUPUESTO</h2>
<p><strong>Fecha:</strong> ___/___/___</p>
<p><strong>Cliente:</strong> _________________</p>
<p><strong>Descripción del servicio/producto:</strong></p>
<ul>
    <li>_________________</li>
    <li>_________________</li>
    <li>_________________</li>
</ul>

<p><strong>Total:</strong> _________________ euros</p>

<p><strong>Condiciones de pago:</strong> _________________</p>

<p><strong>Firma del proveedor:</strong> _________________</p>`,

    cartaRecomendacion: `<h2>CARTA DE RECOMENDACIÓN</h2>
<p style="text-align: right;">_________________, ___ de __________ de 20___</p>

<p>Estimado/a Sr./Sra. _________________,</p>

<p>Por medio de la presente, me complace recomendar a D./Dña. _________________,</p>
<p>quien ha trabajado conmigo en _________________ durante ___ años/meses.</p>

<p>Durante su tiempo en nuestra empresa, demostró ser una persona _________________</p>
<p>(descripción de cualidades).</p>

<p>Sin otro particular, reciba un cordial saludo,</p>

<p>Atentamente,</p>
<p>_________________</p>
<p>DNI: _________________</p>`,

    contratoTrabajo: `<h2>CONTRATO DE TRABAJO</h2>
<p>En _____________, a ___ de __________ de 20___</p>

<p><strong>REUNIDOS</strong></p>
<p>De una parte, D./Dña. _________________, mayor de edad, con DNI _____________,</p>
<p>y domicilio en _________________ (en adelante, el "Empleador").</p>

<p>Y de otra parte, D./Dña. _________________, mayor de edad, con DNI _____________,</p>
<p>y domicilio en _________________ (en adelante, el "Trabajador").</p>

<p><strong>ACUERDAN</strong></p>

<p>1. El Trabajador se compromete a prestar sus servicios en _________________.</p>

<p>2. El salario mensual será de _________________ euros.</p>

<p>3. El horario de trabajo será de _________________ horas semanales.</p>

<p><strong>FIRMAS</strong></p>
<p>El Empleador                                El Trabajador</p>
<p>____________                              ____________</p>`,

    cartaAgradecimiento: `<h2>CARTA DE AGRADECIMIENTO</h2>
<p style="text-align: right;">_________________, ___ de __________ de 20___</p>

<p>Estimado/a Sr./Sra. _________________,</p>

<p>Quiero expresar mi más sincero agradecimiento por _________________.</p>

<p>Su apoyo ha sido fundamental para _________________ (descripción del</p>
<p>motivo de agradecimiento).</p>

<p>Sin otro particular, reciba un cordial saludo,</p>

<p>Atentamente,</p>
<p>_________________</p>
<p>DNI: _________________</p>`,

    invitacion: `<h2>CARTA DE INVITACIÓN</h2>
<p style="text-align: right;">_________________, ___ de __________ de 20___</p>

<p>Estimado/a Sr./Sra. _________________,</p>

<p>Me complace invitarle a _________________ que se celebrará el ___ de</p>
<p>Me complace invitarle a _________________ que se celebrará el ___ de</p>
<p>__________ de 20___ en _________________.</p>

<p>Esperamos contar con su presencia y que disfrute del evento.</p>

<p>Sin otro particular, reciba un cordial saludo,</p>

<p>Atentamente,</p>
<p>_________________</p>
<p>DNI: _________________</p>`
};

// Función para cargar la plantilla seleccionada
function cargarPlantilla(nombrePlantilla) {
    const editor = document.getElementById('editor-texto');
    if (plantillas[nombrePlantilla]) {
        editor.innerHTML = plantillas[nombrePlantilla];
    } else {
        editor.innerHTML = ''; // Si no existe la plantilla, limpiamos el editor
    }
}

// Función para manejar el cambio de plantilla
function manejarCambioPlantilla(select) {
    const editor = document.getElementById('editor-texto');
    const plantillaSeleccionada = select.value;

    if (plantillaSeleccionada !== '') {
        // Verificar si hay contenido en el editor
        if (editor.innerHTML.trim() !== '') {
            if (confirm('¿Estás seguro de que quieres cargar una nueva plantilla? Se perderá el contenido actual.')) {
                cargarPlantilla(plantillaSeleccionada);
            } else {
                // Restaurar la selección a "blanco" si el usuario cancela
                select.value = 'blanco';
            }
        } else {
            cargarPlantilla(plantillaSeleccionada);
        }
    } else {
        editor.innerHTML = ''; // Si se selecciona "blanco", limpiamos el editor
    }
}

// Inicializar el editor con la página en blanco cuando se carga el documento
document.addEventListener('DOMContentLoaded', function () {
    cargarPlantilla('blanco');

    // Resto del código de inicialización existente...
    const editor = document.getElementById('editor-texto');

    editor.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    editor.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const archivos = e.dataTransfer.files;
        if (archivos.length > 0) {
            const lector = new FileReader();
            lector.onload = function (e) {
                editor.innerHTML = e.target.result;
            };
            lector.readAsText(archivos[0]);
        }
    });
});

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    // Habilitar el arrastrar y soltar archivos
    const editor = document.getElementById('editor-texto');

    editor.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    editor.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const archivos = e.dataTransfer.files;
        if (archivos.length > 0) {
            const lector = new FileReader();
            lector.onload = function (e) {
                editor.innerHTML = e.target.result;
            };
            lector.readAsText(archivos[0]);
        }
    });
});
// Definimos los estilos como cadenas de CSS
const temas = {
    original: `
    body {
        background: linear-gradient(135deg, #d3d3d3, #f0f0f0);
    }
    .contenedor, .botones, .botones-exportacion {
        background: #ececec;
    }
    .editor {
        background: white;
        border: 1px solid rgba(176, 176, 176, 0.5);
    }
    h1, .botones button {
        background: linear-gradient(135deg, #7d7d7d,rgb(225, 225, 225));
        color: white;
    }
    .botones-exportacion button {
        background: linear-gradient(135deg, #7d7d7d,rgb(225, 225, 225));
        color: white;
        font-weight: bold;
    }`,

    rosa: `
    body {
        background: linear-gradient(135deg, #fda0a4, #ffe7e0);
    }
    .contenedor, .botones, .botones-exportacion {
        background: #fff6fb;
    }
    .editor {
        background: white;
        border: 1px solid rgba(255, 117, 140, 0.5);
    }
    h1, .botones button {
        background: linear-gradient(135deg, #e64765,rgb(255, 95, 202));
        color: white;
    }
    .botones-exportacion button {
        background: linear-gradient(135deg, #e64765,rgb(255, 95, 202));
        color: white;
        font-weight: bold;
    }`,

    verde: `
    body {
        background: linear-gradient(135deg, #effaef, #c0f9e3);
    }
    .contenedor, .botones, .botones-exportacion {
        background: #f1fef5;
    }
    .editor {
        background: white;
        border: 1px solid rgba(169, 240, 171, 0.5);

    }
    h1, .botones button {
        background: linear-gradient(135deg, #5ab95e,rgb(3, 135, 106));
        color: white;
    }
    .botones-exportacion button {
        background: linear-gradient(135deg, #5ab95e,rgb(3, 135, 106));
        color: white;
        font-weight: bold;
    }`,

    azul: `
    body {
        background: linear-gradient(135deg, #d6ffff, #a3eaff);
    }
    .contenedor, .botones, .botones-exportacion {
        background: #e6fcfc;
    }
    .editor {
        background: white;
        border: 1px solid rgba(128, 207, 255, 0.5);

    }
    h1, .botones button {
        background: linear-gradient(135deg, #3388ff,rgb(172, 173, 247));
        color: white;
    }
    .botones-exportacion button {
        background: linear-gradient(135deg, #3388ff,rgb(172, 173, 247));
        color: white;
        font-weight: bold;
    }`
};

// Variable para el tema actual
let temaActual = 'original';

// Función para cambiar el tema
function cambiarTema() {
    const estiloElemento = document.getElementById('tema-estilo');
    const botonTema = document.getElementById('cambiar-tema');

    const ordenTemas = ['original', 'rosa', 'verde', 'azul'];
    const indexActual = ordenTemas.indexOf(temaActual);
    const nuevoIndex = (indexActual + 1) % ordenTemas.length;
    temaActual = ordenTemas[nuevoIndex];

    estiloElemento.textContent = temas[temaActual];
    botonTema.innerHTML = `<i class="fas fa-paint-brush"></i> Tema ${temaActual.charAt(0).toUpperCase() + temaActual.slice(1)}`;
}

// Función para inicializar el tema al cargar la página
function inicializarTema() {
    const estiloElemento = document.createElement('style');
    estiloElemento.id = 'tema-estilo';
    estiloElemento.textContent = temas.original;
    document.head.appendChild(estiloElemento);
}

// Llamar a la función para inicializar el tema al cargar la página
inicializarTema();
