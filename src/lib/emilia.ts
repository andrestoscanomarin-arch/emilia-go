"use client";

/**
 * El "cerebro" de la demo: lo que Emilia dice, cuándo lo dice y cómo actualiza Delta.
 */
import { respuestaGuion, SEMANA_ACTUAL, valorSimulado } from "./datos";
import { cifra, horaActual, metaTexto, cifraCorta, progreso, pct } from "./formatos";
import { interpretarLocal, type EntradaInterprete } from "./interprete";
import { actualizar, conversacion, getEpoca, getEstado } from "./store";
import type { EstadoApp, Interpretacion, Mensaje, Okr } from "./tipos";

class Cancelado extends Error {}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nuevoId = () => Math.random().toString(36).slice(2, 10);

/** Personas que tienen a Emilia "ocupada" (escribiendo o pensando) */
const ocupadas = new Set<string>();
export const estaOcupada = (pid: string) => ocupadas.has(pid);

const okrsDe = (s: EstadoApp, pid: string) => s.okrs.filter((o) => o.personaId === pid);
const personaDe = (s: EstadoApp, pid: string) => s.personas.find((p) => p.id === pid)!;
const equipoDe = (s: EstadoApp, pid: string) => s.equipos.find((e) => e.id === personaDe(s, pid).equipoId)!;

function agregarMensaje(pid: string, m: Omit<Mensaje, "id" | "hora">): string {
  const id = nuevoId();
  actualizar((s) => {
    conversacion(s, pid).mensajes.push({ ...m, id, hora: horaActual() });
  });
  return id;
}

/** Ejecuta una tanda de respuestas de Emilia con el efecto "escribiendo…" */
async function conEmilia(pid: string, tarea: (decir: (t: string) => Promise<void>) => Promise<void>) {
  const epoca = getEpoca();
  const vigente = () => {
    if (epoca !== getEpoca()) throw new Cancelado();
  };
  ocupadas.add(pid);
  const decir = async (texto: string) => {
    vigente();
    actualizar((s) => {
      conversacion(s, pid).escribiendo = true;
    });
    await esperar(Math.min(2200, 650 + texto.length * 14));
    vigente();
    agregarMensaje(pid, { de: "emilia", tipo: "texto", texto });
    await esperar(350);
  };
  try {
    actualizar((s) => {
      conversacion(s, pid).escribiendo = true;
    });
    await tarea(decir);
  } catch (e) {
    if (!(e instanceof Cancelado)) {
      console.error(e);
      try {
        await decir("Uy, se me enredó algo 😅. ¿Me lo repites, por favor?");
      } catch {}
    }
  } finally {
    ocupadas.delete(pid);
    if (epoca === getEpoca()) {
      actualizar((s) => {
        conversacion(s, pid).escribiendo = false;
      });
    }
  }
}

function pregunta(o: Okr, primera: boolean): string {
  let t: string;
  if (o.unidad === "%") {
    t = `¿Cómo vas con ${o.nombreCorto}? La meta es ${metaTexto(o)} y estabas en ${cifraCorta(o)}.`;
  } else if (o.direccion === "bajar") {
    t = `¿Cómo va ${o.nombreCorto}? La meta es bajarlo a ${metaTexto(o)} y la semana pasada estaba en ${cifraCorta(o)}.`;
  } else {
    t = `¿Cómo va ${o.nombreCorto} esta semana? La meta es ${metaTexto(o)} en ${o.periodo} y llevabas ${cifraCorta(o)}.`;
  }
  return primera ? t : `Ahora, ${t[0] === "¿" ? "¿" + t[1].toLowerCase() + t.slice(2) : t}`;
}

function confirmacion(nombre: string, o: Okr): string {
  const p = progreso(o);
  const detalle = o.unidad === "%" && o.meta === 100 ? `vas en ${o.actual}%` : `${cifra(o)} (${pct(p)})`;
  const extra = p >= 1 ? " ¡Cumpliste la meta! 🎉" : "";
  return `¡Listo, ${nombre}! Actualicé tu avance: ${detalle} ✅${extra}`;
}

