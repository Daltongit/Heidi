/* ==========================================================
   PRINCIPAL · fechas, contadores, corazones de fondo y avisos
   ========================================================== */
(function () {
  const CFG = window.CONFIG || {};

  // Nombre
  const nombreEl = document.getElementById("nombreHero");
  if (nombreEl && CFG.NOMBRE) nombreEl.textContent = CFG.NOMBRE;

  // Convierte "2026-09-30" en fecha local (sin problemas de zona horaria)
  function fechaLocal(texto) {
    const p = texto.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  const DIA = 24 * 60 * 60 * 1000;
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  // Contador exacto desde el 30/09/2026 a las 6:00 p. m. (mes 8 = septiembre)
  const inicioMirada = new Date(2026, 8, 30, 18, 0, 0);
  const contenedorMirada = document.getElementById("chipMirada");
  const contenedorTiles = document.getElementById("tiles");
  const UNIDADES = [
    { clave: "anios", uno: "año", varios: "años" },
    { clave: "meses", uno: "mes", varios: "meses" },
    { clave: "dias", uno: "día", varios: "días" },
    { clave: "horas", uno: "hora", varios: "horas" },
    { clave: "minutos", uno: "minuto", varios: "minutos" },
    { clave: "segundos", uno: "segundo", varios: "segundos" }
  ];

  // Diferencia calendario: años, meses, días y luego hh:mm:ss
  function diferencia(desde, hasta) {
    let y = hasta.getFullYear() - desde.getFullYear();
    let m = hasta.getMonth() - desde.getMonth();
    let d = hasta.getDate() - desde.getDate();
    let seg = (hasta.getHours() * 3600 + hasta.getMinutes() * 60 + hasta.getSeconds()) -
              (desde.getHours() * 3600 + desde.getMinutes() * 60 + desde.getSeconds());
    if (seg < 0) { seg += 86400; d--; }
    if (d < 0) {
      m--;
      d += new Date(hasta.getFullYear(), hasta.getMonth(), 0).getDate();
    }
    if (m < 0) { m += 12; y--; }
    return {
      anios: y, meses: m, dias: d,
      horas: Math.floor(seg / 3600),
      minutos: Math.floor((seg % 3600) / 60),
      segundos: seg % 60
    };
  }

  function crearTiles() {
    if (!contenedorTiles) return [];
    return UNIDADES.map(function (u) {
      const t = document.createElement("div");
      t.className = "tile";
      t.innerHTML = '<span class="tile-num">0</span><span class="tile-etq">' + u.varios + '</span>';
      contenedorTiles.appendChild(t);
      return t;
    });
  }

  const tilesEls = crearTiles();

  function actualizarContador() {
    if (!tilesEls.length) return;
    const d = diferencia(inicioMirada, new Date());
    UNIDADES.forEach(function (u, i) {
      const v = d[u.clave];
      const num = tilesEls[i].querySelector(".tile-num");
      const etq = tilesEls[i].querySelector(".tile-etq");
      const txt = v < 10 && u.clave !== "anios" ? "0" + v : String(v);
      if (num.textContent !== txt) num.textContent = txt;
      const etiqueta = v === 1 ? u.uno : u.varios;
      if (etq.textContent !== etiqueta) etq.textContent = etiqueta;
    });
  }

  if (contenedorMirada) {
    contenedorMirada.hidden = false;
    actualizarContador();
    setInterval(actualizarContador, 1000);
  }

  // Próximo cumpleaños
  const cumple = fechaLocal(CFG.FECHA_CUMPLE_ELLA || "2006-11-25");
  let proximo = new Date(inicioHoy.getFullYear(), cumple.getMonth(), cumple.getDate());
  if (proximo < inicioHoy) {
    proximo = new Date(inicioHoy.getFullYear() + 1, cumple.getMonth(), cumple.getDate());
  }
  const faltan = Math.round((proximo - inicioHoy) / DIA);
  const edad = proximo.getFullYear() - cumple.getFullYear();
  const elCumple = document.getElementById("proximoCumple");
  if (elCumple) {
    if (faltan === 0) elCumple.textContent = "¡Hoy es tu día! Cumples " + edad + " años";
    else if (faltan === 1) elCumple.textContent = "Mañana cumples " + edad + " años";
    else elCumple.textContent = "Faltan " + faltan + " días para tus " + edad + " años";
    document.getElementById("chipCumple").hidden = false;
  }

  // Corazones de fondo
  const contenedor = document.getElementById("flotantes");
  if (contenedor) {
    const total = window.innerWidth < 720 ? 10 : 16;
    for (let i = 0; i < total; i++) {
      const s = document.createElement("span");
      const size = 14 + Math.random() * 26;
      s.style.left = (Math.random() * 100) + "%";
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.animationDuration = (12 + Math.random() * 14) + "s";
      s.style.animationDelay = (-Math.random() * 20) + "s";
      s.style.opacity = String(0.5 + Math.random() * 0.5);
      s.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><use href="#i-heart"/></svg>';
      contenedor.appendChild(s);
    }
  }

  // Instalar como aplicación (funciona con https, como GitHub Pages o ngrok)
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (err) {
        console.warn("No se pudo registrar el service worker", err);
      });
    });
  }

  // Aviso emergente
  const toastEl = document.getElementById("toast");
  let tToast = null;
  window.toast = function (mensaje) {
    if (!toastEl) return;
    toastEl.textContent = mensaje;
    toastEl.classList.add("visible");
    clearTimeout(tToast);
    tToast = setTimeout(function () {
      toastEl.classList.remove("visible");
    }, 2600);
  };
})();
