/**
 * Intérprete local de respaldo: entiende frases comunes sin internet ni claves.
 * Ejemplos: "cerramos 12", "voy en 60%", "nada esta semana", "estoy bloqueado por…".
 */
import type { Interpretacion, Okr } from "./tipos";

export interface EntradaInterprete {
  mensaje: string;
  nombre: string;
  objetivo: Okr;
  otros: Okr[];
  /** Presente si Emilia ya hizo su única pregunta de aclaración */
  aclaracion?: { pregunta: string; mensajeOriginal: string };
}

/** Quita tildes letra por letra, sin cambiar la longitud del texto */
function sinTildes(t: string): string {
  return Array.from(t.toLowerCase())
    .map((c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "") || c)
    .join("");
}

const PALABRAS: Record<string, number> = {
  cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8,
  nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16,
  diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintidos: 22,
  veintitres: 23, veinticuatro: 24, veinticinco: 25, treinta: 30, cuarenta: 40, cincuenta: 50,
  sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100,
};

interface Numero {
  valor: number;
  esPorcentaje: boolean;
}

function extraerNumero(t: string, unidadConMil: boolean): Numero | null {
  // Cifras escritas: 12, 1.500, 2,5, 70%
  const m = t.match(/(\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?)(\s*(?:%|por ?ciento))?(\s*mil\b)?/);
  if (m) {
    let valor = m[1].includes(".") ? Number(m[1].replace(/\./g, "")) : Number(m[1].replace(",", "."));
    if (m[3] && !unidadConMil) valor *= 1000;
    return { valor, esPorcentaje: Boolean(m[2]) };
  }
  // Cifras en palabras: "doce", "treinta y cinco", "setenta por ciento"
  const w = t.match(
    /\b(cero|una?|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieciseis|diecisiete|dieciocho|diecinueve|veinte|veinti\w+|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa|cien|ciento)\b(?:\s+y\s+(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?(\s*(?:%|por ?ciento))?/,
  );
  if (w && PALABRAS[w[1]] !== undefined) {
    // "un" / "una" solas casi nunca son una cifra ("una venta" sí, "una semana" no)
    if ((w[1] === "un" || w[1] === "una") && !w[3]) return null;
    const valor = PALABRAS[w[1]] + (w[2] ? PALABRAS[w[2]] : 0);
    return { valor, esPorcentaje: Boolean(w[3]) };
  }
  return null;
}

const RE_BLOQUEO =
  /(bloquead|bloqueo|trabad|frenad|atascad|no he podido|no hemos podido|necesito ayuda|estoy esperando|estamos esperando|problema|no funciona|esta lento|esta muy lento|caido|se cae|no sirve|falla)/;

function extraerBloqueo(original: string): { texto: string | null; resto: string } {
  const norm = sinTildes(original);
  if (!RE_BLOQUEO.test(norm)) return { texto: null, resto: original };
  // Partir el mensaje en frases y quedarse con la que tiene el bloqueo
  const cortes = [...norm.matchAll(/[,.;!]|\bpero\b|\baunque\b|\bsolo que\b/g)].map((x) => x.index ?? 0);
  const limites = [0, ...cortes, norm.length];
  for (let i = 0; i < limites.length - 1; i++) {
    const a = limites[i];
    const b = limites[i + 1];
    if (RE_BLOQUEO.test(norm.slice(a, b))) {
      let frase = original.slice(a, b).replace(/^[\s,.;!]+/, "");
      frase = frase
        .replace(/^(pero|aunque|solo que)\s+/i, "")
        .replace(
          /^(y\s+)?((estoy|estamos|me tiene|nos tiene|sigo|seguimos)\s+)?(bloquead[oa]s?|trabad[oa]s?|frenad[oa]s?|atascad[oa]s?)\s*(porque|por que|por|con|ya que|debido a)?\s*/i,
          "",
        )
        .trim();
      const texto = (frase || original.slice(a, b)).replace(/[.\s]+$/, "").trim();
      const resto = original.slice(0, a) + " " + original.slice(b);
      return { texto, resto };
    }
  }
  return { texto: original.trim(), resto: "" };
}

const RE_TOTAL =
  /(en total|total|llevo|llevamos|vamos en|voy en|acumulad|en el mes|del mes|este mes|en octubre|de octubre|en el trimestre|del trimestre|ya son|ya van|ya tengo|tenemos|todo el mes|en todo)/;
const RE_SEMANA = /(esta semana|en la semana|de la semana|semanal|adicional|mas que|otras|otros|sumamos|sume|sumé)/;
const RE_NADA =
  /(nada|ninguna|ningun|no avance|no avanc|sin avance|sigo igual|seguimos igual|igual que la semana|no he avanzado|no hubo|todavia no|aun no|no pude)/;
const RE_META = /(cumpli|cumplimos|logre|logramos|alcance|alcanzamos)\s+(la\s+)?meta|al 100|ya termine|terminamos|completamos todo/;

function redondear(n: number) {
  return Math.round(n * 10) / 10;
}

export function interpretarLocal(e: EntradaInterprete): Interpretacion {
  const o = e.objetivo;
  const original = e.mensaje.trim();
  const { texto: bloqueos, resto } = extraerBloqueo(original);
  const t = sinTildes(original);
  const tResto = sinTildes(resto);
  const unidadConMil = o.unidad.includes("mil");
  const num = extraerNumero(tResto, unidadConMil) ?? extraerNumero(t, unidadConMil);
  const comentario = original.length > 140 ? original.slice(0, 137) + "…" : original;
  const base: Interpretacion = {
    objetivo_id: o.id,
    valor_nuevo: null,
    comentario,
    bloqueos,
    necesita_aclaracion: false,
    pregunta_aclaracion: null,
  };

  // Respuesta a la pregunta de aclaración: "de esta semana" / "en total"
  if (e.aclaracion) {
    const previo = extraerNumero(sinTildes(e.aclaracion.mensajeOriginal), unidadConMil);
    const n = num ?? previo;
    if (!n) return base;
    const semanal = RE_SEMANA.test(t) && !/(total|mes|acumul|trimestre|todo)/.test(t);
    const valor = semanal ? o.actual + n.valor : n.valor;
    return { ...base, valor_nuevo: redondear(valor), comentario: e.aclaracion.mensajeOriginal };
  }

  if (RE_META.test(t)) return { ...base, valor_nuevo: o.meta };

  if (!num) {
    if (RE_NADA.test(t)) return { ...base, comentario: "Sin avance esta semana" };
    if (bloqueos) return base;
    return {
      ...base,
      necesita_aclaracion: true,
      pregunta_aclaracion:
        o.unidad === "%"
          ? `¿En qué porcentaje vas? Por ejemplo: "voy en 60%".`
          : o.direccion === "bajar"
            ? `¿En cuánto está hoy? Por ejemplo: "vamos en ${o.actual - 1} ${o.unidad}".`
            : `¿Cuántas ${o.unidad} llevas en total? Por ejemplo: "llevo ${Math.min(o.meta, o.actual + 2)}".`,
    };
  }

  // Porcentaje dicho sobre un objetivo que no es de porcentaje: "voy en 60%" de la meta
  if (num.esPorcentaje && o.unidad !== "%") {
    return { ...base, valor_nuevo: redondear((o.meta * num.valor) / 100) };
  }
  if (o.unidad === "%" || o.direccion === "bajar") {
    return { ...base, valor_nuevo: redondear(num.valor) };
  }

  // Objetivos acumulables (ventas, clientes, tickets, millones…)
  const dijoTotal = RE_TOTAL.test(t);
  const dijoSemana = RE_SEMANA.test(t);
  if (dijoTotal && !/esta semana/.test(t)) return { ...base, valor_nuevo: redondear(num.valor) };
  if (dijoSemana) return { ...base, valor_nuevo: redondear(o.actual + num.valor) };
  if (num.valor < o.actual) return { ...base, valor_nuevo: redondear(o.actual + num.valor) };
  if (num.valor === o.actual) return { ...base, valor_nuevo: num.valor };

  const periodo = o.periodo === "octubre" ? "del mes" : "del trimestre";
  return {
    ...base,
    necesita_aclaracion: true,
    pregunta_aclaracion: `¿Las ${num.valor} ${o.unidad} son de esta semana o el total ${periodo}?`,
  };
}
