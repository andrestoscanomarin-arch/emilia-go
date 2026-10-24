import type { Checkin, Conversacion, EstadoApp, Equipo, Okr, Persona } from "./tipos";

export const EMPRESA = "Andina Distribuciones S.A.S.";
export const GERENTE = { nombre: "Catalina Mejía", cargo: "Gerente general" };
export const SEMANA_ACTUAL = 43;
export const ANIO = 2026;
export const VERSION_DATOS = 3;

/** Objetivo (la "O" del OKR) de cada equipo para el cuarto trimestre */
export const OBJETIVO_EQUIPO: Record<string, string> = {
  ventas: "Crecer las ventas en Antioquia y la Costa en el cuarto trimestre",
  servicio: "Que cada cliente reciba respuesta rápida y una solución en el primer contacto",
  mercadeo: "Llenar el embudo comercial con prospectos de calidad",
};

/** Miércoles de cada semana (W36 a W43 de 2026), como en Delta */
export const SEMANAS = [
  { w: 43, fecha: "21 oct 2026, 13:09" },
  { w: 42, fecha: "14 oct 2026, 13:09" },
  { w: 41, fecha: "7 oct 2026, 13:09" },
  { w: 40, fecha: "30 sept 2026, 13:09" },
  { w: 39, fecha: "23 sept 2026, 13:09" },
  { w: 38, fecha: "16 sept 2026, 13:09" },
  { w: 37, fecha: "9 sept 2026, 13:09" },
  { w: 36, fecha: "2 sept 2026, 13:09" },
];

const equipos: Equipo[] = [
  {
    id: "ventas",
    nombre: "Ventas",
    lider: "Mauricio Restrepo",
    liderCargo: "Director comercial",
    racha: 3,
    avanceSemanaPasada: 0.44,
  },
  {
    id: "servicio",
    nombre: "Servicio al Cliente",
    lider: "Paola Jiménez",
    liderCargo: "Jefe de servicio al cliente",
    racha: 3,
    avanceSemanaPasada: 0.52,
  },
  {
    id: "mercadeo",
    nombre: "Mercadeo",
    lider: "Ricardo Salazar",
    liderCargo: "Gerente de mercadeo",
    racha: 2,
    avanceSemanaPasada: 0.47,
  },
];

const colores = ["#0F2B6B", "#FF7A00", "#1E7F5C", "#7A3FB8", "#C2410C", "#0E7490", "#B91C1C", "#4D7C0F"];

type P = [id: string, nombre: string, apellido: string, cargo: string, equipoId: string];
const listaPersonas: P[] = [
  ["laura", "Laura", "Gómez", "Ejecutiva de ventas", "ventas"],
  ["camilo", "Camilo", "Rodríguez", "Ejecutivo de cuentas clave", "ventas"],
  ["valentina", "Valentina", "Ospina", "Asesora comercial", "ventas"],
  ["andres", "Andrés", "Castaño", "Ejecutivo de ventas", "ventas"],
  ["daniela", "Daniela", "Moreno", "Coordinadora de ventas", "ventas"],
  ["juliana", "Juliana", "Vargas", "Líder de soporte", "servicio"],
  ["santiago", "Santiago", "Herrera", "Agente de servicio", "servicio"],
  ["natalia", "Natalia", "Rojas", "Agente de servicio", "servicio"],
  ["felipe", "Felipe", "Cárdenas", "Analista de calidad", "servicio"],
  ["mariana", "Mariana", "López", "Agente de servicio", "servicio"],
  ["sebastian", "Sebastián", "Torres", "Analista de mercadeo digital", "mercadeo"],
  ["isabella", "Isabella", "Martínez", "Diseñadora de contenido", "mercadeo"],
  ["tomas", "Tomás", "Arango", "Especialista en pauta", "mercadeo"],
  ["sara", "Sara", "Quintero", "Community manager", "mercadeo"],
  ["juandavid", "Juan David", "Pérez", "Analista de CRM", "mercadeo"],
];

const personas: Persona[] = listaPersonas.map(([id, nombre, apellido, cargo, equipoId], i) => ({
  id,
  nombre,
  apellido,
  cargo,
  equipoId,
  email: `${nombre.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.${apellido
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")}@andinadistribuciones.co`,
  color: colores[i % colores.length],
}));

type O = Omit<Okr, "id" | "personaId" | "inicial" | "direccion" | "periodo"> &
  Partial<Pick<Okr, "inicial" | "direccion" | "periodo">>;

