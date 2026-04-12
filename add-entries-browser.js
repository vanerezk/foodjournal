// Script para agregar las entradas faltantes desde localStorage
// Ejecutar en la consola del navegador en https://foodjournal-xi.vercel.app/journal

async function addMissingEntries() {
  // Las entradas del HTML que quieres agregar
  const entriesToAdd = [
    {
      date: '2025-01-21',
      place: 'FATOUSH',
      city: 'MADRID',
      country: 'ESPAÑA',
      cuisine: 'Libanesa',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-20',
      place: 'COSTCO',
      city: 'MADRID',
      country: 'ESPAÑA',
      cuisine: 'Americana',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-19',
      place: 'O.LUAR',
      city: 'MADRID',
      country: 'ESPAÑA',
      cuisine: 'Colombiana',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-18',
      place: 'BRUTAL BURRITO',
      city: 'MADRID',
      country: 'ESPAÑA',
      cuisine: 'Mexicana',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-13',
      place: 'LA BRASERÍA DE LA VIÑA',
      city: 'CADIZ',
      country: 'ESPAÑA',
      cuisine: 'Tapitas',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-12',
      place: 'EL RINCÓN DE MARIANA',
      city: 'CADIZ',
      country: 'ESPAÑA',
      cuisine: 'Tapitas',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-11',
      place: 'PASTELERÍA LOS REYES',
      city: 'JEREZ',
      country: 'ESPAÑA',
      cuisine: 'Merienda',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-11',
      place: 'LA FRONTERA DE JEREZ',
      city: 'JEREZ',
      country: 'ESPAÑA',
      cuisine: 'Tapitas',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-11',
      place: 'ANKA ANA',
      city: 'EL PTO',
      country: 'ESPAÑA',
      cuisine: 'Desayuno',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-08',
      place: 'ONOTO',
      city: 'EL PTO',
      country: 'ESPAÑA',
      cuisine: 'Americana',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-08',
      place: 'NARIGONI',
      city: 'EL PTO',
      country: 'ESPAÑA',
      cuisine: 'Desayuno',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-05',
      place: 'KFC',
      city: 'JEREZ',
      country: 'ESPAÑA',
      cuisine: 'Americana',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-04',
      place: 'LOS POLLITO MI COMPARE',
      city: 'EL PTO',
      country: 'ESPAÑA',
      cuisine: 'Española',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-03',
      place: 'ROCK BAR',
      city: 'EL PTO',
      country: 'ESPAÑA',
      cuisine: 'Española',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-06',
      place: 'HOTEL REINA CRISTINA',
      city: 'ALGECIRAS',
      country: 'ESPAÑA',
      cuisine: 'Buffet',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
    {
      date: '2025-01-02',
      place: 'TGB',
      city: 'CONIL',
      country: 'ESPAÑA',
      cuisine: 'Americana',
      rating: 'neutral',
      serviceType: 'dine-in',
    },
  ];

  // Función para generar ID único
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // Obtener supabase del window (debería estar disponible en la app)
  const supabase = window.supabase;

  if (!supabase) {
    console.error('Supabase no está disponible. Asegúrate de estar en la página correcta.');
    return;
  }

  console.log(`Intentando agregar ${entriesToAdd.length} entradas...`);

  let added = 0;
  let skipped = 0;

  for (const entry of entriesToAdd) {
    try {
      // Verificar si la entrada ya existe
      const {data: existing} = await supabase
        .from('entries')
        .select('id')
        .eq('date', entry.date)
        .eq('place', entry.place)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`⏭️  Ya existe: ${entry.place} (${entry.date})`);
        skipped++;
        continue;
      }

      // Crear la entrada para la base de datos
      const dbEntry = {
        id: uid(),
        date: entry.date,
        place: entry.place,
        city: entry.city || null,
        country: entry.country,
        cuisine: entry.cuisine,
        service_type: entry.serviceType || null,
        rating: entry.rating || null,
        notes: null,
        maps_url: null,
        photos: [],
      };

      // Insertar la entrada
      const {error} = await supabase.from('entries').insert([dbEntry]);

      if (error) {
        console.error(`❌ Error agregando ${entry.place}:`, error);
      } else {
        console.log(`✅ Agregada: ${entry.place} (${entry.date})`);
        added++;
      }
    } catch (err) {
      console.error(`❌ Error procesando ${entry.place}:`, err);
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`✅ Agregadas: ${added}`);
  console.log(`⏭️  Omitidas (ya existían): ${skipped}`);
  console.log(`🔄 Recarga la página para ver los cambios.`);
}

addMissingEntries();
