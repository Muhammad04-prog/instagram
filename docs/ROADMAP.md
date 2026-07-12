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

- [ ] `globals.css`: все CSS-переменные IG (light + dark) + Tailwind `@theme`
- [ ] `ThemeProvider` (next-themes: light / dark / system), `suppressHydrationWarning`
- [ ] i18n: `i18n/routing.ts`, `request.ts`, `navigation.ts`, `messages/{en,ru,tg}.json`, `middleware.ts`
- [ ] `app/layout.tsx` + `app/[locale]/layout.tsx` + Providers (Query, Theme, Auth, Toaster)
- [ ] `lib/axios.ts` (Bearer, unwrap `Response<T>`, 401 → logout), `lib/constants.ts`, `lib/utils.ts`, `lib/query-keys.ts`
- [ ] `types/*` — все DTO из Swagger
- [ ] `shared/`: Loader, EmptyState, ErrorState, ConfirmDialog, Modal
- [ ] `loading.tsx` / `error.tsx` / `not-found.tsx` / `global-error.tsx`
- [ ] IG-иконки (SVG): home, search, explore, reels, message, heart, create, more, bookmark, comment, share

## Фаза 2 — Auth (5 endpoints) (2–3 дня)

- [ ] `services/account.service.ts` — register, login, forgotPassword(DELETE), resetPassword(DELETE), changePassword(PUT)
- [ ] `lib/validators/auth.schema.ts` (Zod: userName, fullName, email, password + confirm)
- [ ] `(auth)/layout.tsx` — как на instagram.com/accounts/login (карточка + фрейм телефона справа на desktop)
- [ ] `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`
- [ ] `store/auth.store.ts` + `hooks/useAuth.ts` + `/api/auth/session/route.ts` (httpOnly cookie)
- [ ] `middleware.ts` — guard: гость → `/login`, авторизован → `/`
- [ ] `settings/change-password` + `ChangePasswordForm`
- ✅ Готово: регистрация → логин → защищённые роуты работают

## Фаза 3 — Layout приложения (2 дня)

- [ ] `Sidebar` (244px / collapsed 73px, авто-collapse на chat+explore), `Navbar` (mobile top), `MobileNav` (bottom tabs)
- [ ] `SearchPanel` (выезжающая панель как в IG), `NotificationsPanel`
- [ ] `RightSidebar` (профиль + «Рекомендации» через `/User/get-users`)
- [ ] Адаптив: 3 брейкпоинта (<768 / 768–1264 / >1264)
- [ ] `@modal` slot + `default.tsx` (заготовка под intercepting routes)

## Фаза 4 — Профиль (7 + 4 endpoints) (3–4 дня)

- [ ] `services/userProfile.service.ts` (7) + `followingRelationShip.service.ts` (4)
- [ ] `profile/me`, `profile/[userId]` — `ProfileHeader`, `ProfileStats`, `ProfileTabs`
- [ ] `PostGrid` (3 колонки, hover = лайки/комменты)
- [ ] `FollowButton` (optimistic + `get-is-follow-user-profile-by-id`), `FollowDialog` (Followers / Following)
- [ ] `profile/edit` (`update-user-profile`: about, gender) + `AvatarUploader` (upload / delete image)
- [ ] `profile/favorites` (`get-post-favorites`, infinite scroll)
- ✅ Готово: 11 endpoints

## Фаза 5 — Посты и лента (12 endpoints) (5–6 дней)

- [ ] `services/post.service.ts` (12) + `hooks/usePosts.ts`, `useComments.ts`, `useFavorites.ts`
- [ ] `PostCard` = Header + `PostCarousel` (embla, точки) + `PostActions` + caption + комментарии
- [ ] `LikeButton` (optimistic, double-tap heart animation), `SaveButton` (`add-post-favorite`)
- [ ] `view-post` через IntersectionObserver (50% видимости, 1 раз на пост)
- [ ] `PostComments` (`add-comment` / `delete-comment`)
- [ ] Feed `/` — `get-following-post` + infinite scroll + skeleton
- [ ] `post/create` — степпер: файлы → кроп (1:1 / 4:5) → caption + `LocationSelect` → `add-post` (multipart, Images[])
- [ ] `post/[postId]` (страница) + `@modal/(.)post/[postId]` (модалка над лентой)
- [ ] `delete-post` (меню «…»)
- ✅ Готово: 12 endpoints

## Фаза 6 — Stories (8 endpoints) (3 дня)

- [ ] `services/story.service.ts` (8) + `hooks/useStories.ts` + `store/story.store.ts`
- [ ] `StoryAvatarList` + `StoryRing` (градиент = непросмотренная, серое = просмотренная)
- [ ] `StoryViewer` (full-screen): прогресс-бары 5 сек, тап/свайп, пауза на hold, ESC
- [ ] `add-story-view` при показе слайда, `LikeStory` (сердце)
- [ ] `StoryUploadForm` (`AddStories` multipart + опционально `PostId`)
- [ ] `StoryViewersSheet` (`viewerDto`: viewCount / viewLike) — только для своих
- [ ] `DeleteStory`
- ✅ Готово: 8 endpoints

## Фаза 7 — Reels + Explore (2 дня)

- [ ] `reels/page.tsx` — `get-reels`, snap-scroll, autoplay по видимости, mute, боковые экшены (`ReelCard`)
- [ ] `explore/page.tsx` — `get-posts` (masonry-сетка IG, крупные тайлы), infinite scroll

## Фаза 8 — Поиск (10 endpoints User) (2 дня)

- [ ] `services/user.service.ts` (10) + `hooks/useUserSearch.ts` + `useDebounce`
- [ ] `UserSearch` в `SearchPanel` (`get-users`, debounce 400ms)
- [ ] `add-search-history` / `add-user-search-history` при вводе и клике
- [ ] `UserSearchHistory` — «Недавние», ✕ (удалить один), «Очистить все» (оба вида истории)
- [ ] `delete-user` — в настройках (админ / удаление аккаунта, double-confirm)
- ✅ Готово: 10 endpoints

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
