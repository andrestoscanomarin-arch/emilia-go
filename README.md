# Emilia Go · Delta Teams en WhatsApp

> "No le pidas a la gente que vaya a Delta. Lleva a Delta a donde ya está la gente."

Prototipo para la presentación. A la izquierda hay un celular con un chat estilo WhatsApp donde **Emilia** le pregunta a cada persona cómo van sus objetivos. A la derecha está la plataforma **Delta Teams**, que se actualiza sola, en vivo, con cada respuesta. Cada vez que **todo** un equipo actualiza, su **Racha de equipo 🔥** sube.

## 🌐 Link de la demo en la nube

**https://andrestoscanomarin-arch.github.io/emilia-go/**

Ábrelo en Chrome desde cualquier computador, sin instalar nada. Esta versión usa siempre los respaldos (el intérprete local y la voz del navegador), así que no necesita claves y no se cae. Lo que hagas se guarda en ese navegador; para empezar de cero usa ⚙️ → **Reiniciar demo**.

Si cambias algo del código y quieres actualizar el link, abre la terminal en esta carpeta y escribe `npm.cmd run publicar`. En uno o dos minutos el link muestra la versión nueva.

La empresa es ficticia: **Andina Distribuciones S.A.S.**, con 3 equipos (Ventas, Servicio al Cliente y Mercadeo), 5 personas por equipo y 2 OKRs por persona.

---

## 1. Cómo instalarlo (solo la primera vez)

1. Instala **Node.js** (versión 20 o más nueva) desde https://nodejs.org. Escoge la opción "LTS".
2. Abre una terminal **dentro de esta carpeta** (`Innovacion prototipo`). Si la terminal dice otra carpeta, primero escribe:

```bash
cd "D:\GAMES\Innovacion prototipo"
```

3. Escribe esto y presiona Enter:

```bash
npm.cmd install
```

Tarda uno o dos minutos. Solo se hace una vez.

> **¿Por qué `npm.cmd` y no `npm`?** En Windows, PowerShell a veces bloquea `npm` con el error *"No se puede cargar el archivo… npm.ps1 porque la ejecución de scripts está deshabilitada"*. `npm.cmd` es lo mismo y no tiene ese bloqueo.

## 2. Cómo poner las claves (opcional)

**La demo funciona sin claves.** Las claves solo hacen que Emilia sea "más inteligente":

| Clave | Para qué sirve | Si no la pones… |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude (modelo `claude-haiku-5-5`) entiende cualquier forma de responder | Se usa un intérprete local que entiende frases comunes ("cerramos 12", "voy en 60%", "nada esta semana", "estoy bloqueado por…") |
| `OPENAI_API_KEY` | Transcribe las notas de voz con `gpt-4o-mini-transcribe` | Se usa la transcripción del navegador (funciona en **Chrome** o **Edge**) |

Pasos:

1. Copia el archivo `.env.example` y llama a la copia `.env.local`.
2. Ábrelo con el Bloc de notas y pega tus claves después del `=`.
3. Guarda el archivo y vuelve a arrancar la app.

Las claves se quedan en tu computador y solo las usa el servidor. El navegador nunca las ve.

## 3. Cómo correr la demo

```bash
npm.cmd run dev
```

Espera a que diga **Ready** y luego abre **Google Chrome** en http://localhost:3000 y pon el navegador en pantalla completa (tecla **F11**). La pantalla está diseñada para 1920×1080 y se ajusta sola al tamaño de tu pantalla o del proyector.

### El panel de control (botón ⚙️ abajo a la izquierda)

Es un botón gris y discreto. Al abrirlo puedes:

- **¿Con quién habla Emilia?**: escoger al colaborador (por defecto, Laura Gómez, de Ventas).
- **Iniciar check-in semanal**: Emilia manda el primer mensaje.
- **Simular respuestas del resto del equipo**: los compañeros de Laura "responden" uno por uno y la racha se completa con animación.
- **Modo demo sin internet**: todo funciona sin claves y sin conexión. Aparece una "respuesta sugerida" sobre el teclado que puedes tocar. Si grabas una nota de voz y no hay internet para transcribirla, se usa la respuesta del guion.
- **Reiniciar demo**: deja todo como al principio. Hay que tocarlo dos veces para confirmar.

El panel también muestra si Claude y OpenAI están activos o si se están usando los respaldos.

Lo que pasa en la demo se guarda en el navegador: si recargas la página, no se pierde. Solo se borra con "Reiniciar demo".

---

## 4. Guion de demo de 60 segundos

**Antes de presentar:** abre la app, toca ⚙️ → **Reiniciar demo** y cierra el panel. Si no confías en el internet del salón, activa **Modo demo sin internet**.

