/* ==========================================================
   JUEGO · "Corazón volador" (estilo Flappy)
   - Toca la pantalla (o pulsa espacio) para aletear
   - Pasa entre los bastones de caramelo: cada uno suma 1 punto
   - Si tocas un bastón, el suelo o el techo, termina
   - Récord guardado en el navegador
   ========================================================== */
(function () {
  const canvas = document.getElementById("juegoCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const overlay = document.getElementById("juegoOverlay");
  const elTitulo = document.getElementById("juegoTitulo");
  const elTexto = document.getElementById("juegoTexto");
  const btn = document.getElementById("btnJugar");
  const elPuntos = document.getElementById("jPuntos");
  const elMejor = document.getElementById("jMejor");

  const CLAVE = "cumple_mejor_corazon_volador";
  const FRASES = [
    "Me encantó verte volar. Eres mi récord favorito.",
    "Cada bastón que pasas me saca una sonrisa.",
    "Vuela tan alto como quieras, siempre te quiero.",
    "Te quiero, aunque sea sólo en un juego."
  ];

  // Forma del corazón
  const FORMA = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    FORMA.push([
      Math.pow(Math.sin(t), 3),
      -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16
    ]);
  }

  let mejor = Number(localStorage.getItem(CLAVE)) || 0;
  let W = 0, H = 0, dpr = 1;
  let estado = "inicio"; // inicio | jugando | fin
  let pajaro = null;
  let bastones = [];
  let copos = [];
  let puntos = 0;
  let distancia = 0;
  let proximoBaston = 0;
  let sacudida = 0;
  let parpadeo = 0;
  let ultimoT = 0, primero = true;
  let mostrado = { puntos: -1, mejor: -1 };

  // Tamaños en función de la pantalla
  function medidas() {
    const base = Math.min(W, H);
    return {
      r: Math.max(14, Math.min(22, base * 0.045)),
      gap: Math.max(190, H * 0.4),
      ancho: Math.max(44, Math.min(70, W * 0.13)),
      suelo: Math.max(38, H * 0.08),
      gravedad: H * 1.9,
      impulso: H * 0.62,
      velocidad: Math.max(120, W * 0.42)
    };
  }

  function redimensionar() {
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!copos.length) {
      for (let i = 0; i < 40; i++) {
        copos.push({ x: Math.random() * W, y: Math.random() * H, v: 15 + Math.random() * 30, s: 1 + Math.random() * 2.2 });
      }
    }
    if (estado === "inicio") reposicionar();
  }

  function reposicionar() {
    const m = medidas();
    pajaro = { x: W * 0.28, y: H * 0.45, vy: 0, angulo: 0 };
    bastones = [];
    distancia = 0;
    proximoBaston = W * 0.9;
    void m;
  }

  function hud(forzar) {
    const m = Math.max(mejor, puntos);
    if (forzar || puntos !== mostrado.puntos) { elPuntos.textContent = puntos; mostrado.puntos = puntos; }
    if (forzar || m !== mostrado.mejor) { elMejor.textContent = m; mostrado.mejor = m; }
  }

  function aletear() {
    if (estado === "fin") return;
    if (estado === "inicio") empezar();
    if (estado !== "jugando") return;
    const m = medidas();
    pajaro.vy = -m.impulso;
    if (window.Sonidos) window.Sonidos.aleteo();
  }

  function empezar() {
    reposicionar();
    puntos = 0;
    estado = "jugando";
    overlay.hidden = true;
    if (window.Sonidos) window.Sonidos.reiniciarPunto();
    hud(true);
  }

  function terminar() {
    if (estado !== "jugando") return;
    estado = "fin";
    sacudida = 1;
    if (window.Sonidos) window.Sonidos.suave();
    const nuevo = puntos > mejor && puntos > 0;
    if (nuevo) {
      mejor = puntos;
      localStorage.setItem(CLAVE, String(mejor));
    }
    hud(true);
    elTitulo.textContent = nuevo ? "¡Nuevo récord!" : "Ups, un bastón";
    const frase = FRASES[Math.floor(Math.random() * FRASES.length)];
    elTexto.textContent = "Pasaste " + puntos + " bastones. " + frase;
    btn.textContent = "Volver a volar";
    overlay.hidden = false;
  }

  // Bastón de caramelo: franjas diagonales rojas y blancas con gorrito
  function baston(x, y, ancho, alto, haciaArriba) {
    if (alto <= 0) return;
    const franja = 16;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, ancho, alto);
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, ancho, alto);
    ctx.fillStyle = "#e5263f";
    for (let k = -alto; k < ancho + alto; k += franja * 2) {
      ctx.beginPath();
      ctx.moveTo(x + k, y + alto);
      ctx.lineTo(x + k + franja, y + alto);
      ctx.lineTo(x + k + franja + alto, y);
      ctx.lineTo(x + k + alto, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    // Contorno suave
    ctx.strokeStyle = "rgba(180, 20, 40, 0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, ancho, alto);
    void haciaArriba;
  }

  function dibujarBaston(b, m) {
    const capAncho = m.ancho + 10;
    const capAlto = 22;
    const x = b.x;
    const cx = x - 5;
    // Parte de arriba (cuelga del techo hasta el hueco)
    const altoArriba = b.hueco - 0;
    baston(x, 0, m.ancho, Math.max(0, altoArriba - capAlto), false);
    baston(cx, altoArriba - capAlto, capAncho, capAlto, false);
    // Parte de abajo (sube desde el suelo hasta el hueco)
    const yAbajo = b.hueco + b.gap;
    const altoAbajo = H - m.suelo - yAbajo;
    baston(cx, yAbajo, capAncho, capAlto, true);
    baston(x, yAbajo + capAlto, m.ancho, Math.max(0, altoAbajo - capAlto), true);
  }

  function corazon(x, y, s, relleno) {
    ctx.beginPath();
    for (let i = 0; i < FORMA.length; i++) {
      const px = x + FORMA[i][0] * s;
      const py = y + FORMA[i][1] * s;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = relleno;
    ctx.fill();
  }

  function actualizar(dt) {
    const m = medidas();
    parpadeo += dt;

    // Copos siempre caen
    for (let i = 0; i < copos.length; i++) {
      const c = copos[i];
      c.y += c.v * dt;
      c.x += Math.sin((parpadeo + i) * 0.8) * 12 * dt;
      if (c.y > H) { c.y = -4; c.x = Math.random() * W; }
    }

    if (sacudida > 0) sacudida = Math.max(0, sacudida - dt * 2.5);

    if (estado === "inicio") {
      if (!pajaro) reposicionar();
      pajaro.y = H * 0.45 + Math.sin(parpadeo * 2.2) * H * 0.02;
      return;
    }

    if (estado === "fin") {
      // El corazón cae un poco tras el choque
      if (pajaro.y < H - m.suelo - m.r) {
        pajaro.vy += m.gravedad * dt;
        pajaro.y += pajaro.vy * dt;
      }
      for (let i = 0; i < bastones.length; i++) bastones[i].x -= 0;
      return;
    }

    // ----- Jugando -----
    const velocidad = m.velocidad * (1 + Math.min(0.9, puntos * 0.03));
    distancia += velocidad * dt;

    pajaro.vy += m.gravedad * dt;
    pajaro.y += pajaro.vy * dt;
    pajaro.angulo = Math.max(-0.5, Math.min(0.9, pajaro.vy / (H * 1.1)));

    // Crear bastones
    if (distancia >= proximoBaston) {
      const margen = H * 0.12;
      const minHueco = margen;
      const maxHueco = H - m.suelo - m.gap - margen;
      const hueco = minHueco + Math.random() * Math.max(0, maxHueco - minHueco);
      bastones.push({ x: W + 10, hueco: hueco, gap: m.gap, pasado: false });
      proximoBaston = distancia + Math.max(W * 0.55, 230);
    }

    for (let i = bastones.length - 1; i >= 0; i--) {
      const b = bastones[i];
      b.x -= velocidad * dt;
      if (!b.pasado && b.x + m.ancho < pajaro.x - m.r) {
        b.pasado = true;
        puntos++;
        if (window.Sonidos) window.Sonidos.punto();
        hud();
      }
      if (b.x + m.ancho + 20 < 0) bastones.splice(i, 1);
    }

    // Colisiones
    const rr = m.r * 0.78;
    if (pajaro.y - rr < 0 || pajaro.y + rr > H - m.suelo) {
      terminar();
      return;
    }
    for (let i = 0; i < bastones.length; i++) {
      const b = bastones[i];
      const cerca = pajaro.x + rr > b.x && pajaro.x - rr < b.x + m.ancho + 10;
      if (!cerca) continue;
      const arribaChoca = pajaro.y - rr < b.hueco;
      const abajoChoca = pajaro.y + rr > b.hueco + b.gap;
      if (arribaChoca || abajoChoca) {
        terminar();
        return;
      }
    }
  }

  function dibujar() {
    const m = medidas();

    // Cielo nocturno suave
    const cielo = ctx.createLinearGradient(0, 0, 0, H);
    cielo.addColorStop(0, "#ffd9e6");
    cielo.addColorStop(0.6, "#ffeef5");
    cielo.addColorStop(1, "#fde2ec");
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    if (sacudida > 0) ctx.translate((Math.random() - 0.5) * sacudida * 8, (Math.random() - 0.5) * sacudida * 5);

    // Copos de nieve
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < copos.length; i++) {
      const c = copos[i];
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bastones
    for (let i = 0; i < bastones.length; i++) dibujarBaston(bastones[i], m);

    // Suelo nevado
    const yS = H - m.suelo;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(0, yS + 10);
    for (let x = 0; x <= W + 40; x += 40) {
      ctx.quadraticCurveTo(x + 20, yS - 6 + ((x / 40) % 2) * 6, x + 40, yS + 6);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 143, 171, 0.25)";
    ctx.fillRect(0, yS + m.suelo * 0.6, W, m.suelo * 0.4);

    // Corazón volador
    if (pajaro) {
      ctx.save();
      ctx.translate(pajaro.x, pajaro.y);
      ctx.rotate(pajaro.angulo);
      const s = m.r * 1.15;
      ctx.shadowColor = "rgba(194, 24, 91, 0.35)";
      ctx.shadowBlur = 14;
      const g = ctx.createLinearGradient(0, -s, 0, s);
      g.addColorStop(0, "#ff8fab");
      g.addColorStop(1, "#e11d5a");
      corazon(0, 0, s, g);
      ctx.shadowBlur = 0;
      // brillito
      ctx.beginPath();
      ctx.ellipse(-s * 0.35, -s * 0.35, s * 0.22, s * 0.12, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  function marco(ms) {
    const t = ms / 1000;
    const dt = primero ? 0.016 : Math.min(0.033, t - ultimoT);
    primero = false;
    ultimoT = t;
    actualizar(dt);
    dibujar();
    requestAnimationFrame(marco);
  }

  // Controles
  canvas.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    if (window.Sonidos) window.Sonidos.preparar();
    aletear();
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "ArrowUp") {
      const cerca = canvas.getBoundingClientRect();
      const visible = cerca.bottom > 0 && cerca.top < window.innerHeight;
      if (visible && (estado === "jugando" || estado === "inicio")) {
        e.preventDefault();
        aletear();
      }
    }
  });

  btn.addEventListener("click", function () {
    if (window.Sonidos) window.Sonidos.preparar();
    empezar();
  });

  window.addEventListener("resize", redimensionar);

  redimensionar();
  hud(true);
  elTitulo.textContent = "Corazón volador";
  elTexto.textContent = "Toca la pantalla para aletear y pasa entre los bastones de caramelo sin tocarlos.";
  btn.textContent = "Jugar";
  requestAnimationFrame(marco);
})();
