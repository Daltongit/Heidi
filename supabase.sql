-- =====================================================================
-- BASE DE DATOS · Página de cumpleaños
-- Copia TODO este archivo, pégalo en Supabase > SQL Editor > New query
-- y pulsa RUN. Se puede correr más de una vez sin romper nada.
-- =====================================================================

-- 1) Tabla donde se guardan los "Te extraño" (texto y/o imagen)
create table if not exists public.mensajes (
  id          bigint generated always as identity primary key,
  texto       text check (texto is null or char_length(texto) <= 500),
  imagen_url  text,
  created_at  timestamptz not null default now()
);

alter table public.mensajes enable row level security;

-- Cualquiera con la página puede ENVIAR un mensaje (insertar),
-- pero nadie puede leer la tabla desde la página. Tú la ves en Table Editor.
drop policy if exists "Enviar te extrano" on public.mensajes;
create policy "Enviar te extrano"
  on public.mensajes
  for insert
  to anon, authenticated
  with check (
    (texto is null or char_length(texto) <= 500)
    and (imagen_url is null or imagen_url like '%/storage/v1/object/public/recuerdos/%')
  );

-- 2) Bucket (carpeta en la nube) para las fotos que ella suba
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recuerdos',
  'recuerdos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 3) Permiso para subir fotos SOLO al bucket "recuerdos"
drop policy if exists "Subir fotos de recuerdos" on storage.objects;
create policy "Subir fotos de recuerdos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'recuerdos');

-- Para ver los mensajes después: Table Editor > mensajes (ordenados por created_at)
-- Consulta útil:
-- select created_at, texto, imagen_url from public.mensajes order by created_at desc;
