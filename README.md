# Página de cumpleaños

Página romántica hecha con HTML, CSS y JavaScript puro (sin instalar nada).

## Estructura

```
index.html        Página principal
css/styles.css    Estilos y animaciones
js/config.js      Datos: nombre, fechas, Supabase y ntfy
js/corazon.js     Corazón 3D de partículas (gira, late, suena)
js/videos.js      Videos de Instagram (uno a la vez, orden aleatorio)
js/voz.js         Nota de voz tipo WhatsApp (audio/25.m4a)
js/juego.js       Minijuego "Atrapa mis corazones"
js/mascotas.js    Perritos y gatitos animados
js/extrano.js     Botón "Te extraño" (texto + foto → Supabase y ntfy)
js/sonidos.js     Campanita y sonidos suaves
js/main.js        Fechas, contadores y avisos
supabase.sql      Crea la base de datos (tabla + fotos)
audio/25.m4a      Audio del mensaje
```

## 1. Crear la base de datos (Supabase)

1. Entra a tu proyecto en https://supabase.com
2. Menú izquierdo: **SQL Editor** → **New query**
3. Abre `supabase.sql`, copia todo, pégalo y pulsa **Run**.

Para ver los mensajes que te envíe: **Table Editor** → tabla `mensajes`.

## 2. Notificaciones a tu celular (ntfy, gratis)

1. Instala la app **ntfy** (Play Store / App Store).
2. En `js/config.js` cambia `NTFY_TOPICO` por un nombre secreto (solo letras y números, por ejemplo `cumple-xyz-83hd92`). Así solo tú lo conoces.
3. En la app ntfy pulsa **+** y suscríbete a ese mismo nombre.
4. Listo: cada vez que ella pulse **Te extraño** te llegará la notificación con su mensaje, y si puso foto, podrás verla.

## 3. Publicar en GitHub Pages

1. Sube todos los archivos de esta carpeta al repositorio `Daltongit/Heidi` (la carpeta `audio/` también).
2. En GitHub: **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
4. En un par de minutos tu enlace será: `https://daltongit.github.io/Heidi/`

## Probarla en tu computadora

Abre `index.html` con doble clic. Para que funcione todo (sobre todo los videos y la subida de fotos) es mejor usar un servidor local:

```powershell
cd "D:\25_11_2026"
python -m http.server 8080
```

Y entra a `http://localhost:8080`.

## Notas

- Los videos de Instagram se reproducen dentro de Instagram: el volumen se controla con los botones del propio video. Solo se carga uno a la vez, así nunca suenan varios juntos.
- Las fechas, el nombre y las frases se cambian en `js/config.js` y en `index.html`.
- La clave de Supabase que se usa en la página es la **publicable** (está pensada para ir en el navegador). No pongas nunca la clave `service_role` en estos archivos.
