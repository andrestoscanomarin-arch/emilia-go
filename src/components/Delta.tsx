"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  ChevronsUpDown,
  CircleCheck,
  CircleHelp,
  Clock,
  Filter,
  Globe,
  House,
  Mail,
  MessageCircle,
  PanelLeft,
  PencilLine,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { actualizar, useEstado } from "@/lib/store";
import { ANIO, EMPRESA, GERENTE, OBJETIVO_EQUIPO, SEMANAS, SEMANA_ACTUAL } from "@/lib/datos";
import { iniciales, nombreCompleto, numero, pct, progreso } from "@/lib/formatos";
import type { EstadoApp, Okr, Pestana, Persona, Vista } from "@/lib/tipos";
import { RachaEquipo, RankingEquipos, estadoEquipo } from "./Racha";
import { cambiarPersona } from "@/lib/emilia";
import { AvatarEmilia } from "./Telefono";

export default function Delta() {
  const s = useEstado();
  const persona = s.personas.find((p) => p.id === s.activaId)!;
  const titulo: Record<Vista, string> = {
    inicio: "Inicio · Vista del líder",
    yo: "Perfil del colaborador",
    okrs: "OKRs de la empresa",
    empresa: "Andina Distribuciones · Organigrama",
  };

  return (
    <div className="flex h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(15,43,107,0.10)]">
      <BarraLateral s={s} persona={persona} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-gray-200 px-5">
          <PanelLeft size={18} className="text-gray-600" />
          <span className="text-[15px] text-gray-600">{titulo[s.vista]}</span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11.5px] font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Emilia Go conectado a WhatsApp
          </span>
          <CircleHelp size={18} className="ml-3 text-gray-700" />
          <Globe size={18} className="text-gray-700" />
        </header>
        <div className="min-h-0 flex-1 bg-[#FBFBFC] p-3">
          {s.vista === "yo" && <VistaPerfil s={s} persona={persona} />}
          {s.vista === "inicio" && <VistaLider s={s} equipoInicial={persona.equipoId} />}
          {s.vista === "okrs" && <VistaOkrs s={s} />}
          {s.vista === "empresa" && <VistaEmpresa s={s} />}
        </div>
      </div>
    </div>
  );
}

