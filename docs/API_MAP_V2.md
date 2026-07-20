# API_MAP v2 — новый backend (NestJS), 230 endpoints

**Swagger:** `https://backend-instagram-a4k6.onrender.com/api/docs-json` → копия в `docs/swagger-v2.json`.

Файл **генерируется**: `node scripts/gen-api-map.js`. Колонки не проставляются вручную —
`Сервис` находится по литералу пути в `src/services/*.service.ts`. `UI` = endpoint **достижим
человеком**: вызов идёт из `components`/`app` напрямую, либо через хук, который сам используется
в `components`/`app`. Готового хука без экрана **недостаточно** — до такого endpoint'а никто не
доберётся, и раньше карта именно это и завышала.

Это проверка проводки, **не** проверка работоспособности: живьём ответы не сверены — любой
запрос в БД отвечает 500 `DATABASE_ERROR`, хотя `/health` и рапортует `database: up`.

**Покрытие: 221 / 230** endpoint'ов вызываются из UI.

Не подключено 9. Это не «не дошли руки»: swagger вырос со 170 до 230 —
бэкенд закрыл то, что просил [`BACKEND_PROMPT.md`](./BACKEND_PROMPT.md) (`/socket/ticket`,
`/chats/calls/ice-servers`, `/live/{id}/requests`, `NotificationDto.requestId`), и заодно
принёс групповые чаты и внешний каталог музыки. Под фронт это отдельные фазы — см.
[`ROADMAP_V2.md`](./ROADMAP_V2.md). Сознательные исключения:

