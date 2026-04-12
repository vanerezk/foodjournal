import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

const entriesToAdd = [
  { date: '2026-01-17', place: 'EL JAPO', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Japonesa', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-23', place: 'LA TAGLIATELLA', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Italiana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-23', place: 'TACOS DON MANOLITO', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Mexicana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-24', place: 'RESTAURANTE EL SITIO', city: 'SEGOVIA', country: 'ESPAÑA', cuisine: 'Española', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-27', place: 'SUMO', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Japonesa', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-02', place: 'SUSHI TOKAMI', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-01', place: 'GATO', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Tapitas', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-03', place: 'OSTERIA NUVOLI', city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Italiana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-03', place: 'GUSTAPIZZA', city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Italiana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-04', place: 'OSTERIA NUTI', city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Italiana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-05', place: 'SERRE TORRIGIANI IN PIAZZETTA', city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Desayuno', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-05', place: 'JOLLY CAFFEE', city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Desayuno', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-02-05', place: "L'ARTIGIANALE", city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Merienda', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-03', place: 'KOI SUSHI', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-01', place: 'VICIO', city: 'POZUELO', country: 'ESPAÑA', cuisine: 'Americana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-02-25', place: 'ITTORYU', city: 'SALAMANCA', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-05', place: 'MALA LECHE', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Desayuno', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-05', place: 'GUSTO', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Italiana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-22', place: 'KOJIMA', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-04', place: 'ALL ANTICO VINAIO', city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Tapitas', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-04', place: 'SPUN', city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Merienda', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-04', place: 'VOLUME', city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Merienda', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-01', place: 'ANA LA FANTASTICA', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Desayuno', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-06', place: 'LA PARADA DEL AGUADOR', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Española', rating: 'like', service_type: 'dine-in' },
  { date: '2026-01-11', place: '100 MONTADITOS', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Tapitas', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-01-13', place: 'AMAZONIA CHIC', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-01-22', place: 'MANTRA INDIAN', city: 'MADRID', country: 'ESPAÑA', cuisine: 'India', rating: 'like', service_type: 'dine-in' },
  { date: '2026-04-01', place: 'H10 PRINCESS', city: 'LANZAROTE', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-04-02', place: 'H10 PRINCESS', city: 'LANZAROTE', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-04-03', place: 'H10 PRINCESS', city: 'LANZAROTE', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-04-03', place: 'BAR LUCAS', city: 'LA LINEA', country: 'ESPAÑA', cuisine: 'Española', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-04-08', place: 'EATMOJI BAR', city: 'MADRID', country: 'ESPAÑA', cuisine: 'China', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-04-07', place: 'PADTHAI', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Tailandesa', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-04-09', place: 'CÓMETE MEXICO', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Mexicana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-04-10', place: 'SUSHI DE', city: 'EL PUERTO', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-04-11', place: 'NARIGONI', city: 'EL PUERTO', country: 'ESPAÑA', cuisine: 'Merienda', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-04-11', place: 'EL PASCAITO', city: 'EL PUERTO', country: 'ESPAÑA', cuisine: 'Española', rating: 'like', service_type: 'dine-in' },
  { date: '2026-04-11', place: 'KFC', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Americana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-05', place: 'BICOS DE ANA', city: 'TORREJÓN', country: 'ESPAÑA', cuisine: 'Desayuno', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-08', place: 'CAFETERÍA MODELO', city: 'TORREJÓN', country: 'ESPAÑA', cuisine: 'Merienda', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-13', place: 'TRADICIONALRIUS CAFE', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Desayuno', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-14', place: 'HEALTHY POKE', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Mediterránea', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-18', place: 'ASADO', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Argentina', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-19', place: "TANO'S", city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Española', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-26', place: 'SAPORI DI TIRAMISU', city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Merienda', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-27', place: 'LA URAMAKERIA', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Japonesa', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-29', place: 'MOE SUSHI', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-31', place: 'EL MIRADOR CANARIO', city: 'PLAYA BLANCA', country: 'ESPAÑA', cuisine: 'Española', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-02-19', place: 'EL MERCATO ITALIANO', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Italiana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-24', place: 'LA CARNICERIA SAN JUSTO', city: 'SALAMANCA', country: 'ESPAÑA', cuisine: 'Tapitas', rating: 'dislike', service_type: 'dine-in' },
  { date: '2026-03-02', place: 'KINTARO', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Buffet', rating: 'like', service_type: 'dine-in' },
  { date: '2026-03-03', place: 'AROY THAI', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Japonesa', rating: 'like', service_type: 'dine-in' },
  { date: '2026-03-06', place: 'MAKITAKE', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Japonesa', rating: 'like', service_type: 'dine-in' },
  { date: '2026-03-07', place: 'PEZ LIMÓN', city: 'EL PUERTO', country: 'ESPAÑA', cuisine: 'Española', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-03-08', place: 'ALEVANTE', city: 'LA LINEA', country: 'ESPAÑA', cuisine: 'Española', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-02-06', place: 'DA CARMINE BISTROT', city: 'FLORENCIA', country: 'ITALIA', cuisine: 'Italiana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-06', place: 'OSTERIA DA FORTUNATA', city: 'BOLOGNA', country: 'ITALIA', cuisine: 'Italiana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-06', place: 'LA PROSCIUTERIA', city: 'BOLOGNA', country: 'ITALIA', cuisine: 'Italiana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-07', place: 'CA PELLETTI', city: 'BOLOGNA', country: 'ITALIA', cuisine: 'Italiana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-02-07', place: 'INDEGNO', city: 'BOLOGNA', country: 'ITALIA', cuisine: 'Italiana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-02-07', place: 'IL PORTICO DI SAN DONATO', city: 'BOLOGNA', country: 'ITALIA', cuisine: 'Italiana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-08', place: 'LE COQ', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Francesa', rating: 'dislike', service_type: 'dine-in' },
  { date: '2026-02-12', place: 'VICIO', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Americana', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-02-15', place: 'DULCE CANELA', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Merienda', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-15', place: 'LA TAQUERÍA MEX', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Mexicana', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-16', place: 'POSEIDON', city: 'FUENGIROLA', country: 'ESPAÑA', cuisine: 'Española', rating: 'neutral', service_type: 'dine-in' },
  { date: '2026-02-16', place: 'SANTA COFFEE', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Merienda', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-24', place: 'LUNA Y WANDA', city: 'MADRID', country: 'ESPAÑA', cuisine: 'Desayuno', rating: 'like', service_type: 'dine-in' },
  { date: '2026-02-16', place: 'HYPE', city: 'MALAGA', country: 'ESPAÑA', cuisine: 'Otra', rating: 'like', service_type: 'dine-in' },
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
