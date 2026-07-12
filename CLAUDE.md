# Instagram Clone — Дастур барои Claude Code

## Стек (тағйир надеҳ)

Next.js 15+ (App Router, TypeScript, `src/`) · Tailwind CSS v4 · shadcn/ui ·
TanStack Query v5 (server-state) · Zustand (client-state) · react-hook-form + Zod ·
Axios · next-intl (en / ru / tg) · next-themes (light / dark / system) ·
lucide-react · framer-motion · embla-carousel · react-easy-crop · sonner.

Backend: `https://instagram-api.softclub.tj` — JWT Bearer.
Ҷавоби API ҳамеша: `{ data, errors, statusCode }` — дар `lib/axios.ts` unwrap кун.

## Ҳуҷҷатҳои проект — пеш аз кор бихон

- ТЗ (пурра): `docs/TZ.md`
- Роадмап: `docs/ROADMAP.md` — **қатъиян аз боло ба поён кор кун, ҳар қадами тайёрро `[x]` кун**
- Картаи API (57 endpoint): `docs/API_MAP.md` — ҳар endpoint бояд 100% дар UI кор кунад
- Қоидаҳои `AGENTS.md`-ро низ риоя кун (Next.js docs дар `node_modules/next/dist/docs/`)

## Дизайн — манбаи ҳақиқат

Скриншотҳои Instagram: `docs/screenshots/` (номҳо: `img1.png` … `img47.png`).
**Индекс: `docs/screenshots/INDEX.md`** — дар он навишта шудааст, кадом сурат кадом экран аст.

Пеш аз вёрсткаи ҳар экран:

1. `docs/screenshots/INDEX.md`-ро бихон
2. Файли мувофиқро (мисол `img12.png`) бо Read tool кушо
3. Аз рӯи он верстка кун

Қоидаҳои дизайн:

- Отступ, андоза, шрифт ва рангҳо бояд ба сурат мувофиқ бошанд (±2px)
- HEX-и hardcode манъ — фақат CSS-токенҳо аз `src/app/globals.css`
- Бари колонкаи лента 470px · sidebar 244px (collapsed 73px) · mobile bottom nav 48px
- Light ва Dark — ҳар ду ҳатмӣ, бе «мигание» ҳангоми боркунӣ

## Қоидаҳои код

- TypeScript strict, `any` манъ
- 1 сервис = 1 тег Swagger (`src/services/*.service.ts`)
- Server-state → TanStack Query; client-state (theme, modal, chat draft) → Zustand
- Валидация → Zod (`src/lib/validators/*.schema.ts`)
- Ҳар экран 3 ҳолат: loading (skeleton) / empty / error
- Optimistic UI: like, save, follow, send-message
- Матни hardcode манъ — ҳама сатр аз `messages/{en,ru,tg}.json` (next-intl)

## Тартиби кор

- Дар як сессия — **як фаза** аз ROADMAP
- Баъд аз ҳар фаза: `npm run build` тафтиш кун, баъд ROADMAP-ро `[x]` кун
- Пеш аз оғози ҳар фаза нақшаро ба ман нишон деҳ
