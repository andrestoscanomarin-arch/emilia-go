"use client";

import { useSyncExternalStore } from "react";
import { estadoInicial, VERSION_DATOS, conversacionVacia } from "./datos";
import type { Conversacion, EstadoApp } from "./tipos";

const CLAVE = "emilia-go-estado";
let estado: EstadoApp = cargar();
const oyentes = new Set<() => void>();
/** Cambia al reiniciar: las respuestas de Emilia que estaban en camino se descartan */
let epoca = 0;

function cargar(): EstadoApp {
  if (typeof window === "undefined") return estadoInicial();
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (crudo) {
      const guardado = JSON.parse(crudo) as EstadoApp;
      if (guardado.version === VERSION_DATOS) {
        // Si se recargó a mitad de una respuesta, no dejar a Emilia "escribiendo" para siempre
        for (const c of Object.values(guardado.conversaciones)) {
          c.escribiendo = false;
          for (const m of c.mensajes) m.transcribiendo = false;
        }
        return guardado;
      }
    }
  } catch {
    // Si el guardado está dañado, se arranca de cero
  }
  return estadoInicial();
}

function guardar() {
  try {
    const { servicios: _s, brilloOkr: _b, celebracion: _c, ...resto } = estado;
    window.localStorage.setItem(CLAVE, JSON.stringify(resto));
  } catch {
    // Sin espacio o modo privado: la demo sigue funcionando sin guardar
  }
}

export const getEstado = () => estado;
export const getEpoca = () => epoca;

/** Aplica un cambio sobre una copia del estado y avisa a la pantalla */
export function actualizar(cambio: (s: EstadoApp) => void) {
  const copia = structuredClone(estado);
  cambio(copia);
  estado = copia;
  guardar();
  oyentes.forEach((f) => f());
}

export function reiniciarEstado() {
  epoca++;
  const servicios = estado.servicios;
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {}
  estado = { ...estadoInicial(), servicios };
  guardar();
  oyentes.forEach((f) => f());
}

export function conversacion(s: EstadoApp, personaId: string): Conversacion {
  if (!s.conversaciones[personaId]) s.conversaciones[personaId] = conversacionVacia();
  return s.conversaciones[personaId];
}

function suscribir(f: () => void) {
  oyentes.add(f);
  return () => oyentes.delete(f);
}

export function useEstado(): EstadoApp {
  return useSyncExternalStore(suscribir, getEstado, getEstado);
}
