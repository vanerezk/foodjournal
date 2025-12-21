# Guía Completa de Configuración de Supabase

## Paso 1: Configuración de la Tabla de Base de Datos ✅

Ya has completado este paso. Tu tabla `entries` está creada con:

```sql
create table entries (
  id text primary key,
  date text not null,
  place text not null,
  city text,
  country text not null,
  cuisine text not null,
  service_type text,
  notes text,
  rating text,
  maps_url text,
  photos jsonb,
  created_at timestamp with time zone default now()
);
```

## Paso 2: Crear el Bucket de Storage

### En el Dashboard de Supabase:

1. Ve a **Storage** en el menú lateral
2. Haz clic en **"New bucket"** o **"Crear bucket"**
3. Configura el bucket:
   - **Name**: `entries`
   - **Public bucket**: Marca esta opción (necesario para que las fotos sean públicas)
   - Haz clic en **"Create bucket"**

### Verificar las Políticas (Policies):

Con "Public bucket" activado, las fotos serán accesibles públicamente. Si necesitas más control:

1. Ve a **Storage** → **Policies**
2. Para el bucket `entries`, asegúrate de tener:
   - **SELECT (READ)**: Política pública para lectura
   - **INSERT**: Política para usuarios autenticados o pública (según tu preferencia)
   - **UPDATE**: Política para usuarios autenticados o pública
   - **DELETE**: Política para usuarios autenticados o pública

#### Ejemplo de Políticas:

```sql
-- Permitir lectura pública
create policy "Public read access"
on storage.objects for select
using ( bucket_id = 'entries' );

-- Permitir inserción pública (o cambia a authenticated si prefieres)
create policy "Public upload access"
on storage.objects for insert
with check ( bucket_id = 'entries' );

-- Permitir actualización pública
create policy "Public update access"
on storage.objects for update
using ( bucket_id = 'entries' );

-- Permitir eliminación pública
create policy "Public delete access"
on storage.objects for delete
using ( bucket_id = 'entries' );
```

## Paso 3: Verificar Variables de Entorno

### Localmente (.env.local):

Verifica que tienes:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### En Vercel:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Verifica que tienes:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Si las acabas de agregar, haz **Redeploy** del proyecto para que tomen efecto

## Paso 4: Migrar Datos Existentes de localStorage

Si ya tienes entradas en localStorage que quieres migrar a Supabase:

### Opción A: Migración Manual desde el Navegador (Recomendado)

1. Abre tu aplicación en el navegador
2. Abre la Consola de Desarrollador (F12)
3. Ve a la pestaña **Console**
4. Ejecuta este script:

```javascript
// Copiar datos de localStorage a Supabase
async function migrateToSupabase() {
  const {createClient} = require('@supabase/supabase-js');

  const supabaseUrl = 'https://tu-proyecto.supabase.co'; // Reemplaza con tu URL
  const supabaseKey = 'tu-anon-key'; // Reemplaza con tu key
  const supabase = createClient(supabaseUrl, supabaseKey);

  const raw = localStorage.getItem('food-journal-v2');
  if (!raw) {
    console.log('No hay datos en localStorage');
    return;
  }

  const entries = JSON.parse(raw);
  console.log(`Encontradas ${entries.length} entradas`);

  for (const entry of entries) {
    const dbEntry = {
      id: entry.id,
      date: entry.date,
      place: entry.place,
      city: entry.city || null,
      country: entry.country,
      cuisine: entry.cuisine,
      service_type: entry.serviceType || null,
      notes: entry.notes || null,
      rating: entry.rating || null,
      maps_url: entry.maps_url || null,
      photos: entry.photos || [],
    };

    const {error} = await supabase.from('entries').upsert(dbEntry);

    if (error) {
      console.error(`Error migrando entrada ${entry.id}:`, error);
    } else {
      console.log(`✓ Migrada: ${entry.place}`);
    }
  }

  console.log('Migración completada');
}

// Ejecutar
migrateToSupabase();
```

### Opción B: Script de Node.js (Para desarrolladores)

Crea un archivo `migrate.js`:

```javascript
const {createClient} = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Pega aquí el contenido de tu localStorage
const entries = [
  // Copia y pega aquí el JSON de localStorage.getItem('food-journal-v2')
];

async function migrate() {
  for (const entry of entries) {
    const dbEntry = {
      id: entry.id,
      date: entry.date,
      place: entry.place,
      city: entry.city || null,
      country: entry.country,
      cuisine: entry.cuisine,
      service_type: entry.serviceType || null,
      notes: entry.notes || null,
      rating: entry.rating || null,
      maps_url: entry.maps_url || null,
      photos: entry.photos || [],
    };

    const {error} = await supabase.from('entries').upsert(dbEntry);

    if (error) {
      console.error(`Error: ${entry.place}`, error);
    } else {
      console.log(`✓ ${entry.place}`);
    }
  }
}

migrate();
```

Ejecuta: `node migrate.js`

## Paso 5: Probar la Sincronización

### Prueba Completa:

1. **Crear una nueva entrada**:

   - Agrega una entrada desde la página principal
   - Verifica en Supabase → Table Editor → `entries` que aparece

2. **Subir una foto**:

   - Entra a una entrada y sube una foto
   - Verifica en Supabase → Storage → `entries` que se carga el archivo
   - Verifica que la URL aparece en la columna `photos` de la tabla

3. **Editar una entrada**:

   - Edita los datos de una entrada
   - Verifica en Supabase que los cambios se reflejan

4. **Eliminar una foto**:

   - Elimina una foto de una entrada
   - Verifica que desaparece del bucket de Storage

5. **Guardar URL de Maps**:

   - Agrega una URL de Google Maps
   - Verifica en la columna `maps_url` de la tabla

6. **Refrescar la página**:
   - Refresca el navegador
   - Verifica que todos los datos se mantienen (ahora vienen de Supabase)

## Paso 6: Probar el Fallback a localStorage

Para verificar que el fallback funciona si Supabase no está disponible:

1. Desconecta internet o quita temporalmente las variables de entorno
2. Intenta crear/editar entradas
3. Verifica que se guardan en localStorage
4. Reconecta internet
5. Refresca la página y verifica que vuelve a cargar de Supabase

## Troubleshooting

### Las fotos no se muestran:

- Verifica que el bucket `entries` es público
- Verifica las políticas de lectura del bucket
- Abre la URL de una foto directamente en el navegador para ver si es accesible

### Los datos no se sincronizan:

- Abre la consola del navegador y busca errores
- Verifica que las variables de entorno están correctas
- Verifica que el nombre de la tabla es exactamente `entries`
- Verifica que el nombre del bucket es exactamente `entries`

### Error "relation entries does not exist":

- La tabla no está creada o tiene otro nombre
- Ve a Supabase → SQL Editor y ejecuta el script de creación de tabla

### Error "bucket not found":

- El bucket no está creado o tiene otro nombre
- Crea el bucket con el nombre exacto `entries`

## Arquitectura de Sincronización

Tu aplicación ahora funciona así:

1. **Al cargar datos**: Intenta primero desde Supabase, si falla usa localStorage
2. **Al guardar datos**: Guarda en Supabase primero, luego actualiza localStorage como respaldo
3. **Las fotos**: Se suben a Supabase Storage y se obtiene una URL pública
4. **Si Supabase no está disponible**: La app sigue funcionando con localStorage

Esta arquitectura asegura:

- ✅ Sincronización entre dispositivos (vía Supabase)
- ✅ Funciona offline (vía localStorage)
- ✅ Las fotos se almacenan en la nube
- ✅ No se pierden datos si hay problemas de conexión
