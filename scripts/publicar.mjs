/**
 * Publica la demo en GitHub Pages: npm run publicar
 * 1. Copia el proyecto a .pages-build/ sin las rutas /api (GitHub Pages no tiene servidor).
 * 2. Arma ahí la versión estática.
 * 3. Sube el resultado a la rama gh-pages del repositorio.
 * Funciona aunque `npm run dev` esté abierto, porque no toca los archivos originales.
 */
import { execSync } from "node:child_process";
import { cpSync, rmSync, writeFileSync } from "node:fs";

const destino = ".pages-build";
const correr = (cmd, opciones = {}) => execSync(cmd, { stdio: "inherit", ...opciones });

rmSync(destino, { recursive: true, force: true });
for (const item of ["src", "public", "package.json", "tsconfig.json", "next.config.ts", "postcss.config.mjs"]) {
  cpSync(item, `${destino}/${item}`, { recursive: true });
}
rmSync(`${destino}/src/app/api`, { recursive: true, force: true });

// node_modules se encuentra en la carpeta de arriba
correr("npx next build", { cwd: destino, env: { ...process.env, PAGES: "1" } });

const salida = `${destino}/out`;
writeFileSync(`${salida}/.nojekyll`, "");
const remoto = execSync("git remote get-url origin").toString().trim();
correr("git init -q -b gh-pages", { cwd: salida });
correr("git add -A", { cwd: salida });
correr('git commit -q -m "Publicar demo"', { cwd: salida });
correr(`git push -q -f ${remoto} gh-pages`, { cwd: salida });
rmSync(destino, { recursive: true, force: true });
console.log("\nListo: la demo quedó publicada en GitHub Pages.");
