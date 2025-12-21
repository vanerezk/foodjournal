

import Link from "next/link";

export default function Home() {
  return (
    <div className="container-main" style={{ maxWidth: 960, textAlign: "center", paddingTop: 60, paddingBottom: 60 }}>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: 12 }}>Mi espacio gastronómico</h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: 32 }}>
        Guarda tus experiencias, fotos y mapas en el Food Journal, o explora la nueva sección próximamente.
      </p>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/journal" className="btn btn-primary" style={{ minWidth: 180 }}>
          Abrir Food Journal
        </Link>
        <Link href="/beer" className="btn btn-outline-secondary" style={{ minWidth: 180 }}>
          Beer Journal
        </Link>
      </div>
    </div>
  );
}
