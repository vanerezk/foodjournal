"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

// Simple beer entry type
type BeerEntry = {
  id: string;
  name: string;
  place: string;
  style: string;
  liked: boolean;
  notes?: string;
  created_at?: string;
};

const uid = () => crypto.randomUUID();

export default function BeerJournalPage() {
  const [entries, setEntries] = useState<BeerEntry[]>([]);
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [style, setStyle] = useState("");
  const [liked, setLiked] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase.from("beer_entries").select("*").order("created_at", { ascending: false });
          if (!error && data && mounted) {
            setEntries(data as BeerEntry[]);
            localStorage.setItem("beer-journal", JSON.stringify(data));
            setLoading(false);
            return;
          }
        }
        // fallback localStorage
        const raw = localStorage.getItem("beer-journal");
        if (raw && mounted) setEntries(JSON.parse(raw));
      } catch (e) {
        console.warn("Could not load beer entries", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const addEntry = async () => {
    if (!name.trim() || !place.trim() || !style.trim() || liked === null) return;
    const entry: BeerEntry = { id: uid(), name: name.trim(), place: place.trim(), style: style.trim(), liked, notes: notes.trim() || undefined };
    setEntries((prev) => [entry, ...prev]);
    setName(""); setPlace(""); setStyle(""); setLiked(null); setNotes("");

    // sync supabase
    if (supabase) {
      const { error } = await supabase.from("beer_entries").upsert({
        id: entry.id,
        name: entry.name,
        place: entry.place,
        style: entry.style,
        liked: entry.liked,
        notes: entry.notes || null
      });
      if (error) console.warn("Supabase beer insert error", error);
    }
    // local backup
    try { localStorage.setItem("beer-journal", JSON.stringify([entry, ...entries])); } catch {}
  };

  const toggleLike = async (id: string) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, liked: !e.liked } : e));
    const current = entries.find((e) => e.id === id);
    const newLiked = current ? !current.liked : true;
    if (supabase) {
      const { error } = await supabase.from("beer_entries").update({ liked: newLiked }).eq("id", id);
      if (error) console.warn("Supabase beer update error", error);
    }
    try { localStorage.setItem("beer-journal", JSON.stringify(entries.map((e) => e.id === id ? { ...e, liked: newLiked } : e))); } catch {}
  };

  return (
    <div className="container-main" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Beer Journal</h1>
        <Link href="/" className="btn btn-outline-secondary btn-sm">← Volver al home</Link>
      </div>
      <p style={{ color: '#666', marginTop: 8 }}>Registra cervezas probadas: nombre, lugar, estilo y si te gustó.</p>

      <div className="card-like" style={{ marginTop: 16 }}>
        <div className="entry-form-grid">
          <div className="form-field-place">
            <label style={{ display: "block", marginBottom: 6 }}>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la cerveza" style={{ width: "100%", padding: 8 }} />
          </div>
          <div className="form-field-city">
            <label style={{ display: "block", marginBottom: 6 }}>Dónde la tomaste</label>
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Bar / Ciudad" style={{ width: "100%", padding: 8 }} />
          </div>
          <div className="form-field-country">
            <label style={{ display: "block", marginBottom: 6 }}>Estilo / Tipo</label>
            <input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="IPA, Lager, Stout..." style={{ width: "100%", padding: 8 }} />
          </div>
          <div className="form-field-service">
            <label style={{ display: "block", marginBottom: 6 }}>¿Te gustó?</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setLiked(true)} className={`btn ${liked === true ? "btn-success" : "btn-outline-success"}`} style={{ flex: '1 1 140px' }}>👍 Sí</button>
              <button type="button" onClick={() => setLiked(false)} className={`btn ${liked === false ? "btn-danger" : "btn-outline-danger"}`} style={{ flex: '1 1 140px' }}>👎 No</button>
            </div>
          </div>
          <div className="form-field-notes">
            <label style={{ display: "block", marginBottom: 6 }}>Notas (opcional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Aroma, sabor, amargor..." rows={2} style={{ width: "100%", padding: 8 }} />
          </div>
          <div className="form-field-actions">
            <button onClick={addEntry} className="btn btn-primary btn-sm">Añadir</button>
          </div>
        </div>
      </div>

      <div className="card-like" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Historial</h3>
        {loading && <p>Cargando...</p>}
        {!loading && entries.length === 0 && <p style={{ color: '#777' }}>Sin registros aún.</p>}
        <div style={{ display: 'grid', gap: 10 }}>
          {entries.map((e) => (
            <div key={e.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{e.name}</div>
                <div style={{ color: '#666', fontSize: 14 }}>{e.place} · {e.style}</div>
                {e.notes && <div style={{ color: '#555', fontSize: 13, marginTop: 4 }}>{e.notes}</div>}
              </div>
              <button onClick={() => toggleLike(e.id)} className={`btn btn-sm ${e.liked ? 'btn-success' : 'btn-outline-secondary'}`}>
                {e.liked ? '👍 Me gustó' : '👎 No me gustó'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
