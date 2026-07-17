# Instagram Clone — Дастур барои Claude Code

## Стек (тағйир надеҳ)

**Next.js 16** (App Router, TypeScript, `src/`) · Tailwind CSS v4 · shadcn/ui ·
TanStack Query v5 (server-state) · Zustand (client-state) · react-hook-form + Zod ·
Axios · next-intl (en / ru / tg) · next-themes (light / dark / system) ·
lucide-react · framer-motion · embla-carousel · react-easy-crop · sonner.

⚠️ Next 16 аст: middleware файлаш **`src/proxy.ts`**, на `middleware.ts`.

Backend: **`https://backend-instagram-a4k6.onrender.com/api`** (NestJS, 190 endpoint) — JWT Bearer.
Ҷавоби API: `{ data, errors, statusCode }` — дар `lib/axios.ts` unwrap мешавад.
Хато танҳо вақте, ки `statusCode >= 400`.

⚠️ Бэкенди кӯҳна `instagram-api.softclub.tj` (57 endpoint) ва `backend-instagram-kvv4`
**дигар кор намекунанд**. Дар код ба онҳо ишора накун.

Токен **танҳо дар httpOnly cookie**. Ҳамаи дархостҳо аз `src/app/api/proxy/[...path]/route.ts`
мегузаранд — Bearer дар СЕРВЕР гузошта мешавад, ба клиент ҳеҷ гоҳ намеравад.

## Ҳуҷҷатҳои проект

Файлҳои **v2** ҳақиқати ҳозираанд; версияи бе `_V2` — таърихи бэкенди кӯҳна, танҳо барои контекст.

- ТЗ: `docs/TZ.md`
- Роадмап: `docs/ROADMAP_V2.md` — **қатъиян аз боло ба поён, ҳар қадами тайёрро `[x]` кун**
- Картаи API (190 endpoint): `docs/API_MAP_V2.md` — **генератсия мешавад**:
  `node scripts/gen-api-map.js`. Дастӣ таҳрир накун.
- DTO-ҳои воқеӣ ва тағйироти шикананда: `docs/API_REAL_DTO.md`
- Қоидаҳои `AGENTS.md` (Next.js docs дар `node_modules/next/dist/docs/`)

## Ду сарчашмаи ҳақиқат — тахмин МАНЪ

### 1. Дизайн → `docs/screenshots/`

Индекс: `docs/screenshots/INDEX.md` — кадом сурат кадом экран аст.

Пеш аз вёрсткаи ҳар экран:

1. `INDEX.md`-ро бихон
2. Файли мувофиқро (мисол `img12.png`) бо **Read tool** кушо ва БУБИН
3. Агар тафсилот ноаён бошад — кропро калон кун (DPR-и суратҳо 1.25)
4. Аз рӯи он верстка кун — фосила, андоза, ранг, тартиб (±2px)

### 2. API → `https://backend-instagram-a4k6.onrender.com/api/docs-json`

- Типҳо **дастӣ навишта намешаванд**: снапшот `docs/swagger-v2.json` → `npm run api:types`
  → `src/types/api.gen.ts`. Барои нав кардани swagger:
  `curl -s <docs-json> -o docs/swagger-v2.json && npm run api:types && npx tsc --noEmit` —
  хатоҳои typecheck маҳз тағйироти шикананда мешаванд.
- Агар Swagger бо ҷавоби **ВОҚЕИИ** API фарқ кунад → **ҷавоби воқеӣ авлотар**
  (дар ин лоиҳа ин қоида дар 8 фаза аз 10 баг гирифт).
- 🔴 Ҳоло санҷидан мумкин НЕСТ: ҳар дархости ба БД тегиста → 500 `DATABASE_ERROR`
  (`register`, `login`, `check-username`). **Ба `/health` бовар накун** — он `database: up`
  мегӯяд, вале дурӯғ аст. Танҳо валидатсия зинда: payload-и бад → 400 бо рӯйхати майдонҳо.
- Тағйироти шикананда ва домҳои codegen-ро дар `docs/API_REAL_DTO.md` сабт кун

## Қоидаҳои дизайн

- HEX-и hardcode манъ — фақат CSS-токенҳо аз `src/app/globals.css`
- Бари лента 470px · sidebar 244px (collapsed 73px, hover → expand) · mobile nav 48px
- Light ва Dark — ҳар ду ҳатмӣ, бе «мигание» ҳангоми боркунӣ
- Брейкпоинтҳо: <768px mobile · 768–1264px sidebar collapsed · >1264px + RightSidebar

## Қоидаҳои код

- TypeScript strict, `any` манъ
- 1 сервис = 1 тег Swagger (`src/services/*.service.ts`)
- Server-state → TanStack Query · client-state (theme, modal, chat draft) → Zustand
- Валидация → Zod (`src/lib/validators/*.schema.ts`)
- Ҳар экран 3 ҳолат: loading (skeleton) / empty / error
- Optimistic UI: like, save, follow, send-message (+ rollback ҳангоми хато)
- Матни hardcode манъ — ҳама сатр аз `messages/{en,ru,tg}.json` (next-intl)

## Тартиби кор

- Дар як сессия — **як фаза** аз ROADMAP
- Пеш аз оғози фаза нақшаро ба ман нишон деҳ
- Баъд аз кор: **Playwright-скриншот гир ва ХУДАТ бубин** (dark + light + /ru), на танҳо тахмин
- Дар охир: `npm run build` + `lint` + `typecheck` → баъд ROADMAP `[x]` + API_MAP `[x]`
- Ҳисобот деҳ: чӣ сохта шуд, кадом DTO аз ТЗ фарқ кард, чӣ нотамом монд
