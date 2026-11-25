/* ==========================================================
   MASCOTAS ANIMADAS (perritos y gatitos dibujados en SVG)
   Cada uno tiene su color y su propia animación al tocarlo.
   Puedes cambiar nombres, colores y frases en la lista PETS.
   ========================================================== */
(function () {
  const grid = document.getElementById("mascotasGrid");
  if (!grid) return;

  const OSCURO = "#3b2232";

  const PETS = [
    {
      tipo: "perro",
      nombre: "Canela", sonido: "canela",
      cuerpo: "#f6c892",
      oreja: "#c7874c",
      orejas: "caidas",
      parche: null,
      frase: "¡Guau! Te quiero",
      anim: "tap-salto"
    },
    {
      tipo: "perro",
      nombre: "Nube", sonido: "nube",
      cuerpo: "#f4f2f8",
      oreja: "#6c6f8c",
      orejas: "puntiagudas",
      mascara: "#6c6f8c",
      frase: "¡Awoo!",
      anim: "tap-brinco"
    },
    {
      tipo: "perro",
      nombre: "Chocolate", sonido: "chocolate",
      cuerpo: "#9a6548",
      oreja: "#5d3a25",
      orejas: "caidas",
      parche: "#fff3e6",
      frase: "¡Guau guau!",
      anim: "tap-meneo"
    },
    {
      tipo: "gato",
      nombre: "Mimi", sonido: "mimi",
      cuerpo: "#f5a25d",
      raya: "#c6742f",
      frase: "Miau~",
      anim: "tap-estirar"
    },
    {
      tipo: "gato",
      nombre: "Luna", sonido: "luna",
      cuerpo: "#a4a9bf",
      raya: null,
      frase: "Prrr, te extraño",
      anim: "tap-corre"
    },
    {
      tipo: "gato",
      nombre: "Oreo", sonido: "oreo",
      cuerpo: "#34333f",
      pecho: "#ffffff",
      raya: null,
      frase: "Mimi mimi",
      anim: "tap-ronroneo"
    }
  ];

  function svgPerro(p) {
    const orejas = p.orejas === "caidas"
      ? '<ellipse cx="60" cy="80" rx="17" ry="32" fill="' + p.oreja + '" transform="rotate(16 60 80)"/>' +
        '<ellipse cx="140" cy="80" rx="17" ry="32" fill="' + p.oreja + '" transform="rotate(-16 140 80)"/>'
      : '<path d="M58 72 L50 18 L86 56Z" fill="' + p.oreja + '"/>' +
        '<path d="M142 72 L150 18 L114 56Z" fill="' + p.oreja + '"/>';

    const mascara = p.mascara
      ? '<path d="M70 84 Q100 64 130 84 Q122 122 100 122 Q78 122 70 84Z" fill="' + p.mascara + '" opacity=".92"/>'
      : "";

    const parche = p.parche
      ? '<ellipse cx="124" cy="104" rx="16" ry="14" fill="' + p.parche + '"/>' +
        '<ellipse cx="72" cy="66" rx="10" ry="9" fill="' + p.parche + '"/>'
      : "";

    return (
      '<svg viewBox="0 0 200 200" aria-hidden="true">' +
        '<path class="tail" d="M150 150 Q186 140 178 108" stroke="' + p.cuerpo + '" stroke-width="13" stroke-linecap="round" fill="none"/>' +
        '<rect x="62" y="150" width="22" height="34" rx="11" fill="' + p.cuerpo + '"/>' +
        '<rect x="116" y="150" width="22" height="34" rx="11" fill="' + p.cuerpo + '"/>' +
        '<ellipse cx="100" cy="142" rx="56" ry="38" fill="' + p.cuerpo + '"/>' +
        orejas +
        '<circle cx="100" cy="92" r="46" fill="' + p.cuerpo + '"/>' +
        mascara +
        parche +
        '<circle cx="83" cy="90" r="6.5" fill="' + OSCURO + '"/>' +
        '<circle cx="117" cy="90" r="6.5" fill="' + OSCURO + '"/>' +
        '<circle cx="85" cy="88" r="2.1" fill="#fff"/>' +
        '<circle cx="119" cy="88" r="2.1" fill="#fff"/>' +
        '<ellipse cx="100" cy="106" rx="9" ry="6.5" fill="' + OSCURO + '"/>' +
        '<path d="M92 115 Q100 124 108 115" stroke="' + OSCURO + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="72" cy="108" rx="7" ry="4.5" fill="#ff8fab" opacity=".75"/>' +
        '<ellipse cx="128" cy="108" rx="7" ry="4.5" fill="#ff8fab" opacity=".75"/>' +
      '</svg>'
    );
  }

  function svgGato(p) {
    const rayas = p.raya
      ? '<path d="M100 60 v12 M90 62 l3 10 M110 62 l-3 10" stroke="' + p.raya + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M54 92 h12 M134 92 h12" stroke="' + p.raya + '" stroke-width="4" stroke-linecap="round"/>'
      : "";

    const pecho = p.pecho
      ? '<ellipse cx="100" cy="170" rx="20" ry="16" fill="' + p.pecho + '"/>' +
        '<path d="M52 118 L60 112 L70 120 L78 112 L86 120" fill="' + p.pecho + '" opacity=".0"/>'
      : "";

    const orejaInterna = p.pecho || p.raya === null ? "#ffb3c6" : "#ffb3c6";

    return (
      '<svg viewBox="0 0 200 200" aria-hidden="true">' +
        '<path class="tail" d="M142 176 Q190 170 178 122 Q174 104 186 96" stroke="' + p.cuerpo + '" stroke-width="12" stroke-linecap="round" fill="none"/>' +
        '<ellipse cx="100" cy="160" rx="42" ry="30" fill="' + p.cuerpo + '"/>' +
        pecho +
        '<path d="M56 100 L56 40 L94 72Z" fill="' + p.cuerpo + '" stroke-linejoin="round"/>' +
        '<path d="M144 100 L144 40 L106 72Z" fill="' + p.cuerpo + '" stroke-linejoin="round"/>' +
        '<path d="M62 92 L62 58 L84 76Z" fill="' + orejaInterna + '" opacity=".85"/>' +
        '<path d="M138 92 L138 58 L116 76Z" fill="' + orejaInterna + '" opacity=".85"/>' +
        '<ellipse cx="100" cy="100" rx="50" ry="44" fill="' + p.cuerpo + '"/>' +
        rayas +
        '<ellipse cx="80" cy="98" rx="6.5" ry="8.5" fill="' + OSCURO + '"/>' +
        '<ellipse cx="120" cy="98" rx="6.5" ry="8.5" fill="' + OSCURO + '"/>' +
        '<circle cx="82" cy="95" r="2.3" fill="#fff"/>' +
        '<circle cx="122" cy="95" r="2.3" fill="#fff"/>' +
        '<path d="M96 110 L104 110 L100 115Z" fill="#ff7fa3" stroke="#ff7fa3" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M92 120 Q96 125 100 118 Q104 125 108 120" stroke="' + OSCURO + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M64 112 L34 106 M64 118 L34 120 M136 112 L166 106 M136 118 L166 120" stroke="' + OSCURO + '" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>' +
        '<ellipse cx="70" cy="112" rx="7" ry="4.5" fill="#ff8fab" opacity=".55"/>' +
        '<ellipse cx="130" cy="112" rx="7" ry="4.5" fill="#ff8fab" opacity=".55"/>' +
      '</svg>'
    );
  }

  function crearPet(p, i) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pet " + (p.tipo === "perro" ? "pet-dog" : "pet-cat");
    btn.setAttribute("aria-label", "Tocar a " + p.nombre);
    btn.innerHTML =
      '<span class="pet-burbuja" aria-hidden="true"></span>' +
      '<div class="pet-cuerpo"><div class="pet-figura">' +
        (p.tipo === "perro" ? svgPerro(p) : svgGato(p)) +
      '</div></div>' +
      '<span class="pet-nombre">' + p.nombre + '</span>';

    btn.addEventListener("click", function (e) {
      tocar(btn, p, e);
    });
    return btn;
  }

  function tocar(btn, p, e) {
    const figura = btn.querySelector(".pet-figura");
    const burbuja = btn.querySelector(".pet-burbuja");

    // Reiniciar la animación de tocar
    figura.classList.remove(p.anim);
    void figura.offsetWidth;
    figura.classList.add(p.anim);
    figura.addEventListener("animationend", function fin() {
      figura.classList.remove(p.anim);
      figura.removeEventListener("animationend", fin);
    });

    // Burbuja con frase
    burbuja.textContent = p.frase;
    burbuja.classList.add("show");
    clearTimeout(btn._tBurbuja);
    btn._tBurbuja = setTimeout(function () {
      burbuja.classList.remove("show");
    }, 1500);

    // Corazones que suben
    const rect = btn.getBoundingClientRect();
    const x = (e && e.clientX ? e.clientX - rect.left : rect.width / 2);
    const y = (e && e.clientY ? e.clientY - rect.top : rect.height * 0.4);
    for (let k = 0; k < 3; k++) {
      const h = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      h.setAttribute("class", "icon pet-corazon");
      h.setAttribute("viewBox", "0 0 24 24");
      h.setAttribute("aria-hidden", "true");
      h.style.left = (x - 11 + (k - 1) * 14) + "px";
      h.style.top = (y - 11) + "px";
      h.style.setProperty("--dx", (k - 1) * 14 + "px");
      h.style.animationDelay = (k * 0.12) + "s";
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#i-heart");
      h.appendChild(use);
      btn.appendChild(h);
      setTimeout(function (el) { el.remove(); }, 1600, h);
    }

    if (window.Sonidos) window.Sonidos.animal(p.sonido);
  }

  PETS.forEach(function (p, i) {
    grid.appendChild(crearPet(p, i));
  });
})();
