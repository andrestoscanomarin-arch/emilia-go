"use client";

import dynamic from "next/dynamic";

// La app vive solo en el navegador (usa el micrófono y guarda el estado localmente)
const App = dynamic(() => import("@/components/App"), { ssr: false });

export default function Pagina() {
  return <App />;
}
