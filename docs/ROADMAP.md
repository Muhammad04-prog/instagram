# ROADMAP — Instagram Clone (Next.js)

Формат: 10 фаз. Каждая фаза = завершённый, проверяемый кусок. Claude Code идёт строго сверху вниз и отмечает `[x]`.
Оценка: ~6–8 недель одним разработчиком (или ~10–14 сессий с Claude Code).

---

## Фаза 0 — Фундамент (0.5 дня)

- [x] `create-next-app` (TS, App Router, `src/`, Tailwind, ESLint) — Next 16.2.10, React 19.2, Tailwind v4
- [x] Установить: `@tanstack/react-query zustand axios react-hook-form zod @hookform/resolvers next-intl next-themes lucide-react framer-motion sonner embla-carousel-react react-easy-crop date-fns`
- [x] `shadcn init` + компоненты: button, input, dialog, dropdown-menu, sheet, tabs, avatar, skeleton, tooltip, switch, textarea, separator, scroll-area (+ label, select)
- [x] `.env.local`: `NEXT_PUBLIC_API_URL=https://instagram-api.softclub.tj` (+ `.env.example`)
- [x] `next.config.ts`: `images.remotePatterns` → домен API; плагин `next-intl`
- [x] Prettier + ESLint strict (`no-explicit-any: error`) + Husky + lint-staged; `tsconfig`: `noUncheckedIndexedAccess`
- [x] Скриншоты-эталоны: `docs/screenshots/` (47 шт.) + `docs/screenshots/INDEX.md`

> Заметки Фазы 0:
>
> - Next **16** → middleware называется **`proxy.ts`** (не `middleware.ts`) — учесть в Фазе 1–2.
> - `src/i18n/request.ts` + `src/messages/en.json` созданы как **заглушки** (плагин `next-intl` требует их для сборки). Полный роутинг en/ru/tg — Фаза 1.
> - shadcn-пресет: `radix-nova`; компонент `form` в реестре отсутствует → используем `react-hook-form` напрямую.
> - `npm run build` / `lint` / `typecheck` — зелёные.

## Фаза 1 — Дизайн-система и каркас (1–2 дня)

- [x] `globals.css`: все CSS-переменные IG (light + dark) + Tailwind `@theme` (+ размеры, `--font-system`, `--font-logo`, утилиты `story-ring` / `input-auth` / `scrollbar-none`)
- [x] `ThemeProvider` (next-themes: light / dark / system), `suppressHydrationWarning`
- [x] i18n: `i18n/routing.ts`, `request.ts`, `navigation.ts`, `messages/{en,ru,tg}.json`, **`src/proxy.ts`** (Next 16 вместо `middleware.ts`)
- [x] `app/layout.tsx` + `app/[locale]/layout.tsx` + Providers (Query, Theme, Tooltip, Toaster) — _AuthProvider → Фаза 2_
- [x] `lib/axios.ts` (Bearer, unwrap `Response<T>`, 401 → logout), `lib/constants.ts`, `lib/utils.ts`, `lib/query-keys.ts`
- [x] `types/*` — все DTO (response, auth, post, story, chat, user, profile, location)
- [x] `shared/`: Loader, EmptyState, ErrorState, ConfirmDialog, Modal
- [x] `loading.tsx` / `error.tsx` / `not-found.tsx` / `global-error.tsx`
- [x] IG-иконки (SVG): home, search, explore, reels, message, heart, create, more, bookmark, comment, share (+ dots, глиф и wordmark логотипа)

> Заметки Фазы 1:
>
> - Палитра light взята из `docs/TZ.md §5` — light-скриншотов (img48–img52) в `docs/screenshots/` нет, там по-прежнему img1–img47 (все dark).
> - Токены IG — единственный источник; токены shadcn (`--background`, `--primary`, …) **отображены на них**, поэтому компоненты shadcn автоматически в стиле IG.
> - `localePrefix: "as-needed"` → `/` = en, `/en` → 307 на `/`, `/ru` и `/tg` с префиксом. Проверено на dev-сервере.
> - Анти-«мигание» темы: inline-скрипт next-themes присутствует в HTML, `suppressHydrationWarning` на `<html>`.
> - `timeAgo()` не добавлял: относительное время делаем через `useFormatter()` next-intl (ТЗ §6), чтобы не дублировать логику.
> - `npm run build` / `lint` / `typecheck` — зелёные; `/`, `/ru`, `/tg`, 404 проверены curl'ом.

## Фаза 2 — Auth (5 endpoints) (2–3 дня)

