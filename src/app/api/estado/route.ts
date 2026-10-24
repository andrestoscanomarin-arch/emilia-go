export const dynamic = "force-dynamic";

/** Le dice al navegador qué servicios de IA están activos, sin revelar las claves */
export function GET() {
  return Response.json({
    claude: Boolean(process.env.ANTHROPIC_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
  });
}