/** Emilia inicia la conversación de la semana */
export async function iniciarCheckin(pid = getEstado().activaId) {
  if (ocupadas.has(pid)) return;
  actualizar((s) => {
    const c = conversacion(s, pid);
    c.paso = { tipo: "preguntando", okrIndex: 0, yaAclaro: false };
    c.bloqueos = [];
    c.comentarios = [];
    s.checkins[pid] = { completado: false };
  });
  const s = getEstado();
  const p = personaDe(s, pid);
  const okrs = okrsDe(s, pid);
  await conEmilia(pid, async (decir) => {
    await esperar(400);
    await decir(
      `¡Hola ${p.nombre}! 👋 Soy Emilia, de Delta. Es hora de tu check-in semanal: son solo ${okrs.length} preguntas y me puedes responder con texto o con nota de voz 🎙️`,
    );
    await decir(pregunta(okrs[0], true));
  });
}

async function interpretar(entrada: EntradaInterprete): Promise<Interpretacion> {
  if (getEstado().modoSinInternet || process.env.NEXT_PUBLIC_ESTATICO) {
    await esperar(500);
    actualizar((s) => {
      s.ultimaFuente = "local";
    });
    return interpretarLocal(entrada);
  }
  try {
    const r = await fetch("/api/interpretar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entrada),
      signal: AbortSignal.timeout(11000),
    });
    if (!r.ok) throw new Error(String(r.status));
    const datos = (await r.json()) as { fuente: "claude" | "local"; resultado: Interpretacion };
    actualizar((s) => {
      s.ultimaFuente = datos.fuente;
    });
    return datos.resultado;
  } catch {
    actualizar((s) => {
      s.ultimaFuente = "local";
    });
    return interpretarLocal(entrada);
  }
}

/** Procesa lo que la persona respondió (texto escrito o transcripción del audio) */
async function procesar(pid: string, texto: string) {
  if (conversacion(structuredClone(getEstado()), pid).paso.tipo === "inactivo") {
    await iniciarCheckin(pid);
    return;
  }
  await conEmilia(pid, async (decir) => {
    const s0 = getEstado();
    const c0 = conversacion(structuredClone(s0), pid);
    const p = personaDe(s0, pid);

    if (c0.paso.tipo === "terminado") {
      await decir(`¡Gracias, ${p.nombre}! Tu check-in de esta semana ya está al día ✅. Te escribo el próximo miércoles 👋`);
      return;
    }

    const paso = c0.paso;
    if (paso.tipo !== "preguntando") return;
    const okrs = okrsDe(s0, pid);
    const objetivo = okrs[paso.okrIndex];
    const r = await interpretar({
      mensaje: texto,
      nombre: p.nombre,
      objetivo,
      otros: okrs.filter((o) => o.id !== objetivo.id),
      aclaracion: paso.aclaracion
        ? { pregunta: paso.aclaracion.pregunta, mensajeOriginal: paso.aclaracion.mensajeOriginal }
        : undefined,
    });

    // UNA sola pregunta de aclaración por objetivo
    if (r.necesita_aclaracion && !paso.yaAclaro) {
      const preguntaAclaracion = r.pregunta_aclaracion || "¿Me lo cuentas con una cifra? Por ejemplo: “llevo 12”.";
      actualizar((s) => {
        conversacion(s, pid).paso = {
          tipo: "preguntando",
          okrIndex: paso.okrIndex,
          yaAclaro: true,
          aclaracion: { pregunta: preguntaAclaracion, mensajeOriginal: texto, bloqueo: r.bloqueos },
        };
      });
      await decir(preguntaAclaracion);
      return;
    }

    const bloqueo = r.bloqueos || paso.aclaracion?.bloqueo || null;
    const destino = okrs.find((o) => o.id === r.objetivo_id) ?? objetivo;

    if (r.valor_nuevo !== null && Number.isFinite(r.valor_nuevo)) {
      const valor = Math.max(0, r.valor_nuevo);
      actualizar((s) => {
        const o = s.okrs.find((x) => x.id === destino.id)!;
        o.actual = valor;
        o.actualizadoVia = "whatsapp";
        o.actualizadoEn = Date.now();
        s.brilloOkr = { id: o.id, t: Date.now() };
        conversacion(s, pid).comentarios.push(r.comentario);
        if (s.activaId === pid) {
          s.vista = "yo";
          s.pestana = "okrs";
        }
      });
      await decir(confirmacion(p.nombre, getEstado().okrs.find((x) => x.id === destino.id)!));
    } else {
      const o = getEstado().okrs.find((x) => x.id === destino.id)!;
      const sinAvance = /sin avance/i.test(r.comentario);
      actualizar((s) => {
        conversacion(s, pid).comentarios.push(r.comentario);
      });
      await decir(
        sinAvance
          ? `Entendido, ${p.nombre}. Lo dejo igual por ahora: ${cifra(o)} (${pct(progreso(o))}). ¡La próxima semana le damos! 💪`
          : `Anotado 📝. Dejo ${o.nombreCorto} en ${cifra(o)} por ahora.`,
      );
    }

    if (bloqueo) {
      const lider = equipoDe(getEstado(), pid).lider.split(" ")[0];
      actualizar((s) => {
        conversacion(s, pid).bloqueos.push(bloqueo);
      });
      await decir(`Anoté el bloqueo: “${bloqueo}”. Se lo cuento a ${lider}, tu líder, para que te ayude a destrabarlo 🙌`);
    }

    const siguiente = paso.okrIndex + 1;
    if (siguiente < okrs.length) {
      actualizar((s) => {
        conversacion(s, pid).paso = { tipo: "preguntando", okrIndex: siguiente, yaAclaro: false };
      });
      await decir(pregunta(getEstado().okrs.find((o) => o.id === okrs[siguiente].id)!, false));
      return;
    }

    await terminar(pid, decir);
  });
}

