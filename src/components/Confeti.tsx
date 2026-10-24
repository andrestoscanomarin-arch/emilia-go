"use client";

import { useEffect, useMemo, useState } from "react";

/** Lluvia corta de llamas y confeti cuando un equipo completa la semana */
export default function Confeti() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3600);
    return () => clearTimeout(t);
  }, []);
  const piezas = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: 560 + ((i * 137) % 1330),
        delay: (i % 12) * 0.12,
        size: 22 + ((i * 7) % 18),
        emoji: ["🔥", "🎉", "✨", "🧡"][i % 4],
      })),
    [],
  );
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {piezas.map((p, i) => (
        <span key={i} className="confeti" style={{ left: p.left, animationDelay: `${p.delay}s`, fontSize: p.size }}>
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
