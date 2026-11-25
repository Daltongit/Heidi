/* ==========================================================
   NOTA DE VOZ (estilo WhatsApp)
   - Reproducir / pausar, barra de onda que avanza
   - Tocar la onda para saltar a otra parte
   - Velocidad 1x / 1.5x / 2x
   ========================================================== */
(function () {
  const audio = document.getElementById("audioVoz");
  if (!audio) return;

  const btn = document.getElementById("btnPlayVoz");
  const iconoPlay = btn.querySelector(".icono-play");
  const iconoPausa = btn.querySelector(".icono-pausa");
  const onda = document.getElementById("onda");
  const tiempo = document.getElementById("tiempoVoz");
  const btnVel = document.getElementById("btnVelocidad");

  const NUM_BARRAS = 46;
  const VELOCIDADES = [1, 1.5, 2];
  let idxVel = 0;
  const barras = [];

  // Altura de cada barra: aspecto de nota de voz (fijo, no aleatorio)
  for (let i = 0; i < NUM_BARRAS; i++) {
    const b = document.createElement("i");
    const alto = 26 + Math.abs(
      Math.sin(i * 0.7) * 0.9 + Math.sin(i * 1.9) * 0.55 + Math.cos(i * 0.37) * 0.6
    ) * 40;
    b.style.setProperty("--h", Math.min(100, Math.round(alto)) + "%");
    onda.appendChild(b);
    barras.push(b);
  }

  function formato(seg) {
    if (!isFinite(seg) || seg < 0) seg = 0;
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  function actualizar() {
    const dur = audio.duration || 0;
    const progreso = dur ? audio.currentTime / dur : 0;
    const hechas = Math.floor(progreso * NUM_BARRAS);
    for (let i = 0; i < barras.length; i++) {
      barras[i].classList.toggle("on", i < hechas);
    }
    tiempo.textContent = formato(audio.currentTime) + " / " + formato(dur);
  }

  function marcarPlay(reproduciendo) {
    iconoPlay.hidden = reproduciendo;
    iconoPausa.hidden = !reproduciendo;
    btn.setAttribute("aria-label", reproduciendo ? "Pausar" : "Reproducir");
  }

  btn.addEventListener("click", function () {
    if (audio.paused) {
      // Solo suena una cosa a la vez: cerramos el video si estaba abierto
      if (window.Videos) window.Videos.cerrar();
      audio.play().catch(function () { /* el navegador bloqueó la reproducción */ });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", function () { marcarPlay(true); });
  audio.addEventListener("pause", function () { marcarPlay(false); });
  audio.addEventListener("ended", function () {
    marcarPlay(false);
    audio.currentTime = 0;
    actualizar();
  });
  audio.addEventListener("timeupdate", actualizar);
  audio.addEventListener("loadedmetadata", actualizar);
  audio.addEventListener("durationchange", actualizar);

  onda.addEventListener("click", function (e) {
    const rect = onda.getBoundingClientRect();
    const r = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    if (audio.duration) audio.currentTime = r * audio.duration;
    actualizar();
  });

  btnVel.addEventListener("click", function () {
    idxVel = (idxVel + 1) % VELOCIDADES.length;
    audio.playbackRate = VELOCIDADES[idxVel];
    btnVel.textContent = VELOCIDADES[idxVel] + "x";
  });

  window.Voz = {
    pausar: function () { audio.pause(); }
  };

  marcarPlay(false);
  actualizar();
})();