| Tiempo | Qué haces | Qué dices |
|---|---|---|
| 0–10 s | Señala la pantalla de Delta: semanas en rojo "Pendiente". | "Este es el problema: nadie entra a Delta a actualizar. Todo queda en rojo y el jefe cancela." |
| 10–15 s | ⚙️ → **Iniciar check-in semanal**. | "Con Emilia Go, Delta va a WhatsApp. Emilia le escribe a Laura." |
| 15–25 s | Escribe **Cerramos 12 ventas** (o grábalo como nota de voz). | "Laura responde como le habla a cualquiera. Si algo no es claro, Emilia pregunta una sola vez." |
| 25–32 s | Responde **Son 12 en total en el mes**. | "Y mire la derecha: el objetivo se actualizó solo, 12 de 20, 60%." |
| 32–42 s | Escribe **Voy en 70%, pero estoy bloqueada porque el CRM está muy lento**. | "Además detecta bloqueos y le avisa al líder. Laura terminó su weekly en 30 segundos, sin abrir Delta." |
| 42–52 s | ⚙️ → **Simular respuestas del resto del equipo**. | "Cuando todo el equipo responde, la racha sube: 4 semanas 🔥, y Ventas pasa a ser el equipo #1 del mes." |
| 52–60 s | Toca **Inicio** en la barra de Delta. | "Y el jefe recibe solo esto: quién actualizó, cuánto avanzó el equipo y qué lo está frenando. Información fresca, sin perseguir a nadie." |

Consejo: si no te sientes seguro escribiendo en vivo, activa el modo sin internet y toca las respuestas sugeridas.

---

## 5. Si algo falla durante la presentación

- **"No se puede cargar el archivo npm.ps1"**: usa `npm.cmd run dev` en vez de `npm run dev`.
- **"Another next dev server is already running"**: ya hay una copia abierta. Usa la dirección que aparece en el mensaje o cierra la otra terminal.
- **La página no carga**: revisa que la terminal siga abierta y diga *Ready*. Si la cierras, la app se apaga.

- **El micrófono no funciona o no hay permiso**: Emilia dice "No te escuché bien, ¿me lo escribes?". Escribe la respuesta y sigue.
- **Se cayó el internet**: ⚙️ → activa **Modo demo sin internet**. Todo sigue funcionando.
- **Algo quedó raro**: ⚙️ → **Reiniciar demo** (dos toques).
- **Para usar el micrófono**: usa Chrome o Edge en `http://localhost:3000` y acepta el permiso la primera vez.

---

## 6. Cómo tomar 3 buenas capturas para la presentación

Usa Chrome en pantalla completa (F11) y la herramienta Recortes de Windows (**Windows + Shift + S**).

1. **Chat con audio**
   Reinicia la demo, inicia el check-in y responde la primera pregunta con una **nota de voz** (micrófono verde). Espera a que aparezca la transcripción gris debajo de la onda. Recorta solo el celular, desde el título "Emilia Go" hasta abajo.

2. **Panel actualizado**
   Termina la respuesta de las ventas ("Son 12 en total en el mes"). Apenas Emilia confirme, Delta muestra la pestaña **OKRs** con la tarjeta brillando y la etiqueta verde "Actualizado vía WhatsApp". Toma la captura de **toda la pantalla** en ese momento, para que se vean el chat y el panel juntos.

3. **Racha completa**
   Termina el check-in de Laura y toca **Simular respuestas del resto del equipo**. Cuando aparezca "4 semanas seguidas" con todos los checks verdes y Ventas en el puesto #1 del ranking, toca **Inicio** y recorta la vista del líder: el resumen de Emilia, el equipo y la racha.

Cierra el panel ⚙️ antes de cada captura.

---

## Cómo está hecho (para curiosos)

- En Delta, el menú **Andina Distribuciones** abre el organigrama: gerencia, los 3 equipos con su líder y racha, y cada persona con su estado de la semana. Si tocas a una persona, ves su perfil y Emilia pasa a conversar con ella.

- **Next.js + TypeScript + Tailwind**. Íconos de `lucide-react`. Tipografías Poppins e Inter (de Google Fonts, instaladas dentro del proyecto para que funcionen sin internet).
- `src/lib/datos.ts`: la empresa, los equipos, las personas y los OKRs de ejemplo.
- `src/lib/emilia.ts`: lo que Emilia dice y cómo actualiza Delta.
- `src/lib/interprete.ts`: el intérprete local de respaldo.
- `src/app/api/interpretar`: usa Claude si hay clave y, si no, el intérprete local.
- `src/app/api/transcribir`: usa OpenAI si hay clave.
- `referencia/`: las capturas reales de Delta Teams que se usaron como guía de diseño.
