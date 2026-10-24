export const runtime = "nodejs";

export async function POST(req: Request) {
  const clave = process.env.OPENAI_API_KEY;
  if (!clave) return Response.json({ texto: null, motivo: "sin-clave" });

  try {
    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof Blob) || audio.size === 0) {
      return Response.json({ texto: null, motivo: "sin-audio" });
    }

    const tipo = audio.type || "audio/webm";
    const extension = tipo.includes("mp4") ? "mp4" : tipo.includes("ogg") ? "ogg" : "webm";
    const envio = new FormData();
    envio.append("file", audio, `nota-de-voz.${extension}`);
    envio.append("model", "gpt-4o-mini-transcribe");
    envio.append("language", "es");
    envio.append("prompt", "Check-in semanal de objetivos en Colombia: ventas, clientes, CRM, tickets, porcentajes.");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}` },
      body: envio,
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) {
      console.error("[transcribir] OpenAI respondió", r.status, await r.text().catch(() => ""));
      return Response.json({ texto: null, motivo: "error" });
    }
    const datos = (await r.json()) as { text?: string };
    return Response.json({ texto: datos.text?.trim() || null });
  } catch (err) {
    console.error("[transcribir] Falló la transcripción:", err instanceof Error ? err.message : err);
    return Response.json({ texto: null, motivo: "error" });
  }
}
