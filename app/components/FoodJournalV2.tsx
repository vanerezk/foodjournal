"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";



type Rating = "like" | "neutral" | "dislike";

type Entry = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  place: string;
  city?: string;
  country: string;
  cuisine: string;
  rating?: Rating;
  serviceType?: "dine-in" | "delivery"; // nuevo: tipo de servicio
  notes?: string;
  maps_url?: string;
  photos?: string[];
};


type DbEntry = {
  id: string;
  date: string;
  place: string;
  city: string | null;
  country: string;
  cuisine: string;
  service_type: string | null;
  notes: string | null;
  rating: string | null;
  maps_url: string | null;
  photos: string[] | null;
};
const DEFAULT_CUISINES = ["Americana", "Argentina", "Buffet", "China", "Colombiana", "Coreana", "Desayuno", "Española", "Francesa", "Griega", "India", "Italiana", "Japonesa", "Libanesa", "Mediterránea", "Merienda", "Mexicana", "Otra", "Peruana", "Tailandesa", "Tapitas", "Turca", "Vegetariana"];
const COLORS = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#b07aa1", "#ff9da7", "#9c755f"];

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// CSV helpers removed (export/import removed from UI)

export function PieChart({ data, size = 180 }: { data: { label: string; value: number }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.min(cx, cy) - 2;

  // Aggregate tiny slices into 'Otros' for clarity
  const threshold = 0.05; // 5%
  const sorted = data.slice().sort((a, b) => b.value - a.value);
  const large: { label: string; value: number }[] = [];
  let otherTotal = 0;
  for (const d of sorted) {
    if (total > 0 && d.value / total < threshold && large.length >= 5) {
      otherTotal += d.value;
    } else {
      large.push(d);
    }
  }
  if (otherTotal > 0) large.push({ label: 'Otros', value: otherTotal });

  let startAngle = 0;

  const slices = large.map((d, i) => {
    const value = d.value;
    const angle = total === 0 ? 0 : (value / total) * 360;
    const endAngle = startAngle + angle;

    const startRad = (Math.PI / 180) * (startAngle - 90);
    const endRad = (Math.PI / 180) * (endAngle - 90);

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    startAngle += angle;

    return { path, color: COLORS[i % COLORS.length], label: d.label, value: d.value, percent: total === 0 ? 0 : Math.round((d.value / total) * 100) };
  });

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ flex: "0 0 auto", width: size, maxWidth: "100%" }}>
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={0.5} />
          ))}
          {total === 0 && <circle cx={cx} cy={cy} r={r} fill="#f5f5f5" stroke="#ddd" />}
        </svg>
      </div>
      <div style={{ minWidth: 120 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 12, height: 12, background: s.color, display: "inline-block", borderRadius: 3 }} />
            <small style={{ color: "#222" }}>{s.label} — <strong>{s.value}</strong> <span style={{ color: '#666' }}>({s.percent}%)</span></small>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple vertical bar chart (SVG)