| Endpoint          | Почему не подключён                                                                                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /posts`      | **Не блокер, а дубль:** сетку Explore питает `/search/explore` — ранжированный endpoint, сделанный ровно под неё. `/posts` отдаёт то же самое плоским списком. Отдельного экрана под него нет ни в одном скриншоте, и выдумывать его ради галочки в карте не стали. |
| `GET /posts/feed` | **Тоже дубль (19.07.2026):** тот же `FeedDto`, те же параметры, то же описание ранжирования, что у нового `GET /feed`. `useFeed` теперь зовёт `/feed` как более новый специализированный ресурс — вызывать оба значило бы дублировать один и тот же запрос.         |

Полный список неподключённых — строки `[ ]` в таблицах ниже.

## admin — 4/4

| ✓   | Метод  | Путь                          | Сервис                | Что делает                          |
| --- | ------ | ----------------------------- | --------------------- | ----------------------------------- |
| [x] | GET    | `/admin/users`                | `admin.getUsers`      | Список пользователей (ADMIN)        |
| [x] | DELETE | `/admin/users/{id}`           | `admin.deleteUser`    | Удалить пользователя (мягко, ADMIN) |
| [x] | GET    | `/admin/reports`              | `admin.getReports`    | Список жалоб (ADMIN, filter=open    | resolved) |
| [x] | POST   | `/admin/reports/{id}/resolve` | `admin.resolveReport` | Отметить жалобу решённой (ADMIN)    |

## auth — 18/18

| ✓   | Метод  | Путь                        | Сервис                    | Что делает                                                  |
| --- | ------ | --------------------------- | ------------------------- | ----------------------------------------------------------- |
| [x] | POST   | `/auth/register`            | `auth.register`           | Регистрация                                                 |
| [x] | POST   | `/auth/login`               | `auth.login`              | Вход по userName ИЛИ email ИЛИ phone                        |
| [x] | POST   | `/auth/refresh`             | `auth-tokens.ts (server)` | Обновить пару токенов                                       |
| [x] | POST   | `/auth/logout`              | `route.ts (server)`       | Выход — отзыв refresh-токена (идемпотентно)                 |
| [x] | POST   | `/auth/forgot-password`     | `auth.forgotPassword`     | Отправить 6-значный код на email                            |
| [x] | POST   | `/auth/resend-code`         | `auth.resendCode`         | Выслать код повторно (не чаще 1 раза в минуту)              |
| [x] | POST   | `/auth/verify-code`         | `auth.verifyCode`         | Проверить код → одноразовый resetToken (15 мин)             |
| [x] | POST   | `/auth/reset-password`      | `auth.resetPassword`      | Задать новый пароль по resetToken                           |
| [x] | PUT    | `/auth/change-password`     | `auth.changePassword`     | Сменить пароль (нужен старый)                               |
| [x] | POST   | `/auth/check-username`      | `auth.checkUsername`      | Свободен ли userName (live-валидация формы регистрации)     |
| [x] | POST   | `/auth/2fa/setup`           | `auth.setup2fa`           | Начать настройку 2FA — вернуть секрет и otpauth-URI для QR  |
| [x] | POST   | `/auth/2fa/enable`          | `auth.enable2fa`          | Подтвердить код → включить 2FA и получить резервные коды    |
| [x] | POST   | `/auth/2fa/disable`         | `auth.disable2fa`         | Отключить 2FA (нужен действующий код или резервный)         |
| [x] | POST   | `/auth/2fa/verify`          | `auth.verify2fa`          | Второй шаг логина: тикет + код → пара токенов               |
| [x] | GET    | `/auth/sessions`            | `route.ts (server)`       | Активные сессии (устройства)                                |
| [x] | DELETE | `/auth/sessions/{id}`       | `auth.revokeSession`      | Завершить конкретную сессию (её refresh перестаёт работать) |
| [x] | POST   | `/auth/sessions/logout-all` | `route.ts (server)`       | Выйти со всех устройств, кроме текущего                     |
| [x] | GET    | `/auth/me`                  | `route.ts (server)`       | Текущий пользователь                                        |

## chats — 27/33

| ✓   | Метод  | Путь                                | Сервис                       | Что делает                                                         |
| --- | ------ | ----------------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| [x] | GET    | `/chats`                            | `chat.getChats`              | Список чатов                                                       |
| [x] | POST   | `/chats`                            | `chat.create`                | Начать чат (идемпотентно)                                          |
| [x] | POST   | `/chats/group`                      | `chat.createGroup`           | Создать групповой чат                                              |
| [x] | POST   | `/chats/{id}/participants`          | `chat.addParticipants`       | Добавить участников в группу                                       |
| [x] | DELETE | `/chats/{id}/participants/{userId}` | `chat.removeParticipant`     | Удалить участника из группы                                        |
| [x] | POST   | `/chats/{id}/leave`                 | `chat.leaveGroup`            | Выйти из группы                                                    |
| [x] | PUT    | `/chats/{id}/title`                 | `chat.updateGroupTitle`      | Переименовать группу                                               |
| [ ] | GET    | `/chats/calls/ice-servers`          | —                            | ICE-серверы (STUN/TURN) для WebRTC                                 |
| [ ] | POST   | `/chats/calls/{callId}/answer`      | —                            | Взять трубку                                                       |
| [ ] | POST   | `/chats/calls/{callId}/decline`     | —                            | Сбросить входящий                                                  |
| [ ] | POST   | `/chats/calls/{callId}/end`         | —                            | Завершить звонок                                                   |
| [ ] | GET    | `/chats/{id}/calls`                 | —                            | История звонков чата (курсорная)                                   |
| [x] | PUT    | `/chats/messages/{id}`              | `chat.editMessage`           | Редактировать сообщение (≤15 мин, только своё)                     |
| [x] | DELETE | `/chats/messages/{id}`              | `chat.deleteMessage`         | Удалить сообщение (OwnerGuard: только своё)                        |
| [x] | POST   | `/chats/messages/bulk-delete`       | `chat.bulkDeleteMessages`    | Удалить несколько своих сообщений                                  |
| [x] | POST   | `/chats/messages/{id}/reaction`     | `chat.reactToMessage`        | Реакция на сообщение                                               |
| [x] | DELETE | `/chats/messages/{id}/reaction`     | `chat.removeMessageReaction` | Убрать реакцию                                                     |
| [x] | GET    | `/chats/requests`                   | `chat.getRequests`           | Запросы на переписку (от неподписанных)                            |
| [x] | POST   | `/chats/requests/{id}/accept`       | `chat.acceptRequest`         | Принять запрос на переписку                                        |
| [x] | POST   | `/chats/requests/{id}/decline`      | `chat.declineRequest`        | Отклонить запрос (строка обновляется, не плодится)                 |
| [x] | GET    | `/chats/{id}`                       | `chat.getChatById`           | Детали чата                                                        |
| [x] | DELETE | `/chats/{id}`                       | `chat.remove`                | Удалить чат (выйти из него)                                        |
| [x] | GET    | `/chats/{id}/messages`              | `chat.getMessages`           | Сообщения чата (cursor)                                            |
| [x] | POST   | `/chats/{id}/messages`              | `chat.send`                  | Отправить сообщение                                                |
| [x] | POST   | `/chats/{id}/read`                  | `chat.markRead`              | Отметить чат прочитанным («Просмотрено»)                           |
| [x] | PUT    | `/chats/{id}/theme`                 | `chat.setTheme`              | Тема чата                                                          |
| [x] | PUT    | `/chats/{id}/nickname`              | `chat.setNickname`           | Никнейм собеседника в чате                                         |
| [x] | PUT    | `/chats/{id}/mute`                  | `chat.setMuted`              | Заглушить/включить уведомления чата                                |
| [x] | PUT    | `/chats/{id}/vanish`                | `chat.setVanish`             | Vanish mode — режим исчезающих сообщений                           |
| [x] | POST   | `/chats/{id}/close`                 | `chat.closeChat`             | Закрыть чат (уйти с экрана) — сжечь увиденные исчезающие сообщения |
| [x] | POST   | `/chats/messages/{id}/open`         | `chat.openViewOnceMessage`   | Открыть медиа «просмотр один раз»                                  |
| [x] | POST   | `/chats/{id}/report`                | `chat.report`                | Пожаловаться на чат                                                |
| [ ] | POST   | `/chats/{id}/call`                  | `chat.startCall`             | Начать звонок (WebRTC-сигналинг через сокет)                       |

## close-friends — 3/3

| ✓   | Метод  | Путь                      | Сервис                         | Что делает                                   |
| --- | ------ | ------------------------- | ------------------------------ | -------------------------------------------- |
| [x] | GET    | `/close-friends`          | `closeFriends.getCloseFriends` | Список близких друзей (зелёный круг историй) |
| [x] | POST   | `/close-friends/{userId}` | `closeFriends.add`             | Добавить в близкие друзья (идемпотентно)     |
| [x] | DELETE | `/close-friends/{userId}` | `closeFriends.remove`          | Убрать из близких друзей                     |

## feed — 1/1

| ✓   | Метод | Путь    | Сервис         | Что делает                                |
| --- | ----- | ------- | -------------- | ----------------------------------------- |
| [x] | GET   | `/feed` | `feed.getFeed` | Получить ленту публикаций (ранжированную) |

## follow — 11/11

| ✓   | Метод  | Путь                            | Сервис                  | Что делает                                           |
| --- | ------ | ------------------------------- | ----------------------- | ---------------------------------------------------- |
| [x] | GET    | `/follow/requests`              | `follow.getRequests`    | Входящие заявки на подписку (для закрытого аккаунта) |
| [x] | POST   | `/follow/requests/{id}/accept`  | `follow.acceptRequest`  | Принять заявку → подписчик видит контент             |
| [x] | POST   | `/follow/requests/{id}/decline` | `follow.declineRequest` | Отклонить заявку                                     |
| [x] | GET    | `/follow/blocked`               | `follow.getBlocked`     | Список заблокированных мной                          |
| [x] | DELETE | `/follow/followers/{userId}`    | `follow.removeFollower` | Удалить подписчика (убирает ЕГО подписку на меня)    |
| [x] | POST   | `/follow/{userId}/block`        | `follow.block`          | Заблокировать                                        |
| [x] | DELETE | `/follow/{userId}/block`        | `follow.unblock`        | Разблокировать (подписки НЕ восстанавливаются)       |
| [x] | GET    | `/follow/{userId}/followers`    | `follow.getFollowers`   | Подписчики (у закрытого аккаунта — только своим)     |
| [x] | GET    | `/follow/{userId}/following`    | `follow.getFollowing`   | Подписки (у закрытого аккаунта — только своим)       |
| [x] | POST   | `/follow/{userId}`              | `follow.follow`         | Подписаться                                          |
| [x] | DELETE | `/follow/{userId}`              | `follow.unfollow`       | Отписаться (идемпотентно)                            |

## health — 1/1

| ✓   | Метод | Путь      | Сервис         | Что делает                      |
| --- | ----- | --------- | -------------- | ------------------------------- |
| [x] | GET   | `/health` | `health.check` | Проверка API, БД, Redis и MinIO |

## highlights — 5/5

| ✓   | Метод  | Путь                        | Сервис                        | Что делает                                           |
| --- | ------ | --------------------------- | ----------------------------- | ---------------------------------------------------- |
| [x] | POST   | `/highlights`               | `highlight.create`            | Создать «Актуальное»                                 |
| [x] | GET    | `/highlights/user/{userId}` | `highlight.getUserHighlights` | Актуальное пользователя                              |
| [x] | GET    | `/highlights/{id}`          | `highlight.getHighlight`      | Актуальное с историями                               |
| [x] | PUT    | `/highlights/{id}`          | `highlight.update`            | Изменить актуальное (title / cover / состав историй) |
| [x] | DELETE | `/highlights/{id}`          | `highlight.remove`            | Удалить актуальное (истории остаются)                |

## live — 20/20

| ✓   | Метод | Путь                          | Сервис                | Что делает                                                      |
| --- | ----- | ----------------------------- | --------------------- | --------------------------------------------------------------- |
| [x] | POST  | `/live/start`                 | `live.start`          | Начать эфир → Live + LiveKit-комната + publisher-токен          |
| [x] | GET   | `/live/feed`                  | `live.getFeed`        | Активные эфиры подписок (рейл историй)                          |
| [x] | GET   | `/live/user/{userId}`         | `live.getByUser`      | Активный эфир пользователя (профиль → «В эфире»)                |
| [x] | POST  | `/live/requests/{id}/accept`  | `live.acceptRequest`  | Хост принял заявку → гостю publisher-токен (split-экран)        |
| [x] | POST  | `/live/requests/{id}/decline` | `live.declineRequest` | Хост отклонил заявку → гостю уведомление отказа                 |
| [x] | GET   | `/live/{id}`                  | `live.getById`        | Один эфир                                                       |
| [x] | POST  | `/live/{id}/end`              | `live.end`            | Завершить эфир (статистика, комната закрывается)                |
| [x] | POST  | `/live/{id}/join`             | `live.join`           | Зайти зрителем → subscriber-токен (Block + Privacy)             |
| [x] | POST  | `/live/{id}/leave`            | `live.leave`          | Покинуть эфир                                                   |
| [x] | GET   | `/live/{id}/viewers`          | `live.getViewers`     | Текущие зрители эфира                                           |
| [x] | GET   | `/live/{id}/comments`         | `live.getComments`    | Комментарии эфира (новые → старые)                              |
| [x] | GET   | `/live/{id}/requests`         | `live.getRequests`    | Заявки на участие в эфире (только хост)                         |
| [x] | POST  | `/live/{id}/comment`          | `live.comment`        | Комментарий в эфир                                              |
| [x] | POST  | `/live/{id}/like`             | `live.like`           | Лайк эфира (можно много раз — всплывающие сердечки)             |
| [x] | POST  | `/live/{id}/reaction`         | `live.reaction`       | Реакция-смайл (всплывает у всех)                                |
| [x] | POST  | `/live/{id}/request-join`     | `live.requestJoin`    | Заявка на участие → уведомление хосту                           |
| [x] | PUT   | `/live/{id}/camera`           | `live.setCamera`      | Камера вкл/выкл (видео выкл → аватар/обложка, звук идёт всегда) |
| [x] | PUT   | `/live/{id}/audio`            | `live.setAudio`       | Звук вкл/выкл                                                   |
| [x] | POST  | `/live/{id}/kick/{userId}`    | `live.kick`           | Выгнать зрителя/гостя (только хост)                             |
| [x] | GET   | `/live/{id}/stats`            | `live.getStats`       | Статистика эфира                                                |

## locations — 6/6

| ✓   | Метод  | Путь                    | Сервис                      | Что делает                                   |
| --- | ------ | ----------------------- | --------------------------- | -------------------------------------------- |
| [x] | GET    | `/locations`            | `location.getLocations`     | Список локаций (cursor, поиск по q)          |
| [x] | POST   | `/locations`            | `location.create`           | Создать локацию                              |
| [x] | GET    | `/locations/{id}`       | `location.getLocationById`  | Одна локация                                 |
| [x] | PUT    | `/locations/{id}`       | `location.update`           | Обновить локацию (полная замена)             |
| [x] | DELETE | `/locations/{id}`       | `location.remove`           | Удалить локацию (у постов locationId → null) |
| [x] | GET    | `/locations/{id}/posts` | `location.getLocationPosts` | Лента постов, снятых в этой локации          |

## music — 10/10

| ✓   | Метод  | Путь                      | Сервис                     | Что делает                                            |
| --- | ------ | ------------------------- | -------------------------- | ----------------------------------------------------- |
| [x] | GET    | `/music/online/providers` | `music.getOnlineProviders` | Какие каталоги музыки сейчас доступны                 |
| [x] | GET    | `/music/online`           | `music.searchOnline`       | Поиск любой песни во внешнем каталоге                 |
| [x] | POST   | `/music/online/save`      | `music.saveOnline`         | Импортировать трек из каталога и сохранить себе       |
| [x] | GET    | `/music`                  | `music.search`             | Поиск музыки (по title И artist, курсорная пагинация) |
| [x] | GET    | `/music/trending`         | `music.getTrending`        | В тренде                                              |
| [x] | GET    | `/music/{id}/stream`      | `music.streamUrl`          | Стриминг mp3 с поддержкой Range (перемотка)           |
| [x] | GET    | `/music/{id}/reels`       | `music.getReels`           | «Use this audio» — все reels с этим треком            |
| [x] | GET    | `/music/{id}`             | `music.getById`            | Трек по id                                            |
| [x] | POST   | `/music/{id}/save`        | `music.save`               | Сохранить трек (идемпотентно)                         |
| [x] | DELETE | `/music/{id}/save`        | `music.unsave`             | Убрать трек из сохранённых                            |

## notes — 10/10

| ✓   | Метод  | Путь                   | Сервис            | Что делает                                                                |
| --- | ------ | ---------------------- | ----------------- | ------------------------------------------------------------------------- |
| [x] | GET    | `/notes`               | `note.getNotes`   | Заметки: свои + подписок (активные)                                       |
| [x] | POST   | `/notes`               | `note.create`     | Создать заметку (text ≤60, musicId/spotifyId, bgColor, audience; TTL 24ч) |
| [x] | GET    | `/notes/{id}`          | `note.getById`    | Заметка по id                                                             |
| [x] | PUT    | `/notes/{id}`          | `note.update`     | Изменить свою заметку                                                     |
| [x] | DELETE | `/notes/{id}`          | `note.remove`     | Удалить свою заметку                                                      |
| [x] | POST   | `/notes/{id}/like`     | `note.like`       | Лайк заметки (toggle) + уведомление LIKE_NOTE                             |
| [x] | GET    | `/notes/{id}/likes`    | `note.getLikes`   | Кто лайкнул (только автору)                                               |
| [x] | POST   | `/notes/{id}/reply`    | `note.reply`      | Ответить на заметку → сообщение в чат                                     |
| [x] | POST   | `/notes/{id}/reaction` | `note.reaction`   | Эмодзи-реакция на заметку → в личку автору                                |
| [x] | GET    | `/notes/{id}/replies`  | `note.getReplies` | Ответы на заметку (только автору)                                         |

## notifications — 5/5

| ✓   | Метод | Путь                           | Сервис                          | Что делает                                 |
| --- | ----- | ------------------------------ | ------------------------------- | ------------------------------------------ |
| [x] | GET   | `/notifications`               | `notification.getNotifications` | Лента уведомлений (cursor, с группировкой) |
| [x] | GET   | `/notifications/unread-count`  | `notification.getUnreadCount`   | Количество непрочитанных                   |
| [x] | GET   | `/notifications/profile-views` | `notification.getProfileViews`  | Кто заходил в твой профиль                 |
| [x] | POST  | `/notifications/{id}/read`     | `notification.markRead`         | Пометить прочитанным (всю группу)          |
| [x] | POST  | `/notifications/read-all`      | `notification.markAllRead`      | Пометить всё прочитанным                   |

## posts — 34/36

| ✓   | Метод  | Путь                                | Сервис                     | Что делает                                                          |
| --- | ------ | ----------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| [x] | POST   | `/posts`                            | `post.create`              | Создать публикацию (до 10 медиа: фото И видео)                      |
| [ ] | GET    | `/posts`                            | `post.getPosts`            | Explore — чужие публикации (закрытые аккаунты и блок исключены)     |
| [ ] | GET    | `/posts/feed`                       | `post.getFeed`             | Лента подписок (ранжированная)                                      |
| [x] | GET    | `/posts/reels`                      | `post.getReels`            | Reels (только видео-посты)                                          |
| [x] | GET    | `/posts/my`                         | `post.getMyPosts`          | Мои публикации                                                      |
| [x] | GET    | `/posts/drafts`                     | `post.getDrafts`           | Мои черновики и запланированные (не видны в лентах/профиле)         |
| [x] | DELETE | `/posts/comments/{id}`              | `post.deleteComment`       | Удалить комментарий                                                 |
| [x] | POST   | `/posts/comments/{id}/like`         | `post.likeComment`         | Лайк комментария (toggle)                                           |
| [x] | POST   | `/posts/comments/{id}/reply`        | `post.replyToComment`      | Ответить на комментарий                                             |
| [x] | GET    | `/posts/comments/{id}/replies`      | `post.getCommentReplies`   | Ответы на комментарий                                               |
| [x] | GET    | `/posts/tags/pending`               | `post.getPendingTags`      | Мои неподтверждённые отметки (ревью)                                |
| [x] | GET    | `/posts/collabs/pending`            | `post.getPendingCollabs`   | Мои приглашения в соавторы (ожидают ответа)                         |
| [x] | GET    | `/posts/{id}`                       | `post.getPostById`         | Публикация по id                                                    |
| [x] | PUT    | `/posts/{id}`                       | `post.update`              | Изменить подпись (хэштеги пересобираются)                           |
| [x] | DELETE | `/posts/{id}`                       | `post.remove`              | Удалить публикацию (только свою)                                    |
| [x] | POST   | `/posts/{id}/archive`               | `post.archive`             | В архив                                                             |
| [x] | DELETE | `/posts/{id}/archive`               | `post.unarchive`           | Вернуть из архива                                                   |
| [x] | PATCH  | `/posts/{id}/pin`                   | `post.pin`                 | Закрепить / открепить публикацию (max 3)                            |
| [x] | PATCH  | `/posts/{id}/privacy`               | `post.updatePrivacy`       | Изменить настройки отображения лайков и комментариев                |
| [x] | PUT    | `/posts/{id}/publish`               | `post.publish`             | Опубликовать черновик/запланированный пост сейчас                   |
| [x] | POST   | `/posts/{id}/like`                  | `post.like`                | Лайк (toggle) → { liked, likesCount }                               |
| [x] | GET    | `/posts/{id}/likes`                 | `post.getLikes`            | Кто лайкнул                                                         |
| [x] | GET    | `/posts/{id}/remixes`               | `post.getRemixes`          | Ремиксы этого reel (снятые «рядом» с ним)                           |
| [x] | POST   | `/posts/{id}/view`                  | `post.view`                | Просмотр (считается 1 раз на пользователя)                          |
| [x] | GET    | `/posts/{id}/insights`              | `post.getInsights`         | Аналитика поста (только автору)                                     |
| [x] | POST   | `/posts/{id}/favorite`              | `post.favorite`            | Сохранить/убрать (toggle). collection — имя коллекции               |
| [x] | POST   | `/posts/{id}/share`                 | `post.share`               | Поделиться: в чат (toUserId) / в историю (toStory) / ссылка         |
| [x] | POST   | `/posts/{id}/collaborators`         | `post.inviteCollaborators` | Пригласить соавторов (только автор)                                 |
| [x] | POST   | `/posts/{id}/collaborators/accept`  | `post.acceptCollab`        | Принять приглашение в соавторы                                      |
| [x] | POST   | `/posts/{id}/collaborators/decline` | `post.declineCollab`       | Отклонить приглашение в соавторы                                    |
| [x] | POST   | `/posts/{id}/report`                | `post.report`              | Пожаловаться на публикацию                                          |
| [x] | POST   | `/posts/{id}/tag/accept`            | `post.acceptTag`           | Принять отметку на публикации                                       |
| [x] | POST   | `/posts/{id}/tag/decline`           | `post.declineTag`          | Отклонить/убрать отметку на публикации                              |
| [x] | POST   | `/posts/{id}/comments`              | `post.addComment`          | Добавить комментарий                                                |
| [x] | GET    | `/posts/{id}/comments`              | `post.getComments`         | Комментарии к публикации (корневые, cursor)                         |
| [x] | PATCH  | `/posts/{postId}/comments/{id}/pin` | `post.pinComment`          | Закрепить / открепить комментарий к публикации (только автор поста) |

## profile — 16/16

| ✓   | Метод  | Путь                             | Сервис                     | Что делает                                       |
| --- | ------ | -------------------------------- | -------------------------- | ------------------------------------------------ |
| [x] | GET    | `/profile/me`                    | `profile.getMyProfile`     | Мой профиль                                      |
| [x] | GET    | `/profile/me/collections`        | `profile.getMyCollections` | Мои коллекции сохранённого                       |
| [x] | GET    | `/profile/favorites`             | `profile.getFavorites`     | Сохранённое (только своё)                        |
| [x] | GET    | `/profile/me/reposts`            | `profile.getMyReposts`     | Мои репосты                                      |
| [x] | GET    | `/profile/me/saved-music`        | `profile.getSavedMusic`    | Сохранённая музыка                               |
| [x] | GET    | `/profile/me/activity`           | `profile.getMyActivity`    | Ваши действия                                    |
| [x] | GET    | `/profile/me/insights`           | `profile.getMyInsights`    | Аналитика аккаунта за период (только себе)       |
| [x] | PUT    | `/profile`                       | `profile.update`           | Изменить профиль                                 |
| [x] | PUT    | `/profile/privacy`               | `profile.setPrivacy`       | Закрытый аккаунт вкл/выкл                        |
| [x] | PUT    | `/profile/avatar`                | `profile.uploadAvatar`     | Загрузить аватар                                 |
| [x] | DELETE | `/profile/avatar`                | `profile.deleteAvatar`     | Удалить аватар                                   |
| [x] | GET    | `/profile/{userId}`              | `profile.getProfileById`   | Профиль пользователя                             |
| [x] | GET    | `/profile/{userId}/is-following` | `profile.isFollowing`      | Подписан ли я на этого пользователя              |
| [x] | GET    | `/profile/{userId}/posts`        | `profile.getUserPosts`     | Публикации пользователя (закрытый аккаунт → 403) |
| [x] | GET    | `/profile/{userId}/reels`        | `profile.getUserReels`     | Reels пользователя (закрытый аккаунт → 403)      |
| [x] | GET    | `/profile/{userId}/tagged`       | `profile.getUserTagged`    | Отмеченные публикации (закрытый аккаунт → 403)   |

## search — 4/4

| ✓   | Метод | Путь                     | Сервис              | Что делает                                                        |
| --- | ----- | ------------------------ | ------------------- | ----------------------------------------------------------------- |
| [x] | GET   | `/search`                | `search.search`     | Комбинированный поиск: аккаунты + хэштеги + локации одним ответом |
| [x] | GET   | `/search/explore`        | `search.getExplore` | Сетка Explore: посты И видео вперемешку                           |
| [x] | GET   | `/search/top`            | `search.getTop`     | Тренды: популярные хэштеги + аккаунты недели                      |
| [x] | GET   | `/search/hashtag/{name}` | `search.getHashtag` | Все посты с хэштегом (cursor)                                     |

## settings — 5/5

| ✓   | Метод  | Путь                            | Сервис                    | Что делает                                                    |
| --- | ------ | ------------------------------- | ------------------------- | ------------------------------------------------------------- |
| [x] | GET    | `/settings`                     | `settings.getSettings`    | Мои настройки (уведомления, приватность взаимодействий, язык) |
| [x] | PUT    | `/settings`                     | `settings.updateSettings` | Изменить настройки                                            |
| [x] | GET    | `/settings/restricted`          | `settings.getRestricted`  | Аккаунты с ограничениями                                      |
| [x] | POST   | `/settings/restricted/{userId}` | `settings.restrict`       | Ограничить аккаунт                                            |
| [x] | DELETE | `/settings/restricted/{userId}` | `settings.unrestrict`     | Снять ограничение                                             |

## socket — 0/1

| ✓   | Метод | Путь             | Сервис | Что делает                               |
| --- | ----- | ---------------- | ------ | ---------------------------------------- |
| [ ] | POST  | `/socket/ticket` | —      | Одноразовый тикет для подключения сокета |

## spotify — 3/3

| ✓   | Метод  | Путь                               | Сервис           | Что делает                      |
| --- | ------ | ---------------------------------- | ---------------- | ------------------------------- |
| [x] | GET    | `/spotify/search`                  | `spotify.search` | Поиск музыки (Deezer + Spotify) |
| [x] | POST   | `/spotify/tracks/{spotifyId}/save` | `spotify.save`   | Сохранить трек из Spotify       |
| [x] | DELETE | `/spotify/tracks/{spotifyId}/save` | `spotify.unsave` | Убрать трек из сохранённых      |

## stories — 19/19

| ✓   | Метод  | Путь                                         | Сервис                    | Что делает                                                            |
| --- | ------ | -------------------------------------------- | ------------------------- | --------------------------------------------------------------------- |
| [x] | POST   | `/stories`                                   | `story.create`            | Создать истории (мультизагрузка до 10 файлов → до 10 отдельных Story) |
| [x] | GET    | `/stories`                                   | `story.getRail`           | Рейл историй (сгруппировано по авторам)                               |
| [x] | GET    | `/stories/my`                                | `story.getMyStories`      | Мои активные истории                                                  |
| [x] | GET    | `/stories/archive`                           | `story.getArchive`        | Мои истёкшие истории (архив)                                          |
| [x] | GET    | `/stories/user/{userId}`                     | `story.getUserStories`    | Истории пользователя                                                  |
| [x] | GET    | `/stories/add-yours/{promptId}`              | `story.getAddYoursFeed`   | Лента цепочки «Add Yours» (промпт + истории-ответы)                   |
| [x] | GET    | `/stories/{id}`                              | `story.getStoryById`      | История по id                                                         |
| [x] | DELETE | `/stories/{id}`                              | `story.remove`            | Удалить свою историю                                                  |
| [x] | POST   | `/stories/{id}/view`                         | `story.view`              | Отметить просмотренной (считается на сервере, 1 раз/зритель)          |
| [x] | POST   | `/stories/{id}/like`                         | `story.like`              | Лайк истории (toggle → { liked, likesCount })                         |
| [x] | POST   | `/stories/{id}/reaction`                     | `story.react`             | Реакция emoji → уходит сообщением в чат (можно много раз)             |
| [x] | POST   | `/stories/{id}/reply`                        | `story.reply`             | Ответ на историю → сообщением в чат                                   |
| [x] | POST   | `/stories/{id}/add-yours`                    | `story.createAddYours`    | Создать промпт «Add Yours» на своей истории («Добавь своё…»)          |
| [x] | GET    | `/stories/{id}/insights`                     | `story.getInsights`       | Аналитика истории (только автору): просмотры, лайки, реакции, ответы  |
| [x] | GET    | `/stories/{id}/viewers`                      | `story.getViewers`        | Список зрителей (только автору): кто смотрел + лайкнул + реакция      |
| [x] | POST   | `/stories/{id}/stickers`                     | `story.createSticker`     | Добавить интерактивный стикер на СВОЮ историю                         |
| [x] | GET    | `/stories/{id}/stickers`                     | `story.getStickers`       | Стикеры истории (для зрителя; правильный ответ QUIZ скрыт до ответа)  |
| [x] | POST   | `/stories/{id}/stickers/{stickerId}/answer`  | `story.answerSticker`     | Ответить на стикер                                                    |
| [x] | GET    | `/stories/{id}/stickers/{stickerId}/results` | `story.getStickerResults` | Итоги стикера (только автору истории)                                 |

## upload — 2/2

| ✓   | Метод  | Путь            | Сервис          | Что делает                                    |
| --- | ------ | --------------- | --------------- | --------------------------------------------- |
| [x] | POST   | `/upload`       | `upload.upload` | Загрузить до 10 файлов (фото / видео / аудио) |
| [x] | DELETE | `/upload/{key}` | `upload.remove` | Удалить файл по ключу                         |

## users — 13/13

| ✓   | Метод  | Путь                              | Сервис                    | Что делает                                                    |
| --- | ------ | --------------------------------- | ------------------------- | ------------------------------------------------------------- |
| [x] | GET    | `/users`                          | `user.search`             | Поиск пользователей (по userName И fullName, подстрокой)      |
| [x] | GET    | `/users/by-username/{userName}`   | `user.getByUserName`      | Профиль по точному userName (регистронезависимо)              |
| [x] | GET    | `/users/suggestions`              | `user.getSuggestions`     | Рекомендации для вас                                          |
| [x] | POST   | `/users/search-history`           | `user.addSearchText`      | Добавить текстовый запрос в историю поиска                    |
| [x] | GET    | `/users/search-history`           | `user.getSearchTexts`     | История текстовых запросов (с createdAt!)                     |
| [x] | DELETE | `/users/search-history`           | `user.clearSearchTexts`   | Очистить историю текстовых запросов                           |
| [x] | DELETE | `/users/search-history/users`     | `user.clearSearchedUsers` | Очистить историю просмотренных профилей                       |
| [x] | GET    | `/users/search-history/users`     | `user.getSearchedUsers`   | История просмотренных профилей (с createdAt!)                 |
| [x] | DELETE | `/users/search-history/user/{id}` | `user.removeSearchedUser` | Удалить один профиль из истории поиска                        |
| [x] | DELETE | `/users/search-history/{id}`      | `user.removeSearchText`   | Удалить один текстовый запрос из истории                      |
| [x] | POST   | `/users/search-history/user`      | `user.addSearchedUser`    | Добавить профиль в историю поиска (повтор — поднимает наверх) |
| [x] | DELETE | `/users/me`                       | `user.deleteMe`           | Удалить свой аккаунт (soft-delete)                            |
| [x] | POST   | `/users/{id}/report`              | `user.report`             | Пожаловаться на пользователя                                  |

## verification — 4/4

| ✓   | Метод | Путь                        | Сервис                    | Что делает                                                         |
| --- | ----- | --------------------------- | ------------------------- | ------------------------------------------------------------------ |
| [x] | GET   | `/verification/status`      | `verification.getStatus`  | Статус верификации (TRIAL/ACTIVE/EXPIRED/CANCELED + дней осталось) |
| [x] | POST  | `/verification/start-trial` | `verification.startTrial` | Начать бесплатный триал (7 дней, 1 раз на аккаунт)                 |
| [x] | POST  | `/verification/subscribe`   | `verification.subscribe`  | Оформить подписку ($1000/мес, mock-платёж MOCK/PAID)               |
| [x] | POST  | `/verification/cancel`      | `verification.cancel`     | Отменить (галочка держится до конца оплаченного периода)           |
