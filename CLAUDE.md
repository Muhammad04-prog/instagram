# Instagram Clone — Дастур барои Claude Code

## Стек (тағйир надеҳ)

**Next.js 16** (App Router, TypeScript, `src/`) · Tailwind CSS v4 · shadcn/ui ·
TanStack Query v5 (server-state) · Zustand (client-state) · react-hook-form + Zod ·
Axios · next-intl (en / ru / tg) · next-themes (light / dark / system) ·
lucide-react · framer-motion · embla-carousel · react-easy-crop · sonner.

⚠️ Next 16 аст: middleware файлаш **`src/proxy.ts`**, на `middleware.ts`.

Backend: `https://instagram-api.softclub.tj` — JWT Bearer.
Ҷавоби API: `{ data, errors, statusCode }` — дар `lib/axios.ts` unwrap мешавад.
Хато танҳо вақте, ки `statusCode >= 400` (бэкенд баъзан `errors: ["success"]` медиҳад).

Токен **танҳо дар httpOnly cookie**. Ҳамаи дархостҳо аз `src/app/api/proxy/[...path]/route.ts`
мегузаранд — Bearer дар СЕРВЕР гузошта мешавад, ба клиент ҳеҷ гоҳ намеравад.

## Ҳуҷҷатҳои проект

- ТЗ: `docs/TZ.md`
- Роадмап: `docs/ROADMAP.md` — **қатъиян аз боло ба поён, ҳар қадами тайёрро `[x]` кун**
- Картаи API (57 endpoint): `docs/API_MAP.md` — ҳар endpoint бояд 100% дар UI кор кунад
- DTO-ҳои воқеӣ: `docs/API_REAL_DTO.md`
- Қоидаҳои `AGENTS.md` (Next.js docs дар `node_modules/next/dist/docs/`)

## Ду сарчашмаи ҳақиқат — тахмин МАНЪ

### 1. Дизайн → `docs/screenshots/`

Индекс: `docs/screenshots/INDEX.md` — кадом сурат кадом экран аст.

Пеш аз вёрсткаи ҳар экран:

1. `INDEX.md`-ро бихон
2. Файли мувофиқро (мисол `img12.png`) бо **Read tool** кушо ва БУБИН
3. Агар тафсилот ноаён бошад — кропро калон кун (DPR-и суратҳо 1.25)
4. Аз рӯи он верстка кун — фосила, андоза, ранг, тартиб (±2px)

### 2. API → `https://instagram-api.softclub.tj/swagger/v1/swagger.json`

- Пеш аз навиштани сервис Swagger-ро гир — майдонҳои дақиқи request/response
- Агар Swagger бо ҷавоби **ВОҚЕИИ** API фарқ кунад → **ҷавоби воқеӣ авлотар**
  (мисол: `gender` сатр `"Male"` аст, на `0|1`; `get-my-profile` майдони `id` надорад)
- DTO-ҳои воқеиро дар `docs/API_REAL_DTO.md` сабт кун

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
