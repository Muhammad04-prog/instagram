# INDEX — Скриншотҳои эталонӣ (Instagram, Dark theme, Desktop)

Ҳамаи 47 сурат — веб-версияи Instagram, **фақат Dark mode**, забони интерфейс — **русӣ**.
Ҳангоми верстка: суратро бо Read tool кушо → отступ/андоза/шрифтро аз он гир (±2px).

| Файл | Тема | Экран | Саҳифаи проект |
|---|---|---|---|
| img1.png | Auth | Саҳифаи «Продолжить как…» (аккаунти захирашуда) + banner-и телефонҳо, footer | `(auth)/login` (варианти сессия) |
| img2.png | Auth | Ҳамон экран, пурра бо footer ва интихоби забон | `(auth)/login` |
| img3.png | Auth | Модалка «Удалите профили из этого браузера» | `(auth)/login` → modal |
| img4.png | Auth | Формаи «Зарегистрируйтесь в Instagram» (қисми боло: email, парол, санаи таваллуд, ном) | `(auth)/register` |
| img5.png | Auth | Формаи регистратсия (қисми поён: username, шартҳо, «Отправить», «У меня уже есть аккаунт») | `(auth)/register` |
| img6.png | Auth | «Поиск аккаунта» — барқарорсозии парол | `(auth)/forgot-password` |
| img7.png | Auth | «Войти в Instagram» — username + password + «Забыли пароль?» + «Создать новый аккаунт» | `(auth)/login` |
| img8.png | Auth | Модалкаи вуруд бо аккаунти захирашуда (аватар + парол) | `(auth)/login` → modal |
| img9.png | Splash | Экрани боркунӣ: логотипи IG дар марказ + «from Meta» дар поён | `app/loading.tsx` / splash |
| img10.png | Feed | Лентаи асосӣ: story-bar боло, пости якум, sidebar чап (свёрнутый), колонкаи рост (профил + «Рекомендации для вас») + widget «Сообщения» | `/` (feed) |
| img11.png | Feed | Скролли лента: `PostActions` (лайк/коммент/репост/шер + закладка), caption, «…ещё», пости навбатӣ | `/` → `PostCard` |
| img12.png | Post | **Модалкаи пост** (intercepting route): расм чап, комментарийҳо рост, лайкҳо, «Добавьте комментарий…» | `@modal/(.)post/[postId]` |
| img13.png | Post | Менюи «…» дар пост: Пожаловаться / Отменить подписку / Добавить в избранное / Перейти к публикации / Поделиться / Копировать ссылку | `PostCard` → dropdown |
| img14.png | Chat | Панели «Сообщения» дар кунҷи рост (мини-чат overlay бо рӯйхати диалогҳо) | `MessagesWidget` (overlay) |
| img15.png | Chat | Модалкаи «New message» — интихоби гиранда (radio) + тугмаи «Chat» | `NewChatDialog` |
| img16.png | Reels | Reels — видеои вертикалӣ, экшенҳои паҳлуӣ (лайк/коммент/репост/шер/закладка), тирчаҳои ↑↓ | `/reels` |
| img17.png | Reels | Reels — слайди дигар, caption + «Подписаться», mute-icon | `/reels` |
| img18.png | Chat | `/chat` — рӯйхати диалогҳо чап + empty state «Ваши сообщения» рост | `chat/page.tsx` |
| img19.png | Chat | Тирезаи чат (гурӯҳӣ): пузыряҳо, овозӣ, реаксияҳо, «Напишите сообщение…» | `chat/[chatId]` |
| img20.png | Chat | Чат бо вложение (видео/пост дар чат), pinned «Voice Message» | `chat/[chatId]` |
| img21.png | Chat | Чати 1-ба-1: пузыряҳои худӣ (кабуд) ва бегона (хокистарӣ), reply, реаксия | `chat/[chatId]` |
| img22.png | Chat | «Запросы на переписку» — empty state + «Delete all 0» | `chat/requests` |
| img23.png | Explore | Explore — сетка бо тайлҳои калон, панели ҷустуҷӯ дар боло | `/explore` |
| img24.png | Explore | Explore — скролл, сетка 4 сутун бо видео-иконкаҳо | `/explore` |
| img25.png | Post | Модалкаи пост аз Explore (видео + комментарийҳо + локатсия) | `@modal/(.)post/[postId]` |
| img26.png | Notifications | Панели «Уведомления» аз sidebar: филтрҳо (Все / Люди / Комментарии), «На этой неделе» | `NotificationsPanel` |
| img27.png | Notifications | Панели уведомления — филтрҳои иловагӣ (Подписки / Метки / Подтвержденные) | `NotificationsPanel` |
| img28.png | Notifications | Уведомления — скролл, «В этом месяце», лайкҳо ва подпискаҳо | `NotificationsPanel` |
| img29.png | Post create | Модалкаи «Создание публикации» — қадами 1: «Перетащите сюда фото и видео» + «Выбрать на компьютере» | `post/create` (қадами 1) |
| img30.png | Post create | Қадами 2: «Обрезать» — кроп, zoom, aspect, «Далее» | `post/create` (кроп) |
| img31.png | Post create | Қадами 3: «Редактировать» → таби «Фильтры» (Aden, Clarendon, Crema…) | `post/create` (филтрҳо) |
| img32.png | Post create | Қадами 3: таби «Настройки» — Яркость / Контраст / Насыщенность / Температура / Виньетка | `post/create` (танзим) |
| img33.png | Post create | Қадами 4: caption (0/2200), «Добавить место», «Добавить соавторов», «Поделиться» | `post/create` (caption) |
| img34.png | Post create | Confirm-модалка «Отменить публикацию?» → Удалить / Отмена | `post/create` → `ConfirmDialog` |
| img35.png | Profile | Профили худ: аватар, статистика (публикация/подписчики/подписок), bio, «Редактировать профиль» / «Посмотреть архив», highlights, табҳо | `profile/me` |
| img36.png | Profile | Таби «Сохранённое» (закладка): подборкаҳо, «Список сохраненного виден только вам» | `profile/favorites` |
| img37.png | Profile | Таби «Репосты» (reels-и репостшуда) — сетка | `profile/me` (tab reels) |
| img38.png | Profile | Таби «Отмеченные» — empty state «Фото с вами» | `profile/me` (tab tagged) |
| img39.png | Settings | «Настройки» — sidebar-и танзимот + «Редактировать профиль» рост | `settings/` layout |
| img40.png | Settings | Менюи танзимот (қисми 1): Центр аккаунтов, Редактировать профиль, Уведомления, Конфиденциальность… | `settings/` sidebar |
| img41.png | Settings | Менюи танзимот (қисми 2): Взаимодействие, Что вы видите… | `settings/` sidebar |
| img42.png | Settings | Менюи танзимот (қисми 3): Архивирование, **Язык**, Специальные возможности, Помощь | `settings/` sidebar (i18n) |
| img43.png | Settings | «Редактировать профиль» — аватар + «Новое фото», Сайт, «О себе» (3/150) | `profile/edit` |
| img44.png | Settings | «Редактировать профиль» — **Пол** (select), рекомендацияҳо, «Отправить» | `profile/edit` (gender) |
| img45.png | Story | «Архивировать» → таби «Истории» — сеткаи сторисҳои архившуда бо сана | `stories/archive` |
| img46.png | Layout | Менюи «Ещё» дар sidebar: Настройки / Ваши действия / Сохраненное / **Переключить режим** / Выйти | `Sidebar` → «More» dropdown |
| img47.png | Layout | Менюи «Другие продукты»: WhatsApp / Threads | `Sidebar` → dropdown |

