/* ==========================================================
   CONFIGURACIÓN GENERAL
   Cambia aquí los datos si necesitas ajustar algo.
   ========================================================== */
window.CONFIG = {
  // Nombre que aparece en el título (pon su nombre si quieres)
  NOMBRE: "Heidi",

  // Recuerdos propios (carpeta videos/). Cada carpeta: video o carrusel de fotos + canción a1.
  MEDIA: [
    { tipo: "fotos", imagenes: ["videos/1/1.jpg", "videos/1/2.jpg", "videos/1/3.jpg", "videos/1/4.jpg", "videos/1/5.jpg"], audio: "videos/1/a1.mp3", },
    { tipo: "video", src: "videos/2/1.mp4" },
    { tipo: "video", src: "videos/3/3.mp4" },
    { tipo: "fotos", imagenes: ["videos/4/1.jpg"], audio: "videos/4/a1.mp3", },
    { tipo: "fotos", imagenes: ["videos/5/1.jpg"], audio: "videos/5/a1.mp3", },
    { tipo: "fotos", imagenes: ["videos/6/1.webp"], audio: "videos/6/a1.mp3", },
    { tipo: "fotos", imagenes: ["videos/7/1.jpg"], audio: "videos/7/a1.mp3", },
    { tipo: "fotos", imagenes: ["videos/8/1.jpg", "videos/8/2.jpg"], audio: "videos/8/a1.mp3", },
    { tipo: "video", src: "videos/9/1.mp4" },
    { tipo: "fotos", imagenes: ["videos/10/1.jpg"], audio: "videos/10/a1.mp3", },
    { tipo: "video", src: "videos/11/1.mp4" },
    { tipo: "fotos", imagenes: ["videos/12/1.jpg", "videos/12/2.jpg", "videos/12/3.jpg"], audio: "videos/12/a1.mp3", },
    { tipo: "video", src: "videos/13/1.mp4" },
    { tipo: "fotos", imagenes: ["videos/14/1.webp"], audio: "videos/14/a1.mp3", },
    { tipo: "video", src: "videos/15/1.mp4" },
    { tipo: "fotos", imagenes: ["videos/16/1.jpg"], audio: "videos/16/a1.mp3", },
    { tipo: "video", src: "videos/17/1.mp4" }
  ],

  // Fechas (año-mes-día)
  FECHA_PRIMER_MENSAJE: "2026-09-28",
  FECHA_PRIMERA_MIRADA: "2026-09-30",
  FECHA_CUMPLE_ELLA: "2006-11-25",

  // Supabase (base de datos + fotos)
  SUPABASE_URL: "https://giuavgkdbzztpjxcphvx.supabase.co",
  SUPABASE_KEY: "sb_publishable_RLpF-fOqFWqDioprtbWD-Q_2WNM3uX3",
  BUCKET_FOTOS: "recuerdos",

  // Notificaciones al celular (app gratuita "ntfy" en tu teléfono)
  // Cambia este nombre por uno secreto y suscríbete a ese mismo nombre en la app ntfy
  NTFY_URL: "https://ntfy.sh",
  NTFY_TOPICO: "te-extrano-k7Qm2vXp9LwR4sT8"
};