function BarChart({ data, width = 360, height = 160 }: { data: { label: string; value: number }[]; width?: number; height?: number }) {
  const sorted = data.slice().sort((a, b) => b.value - a.value);
  const max = Math.max(1, ...sorted.map((d) => d.value));
  const w = width;
  const h = height;
  const pad = 40;
  const innerW = w - pad * 2;
  const innerH = h - 60;
  const barWidth = Math.max(6, Math.floor(innerW / Math.max(1, sorted.length)) - 6);

  return (
    <div style={{ width: '100%', maxWidth: w, overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
        {sorted.map((d, i) => {
          const x = pad + i * (barWidth + 6);
          const barH = Math.round((d.value / max) * innerH);
          const y = h - pad - barH;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barWidth} height={barH} fill="#4e79a7" rx={4} />
              <g transform={`translate(${x + barWidth / 2}, ${h - pad + 8}) rotate(45)`}>
                <text x={0} y={0} fontSize={9} textAnchor="start" fill="#333">{d.label.length > 12 ? d.label.slice(0, 12) + '…' : d.label}</text>
              </g>
              <text x={x + barWidth / 2} y={y - 4} fontSize={11} textAnchor="middle" fill="#222">{d.value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Simple line chart for time series
function LineChart({ data, width = 1250, height = 160 }: { data: { label: string; value: number }[]; width?: number; height?: number }) {
  const w = width;
  const h = height;
  const pad = 30;
  const innerW = w - pad * 2;
  const innerH = h - pad - 20;
  const max = Math.max(1, ...data.map((d) => d.value));

  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * innerW;
    const y = pad + (1 - d.value / max) * innerH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ width: '100%', maxWidth: w }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
        <polyline points={points} fill="none" stroke="#f28e2b" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => {
          const x = pad + (i / Math.max(1, data.length - 1)) * innerW;
          const y = pad + (1 - d.value / max) * innerH;
          return <circle key={i} cx={x} cy={y} r={3.5} fill="#f28e2b" />;
        })}
        {data.map((d, i) => {
          const x = pad + (i / Math.max(1, data.length - 1)) * innerW;
          const y = h - 6;
          return <text key={i} x={x} y={y} fontSize={10} textAnchor="middle" fill="#333">{d.label}</text>;
        })}
      </svg>
    </div>
  );
}

export default function FoodJournalV2() {
  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const raw = localStorage.getItem("food-journal-v2");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Form state
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [place, setPlace] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [cuisine, setCuisine] = useState(DEFAULT_CUISINES[0]);
  const [serviceType, setServiceType] = useState<"dine-in" | "delivery">("dine-in");
  const [notes, setNotes] = useState("");
  const [customCuisine, setCustomCuisine] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // UI state: filters/search
  const [search, setSearch] = useState("");
  const [filterCuisine, setFilterCuisine] = useState("Todas");
  const [filterCountry, setFilterCountry] = useState("Todas");
  const [filterRating, setFilterRating] = useState("Todas");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState<"history" | "stats">("history");
  const [showAllCuisines, setShowAllCuisines] = useState(false);

  // New: debounced search and cuisine filter
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [cuisineSearch, setCuisineSearch] = useState("");

  // New: undo state for clear all
  const [lastDeletedEntries, setLastDeletedEntries] = useState<Entry[] | null>(null);
  const [undoTimerId, setUndoTimerId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drag and drop
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Virtualization (load react-window lazily on client)
  const [ListComponent, setListComponent] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const RW = await import('react-window');
        type RWModule = { FixedSizeList?: React.ComponentType<Record<string, unknown>> };
        const RWm = RW as RWModule;
        if (mounted && RWm && RWm.FixedSizeList) {
          setListComponent(() => RWm.FixedSizeList as React.ComponentType<Record<string, unknown>>);
        }
      } catch {
        // ignore - we'll fallback to non-virtualized list
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Sync with Supabase on mount
    let mounted = true;
    (async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        if (data && mounted) {
          const mapped: Entry[] = data.map((e: DbEntry) => {
            const rating: Rating | undefined =
              e.rating === 'like' || e.rating === 'neutral' || e.rating === 'dislike'
                ? e.rating
                : undefined;

            const serviceType: Entry['serviceType'] =
              e.service_type === 'dine-in' || e.service_type === 'delivery'
                ? e.service_type
                : undefined;

            return {
              id: e.id,
              date: e.date,
              place: e.place,
              city: e.city || undefined,
              country: e.country,
              cuisine: e.cuisine,
              serviceType,
              notes: e.notes || undefined,
              rating,
              maps_url: e.maps_url || undefined,
              photos: e.photos || []
            };
          });
          
          setEntries(mapped);
          // Also update localStorage as backup
          try {
            localStorage.setItem('food-journal-v2', JSON.stringify(mapped));
          } catch {}
        }
      } catch (err) {
        console.warn('Could not load from Supabase, using localStorage:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Load persisted active tab
    try {
      const t = localStorage.getItem("food-journal-active-tab");
      if (t === 'history' || t === 'stats') setActiveTab(t);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("food-journal-v2", JSON.stringify(entries));
    } catch {}
  }, [entries]);

  // Persist active tab
  useEffect(() => {
    try { localStorage.setItem("food-journal-active-tab", activeTab); } catch {}
  }, [activeTab]);

  // Debounce search input
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(id);
  }, [search]);

  const resetForm = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setPlace("");
    setCity("");
    setCountry("");
    setCuisine(DEFAULT_CUISINES[0]);
    setServiceType("dine-in");
    setNotes("");
    setCustomCuisine("");
    setEditingId(null);
  };

  const addOrUpdate = async () => {
    const actualCuisine = cuisine === "Otra" ? (customCuisine.trim() || "Otra") : cuisine;
    if (!place.trim() || !country.trim() || !date) return;

    if (editingId) {
      const updated: Entry = { id: editingId, date, place: place.trim(), city: city.trim() || undefined, country: country.trim(), cuisine: actualCuisine, serviceType, notes: notes.trim(), rating: entries.find(e => e.id === editingId)?.rating || "neutral" };
      setEntries((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      setEditingId(null);
      
      // Sync with Supabase
      if (supabase) {
        try {
          await supabase.from('entries').update({
            date: updated.date,
            place: updated.place,
            city: updated.city,
            country: updated.country,
            cuisine: updated.cuisine,
            service_type: updated.serviceType,
            notes: updated.notes,
            rating: updated.rating,
            maps_url: updated.maps_url,
            photos: updated.photos || []
          }).eq('id', updated.id);
        } catch (err) { console.warn('Could not update in Supabase', err); }
      }
    } else {
      const newEntry: Entry = { id: uid(), date, place: place.trim(), city: city.trim() || undefined, country: country.trim(), cuisine: actualCuisine, serviceType, notes: notes.trim(), rating: "neutral", maps_url: undefined, photos: [] };
      setEntries((prev) => [newEntry, ...prev]);
      
      // Sync with Supabase
      if (supabase) {
        try {
          console.log('Supabase inserting:', { id: newEntry.id, place: newEntry.place });
          const { data, error } = await supabase.from('entries').upsert({
            id: newEntry.id,
            date: newEntry.date,
            place: newEntry.place,
            city: newEntry.city || null,
            country: newEntry.country,
            cuisine: newEntry.cuisine,
            service_type: newEntry.serviceType || null,
            notes: newEntry.notes || null,
            rating: newEntry.rating,
            maps_url: newEntry.maps_url || null,
            photos: newEntry.photos || []
          });
          if (error) {
            console.error('Supabase insert error:', error);
          } else {
            console.log('Supabase insert success');
          }
        } catch (err) { console.error('Could not insert into Supabase', err); }
      } else {
        console.warn('Supabase is null, using localStorage only');
      }
    }

    resetForm();
  };

  const edit = (id: string) => {
    const e = entries.find((x) => x.id === id);
    if (!e) return;
    setEditingId(id);
    setDate(e.date);
    setPlace(e.place);
    setCity(e.city || "");
    setCountry(e.country);
    setServiceType(e.serviceType || "dine-in");
    if (!DEFAULT_CUISINES.includes(e.cuisine)) {
      setCuisine("Otra");
      setCustomCuisine(e.cuisine);
    } else setCuisine(e.cuisine);
    setNotes(e.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: string) => {
    setEntries((prev) => prev.filter((x) => x.id !== id));
    
    // Sync with Supabase
    if (supabase) {
      try {
        await supabase.from('entries').delete().eq('id', id);
      } catch (err) { console.warn('Could not delete from Supabase', err); }
    }
  };

  const clearAll = () => {
    if (entries.length === 0) return;
    if (!confirm("¿Borrar todas las entradas? Esta acción no se puede deshacer.")) return;
    // Save for undo
    setLastDeletedEntries(entries.slice());
    setEntries([]);

    setToastMessage("Entradas borradas");
    const id = window.setTimeout(() => {
      setLastDeletedEntries(null);
      setToastMessage(null);
      setUndoTimerId(null);
    }, 5000);
    setUndoTimerId(id);
  };

  const undoClear = () => {
    if (!lastDeletedEntries) return;
    if (undoTimerId) {
      clearTimeout(undoTimerId);
      setUndoTimerId(null);
    }
    setEntries(lastDeletedEntries);
    setLastDeletedEntries(null);
    setToastMessage(null);
  };

  const setRating = async (id: string, rating: Rating) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, rating } : e));
    
    // Sync with Supabase
    if (supabase) {
      try {
        await supabase.from('entries').update({ rating }).eq('id', id);
      } catch (err) { console.warn('Could not update rating in Supabase', err); }
    }
  };

  // Export/Import handlers removed from UI to simplify experience (kept intentionally out).  

  // Sincronización con backend

  // Reorder helpers
  const reorderById = (draggedId: string, targetId: string) => {
    const fromIndex = entries.findIndex((e) => e.id === draggedId);
    const toIndex = entries.findIndex((e) => e.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const copy = entries.slice();
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    setEntries(copy);
  };

  const moveUp = (id: string) => {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx <= 0) return;
    const copy = entries.slice();
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    setEntries(copy);
  };
  const moveDown = (id: string) => {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1 || idx >= entries.length - 1) return;
    const copy = entries.slice();
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    setEntries(copy);
  };

  // Filters
  const countries = useMemo(() => Array.from(new Set(entries.map((e) => e.country))).sort(), [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (debouncedSearch && !`${e.place} ${e.city || ""} ${e.country} ${e.cuisine} ${e.notes}`.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (filterCuisine !== "Todas" && e.cuisine !== filterCuisine) return false;
      if (filterCountry !== "Todas" && e.country !== filterCountry) return false;
      if (filterRating !== "Todas" && e.rating !== (filterRating as Rating)) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [entries, debouncedSearch, filterCuisine, filterCountry, filterRating, dateFrom, dateTo]);

  const cuisineCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filteredEntries) {
      map.set(e.cuisine, (map.get(e.cuisine) || 0) + 1);
    }
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredEntries]);

  const countryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filteredEntries) map.set(e.country, (map.get(e.country) || 0) + 1);
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredEntries]);

  const cityCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filteredEntries) map.set(e.city || e.place, (map.get(e.city || e.place) || 0) + 1);
    return Array.from(map.entries()).slice(0, 20).map(([label, value]) => ({ label, value }));
  }, [filteredEntries]);

  const ratingCounts = useMemo(() => {
    const map = new Map<Rating, number>([["like", 0], ["neutral", 0], ["dislike", 0]]);
    for (const e of filteredEntries) map.set((e.rating as Rating) || "neutral", (map.get((e.rating as Rating) || "neutral") || 0) + 1);
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredEntries]);

  const serviceTypeCounts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("Comer aquí", 0);
    map.set("Delivery", 0);
    for (const e of filteredEntries) {
      const label = e.serviceType === "delivery" ? "Delivery" : "Comer aquí";
      map.set(label, (map.get(label) || 0) + 1);
    }
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredEntries]);

  // Monthly time series (entries per month) based on filtered entries
  const monthlyCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filteredEntries) {
      const d = new Date(e.date + "T00:00:00");
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + 1);
    }

    // Build last 12 months series (fill zeros)
    const now = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = new Intl.DateTimeFormat("es-ES", { month: "short", year: "numeric" }).format(d);
      months.push({ key, label });
    }

    return months.map((m) => ({ label: m.label, value: map.get(m.key) || 0 }));
  }, [filteredEntries]);

  const topLikedPlaces = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) if (e.rating === "like") map.set(e.place, (map.get(e.place) || 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [entries]);
  const topDislikedPlaces = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) if (e.rating === "dislike") map.set(e.place, (map.get(e.place) || 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [entries]);

  // Row renderer for virtualized list (keeps JSX simpler to avoid parse issues)
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const e = filteredEntries[index];
    return (
      <div key={e.id} style={{ ...style, padding: 8, background: dragOverId === e.id ? '#f7fbff' : 'transparent', display: 'flex', gap: 12, alignItems: 'center' }} className="history-item" draggable
        onDragStart={(ev) => { if (ev.dataTransfer) { ev.dataTransfer.setData('text/plain', e.id); ev.dataTransfer.effectAllowed = 'move'; } }}
        onDragOver={(ev) => { ev.preventDefault(); setDragOverId(e.id); }}
        onDrop={(ev) => { ev.preventDefault(); const draggedId = ev.dataTransfer && ev.dataTransfer.getData('text/plain'); if (draggedId) reorderById(draggedId, e.id); setDragOverId(null); }}>
        <div style={{ cursor: 'grab', padding: 6, borderRadius: 4, background: '#f5f5f5' }}>≡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div>{e.place}</div>
            {e.city && (
              <button type="button" aria-label={"Filtrar por ciudad " + e.city} className="badge bg-secondary" style={{ fontSize: '0.75rem', border: 'none', cursor: 'pointer' }} onClick={() => { setSearch(e.city || ''); setFilterCountry('Todas'); setFilterRating('Todas'); setActiveTab('history'); }}>{e.city}</button>
            )}
            <small style={{ color: '#555', marginLeft: 6 }}>{e.country}</small>
            {e.rating && (
              <button type="button" aria-label={"Filtrar por valoración " + e.rating} className={"badge " + (e.rating === 'like' ? 'bg-success' : e.rating === 'dislike' ? 'bg-danger' : 'bg-secondary')} style={{ marginLeft: 8, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }} onClick={() => { setFilterRating(e.rating as Rating); setActiveTab('history'); }}>{e.rating === 'like' ? 'Me gusta' : e.rating === 'neutral' ? 'Neutral' : 'No me gusta'}</button>
            )}
          </div>
          <div style={{ color: '#444' }}>{formatDate(e.date)} — {e.cuisine}</div>
          {e.notes && <div style={{ color: '#666', marginTop: 6 }}>{e.notes}</div>}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setRating(e.id, 'like')} className={'btn btn-sm ' + (e.rating === 'like' ? 'btn-success' : 'btn-outline-success')}>👍</button>
            <button onClick={() => setRating(e.id, 'neutral')} className={'btn btn-sm ' + (e.rating === 'neutral' ? 'btn-secondary' : 'btn-outline-secondary')}>😐</button>
            <button onClick={() => setRating(e.id, 'dislike')} className={'btn btn-sm ' + (e.rating === 'dislike' ? 'btn-danger' : 'btn-outline-danger')}>👎</button>
          </div>
          <button onClick={() => moveUp(e.id)} aria-label="Subir" title="Subir" className="btn btn-sm btn-outline-secondary">↑</button>
          <button onClick={() => moveDown(e.id)} aria-label="Bajar" title="Bajar" className="btn btn-sm btn-outline-secondary">↓</button>
          <button onClick={() => edit(e.id)} className="btn btn-sm btn-outline-primary">Editar</button>
          <button onClick={() => remove(e.id)} className="btn btn-sm btn-danger">Eliminar</button>
        </div>
      </div>
    );
  };

  return (
    <div className="card-like">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Food Journal 2026</h2>
        <Link href="/" className="btn btn-outline-secondary btn-sm">← Volver al home</Link>
      </div>

      <div className="entry-form-grid">
        <div className="form-field-date">
          <label style={{ display: "block", marginBottom: 6 }}>Fecha</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: 8, boxSizing: "border-box" }} />
        </div>
        <div className="form-field-place">
          <label style={{ display: "block", marginBottom: 6 }}>Lugar</label>
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Nombre del lugar" style={{ width: "100%", padding: 8 }} />
        </div>
        <div className="form-field-city">
          <label style={{ display: "block", marginBottom: 6 }}>Ciudad (opcional)</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" style={{ width: "100%", padding: 8 }} />
        </div>
        <div className="form-field-country">
          <label style={{ display: "block", marginBottom: 6 }}>País</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="País" style={{ width: "100%", padding: 8 }} />
        </div>

        <div className="form-field-cuisine">
          <label style={{ display: "block", marginBottom: 6 }}>Tipo de comida</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} style={{ flex: '1 1 200px', padding: 8 }}>
              {(showAllCuisines ? DEFAULT_CUISINES : DEFAULT_CUISINES.slice(0, 8)).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAllCuisines(s => !s)} style={{ whiteSpace: 'nowrap' }}>{showAllCuisines ? 'Ver menos' : 'Más...'}</button>
          </div>
        </div>
        {cuisine === "Otra" && (
          <div className="form-field-custom-cuisine">
            <label style={{ display: "block", marginBottom: 6 }}>Especificar tipo</label>
            <input value={customCuisine} onChange={(e) => setCustomCuisine(e.target.value)} placeholder="Ej: Peruana" style={{ width: "100%", padding: 8 }} />
          </div>
        )}

        <div className="form-field-service">
          <label style={{ display: "block", marginBottom: 6 }}>Tipo de servicio</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setServiceType("dine-in")} className={`btn ${serviceType === "dine-in" ? "btn-primary" : "btn-outline-primary"}`} style={{ flex: '1 1 140px' }}>🍽️ Dine-In</button>
            <button type="button" onClick={() => setServiceType("delivery")} className={`btn ${serviceType === "delivery" ? "btn-primary" : "btn-outline-primary"}`} style={{ flex: '1 1 140px' }}>🚗 Delivery</button>
          </div>
        </div>

        <div className="form-field-notes">
          <label style={{ display: "block", marginBottom: 6 }}>Notas (opcional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Comentario breve" rows={3} style={{ width: "100%", padding: 8 }} />
        </div>

        <div className="form-field-actions">
          <button onClick={addOrUpdate} className="btn btn-primary btn-sm">{editingId ? "Guardar" : "Añadir"}</button>
          <button onClick={resetForm} className="btn btn-secondary btn-sm">Limpiar</button>










          <button onClick={clearAll} style={{ marginLeft: "auto" }} className="btn btn-danger btn-sm">Borrar todo</button>
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div>
        <ul className="nav nav-tabs" style={{ marginBottom: 12 }} role="tablist">
          <li className="nav-item">
            <button role="tab" aria-selected={activeTab === 'history'} aria-controls="panel-history" id="tab-history" className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Historial</button>
          </li>
          <li className="nav-item">
            <button role="tab" aria-selected={activeTab === 'stats'} aria-controls="panel-stats" id="tab-stats" className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Estadísticas</button>
          </li>
        </ul>

        {activeTab === 'stats' && (
          <div id="panel-stats" role="tabpanel" aria-labelledby="tab-stats" className="card-like" style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Estadísticas</h3>

            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              <div className="stats-filters" style={{ display: "flex", gap: 8 }}>
                <input className="flex-input" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, padding: 8 }} aria-label="Buscar entradas" />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select value={filterCuisine} onChange={(e) => setFilterCuisine(e.target.value)} style={{ padding: 8 }} aria-label="Filtrar por tipo de comida">
                    <option>Todas</option>
                    {Array.from(new Set(["Todas", ...DEFAULT_CUISINES, ...entries.map((x) => x.cuisine)])).filter(c => !c || c.toLowerCase().includes(cuisineSearch.toLowerCase())).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  {showAllCuisines && (
                    <input placeholder="Filtrar comidas..." value={cuisineSearch} onChange={(e) => setCuisineSearch(e.target.value)} style={{ padding: 8 }} aria-label="Filtrar lista de comidas" />
                  )}
                </div>
              </div>

              <div className="stats-controls" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: 'wrap' }}>
                <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} style={{ padding: 8, minWidth: 120, flex: '1 1 auto' }}>
                  <option>Todas</option>
                  {countries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} style={{ padding: 8, minWidth: 120, flex: '1 1 auto' }}>
                  <option>Todas</option>
                  <option value="like">👍 Me gusta</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="dislike">👎 No me gusta</option>
                </select>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: 8, minWidth: 120, flex: '1 1 auto' }} />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: 8, minWidth: 120, flex: '1 1 auto' }} />
                <button onClick={() => { setSearch(""); setFilterCuisine("Todas"); setFilterCountry("Todas"); setFilterRating("Todas"); setDateFrom(""); setDateTo(""); }} style={{ padding: 8, flex: '0 0 auto' }}>Limpiar filtros</button>
              </div>

              <p style={{ marginTop: 4 }}>{filteredEntries.length} registro(s) visibles</p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 160 }}>
                  <h5 style={{ marginTop: 0 }}>Por tipo</h5>
                  <PieChart data={cuisineCounts} />
                </div>
                <div style={{ minWidth: 160 }}>
                  <h5 style={{ marginTop: 0 }}>Por país</h5>
                  <PieChart data={countryCounts} />
                </div>
                <div style={{ minWidth: 160 }}>
                  <h5 style={{ marginTop: 0 }}>Por ciudad</h5>
                  <PieChart data={cityCounts} />
                </div>
                <div style={{ minWidth: 160 }}>
                  <h5 style={{ marginTop: 0 }}>Por servicio</h5>
                  <PieChart data={serviceTypeCounts} />
                </div>
              </div>

              {/* New charts: time series and city bars */}
              <div style={{ marginTop: 14 }}>
                <div style={{ marginBottom: 18 }}>
                  <h5 style={{ marginTop: 0 }}>Entradas por mes</h5>
                  <LineChart data={monthlyCounts} />

                  {/* Mobile: show numeric monthly counts under the chart */}
                  <div className="mobile-month-numbers" style={{ marginTop: 8 }}>
                    {monthlyCounts.map((m) => (
                      <div key={m.label} style={{ display: 'inline-block', marginRight: 10, fontSize: 12 }}>
                        <strong>{m.value}</strong> <span style={{ color: '#666' }}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 320, flex: 1 }}>
                    <h5 style={{ marginTop: 0 }}>Top ciudades (por visitas)</h5>
                    <BarChart data={cityCounts.slice(0, 12)} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <h5 style={{ marginTop: 0 }}>Valoraciones</h5>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button aria-label="Filtrar Me gusta" onClick={() => { setFilterRating('like'); setActiveTab('history'); }} className="btn btn-sm btn-outline-success">👍 {ratingCounts.find(r => r.label === 'like')?.value || 0}</button>
                  <button aria-label="Filtrar Neutral" onClick={() => { setFilterRating('neutral'); setActiveTab('history'); }} className="btn btn-sm btn-outline-secondary">😐 {ratingCounts.find(r => r.label === 'neutral')?.value || 0}</button>
                  <button aria-label="Filtrar No me gusta" onClick={() => { setFilterRating('dislike'); setActiveTab('history'); }} className="btn btn-sm btn-outline-danger">👎 {ratingCounts.find(r => r.label === 'dislike')?.value || 0}</button>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <h5 style={{ marginTop: 0 }}>Top lugares (me gustó)</h5>
                <ol style={{ paddingLeft: 18 }}>
                  {topLikedPlaces.length === 0 && <li style={{ color: "#777" }}>No hay calificaciones &quot;Me gusta&quot; aún.</li>}
                  {topLikedPlaces.map(([place, count]) => <li key={place}>{place} — {count}</li>)}
                </ol>

                <h5 style={{ marginTop: 6 }}>Top lugares (peor)</h5>
                <ol style={{ paddingLeft: 18 }}>
                  {topDislikedPlaces.length === 0 && <li style={{ color: "#777" }}>No hay calificaciones &quot;No me gusta&quot; aún.</li>}
                  {topDislikedPlaces.map(([place, count]) => <li key={place}>{place} — {count}</li>)}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* History panel simplified temporarily to isolate parse issue */}
        {activeTab === 'history' && (
          <div id="panel-history" role="tabpanel" aria-labelledby="tab-history">
            <h3 style={{ marginTop: 0 }}>Historial (temporal)</h3>
            <div className="history-list card-like" style={{ padding: 8 }}>
              {filteredEntries.length === 0 && <p style={{ margin: 8, color: "#777" }}>No hay entradas que coincidan.</p>}
              {ListComponent ? (
                <div>
                  <ListComponent
                    height={Math.min(480, Math.max(140, filteredEntries.length * 96))}
                    itemCount={filteredEntries.length}
                    itemSize={96}
                    width={'100%'}
                  >
                    {Row}
                  </ListComponent>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {filteredEntries.map((e) => (
                    <li key={e.id} className="history-item" draggable
                      onDragStart={(ev) => { if (ev.dataTransfer) { ev.dataTransfer.setData('text/plain', e.id); ev.dataTransfer.effectAllowed = 'move'; } }}
                      onDragOver={(ev) => { ev.preventDefault(); setDragOverId(e.id); }}
                      onDrop={(ev) => { ev.preventDefault(); const draggedId = ev.dataTransfer && ev.dataTransfer.getData('text/plain'); if (draggedId) reorderById(draggedId, e.id); setDragOverId(null); }}
                      style={{ background: dragOverId === e.id ? '#f7fbff' : 'transparent' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ cursor: 'grab', padding: 6, borderRadius: 4, background: '#f5f5f5' }}>≡</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Link href={`/entry/${e.id}`} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer', fontWeight: 600 }}>{e.place}</Link>
                            {e.city && (
                              <button type="button" aria-label={"Filtrar por ciudad " + e.city} className="badge bg-secondary" style={{ fontSize: '0.75rem', border: 'none', cursor: 'pointer' }} onClick={() => { setSearch(e.city || ''); setFilterCountry('Todas'); setFilterRating('Todas'); setActiveTab('history'); }}>{e.city}</button>
                            )}
                            <small style={{ color: '#555', marginLeft: 6 }}>{e.country}</small>
                            {e.rating && (
                              <button type="button" aria-label={"Filtrar por valoración " + e.rating} className={"badge " + (e.rating === 'like' ? 'bg-success' : e.rating === 'dislike' ? 'bg-danger' : 'bg-secondary')} style={{ marginLeft: 8, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }} onClick={() => { setFilterRating(e.rating as Rating); setActiveTab('history'); }}>{e.rating === 'like' ? 'Me gusta' : e.rating === 'neutral' ? 'Neutral' : 'No me gusta'}</button>
                            )}
                          </div>
                          <div style={{ color: '#444' }}>{formatDate(e.date)} — {e.cuisine}</div>
                          {e.notes && <div style={{ color: '#666', marginTop: 6 }}>{e.notes}</div>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setRating(e.id, 'like')} className={'btn btn-sm ' + (e.rating === 'like' ? 'btn-success' : 'btn-outline-success')}>👍</button>
                          <button onClick={() => setRating(e.id, 'neutral')} className={'btn btn-sm ' + (e.rating === 'neutral' ? 'btn-secondary' : 'btn-outline-secondary')}>😐</button>
                          <button onClick={() => setRating(e.id, 'dislike')} className={'btn btn-sm ' + (e.rating === 'dislike' ? 'btn-danger' : 'btn-outline-danger')}>👎</button>
                        </div>
                        <button onClick={() => moveUp(e.id)} aria-label="Subir" title="Subir" className="btn btn-sm btn-outline-secondary">↑</button>
                        <button onClick={() => moveDown(e.id)} aria-label="Bajar" title="Bajar" className="btn btn-sm btn-outline-secondary">↓</button>
                        <button onClick={() => edit(e.id)} className="btn btn-sm btn-outline-primary">Editar</button>
                        <button onClick={() => remove(e.id)} className="btn btn-sm btn-danger">Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast / undo */}
      {toastMessage && (
        <div className="fj-toast" role="status" aria-live="polite">
          <span style={{ marginRight: 12 }}>{toastMessage}</span>
          <button className="btn btn-sm btn-link" onClick={undoClear} aria-label="Deshacer borrado">Deshacer</button>
        </div>
      )}

    </div>
  );
}