- [x] `services/account.service.ts` — register, login, forgotPassword(DELETE), resetPassword(DELETE), changePassword(PUT)
- [x] `lib/validators/auth.schema.ts` (Zod: userName, fullName, email, password + confirm) — схемы как фабрики, сообщения через next-intl
- [x] `(auth)/layout.tsx` — **по скриншотам** (img7: сплит промо+форма; img4/5, img6: одна колонка), а не «карточка + фрейм телефона» (это старый дизайн IG)
- [x] `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm` (+ `AuthInput`, `AuthButton`, `AuthPromo`, `AuthFooter`)
- [x] `store/auth.store.ts` + `hooks/useAuth.ts` + `/api/auth/session/route.ts` (httpOnly cookie) + `AuthProvider`
- [x] **`src/proxy.ts`** (Next 16, не `middleware.ts`) — guard: гость → `/login`, авторизован → `/`
- [x] `settings/change-password` + `ChangePasswordForm`
- ✅ Готово: 5 endpoints (Account) — см. `docs/API_MAP.md`

> Заметки Фазы 2:
>
> - DTO сверены со **Swagger** (`/swagger/v1/swagger.json`), не на глаз: `RegisterDto` = ровно 5 полей (userName, fullName, email, password, confirmPassword). Блок «Дата рождения» из img4 **не делаем** (нет в API), вместо него — «Подтвердите пароль» (обязателен в API).
> - Кнопка «Войти через Facebook» и экран «Продолжить как…» (img1/img2/img8) **не делаем** — в Swagger нет OAuth/сессионных endpoint'ов.
> - **Палитра auth ≠ палитра приложения.** Значения сняты пиксельно со скриншотов: фон `#1F1F22`, промо `#0C1014`, кнопка `#0064E0` (Meta-синий, а не IG `#0095F6`), disabled `#133B6E`, бордер инпута `#50545B` → focus `#AAAFB5`, фон инпута в регистрации `#2B2C2F`. Токены `--auth-*` в `globals.css`.
> - Light-тема для auth выведена из ТЗ §5 — light-скриншотов auth нет.
> - Коллаж телефонов на промо-панели (img7) — ассет Meta, его у нас нет: панель собрана из логотипа и заголовка.
> - **Безопасность (переделано):** токен **никогда** не попадает в клиентский JS. Все запросы идут через Route Handler `src/app/api/proxy/[...path]/route.ts`, который читает httpOnly-cookie и ставит `Authorization: Bearer …` **на сервере**. `lib/axios.ts` baseURL = `/api/proxy`. Тело запроса стримится (`duplex: "half"`), поэтому multipart (add-post, send-message, avatar) проходит с сохранением boundary. `GET /api/auth/session` возвращает **только claims** (userId, userName, email), без токена.
> - Guard — в `src/proxy.ts` (Next 16); `middleware.ts` в проекте нет. Его matcher исключает `/api`, поэтому прокси-роут не попадает под редиректы.
> - ⚠️ **`errors` ≠ признак ошибки!** `update-user-image-profile` отвечает `{errors:["success"], statusCode:200}`. Интерцептор теперь считает ошибкой только `statusCode >= 400`.
> - ⚠️ **DTO профиля из ТЗ не совпадает с реальным API** (обнаружено при e2e-проверке). Реально `get-my-profile` возвращает: `userName, image, dateUpdated, gender ("Male" — строка, а не 0|1!), postCount, subscribersCount, subscriptionsCount, firstName, lastName, locationId, dob, occupation, about`. Нет `id`, `fullName`, `posts`. → `types/profile.types.ts` править в Фазе 4.
> - Проверено e2e на dev (curl + cookie-jar): register → login → httpOnly-cookie → `get-my-profile` 200 → multipart-загрузка аватара 200 (файл реально сохранён). `/` без токена → 307 `/login`; без cookie прокси отдаёт 401.

## Фаза 3 — Layout приложения (2 дня)

- [x] `Sidebar` (244px / collapsed 73px, авто-collapse на `/chat` + `/explore` и при открытой панели), `Navbar` (mobile top, 44px), `MobileNav` (bottom tabs, 48px)
- [x] `SearchPanel` (выезжающая панель как в IG, debounce 400ms → `/User/get-users`), `NotificationsPanel`
- [x] `RightSidebar` (профиль через `/UserProfile/get-my-profile` + «Рекомендации» через `/User/get-users`)
- [x] Адаптив: 3 брейкпоинта (<768 / 768–1264 / >1264)
- [x] `@modal` slot + `default.tsx` (заготовка под intercepting routes Фазы 5)
- [x] `ThemeSwitcher` (Light / Dark / System) — в меню «Ещё», как в IG (img46)

