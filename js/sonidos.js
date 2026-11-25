/* ==========================================================
   SONIDOS (generados en el navegador, sin archivos extra)
   - campana(): acorde suave y relajado al tocar el corazón
   - aleteo(): burbuja suave al aletear
   - punto(): notita tranquila al pasar un bastón
   - suave(): sonido bajito al chocar
   - animal(nombre): cada animalito tiene su propio sonido
   ========================================================== */
(function () {
  let ctx = null;
  let master = null;

  function obtenerContexto() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function salida() {
    obtenerContexto();
    return master;
  }

  // Sonido tipo "pad": suave, con ataque lento y cola larga
  function nota(freq, t0, dur, vol, tipo) {
    const ac = obtenerContexto();
    if (!ac) return;
    const osc = ac.createOscillator();
    const filtro = ac.createBiquadFilter();
    const g = ac.createGain();
    osc.type = tipo || "sine";
    osc.frequency.value = freq;
    filtro.type = "lowpass";
    filtro.frequency.value = 1600;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(filtro);
    filtro.connect(g);
    g.connect(salida());
    osc.start(t0);
    osc.stop(t0 + dur + 0.1);
  }

  // Campana relajada y romántica: acorde Cmaj7 que entra suave
  function campana() {
    const ac = obtenerContexto();
    if (!ac) return;
    const t = ac.currentTime;
    const acorde = [261.63, 329.63, 392.0, 493.88];
    acorde.forEach(function (f, i) {
      nota(f, t + i * 0.09, 3.2, 0.09, "sine");
      nota(f * 2.001, t + i * 0.09, 2.4, 0.015, "sine"); // brillo muy leve
    });
  }

  // Envolvente simple para voces de animales
  function envolvente(g, t0, dur, vol, ataque) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + (ataque || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }

  // Osciladores con barrido de tono y filtro: base de todos los animales
  function voz(opts) {
    const ac = obtenerContexto();
    if (!ac) return;
    const t0 = ac.currentTime + (opts.retraso || 0);
    const osc = ac.createOscillator();
    const filtro = ac.createBiquadFilter();
    const g = ac.createGain();
    osc.type = opts.onda || "sawtooth";
    osc.frequency.setValueAtTime(opts.f0, t0);
    osc.frequency.exponentialRampToValueAtTime(opts.f1, t0 + opts.dur * 0.6);
    osc.frequency.exponentialRampToValueAtTime(opts.f2 || opts.f1, t0 + opts.dur);
    filtro.type = opts.filtro || "lowpass";
    filtro.frequency.setValueAtTime(opts.ff0 || 1200, t0);
    filtro.frequency.exponentialRampToValueAtTime(opts.ff1 || 800, t0 + opts.dur);
    filtro.Q.value = opts.q || 1;
    if (opts.vibrato) {
      const lfo = ac.createOscillator();
      const prof = ac.createGain();
      lfo.frequency.value = opts.vibrato;
      prof.gain.value = opts.vibratoProf || 12;
      lfo.connect(prof);
      prof.connect(osc.frequency);
      lfo.start(t0);
      lfo.stop(t0 + opts.dur + 0.1);
    }
    envolvente(g, t0, opts.dur, opts.vol || 0.25, opts.ataque);
    osc.connect(filtro);
    filtro.connect(g);
    g.connect(salida());
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.1);
  }

  // Ladrido: tono que baja + ruido corto
  function ladrido(retraso, f0, f1) {
    voz({ f0: f0, f1: f1, dur: 0.16, vol: 0.32, onda: "sawtooth", filtro: "bandpass", ff0: 900, ff1: 500, q: 2.2, retraso: retraso, ataque: 0.005 });
  }

  // Maullido
  function maullido(retraso, dur, vol, base) {
    voz({ f0: base, f1: base * 1.6, f2: base * 0.85, dur: dur, vol: vol || 0.2, onda: "sawtooth", filtro: "bandpass", ff0: 1400, ff1: 900, q: 3, vibrato: 5, vibratoProf: 10, retraso: retraso || 0, ataque: 0.04 });
  }

  const ANIMALES = {
    // Perrito café: un "guau" con voz clara
    canela: function () {
      ladrido(0, 470, 230);
    },
    // Perrito blanco: un "awoo" largo tipo aullido
    nube: function () {
      voz({ f0: 420, f1: 760, f2: 520, dur: 1.1, vol: 0.18, onda: "sine", vibrato: 6, vibratoProf: 14, ataque: 0.12, ff0: 2000, ff1: 1200 });
    },
    // Perrito chocolate: dos guaus graves
    chocolate: function () {
      ladrido(0, 300, 150);
      ladrido(0.3, 300, 150);
    },
    // Gata naranja: un "miau" largo
    mimi: function () {
      maullido(0, 0.6, 0.2, 620);
    },
    // Gata gris: ronroneo suave
    luna: function () {
      voz({ f0: 110, f1: 105, dur: 1.6, vol: 0.2, onda: "sawtooth", filtro: "lowpass", ff0: 420, ff1: 380, ataque: 0.15, vibrato: 25, vibratoProf: 18 });
    },
    // Gato negro: dos "mimi" rápidos
    oreo: function () {
      maullido(0, 0.22, 0.2, 760);
      maullido(0.28, 0.22, 0.2, 820);
    }
  };

  function animal(nombre) {
    obtenerContexto();
    const f = ANIMALES[nombre];
    if (f) f();
  }

  // Burbuja suave al aletear
  function aleteo() {
    const ac = obtenerContexto();
    if (!ac) return;
    voz({ f0: 380, f1: 620, dur: 0.12, vol: 0.14, onda: "sine", ataque: 0.01, ff0: 2400, ff1: 2400 });
  }

  // Notita tranquila al pasar un bastón
  const ESCALA = [523.25, 587.33, 659.25, 783.99, 880];
  let idxPunto = 0;
  function punto() {
    const ac = obtenerContexto();
    if (!ac) return;
    nota(ESCALA[idxPunto % ESCALA.length], ac.currentTime, 0.9, 0.12, "sine");
    idxPunto++;
  }

  // Choque: sonido grave y bajito
  function suave() {
    voz({ f0: 220, f1: 140, dur: 0.35, vol: 0.14, onda: "sine", ataque: 0.01 });
  }

  window.Sonidos = {
    campana: campana,
    aleteo: aleteo,
    punto: punto,
    suave: suave,
    animal: animal,
    reiniciarPunto: function () { idxPunto = 0; },
    preparar: obtenerContexto
  };
})();