async function terminar(pid: string, decir: (t: string) => Promise<void>) {
  const s0 = getEstado();
  const p = personaDe(s0, pid);
  const conv = conversacion(structuredClone(s0), pid);
  const resumen = okrsDe(s0, pid)
    .map((o) => `${o.titulo}: ${cifra(o)}`)
    .join(" · ");

  actualizar((s) => {
    conversacion(s, pid).paso = { tipo: "terminado" };
    s.checkins[pid] = {
      completado: true,
      en: Date.now(),
      via: "whatsapp",
      bloqueos: conv.bloqueos.join(" · ") || undefined,
      resumen,
    };
  });
  const subio = revisarRacha(equipoDe(getEstado(), pid).id);
  await decir(`¡Eso es todo, ${p.nombre}! Tu weekly W${SEMANA_ACTUAL} quedó completada en Delta ✅`);

  const s = getEstado();
  const eq = equipoDe(s, pid);
  const miembros = s.personas.filter((x) => x.equipoId === eq.id);
  const listos = miembros.filter((x) => s.checkins[x.id]?.completado).length;
  if (subio) {
    await decir(`🔥 ¡Tu equipo de ${eq.nombre} completó la semana! Ya llevan ${eq.racha} semanas seguidas al día. ¡Sigan así!`);
  } else {
    await decir(
      `Tu equipo de ${eq.nombre} lleva 🔥 ${eq.racha} semanas seguidas al día. Esta semana ya van ${listos} de ${miembros.length}: cuando actualicen todos, la racha sube a ${eq.racha + 1}. ¡Sigan así!`,
    );
  }

  // Mostrar en Delta que la weekly pasó de "Pendiente" a "Completada"
  const epoca = getEpoca();
  setTimeout(() => {
    if (epoca !== getEpoca()) return;
    actualizar((st) => {
      if (st.activaId === pid && st.vista === "yo") st.pestana = "actividad";
    });
  }, 1400);
}

/** Suma una semana a la racha si TODO el equipo actualizó. Devuelve true si subió. */
function revisarRacha(equipoId: string): boolean {
  let subio = false;
  actualizar((s) => {
    const miembros = s.personas.filter((x) => x.equipoId === equipoId);
    const eq = s.equipos.find((e) => e.id === equipoId)!;
    const todos = miembros.every((x) => s.checkins[x.id]?.completado);
    const contada = eq.semanaContada === SEMANA_ACTUAL;
    if (todos && !contada) {
      eq.racha += 1;
      eq.semanaContada = SEMANA_ACTUAL;
      s.celebracion = { equipoId, t: Date.now() };
      subio = true;
    }
  });
  return subio;
}

export async function enviarTexto(texto: string) {
  const pid = getEstado().activaId;
  const limpio = texto.trim();
  if (!limpio || ocupadas.has(pid)) return;
  agregarMensaje(pid, { de: "usuario", tipo: "texto", texto: limpio });
  await procesar(pid, limpio);
}

function aDataUrl(blob: Blob): Promise<string | undefined> {
  return new Promise((res) => {
    const lector = new FileReader();
    lector.onload = () => res(typeof lector.result === "string" ? lector.result : undefined);
    lector.onerror = () => res(undefined);
    lector.readAsDataURL(blob);
  });
}

