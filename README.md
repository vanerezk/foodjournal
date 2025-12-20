# Food Journal

Aplicación web para registrar restaurantes y comidas, con estadísticas y visualizaciones, diseñada para escritorio y móvil.

✅ Características principales:

- Añadir/editar/eliminar entradas de comidas (lugar, ciudad, país, tipo de comida, notas, fecha).
- Seleccionar tipo de servicio: Comer aquí o Delivery y visualizarlo en gráfico.
- Estadísticas interactivas: gráficos tipo pie, bar y time-series (entradas por mes).
- Filtros por país, tipo de comida, valoración y rangos de fecha.
- Persistencia local con localStorage (clave: food-journal-v2).
- Interfaz responsiva optimizada para dispositivos móviles (menús, botones táctiles, vista numérica de entradas por mes).

🧰 Tecnologías:

- Next.js 16 (Turbopack), React 19
- Bootstrap 5 (UI), react-window (virtualized lists)
- TypeScript, ESLint, Playwright (devtools)

## Almacenamiento local

La app guarda tus entradas **localmente** en el navegador usando `localStorage` bajo la clave `food-journal-v2`.

- Los controles de exportar/importar fueron ocultados en la interfaz para simplificar la experiencia. Si quieres que vuelva a añadirse una forma visible de exportar o importar archivos, dímelo y la reintroduzco.

---

## Fichas de entradas y fotos 📸

Cada entrada del historial puede abrirse como una **ficha individual** haciendo clic en el nombre del lugar. Desde allí puedes:

- Ver todos los detalles de la entrada (fecha, país, ciudad, notas, etc.).
- **Subir fotos** desde tu dispositivo (se guardan localmente en base64).
- **Guardar una URL de Google Maps** y ver el mapa embebido (Share → Embed en Google Maps).

Para embeber un mapa desde Google Maps:
1. Abre Google Maps y busca el lugar.
2. Haz clic en "Compartir" (o el icono de compartir).
3. Selecciona "Insertar un mapa".
4. Copia la URL que contiene `https://www.google.com/maps/embed?...`.
5. Pega esa URL en el campo "Google Maps" de la ficha y guarda.

---

## Supabase (backend opcional — futuro)

Si en el futuro quieres migrar a una base de datos en la nube (Supabase), el proyecto tiene la estructura preparada. Por ahora todo funciona con `localStorage` — no es necesario configurar Supabase para usar la app. 

Cuando decidas usarlo:
- Crea un proyecto en https://app.supabase.com/.
- Ejecuta el SQL de `supabase/init.sql` en el editor SQL.
- Crea un bucket `entries` para las fotos.
- Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Vercel (o `.env.local` para desarrollo local).
