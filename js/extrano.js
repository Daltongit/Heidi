/* ==========================================================
   BOTÓN "TE EXTRAÑO"
   - Ella escribe un mensaje y/o pone una foto (cámara o galería)
   - Se guarda en Supabase (tabla "mensajes" + bucket "recuerdos")
   - Te llega una notificación al celular por ntfy (app gratuita)
   ========================================================== */
(function () {
  const btnAbrir = document.getElementById("btnExtrano");
  const panel = document.getElementById("panelExtrano");
  if (!btnAbrir || !panel) return;

  const txt = document.getElementById("txtExtrano");
  const inputFoto = document.getElementById("fotoExtrano");
  const vista = document.getElementById("vistaPrevia");
  const imgVista = document.getElementById("imgPrevia");
  const btnQuitar = document.getElementById("quitarFoto");
  const btnEnviar = document.getElementById("btnEnviarExtrano");
  const estado = document.getElementById("estadoExtrano");

  const CFG = window.CONFIG;
  const CLAVE_ULTIMO = "cumple_ultimo_extrano";
  const ESPERA_MS = 8000; // evita enviar muchas veces seguidas

  let archivo = null;
  let urlVista = null;

  function mensajeEstado(texto, tipo) {
    estado.textContent = texto;
    estado.className = "estado" + (tipo ? " " + tipo : "");
  }

  function limpiarFoto() {
    archivo = null;
    inputFoto.value = "";
    if (urlVista) URL.revokeObjectURL(urlVista);
    urlVista = null;
    imgVista.removeAttribute("src");
    vista.hidden = true;
  }

  btnAbrir.addEventListener("click", function () {
    const abierto = panel.hidden;
    panel.hidden = !abierto;
    btnAbrir.setAttribute("aria-expanded", String(abierto));
    if (abierto) {
      setTimeout(function () {
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
        txt.focus({ preventScroll: true });
      }, 120);
    }
  });

  inputFoto.addEventListener("change", function () {
    const f = inputFoto.files && inputFoto.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      mensajeEstado("Ese archivo no es una imagen.", "err");
      limpiarFoto();
      return;
    }
    archivo = f;
    if (urlVista) URL.revokeObjectURL(urlVista);
    urlVista = URL.createObjectURL(f);
    imgVista.src = urlVista;
    vista.hidden = false;
    mensajeEstado("", "");
  });

  btnQuitar.addEventListener("click", limpiarFoto);

  // Reduce la foto para que suba rápido (máx. 1600 px, JPG)
  function comprimir(file) {
    return new Promise(function (resolver, rechazar) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        const max = 1600;
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * escala);
        const h = Math.round(img.height * escala);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        c.toBlob(function (blob) {
          URL.revokeObjectURL(url);
          if (blob) resolver(blob);
          else rechazar(new Error("No se pudo procesar la foto"));
        }, "image/jpeg", 0.86);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        rechazar(new Error("No se pudo leer la foto"));
      };
      img.src = url;
    });
  }

  function cabeceras(extra) {
    const base = {
      apikey: CFG.SUPABASE_KEY,
      Authorization: "Bearer " + CFG.SUPABASE_KEY
    };
    return Object.assign(base, extra || {});
  }

  async function subirFoto(blob) {
    const nombre = Date.now() + "-" + Math.random().toString(36).slice(2, 10) + ".jpg";
    const r = await fetch(
      CFG.SUPABASE_URL + "/storage/v1/object/" + CFG.BUCKET_FOTOS + "/" + nombre,
      {
        method: "POST",
        headers: cabeceras({ "Content-Type": "image/jpeg", "Cache-Control": "3600" }),
        body: blob
      }
    );
    if (!r.ok) throw new Error("No se pudo subir la foto (" + r.status + ")");
    return CFG.SUPABASE_URL + "/storage/v1/object/public/" + CFG.BUCKET_FOTOS + "/" + nombre;
  }

  async function guardarMensaje(texto, imagenUrl) {
    const r = await fetch(CFG.SUPABASE_URL + "/rest/v1/mensajes", {
      method: "POST",
      headers: cabeceras({
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      }),
      body: JSON.stringify({ texto: texto || null, imagen_url: imagenUrl || null })
    });
    if (!r.ok) throw new Error("No se pudo guardar el mensaje (" + r.status + ")");
  }

  async function notificar(texto, imagenUrl) {
    const icono = new URL("icons/icon-512.png", window.location.href).href;
    const cuerpo = {
      topic: CFG.NTFY_TOPICO,
      title: "❤️ Te extraño",
      message: texto || "Te extraño muchísimo ❤️",
      tags: ["heart"],
      priority: 4,
      icon: icono,
      click: window.location.href
    };
    if (imagenUrl) {
      cuerpo.attach = imagenUrl;
      cuerpo.click = imagenUrl;
    }
    const r = await fetch(CFG.NTFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
    });
    if (!r.ok) throw new Error("ntfy respondió " + r.status);
  }

  btnEnviar.addEventListener("click", async function () {
    const ultimo = Number(localStorage.getItem(CLAVE_ULTIMO)) || 0;
    if (Date.now() - ultimo < ESPERA_MS) {
      mensajeEstado("Espera un momento antes de enviar otra vez.", "err");
      return;
    }

    const texto = txt.value.trim();
    btnEnviar.disabled = true;
    mensajeEstado("Enviando...", "");

    try {
      let imagenUrl = null;
      if (archivo) {
        const blob = await comprimir(archivo);
        imagenUrl = await subirFoto(blob);
      }

      await guardarMensaje(texto, imagenUrl);
      localStorage.setItem(CLAVE_ULTIMO, String(Date.now()));

      let avisoExtra = "";
      try {
        await notificar(texto, imagenUrl);
      } catch (errNotif) {
        console.warn(errNotif);
        avisoExtra = " (no se pudo enviar la notificación al celular)";
      }

      txt.value = "";
      limpiarFoto();
      mensajeEstado("Enviado con cariño." + avisoExtra, avisoExtra ? "err" : "ok");
      if (window.toast) window.toast("Enviado con cariño");
    } catch (err) {
      console.error(err);
      mensajeEstado("Algo salió mal: " + err.message, "err");
    } finally {
      btnEnviar.disabled = false;
    }
  });
})();