/** Nota de voz: se muestra la burbuja, se transcribe y se procesa como texto */
export async function enviarAudio(blob: Blob, duracion: number, textoNavegador: string) {
  const pid = getEstado().activaId;
  if (ocupadas.has(pid)) return;
  ocupadas.add(pid);
  const epoca = getEpoca();
  const audioUrl = blob.size < 1_500_000 ? await aDataUrl(blob) : URL.createObjectURL(blob);
  const id = agregarMensaje(pid, { de: "usuario", tipo: "audio", texto: "", audioUrl, duracion, transcribiendo: true });

  let texto = "";
  const s = getEstado();
  if (!s.modoSinInternet && s.servicios?.openai) {
    try {
      const fd = new FormData();
      fd.append("audio", blob, "nota.webm");
      const r = await fetch("/api/transcribir", { method: "POST", body: fd, signal: AbortSignal.timeout(16000) });
      const datos = (await r.json()) as { texto: string | null };
      texto = datos.texto ?? "";
    } catch {
      texto = "";
    }
  }
  if (!texto) texto = textoNavegador.trim();
  if (!texto && getEstado().modoSinInternet) {
    // Modo sin internet: la nota de voz usa la respuesta preprogramada del guion
    const c = conversacion(structuredClone(getEstado()), pid);
    if (c.paso.tipo === "preguntando") {
      const o = okrsDe(getEstado(), pid)[c.paso.okrIndex];
      texto = respuestaGuion(o, c.paso.yaAclaro);
    }
  }
  ocupadas.delete(pid);
  if (epoca !== getEpoca()) return;

  actualizar((st) => {
    const m = conversacion(st, pid).mensajes.find((x) => x.id === id);
    if (m) {
      m.texto = texto;
      m.transcribiendo = false;
    }
  });

  if (!texto) {
    await noTeEscuche(pid);
    return;
  }
  await procesar(pid, texto);
}

export async function noTeEscuche(pid = getEstado().activaId) {
  await conEmilia(pid, async (decir) => {
    await decir("No te escuché bien, ¿me lo escribes? 🙏");
  });
}

/** Respuesta sugerida para el modo sin internet */
export function sugerencia(s: EstadoApp): string | null {
  const c = s.conversaciones[s.activaId];
  if (!c || c.paso.tipo !== "preguntando") return null;
  const o = okrsDe(s, s.activaId)[c.paso.okrIndex];
  return o ? respuestaGuion(o, c.paso.yaAclaro) : null;
}

/** Los compañeros del equipo "responden" a Emilia uno por uno */
export async function simularEquipo() {
  const epoca = getEpoca();
  const s = getEstado();
  const eqId = personaDe(s, s.activaId).equipoId;
  const pendientes = s.personas.filter(
    (x) => x.equipoId === eqId && x.id !== s.activaId && !s.checkins[x.id]?.completado,
  );
  for (const [i, persona] of pendientes.entries()) {
    await esperar(i === 0 ? 300 : 900);
    if (epoca !== getEpoca()) return;
    actualizar((st) => {
      const suyos = st.okrs.filter((o) => o.personaId === persona.id);
      suyos.forEach((o, j) => {
        o.actual = valorSimulado(o, i + j);
        o.actualizadoVia = "whatsapp";
        o.actualizadoEn = Date.now();
      });
      st.checkins[persona.id] = {
        completado: true,
        en: Date.now(),
        via: "whatsapp",
        resumen: suyos.map((o) => `${o.titulo}: ${cifra(o)}`).join(" · "),
      };
    });
  }
  if (epoca !== getEpoca() || !revisarRacha(eqId)) return;

  // Emilia le cuenta la buena noticia a quien está en el chat
  const st = getEstado();
  const pid = st.activaId;
  if (conversacion(structuredClone(st), pid).mensajes.length === 0) return;
  const eq = st.equipos.find((e) => e.id === eqId)!;
  const primero = [...st.equipos].sort((a, b) => b.racha - a.racha)[0].id === eqId;
  await esperar(1200);
  await conEmilia(pid, async (decir) => {
    await decir(
      `🔥 ¡Lo lograron! Todo el equipo de ${eq.nombre} actualizó esta semana: ya llevan ${eq.racha} semanas seguidas al día${
        primero ? " y son el equipo #1 del mes 🏆" : ""
      }. ¡Sigan así!`,
    );
  });
}

export function cambiarPersona(pid: string) {
  actualizar((s) => {
    s.activaId = pid;
    s.vista = "yo";
    s.pestana = "actividad";
  });
}
