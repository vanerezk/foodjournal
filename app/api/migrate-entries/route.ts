import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

const entriesToAdd = [
  { date: '2025-01-21', place: 'FATOUSH', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Libanesa', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-20', place: 'COSTCO', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Americana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-19', place: 'O.LUAR', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Colombiana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-18', place: 'BRUTAL BURRITO', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Mexicana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-13', place: 'LA BRASERÍA DE LA VIÑA', city: 'CADIZ', country: 'ESPAÑA', cuisine: 'Tapitas', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-12', place: 'EL RINCÓN DE MARIANA', city: 'CADIZ', country: 'ESPAÑA', cuisine: 'Tapitas', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-11', place: 'PASTELERÍA LOS REYES', city: 'JEREZ', country: 'ESPAÑA', cuisine: 'Merienda', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-11', place: 'LA FRONTERA DE JEREZ', city: 'JEREZ', country: 'ESPAÑA', cuisine: 'Tapitas', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-11', place: 'ANKA ANA', city: 'EL PTO', country: 'ESPAÑA', cuisine: 'Desayuno', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-08', place: 'ONOTO', city: 'EL PTO', country: 'ESPAÑA', cuisine: 'Americana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-08', place: 'NARIGONI', city: 'EL PTO', country: 'ESPAÑA', cuisine: 'Desayuno', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-05', place: 'KFC', city: 'JEREZ', country: 'ESPAÑA', cuisine: 'Americana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-04', place: 'LOS POLLITO MI COMPARE', city: 'EL PTO', country: 'ESPAÑA', cuisine: 'Española', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-03', place: 'ROCK BAR', city: 'EL PTO', country: 'ESPAÑA', cuisine: 'Española', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-06', place: 'HOTEL REINA CRISTINA', city: 'ALGECIRAS', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'neutral', service_type: 'dine-in' },
  { date: '2025-01-02', place: 'TGB', city: 'CONIL', country: 'ESPAÑA', cuisine: 'Americana', rating: 'neutral', service_type: 'dine-in' },
];

const SECRET = process.env.MIGRATE_ENTRIES_SECRET || 'foodjournal-migrate-2026';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');

  if (!secret || secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client not configured' }, { status: 500 });
  }

  const added: string[] = [];
  const skipped: string[] = [];
  const errors: Array<{ place: string; message: string }> = [];

  for (const entry of entriesToAdd) {
    try {
      const { data: existing, error: checkError } = await supabase
        .from('entries')
        .select('id')
        .eq('date', entry.date)
        .eq('place', entry.place)
        .limit(1);

      if (checkError) {
        errors.push({ place: entry.place, message: checkError.message });
        continue;
      }

      if (existing && existing.length > 0) {
        skipped.push(`${entry.place} (${entry.date})`);
        continue;
      }

      const dbEntry = {
        id: crypto.randomUUID(),
        ...entry,
        city: entry.city ?? null,
        notes: null,
        maps_url: null,
        photos: [],
      };

      const { error: insertError } = await supabase.from('entries').insert([dbEntry]);
      if (insertError) {
        errors.push({ place: entry.place, message: insertError.message });
      } else {
        added.push(`${entry.place} (${entry.date})`);
      }
    } catch (err) {
      errors.push({ place: entry.place, message: String(err) });
    }
  }

  return NextResponse.json({ added, skipped, errors });
}
