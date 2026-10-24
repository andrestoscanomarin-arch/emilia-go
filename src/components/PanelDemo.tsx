"use client";

import { useState } from "react";
import { MessageSquarePlus, RotateCcw, Settings2, Users, WifiOff, X } from "lucide-react";
import { actualizar, reiniciarEstado, useEstado } from "@/lib/store";
import { cambiarPersona, iniciarCheckin, simularEquipo } from "@/lib/emilia";
import { nombreCompleto } from "@/lib/formatos";

/** Botón flotante y discreto para manejar la demo en vivo */
export default function PanelDemo() {
  const s = useEstado();
  const [abierto, setAbierto] = useState(false);
  const [confirmarReinicio, setConfirmarReinicio] = useState(false);
  const [simulando, setSimulando] = useState(false);

  const persona = s.personas.find((p) => p.id === s.activaId)!;
  const conv = s.conversaciones[s.activaId];

  return (
    <div className="absolute bottom-5 left-5 z-50">
      {abierto && (
        <div className="aparecer mb-3 w-[340px] rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,43,107,0.25)]">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-navy">Control de la demo</h3>
            <button onClick={() => setAbierto(false)} className="text-gray-400 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>

          <label className="mt-3 block text-[12px] font-semibold text-gray-600">¿Con quién habla Emilia?</label>
          <select
            value={s.activaId}
            onChange={(e) => cambiarPersona(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[13.5px] outline-none focus:border-navy"
          >
            {s.equipos.map((e) => (
              <optgroup key={e.id} label={e.nombre}>
                {s.personas
                  .filter((p) => p.equipoId === e.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {nombreCompleto(p)} {s.checkins[p.id]?.completado ? "✓" : ""}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>

          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                void iniciarCheckin();
                setAbierto(false);
              }}
              disabled={conv?.escribiendo}
              className="flex items-center justify-center gap-2 rounded-lg bg-navy px-3 py-2.5 text-[13.5px] font-semibold text-white hover:brightness-110 disabled:opacity-50"
            >
              <MessageSquarePlus size={16} /> Iniciar check-in semanal
            </button>
            <button
              onClick={async () => {
                setSimulando(true);
                setAbierto(false);
                await simularEquipo();
                setSimulando(false);
              }}
              disabled={simulando}
              className="flex items-center justify-center gap-2 rounded-lg bg-naranja px-3 py-2.5 text-[13.5px] font-semibold text-white hover:brightness-105 disabled:opacity-50"
            >
              <Users size={16} /> Simular respuestas del resto del equipo
            </button>

            <button
              onClick={() =>
                actualizar((st) => {
                  st.modoSinInternet = !st.modoSinInternet;
                })
              }
              className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2.5 text-left text-[13.5px] font-medium"
            >
              <WifiOff size={16} className="text-gray-600" />
              <span className="flex-1">Modo demo sin internet</span>
              <span className={`relative h-5 w-9 rounded-full transition ${s.modoSinInternet ? "bg-wa" : "bg-gray-300"}`}>
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                    s.modoSinInternet ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => {
                if (!confirmarReinicio) {
                  setConfirmarReinicio(true);
                  setTimeout(() => setConfirmarReinicio(false), 3000);
                  return;
                }
                setConfirmarReinicio(false);
                reiniciarEstado();
              }}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[13.5px] font-semibold ${
                confirmarReinicio ? "border-red-500 bg-red-500 text-white" : "border-red-200 text-red-600 hover:bg-red-50"
              }`}
            >
              <RotateCcw size={15} /> {confirmarReinicio ? "Toca otra vez para confirmar" : "Reiniciar demo"}
            </button>
          </div>

          <div className="mt-3.5 rounded-lg bg-fondo px-3 py-2.5 text-[11.5px] leading-relaxed text-gray-600">
            <Estado
              ok={!s.modoSinInternet && !!s.servicios?.claude}
              titulo="Comprensión"
              si="Claude (claude-haiku-5-5)"
              no="Intérprete local de respaldo"
            />
            <Estado
              ok={!s.modoSinInternet && !!s.servicios?.openai}
              titulo="Notas de voz"
              si="OpenAI (gpt-4o-mini-transcribe)"
              no={s.modoSinInternet ? "Navegador o respuesta del guion" : "Transcripción del navegador"}
            />
            {s.ultimaFuente && (
              <div className="mt-1 text-gris">
                Última respuesta entendida por: <b>{s.ultimaFuente === "claude" ? "Claude" : "intérprete local"}</b>
              </div>
            )}
            <div className="mt-1 text-gris">Hablando con: {nombreCompleto(persona)}</div>
          </div>
        </div>
      )}
      <button
        onClick={() => setAbierto((a) => !a)}
        title="Control de la demo"
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white/80 text-gray-500 shadow-sm transition hover:opacity-100 ${
          abierto ? "opacity-100" : "opacity-50"
        }`}
      >
        <Settings2 size={18} />
      </button>
    </div>
  );
}

function Estado({ ok, titulo, si, no }: { ok: boolean; titulo: string; si: string; no: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-green-500" : "bg-amber-400"}`} />
      <b>{titulo}:</b> {ok ? si : no}
    </div>
  );
}
