# Техническое задание (ТЗ) — Instagram Clone (Next.js 15+ / App Router)

**Проект:** Веб-клон Instagram
**Backend:** `https://instagram-api.softclub.tj` (Swagger: `/swagger/v1/swagger.json`)
**Auth:** JWT Bearer (header `Authorization: Bearer <token>`)
**Цель:** 100% покрытие всех **57 endpoint'ов** Swagger, дизайн 1-в-1 как у настоящего Instagram (light + dark), i18n (en / ru / tg), профессиональная архитектура.

---

## 1. Технологический стек (обязательный)

| Слой           | Технология                                                                                           | Почему                                        |
| -------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Framework      | **Next.js 15+ (App Router, TypeScript, `src/`)**                                                     | требование проекта                            |
| Стили          | **Tailwind CSS v4** + CSS-переменные (design tokens)                                                 | точный контроль IG-палитры                    |
| UI-примитивы   | **shadcn/ui** (Radix) → `src/components/ui/`                                                         | доступность, модалки, dropdown, sheet         |
| Server-state   | **TanStack Query v5** (`@tanstack/react-query`)                                                      | кэш, infinite scroll, optimistic UI (лайки)   |
| Client-state   | **Zustand** (+ `persist`)                                                                            | тема, язык, UI-состояние, черновик поста, чат |
| Формы          | **react-hook-form** + **Zod** (`@hookform/resolvers`)                                                | валидация = `lib/validators/*.schema.ts`      |
| HTTP           | **Axios** + interceptors (`lib/axios.ts`)                                                            | токен, 401 → logout, обработка `Response<T>`  |
| i18n           | **next-intl** (`[locale]` routing)                                                                   | en / ru / tg                                  |
| Тема           | **next-themes** (`class` strategy)                                                                   | Light / Dark / System — как в IG              |
| Иконки         | **lucide-react** (+ кастомные SVG IG-иконок)                                                         | 1-в-1 иконки IG                               |
| Анимации       | **framer-motion**                                                                                    | сторис, лайк-хаб, модалки                     |
| Медиа          | `react-easy-crop` (кроп 1:1 / 4:5), `embla-carousel-react` (карусель постов)                         | как в IG                                      |
| Realtime (чат) | **@microsoft/signalr** (если бэк поддержит хаб) иначе polling через TanStack Query `refetchInterval` | чат                                           |
| Уведомления    | **sonner** (toasts)                                                                                  | ошибки/успех                                  |
| Skeleton       | Tailwind `animate-pulse`                                                                             | loading.tsx                                   |
| Тесты (опц.)   | Vitest + Playwright                                                                                  | e2e основных флоу                             |

### Zustand vs Redux Toolkit — решение

Берём **Zustand + TanStack Query**.
Причина: 90% состояния в Instagram-подобном приложении — это **серверные данные** (лента, посты, чаты, профили), их держит TanStack Query, а не глобальный стор. Redux Toolkit здесь даёт лишний boilerplate. Zustand закрывает оставшееся: `auth`, `ui` (тема/модалки/сайдбар), `chat` (активный чат, черновики), `story` (индекс просмотра).
_(Сам Meta внутри использует Redux-подобный слой, но это legacy монолита; для нового Next.js-проекта индустриальный стандарт 2025–2026 — Query + Zustand.)_

---

## 2. Роли и доступ

| Роль                    | Права                                                                      |
| ----------------------- | -------------------------------------------------------------------------- |
| Гость                   | `/login`, `/register`, `/forgot-password`, `/reset-password`               |
| Пользователь            | всё остальное (feed, reels, explore, chat, profile, post, story, settings) |
| Admin (если роль в JWT) | `DELETE /User/delete-user`, CRUD `Location`                                |

Защита: `proxy.ts` (middleware) — нет `access_token` в httpOnly-cookie → редирект на `/{locale}/login`. Авторизованный на `(auth)` → редирект на `/`.

---

## 3. Полная карта API → UI (57 endpoints, 100% покрытие)

Обёртка ответов бэка: `Response<T> = { data: T; errors: string[] | null; statusCode: number }` → типизировать в `types/response.types.ts` и разворачивать в `lib/axios.ts` (interceptor возвращает `res.data.data`, при `errors` — throw).

