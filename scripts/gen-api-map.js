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

const isUiFile = (file) => file.startsWith("src/components/") || file.startsWith("src/app/");

/** The exported function `before` ends inside — the last one declared above it. */
function enclosingExport(before) {
  const matches = [...before.matchAll(/export function (\w+)/g)];
  return matches.at(-1)?.[1] ?? null;
}

/**
 * Is this endpoint reachable **by a user**?
 *
 * "Called outside its own service file" is not enough, and used not to be
 * checked: a hook that calls the service counts as a caller even when no
 * component ever calls the hook — so endpoints with a ready hook and no screen
 * were reported as wired. They are not; nobody can reach them.
 *
 * So: a direct call from components/app counts, and a call from a hook counts
 * only when that hook's exported function is itself used by components/app.
 */
function isCalledFromUi(methodName, serviceFile) {
  // Qualify by the service object, not just the method: `.getRequests(` alone
  // matches BOTH chatService and followService, so chat's requests counted as
  // wired purely because the *follow* hook exists.
  // "src/services/chat.service.ts" -> "chatService".
  const serviceVar = path.basename(serviceFile, ".service.ts").replace(/\..*/, "") + "Service";
  // Whitespace-tolerant: prettier breaks method chains across lines, e.g.
  //   void storyService
  //     .view(id)
  // and a strict `storyService\.view\(` silently misses those.
  const call = new RegExp(`\\b${serviceVar}\\s*\\.\\s*${methodName}\\s*\\(`);

  const callers = sources.filter((s) => s.file !== serviceFile && call.test(s.text));
  if (callers.some((s) => isUiFile(s.file))) return true;

  return callers.some((caller) => {
    const at = caller.text.search(call);
    const hookName = at === -1 ? null : enclosingExport(caller.text.slice(0, at));
    if (!hookName) return false;

    const used = new RegExp(`\\b${hookName}\\b`);
    return sources.some((s) => isUiFile(s.file) && used.test(s.text));
  });
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
  "`Сервис` находится по литералу пути в `src/services/*.service.ts`. `UI` = endpoint **достижим",
);
lines.push(
  "человеком**: вызов идёт из `components`/`app` напрямую, либо через хук, который сам используется",
);
lines.push(
  "в `components`/`app`. Готового хука без экрана **недостаточно** — до такого endpoint'а никто не",
);
lines.push("доберётся, и раньше карта именно это и завышала.");
lines.push("");
lines.push(
  "Это проверка проводки, **не** проверка работоспособности: БД бэкенда лежит, живьём ни один ответ",
);
lines.push("не сверен.");
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