function LogoDelta() {
  return (
    <div className="flex items-center gap-2">
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
        <path d="M16 3 4 29h5.2L16 13.5 22.8 29H28L16 3Z" fill="#1A4FD0" />
        <path d="M11.5 23.5h9" stroke="#171B33" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/delta-logo.png`} alt="Delta Teams" className="h-[17px]" />
    </div>
  );
}

function BarraLateral({ s, persona }: { s: EstadoApp; persona: Persona }) {
  const ir = (vista: Vista) =>
    actualizar((st) => {
      st.vista = vista;
    });
  const item = (activo: boolean) =>
    `flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[14px] text-gray-800 ${
      activo ? "bg-gray-200/70 font-medium" : "hover:bg-gray-100"
    }`;
  return (
    <aside className="flex w-[212px] shrink-0 flex-col border-r border-gray-200 bg-[#FAFAFA]">
      <div className="px-4 pb-5 pt-5">
        <LogoDelta />
      </div>
      <div className="px-2">
        <div className="px-2.5 pb-1.5 text-[12px] font-medium text-gray-500">Principal</div>
        <button className={item(s.vista === "inicio")} onClick={() => ir("inicio")}>
          <House size={17} /> Inicio
        </button>
        <button className={item(s.vista === "yo")} onClick={() => ir("yo")}>
          <span className="flex w-[17px] justify-center text-[11px] font-semibold">{persona.nombre[0]}</span> Yo
        </button>
        <button className={item(s.vista === "empresa")} onClick={() => ir("empresa")}>
          <span className="flex h-[17px] w-[17px] items-center justify-center rounded-sm bg-navy text-[9px] font-bold text-white">
            AD
          </span>
          <span className="flex-1 truncate">Andina Distribuciones</span>
          <ChevronRight size={16} />
        </button>
        <button className={item(s.vista === "okrs")} onClick={() => ir("okrs")}>
          <Target size={17} /> OKRs
        </button>
      </div>
      <div className="mt-auto flex items-center gap-2.5 border-t border-gray-200 px-4 py-3.5">
        <span className="text-[12px] font-semibold">{persona.nombre[0]}</span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[14px] font-semibold">{persona.nombre}</div>
          <div className="truncate text-[12px] text-gray-500">{persona.email}</div>
        </div>
        <ChevronsUpDown size={15} className="text-gray-500" />
      </div>
    </aside>
  );
}

/* ---------------------------- Perfil del colaborador ---------------------------- */

const PESTANAS: [Pestana, string][] = [
  ["actividad", "Actividad"],
  ["reuniones", "Reuniones"],
  ["kpis", "KPIs"],
  ["okrs", "OKRs"],
  ["objetivos", "Objetivos y tareas"],
];

function VistaPerfil({ s, persona }: { s: EstadoApp; persona: Persona }) {
  const equipo = s.equipos.find((e) => e.id === persona.equipoId)!;
  return (
    <div className="flex h-full gap-3">
      {/* Tarjeta del perfil, como en Delta */}
      <div className="w-[222px] shrink-0 rounded-xl border border-gray-200 bg-white px-5 py-6">
        <div className="flex flex-col items-center">
          <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-gray-100 text-[34px] font-medium text-gray-800">
            {iniciales(persona)}
          </div>
          <div className="mt-4 text-center text-[15px] font-semibold">{nombreCompleto(persona)}</div>
          <div className="mt-0.5 text-center text-[12.5px] text-gray-500">{persona.cargo}</div>
          <button className="mt-3 rounded-md border border-gray-200 p-1.5 text-gray-600">
            <Mail size={15} />
          </button>
        </div>
        <Seccion titulo="Equipos">
          <span className="rounded-md bg-navy/8 px-2 py-0.5 text-[13px] font-medium text-navy">{equipo.nombre}</span>
        </Seccion>
        <Seccion titulo="Líderes">
          <div className="flex items-center gap-2 text-[13px] text-gray-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold">
              {equipo.lider
                .split(" ")
                .map((x) => x[0])
                .join("")}
            </span>
            <span className="leading-tight">
              {equipo.lider}
              <span className="block text-[11px] text-gray-500">{equipo.liderCargo}</span>
            </span>
          </div>
        </Seccion>
        <Seccion titulo="Información Personal" icono={<PencilLine size={14} className="text-gray-500" />}>
          <div className="flex flex-col gap-2 text-[13px] text-gray-700">
            <span className="flex items-center gap-2">
              <Globe size={14} /> Español
            </span>
            <span className="flex items-center gap-2">
              <Clock size={14} /> America/Bogota
            </span>
          </div>
        </Seccion>
        <Seccion titulo="Etiquetas">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md bg-naranja/10 px-2 py-0.5 text-[12px] font-medium text-naranja">Emilia Go</span>
            <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[12px] font-medium text-green-700">
              <MessageCircle size={11} /> WhatsApp activo
            </span>
          </div>
        </Seccion>
      </div>

      {/* Contenido con pestañas */}
      <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-0.5 px-3 pt-3.5">
          {PESTANAS.map(([id, nombre]) => (
            <button
              key={id}
              onClick={() =>
                actualizar((st) => {
                  st.pestana = id;
                })
              }
              className={`whitespace-nowrap rounded-lg px-2 py-1.5 text-[13px] font-semibold transition ${
                s.pestana === id ? "bg-[#18181B] text-white" : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              {nombre}
            </button>
          ))}
          <div className="ml-auto flex gap-1.5 pl-2">
            <button className="flex items-center whitespace-nowrap rounded-lg border border-gray-200 px-2.5 py-1.5 text-[13px] font-medium" title="Filtros">
              <Filter size={15} />
            </button>
            <button className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#18181B] px-3 py-1.5 text-[13px] font-semibold text-white">
              <Plus size={15} /> Nueva actividad
            </button>
          </div>
        </div>
        <div className="scroll-fino min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3">
          {s.pestana === "actividad" && <Actividad s={s} persona={persona} />}
          {s.pestana === "okrs" && <OkrsPersona s={s} persona={persona} />}
          {s.pestana === "kpis" && <Kpis s={s} persona={persona} />}
          {s.pestana === "reuniones" && <Reuniones s={s} persona={persona} />}
          {s.pestana === "objetivos" && <Vacio texto="No hay tareas asignadas para esta semana" />}
        </div>
      </div>

      {/* Columna de la racha */}
      <div className="scroll-fino flex w-[282px] shrink-0 flex-col gap-3 overflow-y-auto">
        <RachaEquipo s={s} equipoId={persona.equipoId} />
        <RankingEquipos s={s} resaltar={persona.equipoId} />
      </div>
    </div>
  );
}