### 3.1 Account (5) → `services/account.service.ts`

| #   | Endpoint                                                          | Метод       | Где в UI                                                    |
| --- | ----------------------------------------------------------------- | ----------- | ----------------------------------------------------------- |
| 1   | `/Account/register`                                               | POST (json) | `(auth)/register` → `RegisterForm`                          |
| 2   | `/Account/login`                                                  | POST (json) | `(auth)/login` → `LoginForm` (userName + password)          |
| 3   | `/Account/ForgotPassword?Email=`                                  | **DELETE**  | `(auth)/forgot-password` → `ForgotPasswordForm`             |
| 4   | `/Account/ResetPassword?Token=&Email=&Password=&ConfirmPassword=` | **DELETE**  | `(auth)/reset-password?token=&email=` → `ResetPasswordForm` |
| 5   | `/Account/ChangePassword?OldPassword=&Password=&ConfirmPassword=` | PUT         | `settings/change-password` → `ChangePasswordForm`           |

> ⚠️ Внимание: ForgotPassword/ResetPassword — это `DELETE` с query-параметрами (нестандартно, но так в Swagger). Пароли **не логировать**.

### 3.2 Post (12) → `services/post.service.ts` + `hooks/usePosts.ts`

| #   | Endpoint                                                   | Метод                                       | Где в UI                                               |
| --- | ---------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| 6   | `/Post/get-posts?UserId&Title&Content&PageNumber&PageSize` | GET                                         | `explore` (сетка), поиск по постам                     |
| 7   | `/Post/get-reels?PageNumber&PageSize`                      | GET                                         | `reels` — вертикальный snap-скролл                     |
| 8   | `/Post/get-post-by-id?id`                                  | GET                                         | `post/[postId]` + модалка (intercepting route)         |
| 9   | `/Post/get-my-posts`                                       | GET                                         | `profile/me` вкладка «Публикации»                      |
| 10  | `/Post/get-following-post?UserId&PageNumber&PageSize`      | GET                                         | **главная лента `/`** (infinite scroll)                |
| 11  | `/Post/add-post`                                           | POST `multipart` (Title, Content, Images[]) | `post/create` — кроп, карусель, caption                |
| 12  | `/Post/delete-post?id`                                     | DELETE                                      | меню «…» на своём посте                                |
| 13  | `/Post/like-post?postId`                                   | POST (toggle)                               | `LikeButton` + double-tap heart (optimistic)           |
| 14  | `/Post/view-post?postId`                                   | POST                                        | автоматически при 50% видимости (IntersectionObserver) |
| 15  | `/Post/add-comment`                                        | POST (json: postId, comment)                | `PostComments`                                         |
| 16  | `/Post/delete-comment?commentId`                           | DELETE                                      | long-press / «…» на своём комменте                     |
| 17  | `/Post/add-post-favorite`                                  | POST (json: postId)                         | иконка «закладка» (toggle)                             |

### 3.3 Story (8) → `services/story.service.ts` + `hooks/useStories.ts`

| #   | Endpoint                                      | Метод  | Где в UI                                            |
| --- | --------------------------------------------- | ------ | --------------------------------------------------- |
| 18  | `/Story/get-stories`                          | GET    | `StoryAvatarList` вверху ленты (градиентные кольца) |
| 19  | `/Story/get-user-stories/{userId}`            | GET    | `stories/[userId]` — полноэкранный вьюер            |
| 20  | `/Story/get-my-stories`                       | GET    | «Ваша история» + список зрителей                    |
| 21  | `/Story/GetStoryById?id`                      | GET    | deep-link на конкретную сторис                      |
| 22  | `/Story/AddStories?PostId` (multipart: Image) | POST   | `StoryUploadForm` (+ «поделиться постом в сторис»)  |
| 23  | `/Story/LikeStory?storyId`                    | POST   | сердечко в вьюере                                   |
| 24  | `/Story/add-story-view?StoryId`               | POST   | авто при открытии слайда                            |
| 25  | `/Story/DeleteStory?id`                       | DELETE | «…» в своей сторис                                  |

