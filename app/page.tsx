

import Link from "next/link";

export default function Home() {
  return (
    <div className="container-main" style={{ maxWidth: 960, textAlign: "center", paddingTop: 60, paddingBottom: 60 }}>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: 12 }}>Mi espacio gastronómico</h1>
      
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: 32 }}>
        Para que dejes de usar el bloc de notas y puedas registrar todo lo que comes y bebes  en un solo lugar.
      </p>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/journal" className="btn" style={{ minWidth: 180, backgroundColor: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }}>
            Abrir Food Journal
          </Link>
          <Link href="/beer" className="btn" style={{ minWidth: 180, backgroundColor: 'var(--accent-2)', color: '#fff', borderColor: 'var(--accent-2)' }}>
            Beer Journal
          </Link>

        
      </div>
      <hr style={{ margin: "40px 0" }} />
      <p>Ojala poder completarlo con vos.
        <br />Te quiero mi chica. 🧡</p>
    </div>
  );
}
