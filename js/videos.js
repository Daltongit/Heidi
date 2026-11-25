/* ==========================================================
   RECUERDOS · videos y carruseles propios (carpeta videos/)
   - Cada visita muestra 3 al azar.
   - Videos: se reproducen con su propio audio.
   - Carruseles de fotos: suenan con su canción a1.
   - Solo uno suena a la vez. El botón "Sonido" activa el audio.
   - Móvil: una tarjeta por pantalla (se desliza).
   - Computadora: 3 tarjetas en fila; tocar una la reproduce.
   ========================================================== */
(function () {
  const CFG = window.CONFIG || {};
  const todos = (CFG.MEDIA || []).slice();
  const sec = document.getElementById("videos");
  const feed = document.getElementById("feed");
  const btnSonido = document.getElementById("btnSonido");
  if (!sec || !feed || !todos.length) return;

  // 3 al azar
  for (let i = todos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = todos[i];
    todos[i] = todos[j];
    todos[j] = tmp;
  }
  const lista = todos.slice(0, 3);

  sec.hidden = false;

  const esMovil = window.matchMedia("(max-width: 759px)");
  const PALETA = [[340, 12], [325, 350], [352, 20], [312, 335], [18, 40], [296, 330]];
  let sonido = false;
  let activo = null;

  function escapar(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- Render ----------
  feed.innerHTML = lista.map(function (m, i) {
    const pal = PALETA[i % PALETA.length];
    const estilo = 'style="--h:' + pal[0] + ';--h2:' + pal[1] + '"';
    let fondo = "";
    let cuerpo;
    if (m.tipo === "video") {
      cuerpo = '<video class="media-video" playsinline loop preload="auto" muted src="' + escapar(m.src) + '"></video>';
    } else {
      const imgs = m.imagenes || [];
      fondo = '<img class="media-fondo" src="' + escapar(imgs[0]) + '" alt="">';
      const slides = imgs.map(function (src) {
        return '<img class="slide" src="' + escapar(src) + '" alt="" draggable="false">';
      }).join("");
      const puntos = imgs.length > 1
        ? '<div class="slide-puntos">' + imgs.map(function () { return "<i></i>"; }).join("") + "</div>"
        : "";
      const audio = m.audio ? '<audio class="media-audio" loop preload="auto" src="' + escapar(m.audio) + '"></audio>' : "";
      cuerpo = '<div class="slides">' + slides + '</div>' + puntos + audio +
               '<span class="nota-musical" aria-hidden="true"><i></i><i></i><i></i></span>';
    }
    return (
      '<article class="feed-item' + (m.tipo === "video" ? " es-video" : " es-fotos") + '" data-i="' + i + '" ' + estilo + '>' +
        '<div class="media-capa">' + fondo + '</div>' +
        '<div class="media-main">' + cuerpo + '</div>' +
        '<div class="feed-pausa" aria-hidden="true"><svg class="icon"><use href="#i-play"/></svg></div>' +
      '</article>'
    );
  }).join("");

  const items = Array.prototype.slice.call(feed.querySelectorAll(".feed-item"));

  function medios(item) {
    return {
      video: item.querySelector("video"),
      audio: item.querySelector("audio"),
      slides: item.querySelector(".slides"),
      puntos: item.querySelectorAll(".slide-puntos i")
    };
  }

  function aplicarSonido(item) {
    const m = medios(item);
    if (m.video) m.video.muted = !sonido;
    if (m.audio) m.audio.muted = !sonido;
  }

  function pausar(item) {
    const m = medios(item);
    if (m.video) m.video.pause();
    if (m.audio) m.audio.pause();
    item.classList.remove("reproduciendo");
  }

  function pausarTodos(excepto) {
    items.forEach(function (it) { if (it !== excepto) pausar(it); });
  }

  function reproducir(item) {
    if (activo && activo !== item) pausar(activo);
    activo = item;
    const m = medios(item);
    aplicarSonido(item);
    let p = null;
    if (m.video) p = m.video.play();
    else if (m.audio) p = m.audio.play();
    if (p && p.catch) p.catch(function () { /* el navegador pidió tocar la pantalla primero */ });
    item.classList.add("reproduciendo");
  }

  function actualizarBoton() {
    btnSonido.querySelector(".icono-on").hidden = !sonido;
    btnSonido.querySelector(".icono-off").hidden = sonido;
    btnSonido.querySelector("span").textContent = sonido ? "Sonido activado" : "Activar sonido";
    btnSonido.classList.toggle("activo", sonido);
  }

  btnSonido.addEventListener("click", function () {
    if (window.Sonidos) window.Sonidos.preparar();
    sonido = !sonido;
    actualizarBoton();
    if (activo) {
      aplicarSonido(activo);
      if (sonido) reproducir(activo);
    }
  });

  items.forEach(function (item) {
    // Tocar la tarjeta: reproducir/pausar; al reproducir se activa el sonido
    item.addEventListener("click", function () {
      if (item.classList.contains("reproduciendo")) {
        pausar(item);
        if (activo === item) activo = null;
      } else {
        if (window.Sonidos) window.Sonidos.preparar();
        if (!sonido) { sonido = true; actualizarBoton(); }
        reproducir(item);
      }
    });

    // Puntos del carrusel
    const m = medios(item);
    if (m.slides && m.puntos.length) {
      m.puntos[0].classList.add("on");
      m.slides.addEventListener("scroll", function () {
        const idx = Math.round(m.slides.scrollLeft / m.slides.clientWidth);
        m.puntos.forEach(function (p, k) { p.classList.toggle("on", k === idx); });
      }, { passive: true });
    }

    // Videos: loop (ya está en el HTML) y reinicio de la música al terminar
    if (m.audio) m.audio.addEventListener("ended", function () { m.audio.currentTime = 0; m.audio.play(); });
  });

  // Móvil: se activa la tarjeta que está centrada
  const observador = new IntersectionObserver(function (entradas) {
    if (!esMovil.matches) return;
    entradas.forEach(function (en) {
      if (en.isIntersecting && en.intersectionRatio > 0.6) {
        if (activo !== en.target) reproducir(en.target);
      } else if (!en.isIntersecting && en.target === activo) {
        pausar(en.target);
        activo = null;
      }
    });
  }, { root: feed, threshold: [0, 0.6] });
  items.forEach(function (it) { observador.observe(it); });

  esMovil.addEventListener("change", function () {
    pausarTodos(null);
    activo = null;
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { pausarTodos(null); activo = null; }
  });

  window.Videos = {
    cerrar: function () { pausarTodos(null); activo = null; }
  };

  actualizarBoton();
})();