`GetStoryDto`: `{ id, fileName, postId, createAt, userId, userAvatar, viewerDto: { userName, name, viewCount, viewLike } }`.

### 3.4 Chat (6) → `services/chat.service.ts` + `store/chat.store.ts`

| #   | Endpoint                           | Метод                                           | Где в UI                                                                   |
| --- | ---------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------- |
| 26  | `/Chat/get-chats`                  | GET                                             | `chat` — список диалогов                                                   |
| 27  | `/Chat/get-chat-by-id?chatId`      | GET                                             | `chat/[chatId]` — окно переписки                                           |
| 28  | `/Chat/create-chat?receiverUserId` | POST                                            | кнопка «Отправить сообщение» в профиле / «Новое сообщение»                 |
| 29  | `/Chat/send-message`               | **PUT** `multipart` (ChatId, MessageText, File) | `MessageInput` (текст + файл)                                              |
| 30  | `/Chat/delete-message?massageId`   | DELETE                                          | контекстное меню на сообщении _(опечатка `massageId` — оставить как есть)_ |
| 31  | `/Chat/delete-chat?chatId`         | DELETE                                          | swipe / «…» в списке чатов                                                 |

### 3.5 FollowingRelationShip (4) → `services/followingRelationShip.service.ts`

| #   | Endpoint                                                                | Метод  | Где в UI                                                     |
| --- | ----------------------------------------------------------------------- | ------ | ------------------------------------------------------------ |
| 32  | `/FollowingRelationShip/get-subscribers?UserId`                         | GET    | модалка «Подписчики»                                         |
| 33  | `/FollowingRelationShip/get-subscriptions?UserId`                       | GET    | модалка «Подписки»                                           |
| 34  | `/FollowingRelationShip/add-following-relation-ship?followingUserId`    | POST   | `FollowButton` (optimistic)                                  |
| 35  | `/FollowingRelationShip/delete-following-relation-ship?followingUserId` | DELETE | `FollowButton` → «Отписаться» (с confirm-модалкой, как в IG) |

### 3.6 User (10) → `services/user.service.ts`

| #   | Endpoint                                             | Метод  | Где в UI                                      |
| --- | ---------------------------------------------------- | ------ | --------------------------------------------- |
| 36  | `/User/get-users?UserName&Email&PageNumber&PageSize` | GET    | `UserSearch` (debounce 400ms)                 |
| 37  | `/User/add-search-history?Text`                      | POST   | при вводе текста поиска                       |
| 38  | `/User/get-search-histories`                         | GET    | «Недавние» в поиске                           |
| 39  | `/User/delete-search-history?id`                     | DELETE | ✕ на элементе                                 |
| 40  | `/User/delete-search-histories`                      | DELETE | «Очистить все»                                |
| 41  | `/User/add-user-search-history?UserSearchId`         | POST   | при клике на пользователя в результатах       |
| 42  | `/User/get-user-search-histories`                    | GET    | «Недавние» (пользователи)                     |
| 43  | `/User/delete-user-search-history?id`                | DELETE | ✕                                             |
| 44  | `/User/delete-user-search-histories`                 | DELETE | «Очистить все»                                |
| 45  | `/User/delete-user?userId`                           | DELETE | settings → «Удалить аккаунт» (double-confirm) |

### 3.7 UserProfile (7) → `services/userProfile.service.ts`

| #   | Endpoint                                                        | Метод                       | Где в UI                          |
| --- | --------------------------------------------------------------- | --------------------------- | --------------------------------- |
| 46  | `/UserProfile/get-my-profile`                                   | GET                         | `profile/me`, шапка, `useAuth`    |
| 47  | `/UserProfile/get-user-profile-by-id?id`                        | GET                         | `profile/[userId]`                |
| 48  | `/UserProfile/get-is-follow-user-profile-by-id?followingUserId` | GET                         | состояние `FollowButton`          |
| 49  | `/UserProfile/update-user-profile`                              | PUT (json: about, gender)   | `profile/edit`                    |
| 50  | `/UserProfile/update-user-image-profile`                        | PUT `multipart` (imageFile) | `AvatarUploader`                  |
| 51  | `/UserProfile/delete-user-image-profile`                        | DELETE                      | «Удалить фото профиля»            |
| 52  | `/UserProfile/get-post-favorites?PageNumber&PageSize`           | GET                         | `profile/favorites` (Сохранённое) |

