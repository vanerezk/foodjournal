"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Entry = {
  id: string;
  date: string;
  place: string;
  city?: string;
  country: string;
  cuisine: string;
  serviceType?: string;
  notes?: string;
  rating?: string;
  maps_url?: string;
  photos?: string[];
};

export default function EntryClient({ id }: { id: string }) {
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mapsUrl, setMapsUrl] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ date: '', place: '', city: '', country: '', cuisine: '', serviceType: 'dine-in', notes: '' });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    try {
      const raw = localStorage.getItem('food-journal-v2');
      if (raw) {
        const arr = JSON.parse(raw) as any[];
        const found = arr.find((x) => x.id === id);
        if (found && mounted) {
          setEntry(found);
          setMapsUrl(found.maps_url || '');
          setEditData({
            date: found.date,
            place: found.place,
            city: found.city || '',
            country: found.country,
            cuisine: found.cuisine,
            serviceType: found.serviceType || 'dine-in',
            notes: found.notes || ''
          });
        }
      }
    } catch (err) {
      console.error('Error loading entry from localStorage', err);
    } finally {
      if (mounted) setLoading(false);
    }

    return () => { mounted = false; };
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const uploadPhotos = async () => {
    if (!files || files.length === 0) return;
    if (!entry) return;
    
    setUploading(true);
    const uploadedUrls: string[] = [];
    try {
      // Simple approach: convert images to base64 and store in localStorage
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          uploadedUrls.push(base64);
          
          if (uploadedUrls.length === files.length) {
            // All files processed, update entry
            const newPhotos = [...(entry.photos || []), ...uploadedUrls];
            const updated = { ...entry, photos: newPhotos };
            setEntry(updated);
            
            // Update localStorage
            try {
              const raw = localStorage.getItem('food-journal-v2');
              if (raw) {
                const arr = JSON.parse(raw) as any[];
                const ix = arr.findIndex((x) => x.id === entry.id);
                if (ix !== -1) {
                  arr[ix].photos = newPhotos;
                  localStorage.setItem('food-journal-v2', JSON.stringify(arr));
                }
              }
            } catch {}
            setFiles(null);
            setUploading(false);
          }
        };
        reader.readAsDataURL(f);
      }
    } catch (err) {
      console.error(err);
      alert('Error subiendo fotos');
      setUploading(false);
    }
  };

  const saveMapsUrl = () => {
    if (!entry) return;
    try {
      const updated = { ...entry, maps_url: mapsUrl };
      setEntry(updated);
      
      // Update localStorage
      try {
        const raw = localStorage.getItem('food-journal-v2');
        if (raw) {
          const arr = JSON.parse(raw) as any[];
          const ix = arr.findIndex((x) => x.id === entry.id);
          if (ix !== -1) {
            arr[ix].maps_url = mapsUrl;
            localStorage.setItem('food-journal-v2', JSON.stringify(arr));
          }
        }
      } catch {}
      alert('URL de Google Maps guardada');
    } catch (err) {
      console.error(err);
      alert('No se pudo guardar la URL');
    }
  };

  const saveEntryChanges = () => {
    if (!entry) return;
    try {
      const updated: Entry = {
        id: entry.id,
        date: editData.date,
        place: editData.place.trim(),
        city: editData.city.trim() || undefined,
        country: editData.country.trim(),
        cuisine: editData.cuisine,
        serviceType: editData.serviceType as any,
        notes: editData.notes.trim(),
        rating: entry.rating,
        maps_url: entry.maps_url,
        photos: entry.photos
      };
      setEntry(updated);
      
      // Update localStorage
      try {
        const raw = localStorage.getItem('food-journal-v2');
        if (raw) {
          const arr = JSON.parse(raw) as any[];
          const ix = arr.findIndex((x) => x.id === entry.id);
          if (ix !== -1) {
            arr[ix] = updated;
            localStorage.setItem('food-journal-v2', JSON.stringify(arr));
          }
        }
      } catch {}
      setIsEditing(false);
      alert('Entrada actualizada');
    } catch (err) {
      console.error(err);
      alert('No se pudo guardar los cambios');
    }
  };

  const deletePhoto = (index: number) => {
    if (!entry || !entry.photos) return;
    const newPhotos = entry.photos.filter((_, i) => i !== index);
    const updated = { ...entry, photos: newPhotos };
    setEntry(updated);
    
    // Update localStorage
    try {
      const raw = localStorage.getItem('food-journal-v2');
      if (raw) {
        const arr = JSON.parse(raw) as any[];
        const ix = arr.findIndex((x) => x.id === entry.id);
        if (ix !== -1) {
          arr[ix].photos = newPhotos;
          localStorage.setItem('food-journal-v2', JSON.stringify(arr));
        }
      }
    } catch {}
  };

  if (loading) return <div style={{ padding: 12 }}>Cargando...</div>;
  if (!entry) return (
    <div style={{ padding: 12 }}>
      <p>Entrada no encontrada.</p>
      <button onClick={() => router.push('/')} className="btn btn-primary">Volver</button>
    </div>
  );

  return (
    <div style={{ padding: 12, maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => router.push('/')} className="btn btn-outline-secondary mb-3">← Volver</button>
      
      {!isEditing ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2>{entry.place}</h2>
            <button onClick={() => setIsEditing(true)} className="btn btn-outline-primary">Editar</button>
          </div>
          <p><strong>Fecha:</strong> {entry.date}</p>
          <p><strong>Ciudad:</strong> {entry.city || '-'}</p>
          <p><strong>País:</strong> {entry.country}</p>
          <p><strong>Tipo de cocina:</strong> {entry.cuisine}</p>
          <p><strong>Servicio:</strong> {entry.serviceType === 'delivery' ? 'Delivery' : 'Comer aquí'}</p>
          <p><strong>Notas:</strong> {entry.notes || '-'}</p>
        </>
      ) : (
        <>
          <h2>Editar entrada</h2>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Lugar</label>
            <input type="text" value={editData.place} onChange={(e) => setEditData({...editData, place: e.target.value})} className="form-control" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Fecha</label>
            <input type="date" value={editData.date} onChange={(e) => setEditData({...editData, date: e.target.value})} className="form-control" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Ciudad</label>
            <input type="text" value={editData.city} onChange={(e) => setEditData({...editData, city: e.target.value})} className="form-control" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>País</label>
            <input type="text" value={editData.country} onChange={(e) => setEditData({...editData, country: e.target.value})} className="form-control" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Tipo de cocina</label>
            <input type="text" value={editData.cuisine} onChange={(e) => setEditData({...editData, cuisine: e.target.value})} className="form-control" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Servicio</label>
            <select value={editData.serviceType} onChange={(e) => setEditData({...editData, serviceType: e.target.value})} className="form-control">
              <option value="dine-in">Comer aquí</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Notas</label>
            <textarea value={editData.notes} onChange={(e) => setEditData({...editData, notes: e.target.value})} className="form-control" rows={3} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveEntryChanges} className="btn btn-success">Guardar cambios</button>
            <button onClick={() => setIsEditing(false)} className="btn btn-outline-secondary">Cancelar</button>
          </div>
        </>
      )}

      <hr />

      <div>
        <h3>Fotos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginBottom: 12 }}>
          {(entry.photos || []).length === 0 && <p style={{ color: '#999', gridColumn: '1/-1' }}>No hay fotos aún.</p>}
          {(entry.photos || []).map((p, i) => (
            <div key={i} style={{ position: 'relative', cursor: 'pointer' }}>
              <img 
                src={p} 
                alt={`photo-${i}`} 
                onClick={() => setLightboxIndex(i)}
                style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
              />
              <button 
                onClick={() => deletePhoto(i)}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'rgba(255,0,0,0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <input 
            ref={(el) => { if (el) (el as any).id = `file-input-${id}`; }}
            id={`file-input-${id}`}
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <button 
            onClick={() => document.getElementById(`file-input-${id}`)?.click()}
            className="btn btn-outline-primary"
            style={{ marginRight: 8 }}
          >
            📁 Seleccionar fotos
          </button>
          {files && files.length > 0 && (
            <span style={{ marginRight: 12, color: '#666' }}>
              {files.length} foto{files.length !== 1 ? 's' : ''} seleccionada{files.length !== 1 ? 's' : ''}
            </span>
          )}
          <button onClick={uploadPhotos} disabled={uploading || !files} className="btn btn-primary">
            {uploading ? 'Subiendo...' : '⬆️ Subir fotos'}
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (entry.photos || []).length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 12
        }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={(entry.photos || [])[lightboxIndex]} 
              alt={`photo-${lightboxIndex}`}
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
            />
            <button 
              onClick={() => setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : (entry.photos || []).length - 1)}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.8)',
                border: 'none',
                borderRadius: 4,
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 18
              }}
            >
              ←
            </button>
            <button 
              onClick={() => setLightboxIndex(lightboxIndex < (entry.photos || []).length - 1 ? lightboxIndex + 1 : 0)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.8)',
                border: 'none',
                borderRadius: 4,
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 18
              }}
            >
              →
            </button>
            <button 
              onClick={() => setLightboxIndex(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(255,255,255,0.8)',
                border: 'none',
                borderRadius: 4,
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 18
              }}
            >
              ✕
            </button>
            <div style={{ position: 'absolute', bottom: 12, color: 'white', fontSize: 14 }}>
              {lightboxIndex + 1} / {(entry.photos || []).length}
            </div>
          </div>
        </div>
      )}

      <hr />

      <div>
        <h3>Google Maps</h3>
        <input 
          type="text" 
          value={mapsUrl} 
          onChange={(e) => setMapsUrl(e.target.value)} 
          placeholder="Pega la URL de Google Maps embebible aquí" 
          style={{ width: '100%', marginBottom: 8, padding: 8, border: '1px solid #ccc', borderRadius: 4 }} 
        />
        <button onClick={saveMapsUrl} className="btn btn-primary">Guardar URL</button>
        {entry.maps_url && (
          <div style={{ marginTop: 12 }}>
            <h4>Mapa</h4>
            <div style={{ width: '100%', height: 300, borderRadius: 4, overflow: 'hidden' }}>
              <iframe 
                src={entry.maps_url} 
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
