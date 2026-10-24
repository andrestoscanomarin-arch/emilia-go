import type { Okr, Persona } from "./tipos";

export function progreso(o: Pick<Okr, "actual" | "meta" | "inicial" | "direccion">): number {
  const p =
    o.direccion === "bajar"
      ? (o.inicial - o.actual) / Math.max(1e-9, o.inicial - o.meta)
      : o.actual / Math.max(1e-9, o.meta);
  return Math.max(0, Math.min(1, p));
}

export const pct = (p: number) => `${Math.round(p * 100)}%`;

export function numero(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

/** "12 de 20 ventas", "70% (meta 100%)", "15 min (meta 10 min)" */
export function cifra(o: Okr, valor = o.actual): string {
  if (o.unidad === "%") return `${numero(valor)}% de ${numero(o.meta)}%`;
  if (o.direccion === "bajar") return `${numero(valor)} ${o.unidad} (meta ${numero(o.meta)} ${o.unidad})`;
  return `${numero(valor)} de ${numero(o.meta)} ${o.unidad}`;
}

export function cifraCorta(o: Okr): string {
  if (o.unidad === "%") return `${numero(o.actual)}%`;
  return `${numero(o.actual)} ${o.unidad}`;
}

export function metaTexto(o: Okr): string {
  return o.unidad === "%" ? `${numero(o.meta)}%` : `${numero(o.meta)} ${o.unidad}`;
}

export const iniciales = (p: Pick<Persona, "nombre" | "apellido">) =>
  `${p.nombre[0]}${p.apellido[0]}`.toUpperCase();

export const nombreCompleto = (p: Pick<Persona, "nombre" | "apellido">) => `${p.nombre} ${p.apellido}`;

export function horaActual(): string {
  return new Date().toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true })
    .replace(/\s/g, " ")
    .replace("a. m.", "a. m.")
    .replace("p. m.", "p. m.");
}

export function normalizar(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
