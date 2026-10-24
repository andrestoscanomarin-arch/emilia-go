"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BatteryFull,
  Camera,
  CheckCheck,
  Lock,
  Mic,
  MoreVertical,
  Paperclip,
  Pause,
  Phone,
  Play,
  SendHorizontal,
  Signal,
  Smile,
  Trash2,
  Video,
  Wifi,
} from "lucide-react";
import { useEstado } from "@/lib/store";
import { enviarAudio, enviarTexto, noTeEscuche, sugerencia } from "@/lib/emilia";
import type { Mensaje } from "@/lib/tipos";
import { iniciales } from "@/lib/formatos";
import { useGrabadora } from "./useGrabadora";

export function AvatarEmilia({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-navy font-display font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.46 }}
    >
      E
    </div>
  );
}

const duracionTexto = (seg: number) => `${Math.floor(seg / 60)}:${String(Math.floor(seg % 60)).padStart(2, "0")}`;

export default function Telefono() {
  const s = useEstado();
  const conv = s.conversaciones[s.activaId];
  const mensajes = conv?.mensajes ?? [];
  const escribiendo = conv?.escribiendo ?? false;
  const [texto, setTexto] = useState("");
  const listaRef = useRef<HTMLDivElement>(null);
  const grabadora = useGrabadora({
    alTerminar: (blob, seg, transcripcion) => void enviarAudio(blob, seg, transcripcion),
    alFallar: () => void noTeEscuche(),
  });
  const persona = s.personas.find((p) => p.id === s.activaId)!;
  const siglas = iniciales(persona);
  const sugerida = s.modoSinInternet && !escribiendo ? sugerencia(s) : null;

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes.length, escribiendo, mensajes[mensajes.length - 1]?.texto]);

  const enviar = () => {
    if (!texto.trim() || escribiendo) return;
    void enviarTexto(texto);
    setTexto("");
  };

  return (
    <div className="relative h-[880px] w-[420px] rounded-[62px] bg-[#1b1b1f] p-[13px] shadow-[0_30px_70px_rgba(15,43,107,0.35),inset_0_0_0_2px_#3a3a40]">
      {/* Botones laterales del iPhone */}
      <div className="absolute -left-[3px] top-[170px] h-[34px] w-[4px] rounded-l bg-[#2a2a2f]" />
      <div className="absolute -left-[3px] top-[225px] h-[62px] w-[4px] rounded-l bg-[#2a2a2f]" />
      <div className="absolute -left-[3px] top-[300px] h-[62px] w-[4px] rounded-l bg-[#2a2a2f]" />
      <div className="absolute -right-[3px] top-[250px] h-[96px] w-[4px] rounded-r bg-[#2a2a2f]" />

      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[50px] bg-white">
        {/* Barra de estado + isla dinámica */}
        <div className="relative flex h-[50px] shrink-0 items-end justify-between bg-wa-oscuro px-8 pb-1.5 text-white">
          <span className="text-[15px] font-semibold">9:41</span>
          <div className="absolute left-1/2 top-[10px] h-[30px] w-[112px] -translate-x-1/2 rounded-full bg-black" />
          <div className="flex items-center gap-1.5">
            <Signal size={15} strokeWidth={2.5} />
            <Wifi size={15} strokeWidth={2.5} />
            <BatteryFull size={20} strokeWidth={2} />
          </div>
        </div>

        {/* Encabezado del chat */}
        <div className="flex h-[62px] shrink-0 items-center gap-2 bg-wa-oscuro px-2.5 text-white">
          <ArrowLeft size={22} />
          <AvatarEmilia size={38} />
          <div className="ml-1 min-w-0 flex-1 leading-tight">
            <div className="truncate text-[16px] font-semibold">Emilia · Delta Teams</div>
            <div className="text-[12.5px] text-white/80">{escribiendo ? "escribiendo…" : "en línea"}</div>
          </div>
          <Video size={21} className="mx-1.5" />
          <Phone size={19} className="mx-1.5" />
          <MoreVertical size={20} />
        </div>

        {/* Mensajes */}
        <div ref={listaRef} className="fondo-chat scroll-fino flex-1 overflow-y-auto px-3 pb-3 pt-3">
          <div className="mx-auto mb-2 w-fit rounded-md bg-white/90 px-2.5 py-1 text-[11.5px] font-medium uppercase text-gray-500 shadow-sm">
            Hoy
          </div>
          <div className="mx-auto mb-3 flex max-w-[330px] items-start gap-1.5 rounded-lg bg-[#FFF3C4] px-3 py-1.5 text-center text-[11.5px] leading-snug text-[#54656f] shadow-sm">
            <Lock size={11} className="mt-[3px] shrink-0" />
            <span>Emilia es la asistente oficial de Delta Teams en tu empresa. Tus respuestas actualizan tus objetivos.</span>
          </div>

          {mensajes.map((m, i) => (
            <Burbuja key={m.id} m={m} siglas={siglas} primeraDelGrupo={i === 0 || mensajes[i - 1].de !== m.de} />
          ))}

          {escribiendo && (
            <div className="aparecer mt-1 flex w-fit items-center gap-1 rounded-lg rounded-tl-none bg-white px-3.5 py-3 shadow-sm">
              {[0, 1, 2].map((i) => (
                <span key={i} className="punto h-2 w-2 rounded-full bg-gray-400" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          )}
        </div>

        {/* Respuesta sugerida (solo en modo demo sin internet) */}
        {sugerida && !grabadora.grabando && (
          <div className="flex shrink-0 items-center gap-2 bg-[#F0F2F5] px-3 pt-2">
            <span className="text-[11px] font-medium text-gray-500">Sugerida:</span>
            <button
              onClick={() => void enviarTexto(sugerida)}
              className="truncate rounded-full border border-wa/50 bg-white px-3 py-1 text-[12.5px] text-wa-oscuro shadow-sm hover:bg-wa-burbuja"
            >
              {sugerida}
            </button>
          </div>
        )}

        {/* Barra para escribir o grabar */}
        <div className="flex shrink-0 items-end gap-2 bg-[#F0F2F5] px-2.5 pb-7 pt-2">
          {grabadora.grabando ? (
            <div className="flex h-[46px] flex-1 items-center gap-3 rounded-full bg-white px-4 shadow-sm">
              <button onClick={grabadora.cancelar} className="text-gray-500 hover:text-red-500" title="Cancelar">
                <Trash2 size={20} />
              </button>
              <span className="pulso-rojo h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="font-medium tabular-nums text-gray-700">{duracionTexto(grabadora.segundos)}</span>
              <span className="truncate text-[13px] text-gray-400">
                {grabadora.textoEnVivo ? `“${grabadora.textoEnVivo}”` : "Grabando… habla con normalidad"}
              </span>
            </div>
          ) : (
            <div className="flex min-h-[46px] flex-1 items-center gap-2 rounded-full bg-white px-3.5 shadow-sm">
              <Smile size={22} className="shrink-0 text-gray-500" />
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviar()}
                placeholder="Mensaje"
                className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-gray-400"
              />
              <Paperclip size={20} className="shrink-0 -rotate-45 text-gray-500" />
              {!texto && <Camera size={20} className="shrink-0 text-gray-500" />}
            </div>
          )}

          <button
            onClick={grabadora.grabando ? grabadora.detener : texto.trim() ? enviar : grabadora.iniciar}
            disabled={escribiendo && !grabadora.grabando}
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-wa text-white shadow-md transition hover:brightness-95 disabled:opacity-60"
            title={grabadora.grabando ? "Enviar nota de voz" : texto.trim() ? "Enviar" : "Grabar nota de voz"}
          >
            {grabadora.grabando || texto.trim() ? <SendHorizontal size={21} /> : <Mic size={22} />}
          </button>
        </div>
        <div className="absolute bottom-2 left-1/2 h-[5px] w-[135px] -translate-x-1/2 rounded-full bg-black/80" />
      </div>
    </div>
  );
}

function Burbuja({ m, siglas, primeraDelGrupo }: { m: Mensaje; siglas: string; primeraDelGrupo: boolean }) {
  const mio = m.de === "usuario";
  return (
    <div className={`aparecer flex ${mio ? "justify-end" : "justify-start"} ${primeraDelGrupo ? "mt-2.5" : "mt-1"}`}>
      <div
        className={`relative max-w-[86%] rounded-lg px-2.5 pb-1.5 pt-1.5 text-[14.5px] leading-[1.35] text-[#111b21] shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${
          mio ? "bg-wa-burbuja" : "bg-white"
        } ${primeraDelGrupo ? (mio ? "rounded-tr-none" : "rounded-tl-none") : ""}`}
      >
        {primeraDelGrupo && (
          <svg
            className={`absolute top-0 ${mio ? "-right-2" : "-left-2"}`}
            width="8"
            height="13"
            viewBox="0 0 8 13"
            style={{ transform: mio ? "scaleX(-1)" : undefined }}
          >
            <path d="M8 0H1.5C0.2 0-.4 1.6.6 2.4L8 9z" fill={mio ? "#DCF8C6" : "#fff"} />
          </svg>
        )}
        {m.tipo === "audio" ? <NotaDeVoz m={m} siglas={siglas} /> : <span className="whitespace-pre-wrap">{m.texto}</span>}
        <span className={`float-right ml-2 mt-1.5 flex translate-y-0.5 items-center gap-0.5 text-[11px] text-gray-500`}>
          {m.hora}
          {mio && <CheckCheck size={16} className="text-wa-check" />}
        </span>
      </div>
    </div>
  );
}

function NotaDeVoz({ m, siglas }: { m: Mensaje; siglas: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [sonando, setSonando] = useState(false);
  const [avance, setAvance] = useState(0);
  const barras = useMemo(() => {
    let semilla = [...m.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    return Array.from({ length: 30 }, () => {
      semilla = (semilla * 9301 + 49297) % 233280;
      return 5 + (semilla / 233280) * 20;
    });
  }, [m.id]);

  const alternar = () => {
    if (!m.audioUrl) return;
    if (!audioRef.current) {
      const a = new Audio(m.audioUrl);
      a.ontimeupdate = () => setAvance(a.duration && isFinite(a.duration) ? a.currentTime / a.duration : a.currentTime / (m.duracion || 1));
      a.onended = () => {
        setSonando(false);
        setAvance(0);
      };
      audioRef.current = a;
    }
    if (sonando) {
      audioRef.current.pause();
      setSonando(false);
    } else {
      void audioRef.current.play().catch(() => setSonando(false));
      setSonando(true);
    }
  };

  return (
    <div className="w-[262px]">
      <div className="flex items-center gap-2.5 pr-1 pt-0.5">
        <div className="relative">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#4F7B5C] font-display text-[15px] font-bold text-white">
            {siglas}
          </div>
          <Mic size={16} className="absolute -bottom-0.5 -right-1 rounded-full bg-wa-burbuja p-[1px] text-wa-check" />
        </div>
        <button onClick={alternar} disabled={!m.audioUrl} className="text-[#54656f] disabled:opacity-40">
          {sonando ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        <div className="flex flex-1 flex-col">
          <div className="flex h-[28px] items-center gap-[2px]">
            {barras.map((h, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full"
                style={{ height: h, background: i / barras.length <= avance ? "#2E9AD0" : "#8FA49B" }}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-500">{duracionTexto(m.duracion ?? 0)}</span>
        </div>
      </div>
      <div className="mt-1.5 border-t border-black/10 pt-1.5 text-[12.5px] italic leading-snug text-gray-500">
        {m.transcribiendo ? (
          <span className="pulso-rojo not-italic">Transcribiendo…</span>
        ) : m.texto ? (
          `“${m.texto}”`
        ) : (
          "No se pudo transcribir"
        )}
      </div>
    </div>
  );
}