const okrsPorPersona: Record<string, [O, O]> = {
  laura: [
    { titulo: "Cerrar 20 ventas nuevas en octubre", nombreCorto: "tu objetivo de ventas", unidad: "ventas", tipo: "conteo", meta: 20, actual: 8 },
    { titulo: "Actualizar el 100% de la cartera de clientes en el CRM", nombreCorto: "la actualización de tu cartera en el CRM", unidad: "%", tipo: "porcentaje", meta: 100, actual: 40 },
  ],
  camilo: [
    { titulo: "Cerrar 15 ventas con cuentas clave", nombreCorto: "tus ventas con cuentas clave", unidad: "ventas", tipo: "conteo", meta: 15, actual: 11 },
    { titulo: "Conseguir 8 clientes nuevos en Antioquia", nombreCorto: "tus clientes nuevos en Antioquia", unidad: "clientes", tipo: "conteo", meta: 8, actual: 5 },
  ],
  valentina: [
    { titulo: "Agendar 25 demostraciones con prospectos", nombreCorto: "tus demostraciones agendadas", unidad: "demos", tipo: "conteo", meta: 25, actual: 11 },
    { titulo: "Llevar la tasa de cierre al 30%", nombreCorto: "tu tasa de cierre", unidad: "%", tipo: "porcentaje", meta: 30, actual: 18, inicial: 0 },
  ],
  andres: [
    { titulo: "Cerrar 18 ventas nuevas en octubre", nombreCorto: "tu objetivo de ventas", unidad: "ventas", tipo: "conteo", meta: 18, actual: 7 },
    { titulo: "Conseguir 10 clientes nuevos en la Costa", nombreCorto: "tus clientes nuevos en la Costa", unidad: "clientes", tipo: "conteo", meta: 10, actual: 4 },
  ],
  daniela: [
    { titulo: "Facturar 450 millones en el trimestre", nombreCorto: "tu meta de facturación", unidad: "millones", tipo: "dinero", meta: 450, actual: 210, periodo: "el trimestre" },
    { titulo: "Renovar 12 contratos que vencen este trimestre", nombreCorto: "las renovaciones de contratos", unidad: "contratos", tipo: "conteo", meta: 12, actual: 5, periodo: "el trimestre" },
  ],
  juliana: [
    { titulo: "Bajar el tiempo de primera respuesta a 10 minutos", nombreCorto: "tu tiempo de primera respuesta", unidad: "min", tipo: "tiempo", meta: 10, actual: 18, inicial: 30, direccion: "bajar" },
    { titulo: "Resolver 300 tickets en octubre", nombreCorto: "los tickets resueltos", unidad: "tickets", tipo: "conteo", meta: 300, actual: 190 },
  ],
  santiago: [
    { titulo: "Llegar a 90% de satisfacción (CSAT)", nombreCorto: "tu satisfacción de clientes", unidad: "%", tipo: "porcentaje", meta: 90, actual: 82, inicial: 0 },
    { titulo: "Resolver 250 tickets en octubre", nombreCorto: "tus tickets resueltos", unidad: "tickets", tipo: "conteo", meta: 250, actual: 160 },
  ],
  natalia: [
    { titulo: "Resolver el 85% de casos en el primer contacto", nombreCorto: "la resolución en primer contacto", unidad: "%", tipo: "porcentaje", meta: 85, actual: 64, inicial: 0 },
    { titulo: "Documentar 20 respuestas frecuentes", nombreCorto: "las respuestas frecuentes documentadas", unidad: "respuestas", tipo: "conteo", meta: 20, actual: 9 },
  ],
  felipe: [
    { titulo: "Auditar 120 conversaciones de servicio", nombreCorto: "las auditorías de conversaciones", unidad: "auditorías", tipo: "conteo", meta: 120, actual: 70 },
    { titulo: "Bajar las quejas repetidas a 5 por semana", nombreCorto: "las quejas repetidas", unidad: "quejas", tipo: "conteo", meta: 5, actual: 9, inicial: 15, direccion: "bajar" },
  ],
  mariana: [
    { titulo: "Bajar el tiempo de resolución a 24 horas", nombreCorto: "tu tiempo de resolución", unidad: "horas", tipo: "tiempo", meta: 24, actual: 36, inicial: 48, direccion: "bajar" },
    { titulo: "Resolver 220 tickets en octubre", nombreCorto: "tus tickets resueltos", unidad: "tickets", tipo: "conteo", meta: 220, actual: 120 },
  ],
  sebastian: [
    { titulo: "Generar 400 leads calificados", nombreCorto: "los leads calificados", unidad: "leads", tipo: "conteo", meta: 400, actual: 230 },
    { titulo: "Bajar el costo por lead a 18 mil pesos", nombreCorto: "el costo por lead", unidad: "mil pesos", tipo: "dinero", meta: 18, actual: 24, inicial: 30, direccion: "bajar" },
  ],
  isabella: [
    { titulo: "Publicar 16 piezas de contenido en octubre", nombreCorto: "las piezas de contenido", unidad: "piezas", tipo: "conteo", meta: 16, actual: 9 },
    { titulo: "Lanzar el nuevo catálogo digital", nombreCorto: "el catálogo digital", unidad: "%", tipo: "porcentaje", meta: 100, actual: 55, inicial: 0 },
  ],
  tomas: [
    { titulo: "Lograr 35% de apertura en correos", nombreCorto: "la apertura de correos", unidad: "%", tipo: "porcentaje", meta: 35, actual: 27, inicial: 0 },
    { titulo: "Lanzar 6 campañas de pauta", nombreCorto: "las campañas de pauta", unidad: "campañas", tipo: "conteo", meta: 6, actual: 3 },
  ],
  sara: [
    { titulo: "Crecer 2.000 seguidores en Instagram", nombreCorto: "los seguidores nuevos", unidad: "seguidores", tipo: "conteo", meta: 2000, actual: 1150 },
    { titulo: "Responder el 100% de mensajes en menos de 1 hora", nombreCorto: "los mensajes respondidos a tiempo", unidad: "%", tipo: "porcentaje", meta: 100, actual: 72, inicial: 0 },
  ],
  juandavid: [
    { titulo: "Limpiar 5.000 registros duplicados del CRM", nombreCorto: "la limpieza del CRM", unidad: "registros", tipo: "conteo", meta: 5000, actual: 2600 },
    { titulo: "Automatizar 4 flujos de seguimiento", nombreCorto: "los flujos automatizados", unidad: "flujos", tipo: "conteo", meta: 4, actual: 2 },
  ],
};