`Gender enum: 0 | 1` → `types/profile.types.ts`.

### 3.8 Location (5) → `services/location.service.ts`

| #   | Endpoint                                                                 | Метод                                | Где в UI                            |
| --- | ------------------------------------------------------------------------ | ------------------------------------ | ----------------------------------- |
| 53  | `/Location/get-Locations?City&State&ZipCode&Country&PageNumber&PageSize` | GET                                  | `LocationSelect` при создании поста |
| 54  | `/Location/get-Location-by-id?id`                                        | GET                                  | страница локации / чип под постом   |
| 55  | `/Location/add-Location`                                                 | POST (city, state, zipCode, country) | `LocationForm`                      |
| 56  | `/Location/update-Location`                                              | PUT (locationId + поля)              | `LocationForm` (edit)               |
| 57  | `/Location/delete-Location?id`                                           | DELETE                               | admin                               |

---

## 4. Функциональные требования по экранам

1. **Feed `/`** — сторис-бар сверху, лента постов (infinite scroll, `get-following-post`), карусель изображений, double-tap лайк, комментарии inline, «Показать все N комментариев», сохранение, шаринг; правая колонка (desktop ≥1264px): мой профиль + «Рекомендации для вас» (`get-users`).
2. **Reels `/reels`** — full-screen вертикальный snap-scroll, автоплей при видимости, mute-toggle, боковые кнопки (лайк / коммент / сохранить / поделиться).
3. **Explore `/explore`** — masonry-сетка 3 колонки с «большими» тайлами каждые 5 элементов (как в IG), поиск.
4. **Search** — оверлей-панель из сайдбара (как в IG, не отдельная страница): debounce, история (`search-histories` + `user-search-histories`).
5. **Chat `/chat` и `/chat/[chatId]`** — 2-колоночный layout, пузыри сообщений, отправка файла, удаление сообщения/чата, автоскролл, «печатает…» (если SignalR).
6. **Profile `/profile/me` и `/profile/[userId]`** — аватар, статистика (посты/подписчики/подписки), bio, кнопки (Edit / Follow / Message), вкладки: Публикации / Reels / Отмеченные / Сохранённое (только для себя).
7. **Post create `/post/create`** — модальный степпер IG: выбор файлов → кроп/фильтры → caption + локация → публикация.
8. **Post detail `/post/[postId]`** — как модалка поверх ленты (intercepting route) и как отдельная страница при прямом заходе.
9. **Stories `/stories/[userId]`** — прогресс-бары, тап влево/вправо, свайп, авто-переход, лайк, счётчик зрителей для своих.
10. **Settings** — смена пароля, тема (Light/Dark/Auto), язык (EN/RU/TJ), удаление аккаунта.

---

## 5. Дизайн-система (точная палитра Instagram)

`globals.css` — CSS-переменные, dark через `.dark` (next-themes, `attribute="class"`).

```css
:root {
  /* LIGHT */
  --ig-bg: #ffffff;
  --ig-bg-secondary: #fafafa;
  --ig-elevated: #ffffff;
  --ig-text: #000000;
  --ig-text-secondary: #737373;
  --ig-border: #dbdbdb;
  --ig-separator: #efefef;
  --ig-primary: #0095f6; /* кнопки/ссылки */
  --ig-primary-hover: #1877f2;
  --ig-danger: #ed4956; /* лайк, ошибки */
  --ig-badge: #ff3040;
  --ig-story-gradient: linear-gradient(
    45deg,
    #f09433 0%,
    #e6683c 25%,
    #dc2743 50%,
    #cc2366 75%,
    #bc1888 100%
  );
}
.dark {
  /* DARK */
  --ig-bg: #000000;
  --ig-bg-secondary: #121212;
  --ig-elevated: #262626;
  --ig-text: #f5f5f5;
  --ig-text-secondary: #a8a8a8;
  --ig-border: #262626;
  --ig-separator: #363636;
  --ig-primary: #0095f6;
  --ig-danger: #ed4956;
}
```

