/* ==========================================================
   CORAZÓN 3D DE PARTÍCULAS
   - Arrastra (dedo o mouse) para girarlo a izquierda / derecha
   - Tócalo para que lata, suene la campana y salgan partículas
   - Late suavemente todo el tiempo
   ========================================================== */
(function () {
  const canvas = document.getElementById("heartCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const PUNTOS = [];
  const DESTELLOS = [];
  const ANILLOS = [];
  const COLORES = ["#ff5c8a", "#ffb3c6", "#f7c873", "#ffffff", "#e75480"];

  let W = 0;
  let H = 0;
  let dpr = 1;

  let angulo = 0.35;
  let velocidad = 0;
  let arrastrando = false;
  let ultimoX = 0;
  let movido = 0;
  let inicioPulsacion = 0;
  let tapT = -10;
  let ultimoT = 0;

  // Forma del corazón: f(x,y) <= 0 es el interior
  function forma(x, y) {
    const a = x * x + y * y - 1;
    return a * a * a - x * x * y * y * y;
  }

  // Genera partículas dentro del corazón (más densas en el borde)
  function construir() {
    PUNTOS.length = 0;
    let intentos = 0;
    while (PUNTOS.length < 2600 && intentos < 400000) {
      intentos++;
      const x = (Math.random() * 2 - 1) * 1.2;
      const y = Math.random() * 2.4 - 1.1;
      const v = forma(x, y);
      if (v > 0) continue;
      if (Math.abs(v) > 0.12 && Math.random() > 0.4) continue;
      const d = x * x + (y - 0.1) * (y - 0.1);
      const z = (Math.random() * 2 - 1) * 0.5 * Math.max(0.12, 1 - d / 1.4);
      PUNTOS.push({ x: x, y: y, z: z, s: 0.7 + Math.random() * 0.6 });
    }
  }

  function redimensionar() {
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Pulso de "lub-dub" permanente
  function latido(t) {
    const p = (t % 1.45) / 1.45;
    return (
      Math.exp(-Math.pow((p - 0.02) * 13, 2)) * 0.6 +
      Math.exp(-Math.pow((p - 0.2) * 13, 2)) * 0.4
    );
  }

  function explotar(cx, cy, S) {
    for (let i = 0; i < 90; i++) {
      const ang = Math.random() * Math.PI * 2;
      const vel = 120 + Math.random() * 300;
      DESTELLOS.push({
        x: cx + (Math.random() - 0.5) * S * 0.6,
        y: cy + (Math.random() - 0.5) * S * 0.6,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel - 60,
        vida: 0,
        duracion: 0.9 + Math.random() * 0.8,
        tam: 1.8 + Math.random() * 3.6,
        color: COLORES[Math.floor(Math.random() * COLORES.length)]
      });
    }
    ANILLOS.push({ x: cx, y: cy, r: S * 0.3, vida: 0 });
  }

  function latir() {
    tapT = performance.now() / 1000;
    if (window.Sonidos) window.Sonidos.campana();
    const S = Math.min(W, H) * 0.34;
    explotar(W / 2, H / 2, S);
  }

  function dibujar(t, dt) {
    ctx.clearRect(0, 0, W, H);

    if (!arrastrando) {
      angulo += velocidad;
      velocidad *= 0.93;
      if (Math.abs(velocidad) < 0.0004) angulo += 0.003; // giro lento de reposo
    }

    const k = Math.max(0, 1 - (t - tapT) / 0.7);
    const pulso = 1 + 0.045 * latido(t) + 0.14 * Math.sin(k * Math.PI) * k;
    const S = Math.min(W, H) * 0.34 * pulso;
    const cx = W / 2;
    const cy = H / 2 + S * 0.05;
    const ca = Math.cos(angulo);
    const sa = Math.sin(angulo);

    // Resplandor de fondo
    const halo = ctx.createRadialGradient(cx, cy, S * 0.2, cx, cy, S * 1.45);
    halo.addColorStop(0, "rgba(255, 143, 171, 0.35)");
    halo.addColorStop(1, "rgba(255, 143, 171, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    // Proyección 3D simple
    const proy = new Array(PUNTOS.length);
    for (let i = 0; i < PUNTOS.length; i++) {
      const p = PUNTOS[i];
      const X = p.x * ca + p.z * sa;
      const Zr = -p.x * sa + p.z * ca;
      const persp = 4.2 / (4.2 - Zr);
      proy[i] = {
        sx: cx + X * S * persp,
        sy: cy - (p.y - 0.05) * S * persp,
        Zr: Zr,
        s: p.s,
        persp: persp
      };
    }
    proy.sort(function (a, b) { return a.Zr - b.Zr; });

    const escala = S / 150;
    for (let i = 0; i < proy.length; i++) {
      const p = proy[i];
      ctx.fillStyle = "hsl(" + (343 + p.Zr * 18) + ", 88%, " + (58 + p.Zr * 22) + "%)";
      const r = (1.5 + p.s * 1.3) * p.persp * escala;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Anillos de onda
    for (let i = ANILLOS.length - 1; i >= 0; i--) {
      const a = ANILLOS[i];
      a.vida += dt;
      a.r += 260 * dt;
      const alfa = Math.max(0, 1 - a.r / (S * 2.4));
      if (alfa <= 0) { ANILLOS.splice(i, 1); continue; }
      ctx.strokeStyle = "rgba(231, 84, 128, " + (alfa * 0.6) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Partículas de la explosión
    for (let i = DESTELLOS.length - 1; i >= 0; i--) {
      const d = DESTELLOS[i];
      d.vida += dt;
      if (d.vida >= d.duracion) { DESTELLOS.splice(i, 1); continue; }
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vx *= 0.97;
      d.vy = d.vy * 0.97 + 90 * dt;
      const alfa = 1 - d.vida / d.duracion;
      ctx.globalAlpha = alfa;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.tam * (0.6 + alfa * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  let primero = true;
  function marco(ms) {
    const t = ms / 1000;
    const dt = primero ? 0.016 : Math.min(0.05, t - ultimoT);
    primero = false;
    ultimoT = t;
    dibujar(t, dt);
    requestAnimationFrame(marco);
  }

  // Interacción
  canvas.addEventListener("pointerdown", function (e) {
    arrastrando = true;
    ultimoX = e.clientX;
    movido = 0;
    inicioPulsacion = performance.now();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignorar */ }
  });

  canvas.addEventListener("pointermove", function (e) {
    if (!arrastrando) return;
    const dx = e.clientX - ultimoX;
    ultimoX = e.clientX;
    movido += Math.abs(dx);
    angulo += dx * 0.011;
    velocidad = dx * 0.011;
  });

  function terminar(e) {
    if (!arrastrando) return;
    arrastrando = false;
    const duracion = performance.now() - inicioPulsacion;
    if (movido < 8 && duracion < 450) latir();
  }

  canvas.addEventListener("pointerup", terminar);
  canvas.addEventListener("pointercancel", function () { arrastrando = false; });

  window.addEventListener("resize", function () {
    redimensionar();
  });

  construir();
  redimensionar();
  requestAnimationFrame(marco);
})();