const okrs: Okr[] = Object.entries(okrsPorPersona).flatMap(([personaId, lista]) =>
  lista.map((o, i) => ({
    id: `${personaId}-${i + 1}`,
    personaId,
    inicial: 0,
    direccion: "subir" as const,
    periodo: "octubre" as const,
    ...o,
  })),
);

/** Quiénes ya hicieron su check-in esta semana al empezar la demo */
const yaActualizaron = ["camilo", "juliana", "santiago", "felipe", "sebastian", "sara"];

export function conversacionVacia(): Conversacion {
  return { mensajes: [], paso: { tipo: "inactivo" }, escribiendo: false, bloqueos: [], comentarios: [] };
}

export function estadoInicial(): EstadoApp {
  const checkins: Record<string, Checkin> = {};
  for (const p of personas) {
    checkins[p.id] = yaActualizaron.includes(p.id)
      ? { completado: true, en: Date.now() - 1000 * 60 * 60 * 20, via: "whatsapp", resumen: "Check-in por WhatsApp con Emilia" }
      : { completado: false };
  }
  return {
    version: VERSION_DATOS,
    personas: structuredClone(personas),
    equipos: structuredClone(equipos),
    okrs: structuredClone(okrs),
    checkins,
    conversaciones: {},
    activaId: "laura",
    vista: "yo",
    pestana: "actividad",
    modoSinInternet: false,
  };
}

/** Respuestas preprogramadas para el modo demo sin internet (por objetivo y paso) */
export const RESPUESTAS_GUION: Record<string, { primera: string; aclaracion?: string }> = {
  "laura-1": { primera: "Cerramos 12 ventas", aclaracion: "Son 12 en total en el mes" },
  "laura-2": { primera: "Voy en 70%, pero estoy bloqueada porque el CRM está muy lento" },
};

export function respuestaGuion(okr: Okr, enAclaracion: boolean): string {
  const g = RESPUESTAS_GUION[okr.id];
  if (g) return enAclaracion ? g.aclaracion ?? "En total" : g.primera;
  if (enAclaracion) return "En total";
  const nuevo = valorSimulado(okr, 0);
  if (okr.tipo === "porcentaje") return `Voy en ${nuevo}%`;
  if (okr.direccion === "bajar") return `Ya vamos en ${nuevo} ${okr.unidad}`;
  return `Llevo ${nuevo} ${okr.unidad} en total`;
}

/** Avance creíble para simular a los compañeros */
export function valorSimulado(okr: Okr, i: number): number {
  const factor = [0.12, 0.09, 0.15, 0.1, 0.08][i % 5];
  if (okr.direccion === "bajar") {
    const paso = Math.max(1, Math.round((okr.inicial - okr.meta) * factor));
    return Math.max(okr.meta, okr.actual - paso);
  }
  const paso = Math.max(1, Math.round(okr.meta * factor));
  return Math.min(okr.meta, okr.actual + paso);
}