- **Шрифт:** system stack IG — `-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`; логотип — «Instagram Sans» (или `Grand Hotel` из Google Fonts как fallback для лого-надписи).
- **Радиусы:** кнопки `8px`, инпуты `3px` (auth-формы), карточки `8px` (десктоп), аватар — круг.
- **Размеры:** контейнер ленты `470px`, сайдбар `244px` (свёрнутый `73px`, авто-сворачивание на `/chat` и `/explore`), верхний mobile-хедер `44px`, нижний таббар `48px`.
- **Брейкпоинты:** `<768px` — mobile (`MobileNav` снизу + `Navbar` сверху); `768–1264px` — свёрнутый сайдбар; `>1264px` — полный сайдбар + правая колонка.

---

## 6. i18n (next-intl)

- Локали: `en` (default), `ru`, `tg`. Стратегия: `localePrefix: 'as-needed'`.
- Файлы: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`, `src/messages/{en,ru,tg}.json`.
- Namespaces: `common, auth, feed, post, story, reels, chat, profile, settings, search, errors, validation`.
- Форматы дат/времени — через `useFormatter()` (`«2 ч.»`, `«3 d»`), плюрализация — ICU (`{count, plural, one {# like} other {# likes}}`).
- Переключатель языка — в Settings (как в реальном Instagram: _Settings → Language_), выбор сохраняется в cookie `NEXT_LOCALE` + `ui.store`.

## 7. Тема (Dark / Light / Auto)

Как в Instagram: _Settings → Switch appearance_ — три опции: **Light / Dark / Use system setting**. `next-themes` + `suppressHydrationWarning` на `<html>`.

## 8. Нефункциональные требования

- **Производительность:** `next/image` (remotePatterns на домен API), lazy-loading, `dynamic()` для тяжёлых компонентов (StoryViewer, PostCreate, Reels), Lighthouse ≥ 90.
- **A11y:** фокус-ловушки в модалках (Radix), alt для изображений, aria-label на иконочных кнопках, поддержка клавиатуры в сторис/каруселях.
- **Безопасность:** токен в `httpOnly` cookie (ставится через Route Handler `/api/auth/session`), CSRF-safe, refresh/logout при 401, никаких токенов в `localStorage`.
- **Ошибки:** `error.tsx` на сегмент, `not-found.tsx`, `ErrorState`/`EmptyState`, toasts на мутациях.
- **SEO:** `generateMetadata` для профиля и поста, OG-images.
- **Качество кода:** ESLint + Prettier + strict TS (`noUncheckedIndexedAccess`), запрет `any`, Husky + lint-staged.

---

## 9. Целевая архитектура (доработанная, под Next.js App Router + next-intl)

```
src/
├── middleware.ts                 # (или proxy.ts в Next 16) — next-intl + auth guard
├── i18n/
│   ├── routing.ts                # locales: en, ru, tg
│   ├── request.ts
│   └── navigation.ts             # typed Link, useRouter, redirect
├── messages/
│   ├── en.json
│   ├── ru.json
│   └── tg.json
│
├── app/
│   ├── layout.tsx                # root: <html>, fonts
│   ├── globals.css               # design tokens (light/dark)
│   ├── manifest.ts               # PWA
│   ├── icon.tsx / apple-icon.tsx / opengraph-image.tsx
│   ├── robots.ts / sitemap.ts
│   ├── api/
│   │   ├── auth/session/route.ts     # set/clear httpOnly cookie
│   │   └── health/route.ts
│   └── [locale]/
│       ├── layout.tsx            # NextIntlClientProvider + Providers
│       ├── error.tsx
│       ├── not-found.tsx
│       ├── loading.tsx
│       ├── (auth)/
│       │   ├── layout.tsx        # центрированная карточка + скриншот-фрейм телефона
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   ├── forgot-password/page.tsx
│       │   └── reset-password/page.tsx
│       └── (main)/
│           ├── layout.tsx        # Sidebar + Navbar + MobileNav + SearchPanel
│           ├── default.tsx       # для parallel routes
│           ├── page.tsx          # FEED
│           ├── @modal/
│           │   ├── default.tsx
│           │   ├── (.)post/[postId]/page.tsx      # пост в модалке (intercepting)
│           │   └── (.)stories/[userId]/page.tsx   # сторис в модалке
│           ├── reels/page.tsx (+ loading.tsx)
│           ├── explore/page.tsx (+ loading.tsx)
│           ├── chat/
│           │   ├── layout.tsx    # список чатов слева
│           │   ├── page.tsx
│           │   └── [chatId]/page.tsx
│           ├── profile/
│           │   ├── me/page.tsx
│           │   ├── edit/page.tsx
│           │   ├── favorites/page.tsx
│           │   └── [userId]/page.tsx (+ error.tsx, loading.tsx)
│           ├── post/
│           │   ├── create/page.tsx
│           │   └── [postId]/page.tsx
│           ├── stories/[userId]/page.tsx
│           └── settings/
│               ├── layout.tsx
│               ├── page.tsx              # тема + язык + аккаунт
│               └── change-password/page.tsx
│
├── components/
│   ├── ui/                       # shadcn: button, input, dialog, dropdown, sheet, tabs, avatar, skeleton, tooltip, switch, toast
│   ├── providers/
│   │   ├── QueryProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── AuthProvider.tsx
│   ├── layout/ Navbar.tsx, Sidebar.tsx, MobileNav.tsx, SearchPanel.tsx, NotificationsPanel.tsx, RightSidebar.tsx
│   ├── auth/ LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm, ChangePasswordForm
│   ├── post/ PostCard, PostHeader, PostCarousel, PostActions, PostGrid, PostForm, PostCropper, PostComments, CommentItem, ReelCard, LikeButton, SaveButton, ShareDialog, PostSkeleton
│   ├── story/ StoryAvatarList, StoryRing, StoryViewer, StoryProgressBar, StoryUploadForm, StoryViewersSheet
│   ├── chat/ ChatList, ChatListItem, ChatWindow, MessageBubble, MessageInput, NewChatDialog
│   ├── profile/ ProfileHeader, ProfileStats, ProfileTabs, EditProfileForm, AvatarUploader, ProfileSkeleton
│   ├── follow/ FollowButton, FollowersList, FollowingList, FollowDialog
│   ├── user/ UserSearch, UserSearchHistory, UserListItem, SuggestionsList
│   ├── location/ LocationSelect, LocationForm
│   ├── settings/ ThemeSwitcher, LanguageSwitcher, DeleteAccountDialog
│   └── shared/ Loader, EmptyState, ErrorState, ConfirmDialog, InfiniteScrollTrigger, Timestamp, Modal
│
├── lib/
│   ├── axios.ts                  # baseURL, Bearer, unwrap Response<T>, 401 → logout
│   ├── query-keys.ts             # фабрика ключей TanStack Query
│   ├── utils.ts                  # cn(), formatCount(1.2K), timeAgo(), getImageUrl()
│   ├── constants.ts              # API_URL, PAGE_SIZE, ROUTES, IMAGE_BASE
│   └── validators/ auth.schema.ts, post.schema.ts, profile.schema.ts, location.schema.ts, chat.schema.ts
│
├── services/                     # 1 файл = 1 тег Swagger (чистые API-функции)
│   ├── account.service.ts        (5)
│   ├── post.service.ts           (12)
│   ├── story.service.ts          (8)
│   ├── chat.service.ts           (6)
│   ├── followingRelationShip.service.ts (4)
│   ├── user.service.ts           (10)
│   ├── userProfile.service.ts    (7)
│   └── location.service.ts       (5)
│
├── store/                        # Zustand
│   ├── auth.store.ts             # user, token, isAuth, login/logout (persist)
│   ├── chat.store.ts             # activeChatId, drafts, unread
│   ├── ui.store.ts               # searchPanel, notificationsPanel, sidebarCollapsed, modals
│   └── story.store.ts            # currentStoryIndex, muted, paused
│
├── types/                        # response, auth, post, story, chat, user, profile, location, common
└── hooks/
    ├── useAuth.ts  usePosts.ts  useReels.ts  useStories.ts  useChat.ts  useFollow.ts
    ├── useComments.ts  useFavorites.ts  useUserSearch.ts  useProfile.ts  useLocation.ts
    ├── useDebounce.ts  useIntersection.ts  useInfiniteScroll.ts  useMediaQuery.ts  useUploadPreview.ts
```

---

## 10. Какие из 22 file-conventions Next.js используются в проекте

| #   | Convention                      | Используем?    | Где / зачем                                                                                     |
| --- | ------------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| 1   | `layout.js`                     | ✅ обязательно | root, `[locale]`, `(auth)`, `(main)`, `chat`, `settings`                                        |
| 2   | `page.js`                       | ✅ обязательно | все маршруты                                                                                    |
| 3   | **Dynamic Segments**            | ✅ обязательно | `[locale]`, `[userId]`, `[chatId]`, `[postId]`                                                  |
| 4   | **Route Groups**                | ✅ обязательно | `(auth)`, `(main)`                                                                              |
| 5   | `loading.js`                    | ✅ обязательно | feed, explore, reels, profile, chat — IG-скелетоны                                              |
| 6   | `error.js`                      | ✅ обязательно | `[locale]/error.tsx`, `profile/[userId]/error.tsx` + `global-error.tsx`                         |
| 7   | `not-found.js`                  | ✅ обязательно | несуществующий профиль/пост                                                                     |
| 8   | `route.js`                      | ✅ обязательно | `/api/auth/session` (httpOnly cookie), `/api/health`                                            |
| 9   | **Parallel Routes** (`@modal`)  | ✅ обязательно | модалка поста/сторис поверх ленты                                                               |
| 10  | **Intercepting Routes** (`(.)`) | ✅ обязательно | `(.)post/[postId]` — как в настоящем IG (URL меняется, лента остаётся)                          |
| 11  | `default.js`                    | ✅ обязательно | требуется вместе с `@modal` (fallback слота)                                                    |
| 12  | `proxy.js` / `middleware.js`    | ✅ обязательно | next-intl routing + auth guard _(в Next 16 файл называется `proxy.ts`, в 15 — `middleware.ts`)_ |
| 13  | `src` folder                    | ✅ обязательно | весь код в `src/`                                                                               |
| 14  | `public` folder                 | ✅ обязательно | лого, иконки, placeholder-аватар, звуки                                                         |
| 15  | **Metadata Files**              | ✅ обязательно | `icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`, `manifest.ts`, `robots.ts`, `sitemap.ts`   |
| 16  | **Route Segment Config**        | ✅ обязательно | `export const dynamic = 'force-dynamic'` (feed/chat), `revalidate`, `fetchCache`                |
| 17  | `template.js`                   | 🟡 опционально | если нужен ремоунт-анимация переходов (reels/stories)                                           |
| 18  | `unauthorized.js`               | 🟡 опционально | с `experimental.authInterrupts` + `unauthorized()` при 401                                      |
| 19  | `forbidden.js`                  | 🟡 опционально | 403 (admin-зоны: Location CRUD, delete-user)                                                    |
| 20  | `instrumentation.js`            | 🟡 опционально | Sentry / OpenTelemetry (прод)                                                                   |
| 21  | `instrumentation-client.js`     | 🟡 опционально | клиентские метрики / Web Vitals                                                                 |
| 22  | `mdx-components.js`             | ❌ не нужен    | MDX в проекте нет                                                                               |

**Итого: 16 конвенций — обязательные, 5 — опциональные, 1 не используется.**

---

## 11. Definition of Done

- [ ] Все **57 endpoint'ов** вызываются из UI и работают (чек-лист в `docs/API_MAP.md`).
- [ ] Light + Dark темы полностью, без «мигания» при загрузке.
- [ ] EN / RU / TJ — 100% строк переведены, ни одного хардкода.
- [ ] Mobile / Tablet / Desktop layout как в IG.
- [ ] TypeScript strict, 0 ошибок ESLint, `any` отсутствует.
- [ ] Optimistic UI: лайк, сохранение, подписка, отправка сообщения.
- [ ] Infinite scroll: feed, explore, reels, favorites, комментарии.
- [ ] Все состояния экрана: loading (skeleton) / empty / error.
