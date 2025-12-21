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

## Supabase (backend en la nube) ☁️

**¡La app ahora está totalmente integrada con Supabase!** Funciona con:

- **Base de datos Supabase**: Sincronización automática de todas las entradas entre dispositivos
- **Supabase Storage**: Las fotos se suben a la nube y se obtienen URLs públicas
- **Fallback a localStorage**: Si Supabase no está disponible, la app sigue funcionando localmente

### Configuración:

📋 **[Ver guía completa de configuración en SUPABASE_SETUP.md](SUPABASE_SETUP.md)**

Pasos rápidos:

1. ✅ **Tabla creada**: Ya tienes la tabla `entries` en Supabase
2. 📂 **Crear bucket de Storage**: Ve a Storage → New bucket → Nombre: `entries` (público)
3. 🔑 **Variables de entorno configuradas**: Ya tienes las keys en Vercel
4. 🔄 **Migrar datos existentes**: Si tienes entradas en localStorage, usa el script de migración en la guía
5. ✅ **Probar sincronización**: Crea una entrada, sube fotos, verifica en Supabase

La app carga datos de Supabase primero, y si falla usa localStorage. Al guardar, sincroniza con Supabase y mantiene localStorage como respaldo.
