"use client";

import { Check, Clock3, Trophy } from "lucide-react";
import type { EstadoApp } from "@/lib/tipos";
import { iniciales } from "@/lib/formatos";

export function estadoEquipo(s: EstadoApp, equipoId: string) {
  const miembros = s.personas.filter((p) => p.equipoId === equipoId);
  const listos = miembros.filter((p) => s.checkins[p.id]?.completado).length;
  return { miembros, listos, total: miembros.length };
}

export function RachaEquipo({ s, equipoId }: { s: EstadoApp; equipoId: string }) {
  const eq = s.equipos.find((e) => e.id === equipoId)!;
  const { miembros, listos, total } = estadoEquipo(s, equipoId);
  const celebrando = s.celebracion?.equipoId === equipoId && Date.now() - s.celebracion.t < 5000;
  const completo = listos === total;

  return (
    <div
      key={celebrando ? s.celebracion!.t : "racha"}
      className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-[0_2px_10px_rgba(15,43,107,0.06)] ${
        celebrando ? "brillo border-naranja" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-navy">Racha de equipo 🔥</h3>
        <span className="rounded-full bg-fondo px-2 py-0.5 text-[11.5px] font-medium text-gris">{eq.nombre}</span>
      </div>

      <div className="mt-3 flex items-end gap-2.5">
        <span key={eq.racha} className={`text-[44px] leading-none ${celebrando ? "rebote" : "llama"}`}>
          🔥
        </span>
        <div className="leading-none">
          <span key={`n${eq.racha}`} className="rebote inline-block font-display text-[42px] font-extrabold text-naranja">
            {eq.racha}
          </span>
          <span className="ml-1.5 text-[14px] font-semibold text-navy">semanas seguidas</span>
        </div>
      </div>
      {celebrando && (
        <div className="aparecer mt-2 rounded-lg bg-naranja/10 px-2.5 py-1.5 text-[12.5px] font-semibold text-naranja">
          ¡Semana completa! Todo el equipo actualizó 🎉
        </div>
      )}

      <div className="mt-4 flex justify-between">
        {miembros.map((p) => {
          const ok = s.checkins[p.id]?.completado;
          return (
            <div key={p.id} className="flex w-[52px] flex-col items-center">
              <div className="relative">
                <div
                  className={`flex h-[42px] w-[42px] items-center justify-center rounded-full text-[13px] font-bold text-white transition ${
                    ok ? "" : "opacity-45 grayscale"
                  } ${p.id === s.activaId ? "ring-2 ring-naranja ring-offset-2" : ""}`}
                  style={{ background: p.color }}
                >
                  {iniciales(p)}
                </div>
                <span
                  key={ok ? "ok" : "no"}
                  className={`absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white ${
                    ok ? "rebote bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {ok ? <Check size={11} strokeWidth={3.5} /> : <Clock3 size={10} strokeWidth={2.5} />}
                </span>
              </div>
              <span className="mt-1.5 w-full truncate text-center text-[11px] text-gray-600">{p.nombre.split(" ")[0]}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3.5">
        <div className="flex justify-between text-[12px]">
          <span className="font-semibold text-navy">
            {listos} de {total} al día esta semana
          </span>
          <span className="text-gris">W43</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-fondo">
          <div
            className={`barra-progreso h-full rounded-full ${completo ? "bg-green-600" : "bg-naranja"}`}
            style={{ width: `${(listos / total) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-[11.5px] leading-snug text-gris">
          {completo
            ? "¡Todo el equipo actualizó! La racha ya sumó esta semana."
            : "La racha sube solo cuando todo el equipo actualiza."}
        </p>
      </div>
    </div>
  );
}

export function RankingEquipos({ s, resaltar }: { s: EstadoApp; resaltar?: string }) {
  const filas = s.equipos
    .map((e) => ({ e, ...estadoEquipo(s, e.id) }))
    .sort((a, b) => b.e.racha - a.e.racha || b.listos / b.total - a.listos / a.total);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,43,107,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-navy">Ranking de equipos</h3>
        <span className="text-[11.5px] font-medium text-gris">Octubre 2026</span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {filas.map(({ e, listos, total }, i) => (
          <div
            key={e.id}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-700 ${
              i === 0 ? "border-naranja/60 bg-gradient-to-r from-naranja/12 to-white" : "border-gray-100 bg-white"
            } ${resaltar === e.id && i !== 0 ? "border-navy/20" : ""}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-bold ${
                i === 0 ? "bg-naranja text-white" : "bg-fondo text-navy"
              }`}
            >
              {i === 0 ? <Trophy size={14} /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-semibold text-navy">{e.nombre}</div>
              <div className="text-[11px] text-gris">{i === 0 ? "Equipo del mes · " : ""}{listos}/{total} al día</div>
            </div>
            <span className="font-display text-[16px] font-bold text-naranja">🔥 {e.racha}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
