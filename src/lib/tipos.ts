export type TipoOkr = "conteo" | "porcentaje" | "tiempo" | "dinero";

export interface Okr {
  id: string;
  personaId: string;
  titulo: string;
  /** Palabra para mostrar la cifra: "ventas", "clientes", "%", "min", "millones" */
  unidad: string;
  tipo: TipoOkr;
  meta: number;
  /** Valor con el que arrancó el periodo (sirve para objetivos que deben bajar) */
  inicial: number;
  actual: number;
  direccion: "subir" | "bajar";
  periodo: "octubre" | "el trimestre";
  /** Nombre corto para la pregunta de Emilia: "tu objetivo de ventas" */
  nombreCorto: string;
  actualizadoVia?: "whatsapp";
  actualizadoEn?: number;
}

export interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  cargo: string;
  equipoId: string;
  email: string;
  color: string;
}

export interface Equipo {
  id: string;
  nombre: string;
  lider: string;
  liderCargo: string;
  /** Semanas seguidas en que TODO el equipo actualizó */
  racha: number;
  /** Avance promedio del equipo la semana pasada (para comparar) */
  avanceSemanaPasada: number;
  /** Semana en la que ya se sumó la racha (para no contarla dos veces) */
  semanaContada?: number;
}

export interface Checkin {
  completado: boolean;
  en?: number;
  via?: "whatsapp" | "plataforma";
  bloqueos?: string;
  resumen?: string;
}

export interface Mensaje {
  id: string;
  de: "emilia" | "usuario";
  tipo: "texto" | "audio";
  texto: string;
  hora: string;
  audioUrl?: string;
  duracion?: number;
  transcribiendo?: boolean;
}

export type Paso =
  | { tipo: "inactivo" }
  | {
      tipo: "preguntando";
      okrIndex: number;
      /** Si ya se hizo la única pregunta de aclaración para este objetivo */
      aclaracion?: { pregunta: string; mensajeOriginal: string; bloqueo: string | null };
      yaAclaro: boolean;
    }
  | { tipo: "terminado" };

export interface Conversacion {
  mensajes: Mensaje[];
  paso: Paso;
  escribiendo: boolean;
  bloqueos: string[];
  comentarios: string[];
}

export interface Interpretacion {
  objetivo_id: string;
  valor_nuevo: number | null;
  comentario: string;
  bloqueos: string | null;
  necesita_aclaracion: boolean;
  pregunta_aclaracion: string | null;
}

export type Vista = "inicio" | "yo" | "okrs" | "empresa";
export type Pestana =
  | "actividad"
  | "reuniones"
  | "kpis"
  | "okrs"
  | "objetivos"
  | "responsabilidades";

export interface EstadoApp {
  version: number;
  personas: Persona[];
  equipos: Equipo[];
  okrs: Okr[];
  checkins: Record<string, Checkin>;
  conversaciones: Record<string, Conversacion>;
  activaId: string;
  vista: Vista;
  pestana: Pestana;
  modoSinInternet: boolean;
  /** Efectos visuales momentáneos */
  brilloOkr?: { id: string; t: number };
  celebracion?: { equipoId: string; t: number };
  /** No se guardan: se recalculan al abrir */
  servicios?: { claude: boolean; openai: boolean };
  ultimaFuente?: "claude" | "local";
}
