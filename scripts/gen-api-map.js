const fs = require("fs");
const path = require("path");

const ROOT = "C:/Users/Muhammad/Desktop/instagram";
const spec = require(ROOT + "/docs/swagger-v2.json");

/** Every service call site in src/, so "wired?" is measured, not claimed. */
const sources = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (/\.tsx?$/.test(e.name) && !/api\.gen\.ts/.test(e.name))
      sources.push({
        file: path.relative(ROOT, full).replace(/\\/g, "/"),
        text: fs.readFileSync(full, "utf8"),
      });
  }
})(ROOT + "/src");

/** Collect the literal paths each service file calls, mapped to its methods. */
const serviceFiles = sources.filter((s) => /services\/.*\.service\.ts$/.test(s.file));

// Map "METHOD /api/x/y" -> service method name, by finding http.<verb>(`/x/y`) literals.
const wired = new Map();
for (const svc of serviceFiles) {
  const re =
    /(\w+):\s*\([^)]*\)\s*=>\s*(?:\{[\s\S]*?)?http\.(get|post|put|delete|patch)<[^>]*>\(\s*[`"']([^`"']+)[`"']/g;
  let m;
  while ((m = re.exec(svc.text))) {
    const [, method, verb, url] = m;
    // `/posts/${id}/like` -> /api/posts/{id}/like
    const normalized = "/api" + url.replace(/\$\{[^}]+\}/g, "{id}");
    wired.set(`${verb.toUpperCase()} ${normalized}`, { method, file: svc.file });
  }
}

/**
 * Some endpoints are deliberately NOT reachable from a service: the token pair
 * never touches client JS, so refresh / logout / me are called with `fetch` on
 * the server (lib/auth-tokens.ts, the proxy, the session route). Pick those up
 * too, or the map under-reports them as unwired.
 */
const serverCalls = new Map();
for (const s of sources) {
  const re = /fetch\(\s*`\$\{API_URL\}([^`]+)`\s*,\s*\{[\s\S]{0,120}?method:\s*"(\w+)"/g;
  let m;
  while ((m = re.exec(s.text))) {
    serverCalls.set(`${m[2].toUpperCase()} /api${m[1].replace(/\$\{[^}]+\}/g, "{id}")}`, s.file);
  }
  // A fetch without an explicit method is a GET.
  const reGet = /fetch\(\s*`\$\{API_URL\}([^`]+)`\s*,\s*\{\s*headers/g;
  while ((m = reGet.exec(s.text))) {
    serverCalls.set(`GET /api${m[1].replace(/\$\{[^}]+\}/g, "{id}")}`, s.file);
  }
}

/** Does anything outside the service file itself call this method? */
function isCalledFromUi(methodName, serviceFile) {
  return sources.some(
    (s) => s.file !== serviceFile && new RegExp(`\\.${methodName}\\(`).test(s.text),
  );
}

const swaggerToService = (p) => p.replace(/\{[^}]+\}/g, "{id}");

const byTag = {};
let total = 0;
let done = 0;

for (const [p, ops] of Object.entries(spec.paths)) {
  for (const [verb, op] of Object.entries(ops)) {
    const tag = (op.tags || ["-"])[0];
    const key = `${verb.toUpperCase()} ${swaggerToService(p)}`;
    const hit = wired.get(key);
    const server = serverCalls.get(key);
    const ui = hit ? isCalledFromUi(hit.method, hit.file) : Boolean(server);

    (byTag[tag] = byTag[tag] || []).push({
      verb: verb.toUpperCase(),
      path: p,
      summary: op.summary || "",
      service: hit
        ? `${path.basename(hit.file, ".ts").replace(".service", "")}.${hit.method}`
        : server
          ? `${path.basename(server)} (server)`
          : null,
      ui,
    });

    total++;
    if (ui) done++;
  }
}

const lines = [];
lines.push("# API_MAP v2 — новый backend (NestJS), 170 endpoints");
lines.push("");
lines.push(
  "**Swagger:** `https://backend-instagram-kvv4.onrender.com/api/docs-json` → копия в `docs/swagger-v2.json`.",
);
lines.push("");
lines.push(
  "Файл **генерируется**: `node scripts/gen-api-map.js`. Колонки не проставляются вручную —",
);
lines.push(
  "`Сервис` находится по литералу пути в `src/services/*.service.ts`, а `UI` = метод сервиса",
);
lines.push(
  "вызывается хотя бы из одного файла вне самого сервиса. Это проверка проводки, **не** проверка",
);
lines.push("того, что экран работает: БД бэкенда лежит, живьём ни один ответ не сверен.");
lines.push("");
lines.push(`**Покрытие: ${done} / ${total}** endpoint'ов вызываются из UI.`);
lines.push("");

for (const tag of Object.keys(byTag).sort()) {
  const rows = byTag[tag];
  const tagDone = rows.filter((r) => r.ui).length;
  lines.push(`## ${tag} — ${tagDone}/${rows.length}`);
  lines.push("");
  lines.push("| ✓ | Метод | Путь | Сервис | Что делает |");
  lines.push("| - | ----- | ---- | ------ | ---------- |");
  for (const r of rows) {
    lines.push(
      `| ${r.ui ? "[x]" : "[ ]"} | ${r.verb} | \`${r.path.replace("/api", "")}\` | ${r.service ? `\`${r.service}\`` : "—"} | ${r.summary} |`,
    );
  }
  lines.push("");
}

fs.writeFileSync(ROOT + "/docs/API_MAP_V2.md", lines.join("\n") + "\n");
console.log(`API_MAP_V2.md: ${done}/${total} wired`);

for (const tag of Object.keys(byTag).sort()) {
  const rows = byTag[tag];
  console.log(`  ${tag}: ${rows.filter((r) => r.ui).length}/${rows.length}`);
}
