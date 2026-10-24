/**
 * Publica la demo en GitHub Pages: npm run publicar
 * 1. Arma la versión estática (las rutas /api se apartan mientras tanto).
 * 2. Sube la carpeta out/ a la rama gh-pages del repositorio.
 */
import { execSync } from "node:child_process";
import { existsSync, renameSync, rmSync, writeFileSync } from "node:fs";

const api = "src/app/api";
const apartada = "src/app/_api";
const correr = (cmd, opciones = {}) => execSync(cmd, { stdio: "inherit", ...opciones });

if (existsSync(apartada) && !existsSync(api)) renameSync(apartada, api);
rmSync("out", { recursive: true, force: true });
renameSync(api, apartada);
try {
  correr("npx next build", { env: { ...process.env, PAGES: "1" } });
} finally {
  renameSync(apartada, api);
}
writeFileSync("out/.nojekyll", "");

const remoto = execSync("git remote get-url origin").toString().trim();
correr("git init -q -b gh-pages", { cwd: "out" });
correr("git add -A", { cwd: "out" });
correr('git commit -q -m "Publicar demo"', { cwd: "out" });
correr(`git push -q -f ${remoto} gh-pages`, { cwd: "out" });
rmSync("out/.git", { recursive: true, force: true });
console.log("\nListo: la demo quedó publicada en GitHub Pages.");