> Заметки Фазы 3:
>
> - Иконки и порядок сняты с увеличенного кропа сайдбара (img10): логотип → **Home (залитая = активная)** → Reels → бумажный самолётик (Сообщения) → Лупа → Сердце с красной точкой → Плюс → аватар; внизу — гамбургер «Ещё» и сетка «Другие продукты».
> - **Explore/компас добавлен в сайдбар** (правка после ревью). Порядок теперь канонический IG: Home → Search → **Explore** → Reels → Messages → Notifications → Create → Profile. Это отличается от порядка в img10 (там Home → Reels → Messages → Search → …, компаса нет вовсе) — приоритет отдан живому IG по требованию заказчика.
> - Метрики сайдбара перемерены пиксельно по img10 (снимок в DPR **1.25**): иконка 24px, **шаг строк 56px** (было 52), центр логотипа на **112px** выше первой строки (было ~64). Исправлено.
> - `UserAvatar` (`components/shared/UserAvatar.tsx`) — круглый аватар с IG-шным дефолтом-человечком; используется в Sidebar / MobileNav / SearchPanel / RightSidebar. У большинства аккаунтов API отдаёт `image: ""` → показывается дефолт (это поведение самого IG).
> - ⚠️ **Развёрнутый сайдбар 244px на скриншотах есть только частично** (img46/img47 — там видны подписи «Главная», «Ещё», «Другие продукты»). Остальное собрано по этим подписям.
> - ⚠️ **`NotificationsPanel` без данных:** в Swagger **нет ни одного endpoint'а уведомлений** (все 57 расписаны по другим тегам). Панель свёрстана по img26–img28, но показывает empty state. Экраны img26–img28 (лайки/подписки) реализовать нечем.
> - DTO взяты из **живого API**, не из ТЗ: `get-users` → `{id, avatar, fullName, subscribersCount, userName}`; `get-my-profile` → без `id` (id текущего юзера берём из claims JWT). `types/{user,profile}.types.ts` исправлены.
> - Кнопки «Подписаться» в RightSidebar и «Переключиться» пока не подключены — follow приходит в Фазе 4.
> - Проверено на dev с реальной сессией: `/` 200, сайдбар/рекомендации рендерятся, `/ru` переведён. `build` / `lint` / `typecheck` — зелёные.

## Фаза 4 — Профиль (7 + 4 endpoints) (3–4 дня)

- [x] `services/userProfile.service.ts` (7) + `followingRelationShip.service.ts` (4)
- [x] `profile/me`, `profile/[userId]` — `ProfileHeader`, `ProfileStats`, `ProfileTabs`
- [x] `PostGrid` (3 колонки, hover = лайки/комменты)
- [x] `FollowButton` (optimistic + `get-is-follow-user-profile-by-id`), `FollowDialog` (Followers / Following)
- [x] `profile/edit` (`update-user-profile`: about, gender) + `AvatarUploader` (upload / delete image)
- [x] `profile/favorites` (`get-post-favorites`, infinite scroll)
- ✅ Готово: 11 endpoints