function Seccion({ titulo, icono, children }: { titulo: string; icono?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between text-[13px] font-semibold text-gray-600">
        {titulo}
        {icono}
      </div>
      {children}
    </div>
  );
}

function Vacio({ texto }: { texto: string }) {
  return <div className="py-16 text-center text-[14px] text-gray-500">{texto}</div>;
}

function semanasCompletas(s: EstadoApp, persona: Persona) {
  const eq = s.equipos.find((e) => e.id === persona.equipoId)!;
  // Semanas anteriores que el equipo ya tenía al día (la racha previa a esta semana)
  const rachaPrevia = eq.racha - (eq.semanaContada === SEMANA_ACTUAL ? 1 : 0);
  return (w: number) => w < SEMANA_ACTUAL && w >= SEMANA_ACTUAL - rachaPrevia;
}

function Actividad({ s, persona }: { s: EstadoApp; persona: Persona }) {
  const previaCompleta = semanasCompletas(s, persona);
  const checkin = s.checkins[persona.id];
  return (
    <div className="flex flex-col gap-2.5">
      {SEMANAS.map(({ w, fecha }) => {
        const actual = w === SEMANA_ACTUAL;
        const completa = actual ? checkin?.completado : previaCompleta(w);
        return (
          <div
            key={`${w}-${actual && completa ? checkin?.en : "x"}`}
            className={`relative rounded-lg border border-l-4 border-gray-200 border-l-[#16A34A] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
              actual && completa ? "brillo-verde" : ""
            }`}
          >
            <div className="flex items-center gap-2 text-[13.5px] font-semibold">
              <CalendarDays size={15} className="text-[#16A34A]" />
              W{w} {ANIO} Weekly - Semanal miercoles
              {completa && (
                <span className="ml-1 flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                  <MessageCircle size={11} /> vía WhatsApp con Emilia
                </span>
              )}
            </div>
            {completa ? (
              <div className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-[#16A34A]">
                Completada <CircleCheck size={14} />
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-[#DC2626]">
                Pendiente <CircleHelp size={14} />
              </div>
            )}
            {actual && completa && checkin?.resumen && (
              <div className="mt-2 rounded-md bg-fondo px-3 py-2 text-[12.5px] leading-snug text-gray-700">
                {checkin.resumen}
                {checkin.bloqueos && (
                  <div className="mt-1 flex items-start gap-1.5 font-medium text-[#B45309]">
                    <AlertTriangle size={13} className="mt-[2px] shrink-0" /> Bloqueo: {checkin.bloqueos}
                  </div>
                )}
              </div>
            )}
            <div className="mt-2.5 flex items-center gap-1.5 text-[12px] text-gray-500">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-[7px] font-bold text-gray-700">
                {iniciales(persona)}
              </span>
              {nombreCompleto(persona)} • {fecha}
            </div>
            <button className="absolute bottom-3 right-3 rounded-md border border-red-100 p-1.5 text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function TarjetaOkr({ o, brillo, grande = true }: { o: Okr; brillo?: number; grande?: boolean }) {
  const p = progreso(o);
  const reciente = o.actualizadoVia === "whatsapp";
  return (
    <div
      key={brillo ?? "quieto"}
      className={`rounded-xl border border-gray-200 bg-white ${grande ? "p-5" : "p-3.5"} shadow-[0_2px_8px_rgba(15,43,107,0.05)] ${
        brillo ? "brillo" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gris">Resultado clave · Q4 {ANIO}</div>
          <div className={`mt-1 font-semibold text-navy ${grande ? "text-[16px]" : "text-[13.5px]"}`}>{o.titulo}</div>
        </div>
        {reciente && (
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700 ${
              grande ? "text-[11.5px]" : "text-[10.5px]"
            } ${brillo ? "aparecer" : ""}`}
          >
            <MessageCircle size={12} /> Actualizado vía WhatsApp
          </span>
        )}
      </div>
      <div className={`flex items-end justify-between ${grande ? "mt-4" : "mt-2.5"}`}>
        <span className={`font-display font-bold text-naranja ${grande ? "text-[28px]" : "text-[18px]"}`}>
          {o.unidad === "%" ? `${numero(o.actual)}%` : numero(o.actual)}
          <span className={`ml-1.5 font-sans font-medium text-gris ${grande ? "text-[14px]" : "text-[12px]"}`}>
            {o.unidad === "%"
              ? `de ${numero(o.meta)}%`
              : o.direccion === "bajar"
                ? `${o.unidad} · meta ${numero(o.meta)}`
                : `de ${numero(o.meta)} ${o.unidad}`}
          </span>
        </span>
        <span className={`font-display font-bold text-navy ${grande ? "text-[20px]" : "text-[14px]"}`}>{pct(p)}</span>
      </div>
      <div className={`overflow-hidden rounded-full bg-fondo ${grande ? "mt-2 h-3" : "mt-1.5 h-2"}`}>
        <div
          className="barra-progreso h-full rounded-full bg-gradient-to-r from-navy to-naranja"
          style={{ width: `${Math.max(3, p * 100)}%` }}
        />
      </div>
    </div>
  );
}

function OkrsPersona({ s, persona }: { s: EstadoApp; persona: Persona }) {
  const okrs = s.okrs.filter((o) => o.personaId === persona.id);
  const conv = s.conversaciones[persona.id];
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[13px] text-gray-500">
        Objetivo del equipo: <span className="font-semibold text-navy">{OBJETIVO_EQUIPO[persona.equipoId]}</span>
      </div>
      {okrs.map((o) => (
        <TarjetaOkr key={o.id} o={o} brillo={s.brilloOkr?.id === o.id ? s.brilloOkr.t : undefined} />
      ))}
      {conv && conv.bloqueos.length > 0 && (
        <div className="aparecer flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          <AlertTriangle size={16} className="mt-[1px] shrink-0" />
          <span>
            <b>Bloqueo reportado a Emilia:</b> {conv.bloqueos.join(" · ")} — notificado al líder.
          </span>
        </div>
      )}
    </div>
  );
}

function Kpis({ s, persona }: { s: EstadoApp; persona: Persona }) {
  const okrs = s.okrs.filter((o) => o.personaId === persona.id);
  const avance = okrs.reduce((a, o) => a + progreso(o), 0) / okrs.length;
  const previa = semanasCompletas(s, persona);
  const aTiempo = SEMANAS.filter(({ w }) => (w === SEMANA_ACTUAL ? s.checkins[persona.id]?.completado : previa(w))).length;
  const eq = s.equipos.find((e) => e.id === persona.equipoId)!;
  const tarjetas = [
    { t: "Avance promedio de OKRs", v: pct(avance) },
    { t: "Weeklies al día (últimas 8)", v: `${aTiempo} de ${SEMANAS.length}` },
    { t: "Racha del equipo", v: `🔥 ${eq.racha}` },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {tarjetas.map((k) => (
        <div key={k.t} className="rounded-xl border border-gray-200 p-4">
          <div className="text-[12px] text-gris">{k.t}</div>
          <div className="mt-1 font-display text-[26px] font-bold text-navy">{k.v}</div>
        </div>
      ))}
    </div>
  );
}

function Reuniones({ s, persona }: { s: EstadoApp; persona: Persona }) {
  const eq = s.equipos.find((e) => e.id === persona.equipoId)!;
  const lista = [
    { t: `1:1 con ${eq.lider}`, f: "jueves 29 oct 2026, 9:00 a. m." },
    { t: `Weekly de ${eq.nombre}`, f: "miércoles 28 oct 2026, 8:00 a. m." },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      {lista.map((r) => (
        <div key={r.t} className="rounded-lg border border-l-4 border-gray-200 border-l-cyan-600 px-4 py-3">
          <div className="text-[13.5px] font-semibold">{r.t}</div>
          <div className="mt-1 text-[12px] text-gray-500">{r.f}</div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- Vista Líder --------------------------------- */

function VistaLider({ s, equipoInicial }: { s: EstadoApp; equipoInicial: string }) {
  const [equipoId, setEquipoId] = useState(equipoInicial);
  const eq = s.equipos.find((e) => e.id === equipoId)!;
  const { miembros, listos, total } = estadoEquipo(s, equipoId);
  const okrs = s.okrs.filter((o) => miembros.some((m) => m.id === o.personaId));
  const avance = okrs.reduce((a, o) => a + progreso(o), 0) / okrs.length;
  const diferencia = Math.round((avance - eq.avanceSemanaPasada) * 100);
  const actualizaron = miembros.filter((m) => s.checkins[m.id]?.completado);
  const faltan = miembros.filter((m) => !s.checkins[m.id]?.completado);
  const bloqueos = miembros.flatMap((m) =>
    (s.conversaciones[m.id]?.bloqueos ?? []).map((b) => `${m.nombre}: ${b}`),
  );

  return (
    <div className="flex h-full gap-3">
      <div className="scroll-fino flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-[22px] font-bold text-navy">Hola, {eq.lider.split(" ")[0]} 👋</h2>
            <p className="text-[13px] text-gris">
              {eq.liderCargo} · Semana W{SEMANA_ACTUAL} de {ANIO}
            </p>
          </div>
          <div className="flex gap-1 rounded-lg bg-fondo p-1">
            {s.equipos.map((e) => (
              <button
                key={e.id}
                onClick={() => setEquipoId(e.id)}
                className={`rounded-md px-3 py-1.5 text-[13px] font-semibold ${
                  e.id === equipoId ? "bg-white text-navy shadow-sm" : "text-gray-500"
                }`}
              >
                {e.nombre}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-navy/15 bg-gradient-to-br from-navy/[0.04] to-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <AvatarEmilia size={34} />
            <div>
              <div className="text-[15px] font-bold text-navy">Resumen semanal de Emilia</div>
              <div className="text-[12px] text-gris">Se arma solo con lo que el equipo respondió por WhatsApp</div>
            </div>
          </div>
          <ul className="mt-3.5 flex flex-col gap-2.5 text-[14px] leading-snug text-gray-800">
            <li className="flex gap-2.5">
              <Users size={18} className="mt-[1px] shrink-0 text-navy" />
              <span>
                <b>
                  Actualizaron {listos} de {total}
                </b>
                {actualizaron.length > 0 && `: ${actualizaron.map((m) => m.nombre).join(", ")}.`}
                {faltan.length > 0 ? ` Falta${faltan.length > 1 ? "n" : ""}: ${faltan.map((m) => m.nombre).join(", ")}.` : " ¡Equipo completo! 🔥"}
              </span>
            </li>
            <li className="flex gap-2.5">
              <TrendingUp size={18} className="mt-[1px] shrink-0 text-naranja" />
              <span>
                <b>Avance general: {pct(avance)}</b> en los OKRs del equipo ({diferencia >= 0 ? "+" : ""}
                {diferencia} puntos frente a la semana pasada).
              </span>
            </li>
            <li className="flex gap-2.5">
              <AlertTriangle size={18} className={`mt-[1px] shrink-0 ${bloqueos.length ? "text-amber-600" : "text-green-600"}`} />
              <span>
                {bloqueos.length ? (
                  <>
                    <b>Bloqueos ({bloqueos.length}):</b> {bloqueos.join(" · ")}.
                  </>
                ) : (
                  <>
                    <b>Sin bloqueos</b> reportados esta semana.
                  </>
                )}
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-3 text-[14px] font-bold text-navy">Equipo de {eq.nombre}</div>
          {miembros.map((m) => {
            const suyos = s.okrs.filter((o) => o.personaId === m.id);
            const av = suyos.reduce((a, o) => a + progreso(o), 0) / suyos.length;
            const ok = s.checkins[m.id]?.completado;
            return (
              <div key={m.id} className="flex items-center gap-3 border-b border-gray-50 px-5 py-2.5 last:border-0">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: m.color }}
                >
                  {iniciales(m)}
                </span>
                <div className="w-[190px] leading-tight">
                  <div className="text-[13.5px] font-semibold">{nombreCompleto(m)}</div>
                  <div className="text-[11.5px] text-gray-500">{m.cargo}</div>
                </div>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-fondo">
                    <div className="barra-progreso h-full rounded-full bg-gradient-to-r from-navy to-naranja" style={{ width: `${av * 100}%` }} />
                  </div>
                </div>
                <span className="w-[42px] text-right font-display text-[13px] font-bold text-navy">{pct(av)}</span>
                <span
                  className={`flex w-[118px] items-center justify-end gap-1 text-[12px] font-semibold ${
                    ok ? "text-[#16A34A]" : "text-[#DC2626]"
                  }`}
                >
                  {ok ? (
                    <>
                      Completada <CircleCheck size={13} />
                    </>
                  ) : (
                    <>
                      Pendiente <CircleHelp size={13} />
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="scroll-fino flex w-[282px] shrink-0 flex-col gap-3 overflow-y-auto">
        <RachaEquipo s={s} equipoId={equipoId} />
        <RankingEquipos s={s} resaltar={equipoId} />
      </div>
    </div>
  );
}

/* ---------------------------------- OKRs ---------------------------------- */

function VistaOkrs({ s }: { s: EstadoApp }) {
  return (
    <div className="scroll-fino h-full overflow-y-auto">
      <div className="grid grid-cols-3 gap-3">
        {s.equipos.map((e) => {
          const miembros = s.personas.filter((p) => p.equipoId === e.id);
          return (
            <div key={e.id} className="flex flex-col gap-2.5 rounded-xl border border-gray-200 bg-white p-3.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[15px] font-bold text-navy">{e.nombre}</h3>
                <span className="font-display text-[14px] font-bold text-naranja">🔥 {e.racha}</span>
              </div>
              {miembros.map((m) => (
                <div key={m.id}>
                  <div className="mb-1 px-1 text-[12px] font-semibold text-gray-600">{nombreCompleto(m)}</div>
                  <div className="flex flex-col gap-1.5">
                    {s.okrs
                      .filter((o) => o.personaId === m.id)
                      .map((o) => (
                        <TarjetaOkr key={o.id} o={o} grande={false} brillo={s.brilloOkr?.id === o.id ? s.brilloOkr.t : undefined} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Organigrama ------------------------------ */

function VistaEmpresa({ s }: { s: EstadoApp }) {
  const total = s.personas.length;
  const alDia = s.personas.filter((p) => s.checkins[p.id]?.completado).length;
  const avance = s.okrs.reduce((a, o) => a + progreso(o), 0) / s.okrs.length;

  return (
    <div className="scroll-fino flex h-full flex-col gap-3 overflow-y-auto">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy font-display text-[15px] font-bold text-white">
            AD
          </span>
          <div>
            <h2 className="text-[20px] font-bold text-navy">{EMPRESA}</h2>
            <p className="text-[13px] text-gris">Distribución de productos de consumo · Bogotá, Medellín y Barranquilla</p>
          </div>
        </div>
        <div className="flex gap-6 text-right">
          {[
            { t: "Colaboradores", v: String(total + s.equipos.length + 1) },
            { t: "Al día esta semana", v: `${alDia} de ${total}` },
            { t: "Avance OKRs empresa", v: pct(avance) },
          ].map((k) => (
            <div key={k.t}>
              <div className="font-display text-[22px] font-bold text-navy">{k.v}</div>
              <div className="text-[11.5px] text-gris">{k.t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white px-6 pb-6 pt-5">
        <div className="mb-4 text-[14px] font-bold text-navy">Organigrama</div>

        {/* Gerencia */}
        <div className="flex justify-center">
          <div className="w-[260px] rounded-xl border-2 border-navy bg-navy px-4 py-3 text-center text-white shadow-md">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Gerencia general</div>
            <div className="mt-0.5 text-[15px] font-bold">{GERENTE.nombre}</div>
            <div className="text-[12px] text-white/80">{GERENTE.cargo}</div>
          </div>
        </div>

        {/* Líneas de conexión */}
        <div className="mx-auto h-5 w-px bg-gray-300" />
        <div className="mx-[16.66%] h-5 border-x border-t border-gray-300" />

        <div className="grid grid-cols-3 gap-5">
          {s.equipos.map((e) => {
            const { miembros, listos, total: n } = estadoEquipo(s, e.id);
            return (
              <div key={e.id} className="flex flex-col items-center">
                <div className="w-full rounded-xl border border-gray-200 bg-fondo px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[14.5px] font-bold text-navy">{e.nombre}</span>
                    <span className="font-display text-[13px] font-bold text-naranja">🔥 {e.racha}</span>
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-gray-800">{e.lider}</div>
                  <div className="text-[11.5px] text-gray-500">{e.liderCargo}</div>
                  <div className={`mt-1.5 text-[11.5px] font-semibold ${listos === n ? "text-green-700" : "text-gris"}`}>
                    {listos} de {n} al día esta semana
                  </div>
                </div>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex w-full flex-col gap-1.5">
                  {miembros.map((m) => {
                    const ok = s.checkins[m.id]?.completado;
                    return (
                      <button
                        key={m.id}
                        onClick={() => cambiarPersona(m.id)}
                        title="Ver perfil y conversar con Emilia"
                        className={`flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2 text-left transition hover:border-navy/40 hover:shadow-sm ${
                          m.id === s.activaId ? "border-naranja" : "border-gray-200"
                        }`}
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ background: m.color }}
                        >
                          {iniciales(m)}
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block truncate text-[13px] font-semibold">{nombreCompleto(m)}</span>
                          <span className="block truncate text-[11.5px] text-gray-500">{m.cargo}</span>
                        </span>
                        {ok ? (
                          <CircleCheck size={16} className="shrink-0 text-green-600" />
                        ) : (
                          <CircleHelp size={16} className="shrink-0 text-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-[11.5px] text-gris">
          Toca a una persona para ver su perfil. Emilia pasará a conversar con ella en el celular.
        </p>
      </div>
    </div>
  );
}