---

## Экранҳое, ки дар суратҳо НЕСТанд (бояд аз рӯи ТЗ + Instagram-и воқеӣ созем)

### Ҳатмӣ барои ТЗ, вале сурат нест
1. **Light theme** — ҳамаи 47 сурат танҳо Dark. Палитраи light аз `TZ.md §5` гирифта шавад.
2. **Mobile / Tablet layout** — ҳама скриншотҳо desktop. `MobileNav` (48px), `Navbar` (44px), брейкпоинтҳо <768 / 768–1264 — сурат нест.
3. **Sidebar-и пурра (244px)** — дар ҳама суратҳо sidebar collapsed (73px, танҳо иконка). Ҳолати expanded бо матн — нест.
4. **Панели «Поиск» (SearchPanel)** — экрани ҷустуҷӯ бо debounce, «Недавние» ва ✕ — **сурат нест** (муҳим: 10 endpoint-и User ба ҳамин экран вобастаанд).
5. **StoryViewer (full-screen)** — прогресс-барҳо, тап чап/рост, лайк, ҳисоби зрителҳо — **сурат нест** (Фазаи 6 пурра).
6. **StoryUploadForm** — иловаи сторис — сурат нест.
7. **StoryViewersSheet** — рӯйхати зрителҳо (`viewerDto`) — сурат нест.
8. **Модалкаи «Подписчики» / «Подписки»** (FollowDialog) — сурат нест.
9. **Профили бегона (`profile/[userId]`)** — бо тугмаҳои «Подписаться» / «Отправить сообщение» — сурат нест (танҳо профили худ ҳаст).
10. **Confirm-модалкаи «Отменить подписку?»** — сурат нест.
11. **`settings/change-password`** — формаи ивази парол — сурат нест.
12. **`reset-password`** — формаи парол аз рӯи token — сурат нест (танҳо «Поиск аккаунта» ҳаст).
13. **Switch appearance (Light/Dark/System)** — дар img46 танҳо «Переключить режим» ҳаст, худи модалкаи интихоб нест.
14. **Экрани интихоби забон (EN/RU/TJ)** — дар img42 пункти «Язык» ҳаст, худи экран нест.
15. **DeleteAccountDialog** («Удалить аккаунт», double-confirm) — сурат нест.
16. **LocationSelect / LocationForm (CRUD)** — дар img33 танҳо «Добавить место» ҳаст; худи рӯйхат/формаи локатсия нест.
17. **Skeleton / Empty / Error states** — ба ғайр аз 3 empty state (img18, img22, img38) — нест.
18. **404 / not-found, error.tsx** — сурат нест.

### Дар суратҳо ҳаст, вале дар API нест (нахоҳем сохт ё сохта — фейк)
- Highlights (доираҳои «porsche», «Добавить») — img35–img38 → API надорад.
- Филтрҳо ва танзимоти расм (img31, img32) → бэк надорад (метавон client-side бо CSS-filter).
- Соавторы, Threads/Facebook toggle, Заметки, овозӣ, звонки, реаксия ба паём → берун аз 57 endpoint.
- «Запросы на переписку», «Архив» → API надорад.