> Заметки Фазы 4:
>
> - 🔴 **`delete-user-image-profile` ломает аккаунт**: image → `null`, после чего `login` этого юзера
>   отвечает 500 «Value cannot be null» (проверено на 3 аккаунтах; лечится загрузкой нового фото со
>   старым токеном). Кнопка «Удалить текущее фото» **работает** (11/11 endpoint'ов закрыты), но в
>   ConfirmDialog выводится красное предупреждение об этом. Подробности: `docs/BACKEND_BUGS.md`.
> - DTO сняты с живого API (`docs/API_REAL_DTO.md`): `get-is-follow-user-profile-by-id` отдаёт **весь профиль
>   - `isSubscriber`** (не boolean) → один запрос кормит и header, и `FollowButton`;
>     `get-subscribers/subscriptions` → `[{ id, userShortInfo: { userId, userName, userPhoto, fullname } }]`.
> - ⚠️ **`gender` асимметричен**: читается строкой (`"Male"`), пишется числом (`0` = Female, `1` = Male);
>   строка на запись → 400. `update-user-profile` принимает **только** `about` + `gender`, поэтому в
>   `profile/edit` нет полей «Сайт» / occupation (в API их нет), а не потому что забыли.
> - `Post` DTO из ТЗ неверен: `images` — массив **строк** (и может быть `.mp4`), счётчик — `postView`.
>   Типы исправлены. Таб «Reels» профиля считается из `get-posts` (у `get-reels` нет фильтра по UserId).
> - Порядок табов взят с img35: сетка → **Сохранённое** → Репосты → Отмеченные (иконки без подписей).
> - Добавлен токен `--ig-button-secondary` — в light `--ig-elevated` = `#fff`, серые кнопки были невидимы.
> - `Post/get-posts` подключён досрочно (только чтение) — иначе сетка профиля пустая; остальные 11
>   endpoint'ов тега Post остаются на Фазу 5, в API_MAP они всё ещё `[ ]`.
> - Проверено в браузере (Playwright, dark + light + /ru): follow/unfollow оптимистичен и совпадает с
>   сервером — 29 → 28 → 29 (после reload тоже 29). `build` / `lint` / `typecheck` — зелёные.

## Фаза 5 — Посты и лента (12 endpoints) (5–6 дней)

- [x] `services/post.service.ts` (12) + `hooks/usePosts.ts`, `useComments.ts` (favorites живут в `useProfile.ts`)
- [x] `PostCard` = Header + `PostCarousel` (embla, точки) + `PostActions` + caption + комментарии
- [x] Лайк (optimistic, double-tap heart animation через framer-motion), сохранение (`add-post-favorite`)
- [x] `view-post` через IntersectionObserver (50% видимости, 1 раз на пост)
- [x] `PostComments` (`add-comment` / `delete-comment`)
- [x] Feed `/` — `get-following-post` + infinite scroll + skeleton
- [x] `post/create` — степпер: файлы → кроп (1:1 / 4:5) → caption → `add-post` (multipart, Images[]) — _без `LocationSelect`: в `add-post` нет поля локации_
- [x] `post/[postId]` (страница) + `@modal/(.)post/[postId]` (модалка над лентой)
- [x] `delete-post` (меню «…»)
- ✅ Готово: 12 endpoints

> Заметки Фазы 5:
>
> - ⚠️ **`get-following-post` без `UserId` молча отдаёт пустую ленту** (200, `data: []`), хотя подписки есть.
>   С `UserId` — 16 постов. `useFeed()` всегда шлёт id из JWT-claims. Легко принять за «лента сломана».
> - ⚠️ **`like-post` и `add-post-favorite` — TOGGLE**, а не «поставить»: `data` = новое состояние.
>   Optimistic UI инвертирует состояние сам, откат только при ошибке.
> - ⚠️ **`get-my-posts` отвечает голым массивом** без конверта `{data,errors,statusCode}` — интерцептор
>   это переживает (unwrap только при наличии ключа `data`).
> - ⚠️ **`comments[].userName` / `userImage` всегда `null`** → имя автора комментария подтягивается через
>   `useProfileLite(userId)` (кэш на пользователя). См. `docs/BACKEND_BUGS.md` #6.
> - `add-post` не имеет поля локации, соавторов и фильтров → шаги img31/img32 и «Добавить место» (img33)
>   не делались: подделывать нечего.
> - Проверено вживую в браузере: лайк 1 → 0 (оптимистично) и после reload 0; комментарий сохранился;
>   пост реально создан через UI (кроп → подпись → «Поделиться» → появился в сетке профиля).
> - `build` / `lint` / `typecheck` — зелёные.

## Фаза 6 — Stories (8 endpoints) (3 дня)

- [x] `services/story.service.ts` (8) + `hooks/useStories.ts` + `store/story.store.ts`
- [x] `StoryAvatarList` + `StoryRing` (градиент = непросмотренная, серое = просмотренная)
- [x] `StoryViewer` (full-screen): прогресс-бары 5 сек, тап/свайп, пауза на hold, ←/→, Space, ESC
- [x] `add-story-view` при показе слайда, `LikeStory` (сердце)
- [x] `StoryUploadDialog` (`AddStories` multipart + опционально `PostId`)
- [x] `StoryViewersSheet` (`viewerDto`: viewCount / viewLike) — только для своих
- [x] `DeleteStory`
- [x] Роуты `stories/[userId]` + `@modal/(.)stories/[userId]` (intercepting, как у поста)
- ✅ Готово: 8 endpoints

> Заметки Фазы 6:
>
> - ⚠️ **`get-stories` — голый массив, сгруппированный по авторам** (не `GetStoryDto[]` из Swagger),
>   и в нём есть авторы с пустым `stories: []` (включая меня) — их фильтруем.
> - ⚠️ **API не знает, видел ли Я историю.** `add-story-view` пишет просмотр, но обратно этого не
>   отдаёт никто (`viewerDto` — только агрегат). Поэтому серое кольцо хранится в браузере
>   (Zustand + localStorage, `store/story.store.ts`). В другом браузере кольца снова цветные.
> - ⚠️ **`viewerDto` — не список зрителей, а два счётчика** (viewCount / viewLike). `StoryViewersSheet`
>   честно показывает цифры и подпись, что списка в API нет — лиц не выдумываем.
> - ⚠️ **`LikeStory` — toggle и отдаёт строку** `"Liked"` / `"Disliked"`, а `likedCount` в списке
>   всегда 0 (баг сервера), поэтому количество лайков берём из `viewerDto.viewLike`.
> - ⚠️ Файлы старых историй на сервере **404** → во вьюере вместо чёрного экрана честный текст.
> - Проверено вживую: история загружена → появилась в рейле; просмотр всех историй автора → кольцо
>   стало серым; лайк → `viewLike` 1; удаление → история ушла из рейла, «Ваша история» снова с «+».
> - `build` / `lint` / `typecheck` — зелёные.

## Фаза 7 — Reels + Explore (2 дня)

- [x] `reels/page.tsx` — `get-reels`, snap-scroll, autoplay по видимости, mute, боковые экшены (`ReelCard`)
- [x] `explore/page.tsx` — `get-posts`, сетка 4 колонки (3:4), infinite scroll
- [x] «Поделиться в сторис» в меню «…» поста (`AddStories?PostId=`)

> Заметки Фазы 7:
>
> - **Explore — НЕ masonry.** На эталонах (img23, img24) современный IG показывает **4 колонки
>   одинаковых вертикальных плиток 3:4**, крупного тайла 2×2 там нет вовсе. Верстал по скриншоту,
>   а не по устаревшему описанию в роадмапе.
> - Reels: `get-reels` отдаёт `images` **строкой** (один файл), поэтому в `useReels` каждый рил
>   нормализуется в `Post` — и хуки лайка/сохранения/просмотра из Фазы 5 работают без копипасты.
> - Autoplay только `muted` (требование браузеров): по умолчанию звук выключен, включается кнопкой
>   или клавишей **M**. Клавиатура: ↑/↓ — соседний рил, Space — пауза/плей.
> - Видео-плитки без постера были чёрными → `src` с фрагментом `#t=0.1`, браузер рисует первый кадр
>   (исправлено и в `PostGrid` Фазы 4).
> - Sidebar теперь авто-схлопывается и на `/reels` (был только `/chat` и `/explore`).
> - На мобиле экшены рила уезжали за экран → на <768px рейл лежит поверх видео, подпись поднята над
>   `MobileNav`.
> - Проверено в браузере: автоплей работает (`paused: false`, звук выключен), ↓ листает ровно на экран,
>   **M** включает звук, explore — 24 плитки, клик открывает модалку поста. `build` / `lint` / `typecheck` — зелёные.

## Фаза 8 — Поиск (10 endpoints User) (2 дня)

- [x] `services/user.service.ts` (10) + `hooks/useUserSearch.ts` + `useDebounce`
- [x] `UserSearch` в `SearchPanel` (`get-users`, debounce 400ms) + `SearchResults` / `SearchUserRow`
- [x] `add-search-history` / `add-user-search-history` при вводе и клике
- [x] `UserSearchHistory` — «Недавние», ✕ (удалить один, optimistic), «Очистить все» (оба вида истории)
- [x] Поиск в шапке `/explore` (img23) — тот же `SearchResults` в выпадающем списке
- [x] `delete-user` — `settings/page.tsx` + `DeleteAccountDialog` (double-confirm)
- ✅ Готово: 10 endpoints

> Заметки Фазы 8:
>
> - ⚠️ **Swagger для тега User бесполезен**: у всех 10 endpoint'ов `responses.200` пуст — схемы ответа
>   нет вообще. Все DTO сняты с живого API и записаны в `docs/API_REAL_DTO.md`.
> - ⚠️ **`get-user-search-histories` возвращает пользователя ВЛОЖЕННЫМ**: `{ id, users: {...} }`, где
>   `id` — строка истории, а не пользователя. `get-search-histories` → `{ id, text }` (без `userId`).
>   Заготовка типов из Фазы 3 была неверна — исправлена.
> - 🔴 **`delete-user` — admin-only, отвечает 403 ВСЕМ**, включая удаление собственного аккаунта
>   (проверено на двух одноразовых аккаунтах, не на живом пользователе). Кнопка «Удалить аккаунт»
>   оставлена с double-confirm, но честно показывает отказ сервера в toast. `BACKEND_BUGS.md` #13.
> - ⚠️ **Хронологические «Недавние» невозможны**: у истории нет `createdAt`, а id двух историй идут из
>   разных последовательностей. Показываем аккаунты, затем текстовые запросы (в каждой группе — свежие
>   сверху). `BACKEND_BUGS.md` #14.
> - **`add-search-history` вызывается на Enter и на клик по результату, а не на каждый keystroke** —
>   иначе «Недавние» забиваются всеми префиксами («e», «er», «era»…). Сервер сам дедуплицирует повторы.
> - `UserName` в `get-users` — substring и matches ещё и `fullName` (`er` → `eraj`, `amERica`, `chessmastER`).
> - 🐛 **Починен баг Фазы 3:** развёрнутый по hover сайдбар (244px) наезжал на выехавшую панель (она
>   прибита к 73px) — курсор после клика по «Поиску» остаётся на рейке, и панель закрывалась наполовину.
>   Hover-expand теперь отключён, пока открыта панель (`Sidebar`: `panel === null && "hover:w-sidebar"`).
> - 🐛 **Light-тема:** поле ввода и кружок иконки истории были на `--ig-elevated` = `#fff` → невидимы на
>   белом фоне (та же ловушка, что в Фазе 4). Переведены на `--ig-button-secondary`, ховер строк — на
>   `--ig-bg-secondary`. Оба токена читаемы и в light, и в dark.
> - `settings/page.tsx` создан минимальным (смена пароля + удаление аккаунта); полная оболочка настроек
>   (тема, язык, sidebar — img39–img42) остаётся на Фазу 10.
> - Проверено вживую в браузере (Playwright, dark + light + /ru + мобильный 390px): поиск «er» → 10
>   аккаунтов; клик по `eraj` → появился в «Недавние» и **пережил полную перезагрузку**; ✕ убрал строку
>   (3 → 2); «Очистить всё» → 0 строк и после reload тоже 0; «Удалить аккаунт» → toast с отказом 403.
> - `build` / `lint` / `typecheck` — зелёные.

## Фаза 9 — Чат (6 endpoints) (3–4 дня)

- [ ] `services/chat.service.ts` (6) + `store/chat.store.ts` + `hooks/useChat.ts`
- [ ] `chat/layout.tsx` (список слева) + `ChatList` / `ChatListItem` (`get-chats`)
- [ ] `chat/[chatId]` — `ChatWindow`, `MessageBubble` (свои/чужие), автоскролл, группировка по дате
- [ ] `MessageInput` — текст + файл → `send-message` (**PUT multipart**), optimistic отправка
- [ ] `create-chat` из профиля («Отправить сообщение») + `NewChatDialog`
- [ ] `delete-message` (`massageId`), `delete-chat`
- [ ] Realtime: SignalR-хаб, если есть; иначе `refetchInterval: 5000` на активный чат
- ✅ Готово: 6 endpoints

## Фаза 10 — Locations + Settings + полировка (2–3 дня)

- [ ] `services/location.service.ts` (5) + `LocationSelect` / `LocationForm` (CRUD)
- [ ] `settings/page.tsx`: `ThemeSwitcher` (Light/Dark/Auto), `LanguageSwitcher` (EN/RU/TJ), `DeleteAccountDialog`
- [ ] Полный перевод всех строк (en / ru / tg), проверка на хардкод
- [ ] Метадата: `manifest.ts`, `icon.tsx`, `opengraph-image.tsx`, `robots.ts`, `sitemap.ts`
- [ ] Skeleton'ы для всех экранов, empty/error states
- [ ] Lighthouse ≥ 90, устранить CLS, `next/image` везде
- [ ] Финальная сверка: чек-лист **57/57 endpoints**
- ✅ Готово: 5 endpoints → **ИТОГО 57/57**

---

## Счётчик покрытия API

| Модуль                | Endpoints | Фаза |
| --------------------- | --------- | ---- |
| Account               | 5         | 2    |
| UserProfile           | 7         | 4    |
| FollowingRelationShip | 4         | 4    |
| Post                  | 12        | 5    |
| Story                 | 8         | 6    |
| User                  | 10        | 8    |
| Chat                  | 6         | 9    |
| Location              | 5         | 10   |
| **Всего**             | **57**    | —    |
