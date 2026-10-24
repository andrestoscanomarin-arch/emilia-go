import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { interpretarLocal, type EntradaInterprete } from "@/lib/interprete";
import type { Interpretacion } from "@/lib/tipos";

export const runtime = "nodejs";

const Esquema = z.object({
  objetivo_id: z.string(),
  valor_nuevo: z.number().nullable(),
  comentario: z.string(),
  bloqueos: z.string().nullable(),
  necesita_aclaracion: z.boolean(),
  pregunta_aclaracion: z.string().nullable(),
});

const SISTEMA = `Eres Emilia, la asistente de Delta Teams. Un colaborador te respondió por WhatsApp cómo va UN objetivo (OKR). Convierte su respuesta en datos.

Reglas:
- valor_nuevo es el NUEVO valor TOTAL del objetivo, no el incremento. Si la persona dice cuánto logró solo esta semana en un objetivo acumulable (conteo o dinero), súmalo al valor actual.
- En un objetivo acumulable, si da una cifra MAYOR que el valor actual sin decir si es de esta semana o el total, pide aclaración: necesita_aclaracion = true y una pregunta corta, por ejemplo "¿Las 12 ventas son de esta semana o el total del mes?". Si la cifra es MENOR que el valor actual, asume que es de esta semana.
- Si en el contexto viene "aclaracion_ya_hecha", NO vuelvas a preguntar: decide con lo que tengas (si dice semana, suma; si dice total o mes, es el total).
- Objetivos en porcentaje: el número es el valor actual. Si dice un porcentaje en un objetivo que no es de porcentaje, es el porcentaje de la meta.
- Objetivos que deben bajar (tiempos, costos, quejas): el número es el valor actual.
- Si dice que no avanzó, valor_nuevo = null y necesita_aclaracion = false.
- Si no da ninguna cifra ni dice que no avanzó, pide la cifra con una pregunta corta.
- bloqueos: lo que le impide avanzar, corto y en sus palabras (ej. "el CRM está muy lento"), o null.
- comentario: una frase corta que resuma la respuesta.
- objetivo_id: el id del objetivo preguntado, salvo que hable claramente de otro objetivo de la lista.
- pregunta_aclaracion: español colombiano, cálida, máximo 15 palabras; null si no aplica.`;

export async function POST(req: Request) {
  let entrada: EntradaInterprete;
  try {
    entrada = (await req.json()) as EntradaInterprete;
  } catch {
    return Response.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const local = () => Response.json({ fuente: "local", resultado: interpretarLocal(entrada) });
  if (!process.env.ANTHROPIC_API_KEY) return local();

  try {
    const client = new Anthropic({ timeout: 9000, maxRetries: 0 });
    const o = entrada.objetivo;
    const contexto = {
      colaborador: entrada.nombre,
      objetivo_preguntado: {
        id: o.id,
        titulo: o.titulo,
        tipo: o.tipo,
        unidad: o.unidad,
        meta: o.meta,
        valor_actual: o.actual,
        valor_inicial: o.inicial,
        direccion: o.direccion,
        periodo: o.periodo,
      },
      otros_objetivos: entrada.otros.map((x) => ({ id: x.id, titulo: x.titulo, valor_actual: x.actual, meta: x.meta })),
      aclaracion_ya_hecha: entrada.aclaracion
        ? { pregunta_de_emilia: entrada.aclaracion.pregunta, respuesta_original: entrada.aclaracion.mensajeOriginal }
        : null,
      mensaje: entrada.mensaje,
    };

    const respuesta = await client.messages.parse({
      model: "claude-haiku-5-5",
      max_tokens: 1024,
      thinking: { type: "disabled" },
      system: SISTEMA,
      messages: [{ role: "user", content: JSON.stringify(contexto, null, 2) }],
      output_config: { effort: "low", format: zodOutputFormat(Esquema) },
    });

    const r = respuesta.parsed_output;
    if (!r) return local();
    const resultado: Interpretacion = {
      ...r,
      objetivo_id: [o.id, ...entrada.otros.map((x) => x.id)].includes(r.objetivo_id) ? r.objetivo_id : o.id,
    };
    // Solo se permite UNA pregunta de aclaración por objetivo
    if (entrada.aclaracion && resultado.necesita_aclaracion) {
      resultado.necesita_aclaracion = false;
      resultado.pregunta_aclaracion = null;
    }
    return Response.json({ fuente: "claude", resultado });
  } catch (err) {
    console.error("[interpretar] Claude falló, uso el intérprete local:", err instanceof Error ? err.message : err);
    return local();
  }
}
