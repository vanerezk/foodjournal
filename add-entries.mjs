import {supabase} from './lib/supabaseClient';

const entriesToAdd = [
  {
    date: '2025-01-21',
    place: 'FATOUSH',
    city: 'MADRID',
    country: 'ESPAÑA',
    cuisine: 'Libanesa',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-20',
    place: 'COSTCO',
    city: 'MADRID',
    country: 'ESPAÑA',
    cuisine: 'Americana',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-19',
    place: 'O.LUAR',
    city: 'MADRID',
    country: 'ESPAÑA',
    cuisine: 'Colombiana',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-18',
    place: 'BRUTAL BURRITO',
    city: 'MADRID',
    country: 'ESPAÑA',
    cuisine: 'Mexicana',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-13',
    place: 'LA BRASERÍA DE LA VIÑA',
    city: 'CADIZ',
    country: 'ESPAÑA',
    cuisine: 'Tapitas',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-12',
    place: 'EL RINCÓN DE MARIANA',
    city: 'CADIZ',
    country: 'ESPAÑA',
    cuisine: 'Tapitas',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-11',
    place: 'PASTELERÍA LOS REYES',
    city: 'JEREZ',
    country: 'ESPAÑA',
    cuisine: 'Merienda',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-11',
    place: 'LA FRONTERA DE JEREZ',
    city: 'JEREZ',
    country: 'ESPAÑA',
    cuisine: 'Tapitas',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-11',
    place: 'ANKA ANA',
    city: 'EL PTO',
    country: 'ESPAÑA',
    cuisine: 'Desayuno',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-08',
    place: 'ONOTO',
    city: 'EL PTO',
    country: 'ESPAÑA',
    cuisine: 'Americana',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-08',
    place: 'NARIGONI',
    city: 'EL PTO',
    country: 'ESPAÑA',
    cuisine: 'Desayuno',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-05',
    place: 'KFC',
    city: 'JEREZ',
    country: 'ESPAÑA',
    cuisine: 'Americana',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-04',
    place: 'LOS POLLITO MI COMPARE',
    city: 'EL PTO',
    country: 'ESPAÑA',
    cuisine: 'Española',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-03',
    place: 'ROCK BAR',
    city: 'EL PTO',
    country: 'ESPAÑA',
    cuisine: 'Española',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-06',
    place: 'HOTEL REINA CRISTINA',
    city: 'ALGECIRAS',
    country: 'ESPAÑA',
    cuisine: 'Buffet',
    rating: 'neutral',
    service_type: 'dine-in',
  },
  {
    date: '2025-01-02',
    place: 'TGB',
    city: 'CONIL',
    country: 'ESPAÑA',
    cuisine: 'Americana',
    rating: 'neutral',
    service_type: 'dine-in',
  },
];

async function addEntries() {
  if (!supabase) {
    console.error('Supabase not configured');
    return;
  }

  for (const entry of entriesToAdd) {
    try {
      // Check if entry already exists
      const {data: existing} = await supabase
        .from('entries')
        .select('id')
        .eq('date', entry.date)
        .eq('place', entry.place)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`Entry already exists: ${entry.place} on ${entry.date}`);
        continue;
      }

      // Add the entry
      const {error} = await supabase.from('entries').insert([entry]);

      if (error) {
        console.error(`Error adding ${entry.place}:`, error);
      } else {
        console.log(`Added: ${entry.place} on ${entry.date}`);
      }
    } catch (err) {
      console.error(`Error processing ${entry.place}:`, err);
    }
  }
}

addEntries();
