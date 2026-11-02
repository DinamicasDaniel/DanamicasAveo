document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("gridNumeros");
  const listaElegidosEl = document.getElementById("listaElegidos");
  const cajaMensajeEl = document.getElementById("cajaMensaje");
  const btnWhatsapp = document.getElementById("btnWhatsapp");
  const btnCaptura = document.getElementById("btnCaptura");

  const TELEFONO_WHATSAPP = "573103073486";

  let numerosSeleccionados = [];

// 1. Generar automáticamente los números del 000 al 999
const disponibles = [];

for (let i = 0; i <= 999; i++) {
  disponibles.push(String(i).padStart(3, "0"));
}

// 2. Cargar los números ocupados
fetch("numeros.json")
  .then(res => {
    if (!res.ok) throw new Error("Error al cargar numeros.json");
    return res.json();
  })
  .then(vendidos => {

    const listaVendidos = vendidos.map(item => {
      return String(item.numero).padStart(3, "0");
    });

    renderizarNumeros(disponibles, listaVendidos);

  })
  .catch(err => {
    console.error(err);
    contenedor.innerHTML = "<p class='error'>Error al cargar los números.</p>";
  });

  // 2. Renderizar los números procesando el array completo
  function renderizarNumeros(disponibles, vendidos) {
    const setVendidos = new Set(vendidos);
    const fragmento = document.createDocumentFragment();

    // Bucle para iterar todo el arreglo de números disponibles
    disponibles.forEach(num => {
      // Forzar formato de texto a 3 dígitos (ej: 5 -> "005")
      const numFormateado = num;

      const div = document.createElement("div");
      div.className = "card-numero";
      div.textContent = numFormateado;
      div.dataset.numero = numFormateado;

      // Verificar si el número formateado ya fue vendido
      if (setVendidos.has(numFormateado)) {
        div.classList.add("ocupado");
      } else {
        div.classList.add("disponible");
        div.addEventListener("click", () => toggleSeleccion(numFormateado, div));
      }

      fragmento.appendChild(div);
    });

    contenedor.innerHTML = "";
    contenedor.appendChild(fragmento);
  }

  // 3. Gestionar selección / deselección
  function toggleSeleccion(numero, elemento) {
    if (numerosSeleccionados.includes(numero)) {
      numerosSeleccionados = numerosSeleccionados.filter(n => n !== numero);
      elemento.classList.remove("seleccionado");
    } else {
      numerosSeleccionados.push(numero);
      elemento.classList.add("seleccionado");
    }

    actualizarResumen();
  }

  // 4. Actualizar resumen visual y mensaje
  function actualizarResumen() {
    if (numerosSeleccionados.length === 0) {
      listaElegidosEl.textContent = "Ninguno seleccionado";
      cajaMensajeEl.textContent = "Hola, me gustaría reservar los siguientes números: ";
      btnWhatsapp.disabled = true;
      btnCaptura.disabled = true;
      return;
    }

    // Ordenar de menor a mayor numéricamente
    numerosSeleccionados.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const textoLista = numerosSeleccionados.join(", ");
    const mensajeTexto = `Hola, me gustaría reservar los siguientes números: ${textoLista}`;

    listaElegidosEl.textContent = textoLista;
    cajaMensajeEl.textContent = mensajeTexto;

    btnWhatsapp.disabled = false;
    btnCaptura.disabled = false;
  }

  // 5. Enviar mensaje por WhatsApp
  btnWhatsapp.addEventListener("click", () => {
    const textoEncodificado = encodeURIComponent(cajaMensajeEl.textContent);
    const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${textoEncodificado}`;
    window.open(url, "_blank");
  });

  // 6. Generar y descargar captura del resumen
  btnCaptura.addEventListener("click", () => {
    const panel = document.getElementById("panelResumen");

    if (typeof html2canvas !== "undefined") {
      html2canvas(panel).then(canvas => {
        const enlace = document.createElement("a");
        enlace.download = "numeros-seleccionados.png";
        enlace.href = canvas.toDataURL("image/png");
        enlace.click();
      });
    } else {
      alert("No se pudo cargar la librería para la captura de pantalla.");
    }
  });
});