# API_MAP v2 — новый backend (NestJS), 170 endpoints

**Swagger:** `https://backend-instagram-kvv4.onrender.com/api/docs-json` → копия в `docs/swagger-v2.json`.

Файл **генерируется**: `node scripts/gen-api-map.js`. Колонки не проставляются вручную —
`Сервис` находится по литералу пути в `src/services/*.service.ts`, а `UI` = метод сервиса
вызывается хотя бы из одного файла вне самого сервиса. Это проверка проводки, **не** проверка
того, что экран работает: БД бэкенда лежит, живьём ни один ответ не сверен.

**Покрытие: 81 / 170** endpoint'ов вызываются из UI.

## admin — 0/4

| ✓   | Метод  | Путь                          | Сервис | Что делает                          |
| --- | ------ | ----------------------------- | ------ | ----------------------------------- |
| [ ] | GET    | `/admin/users`                | —      | Список пользователей (ADMIN)        |
| [ ] | DELETE | `/admin/users/{id}`           | —      | Удалить пользователя (мягко, ADMIN) |
| [ ] | GET    | `/admin/reports`              | —      | Список жалоб (ADMIN, filter=open    | resolved) |
| [ ] | POST   | `/admin/reports/{id}/resolve` | —      | Отметить жалобу решённой (ADMIN)    |

## auth — 11/11

| ✓   | Метод | Путь                    | Сервис                    | Что делает                                              |
| --- | ----- | ----------------------- | ------------------------- | ------------------------------------------------------- |
| [x] | POST  | `/auth/register`        | `auth.register`           | Регистрация                                             |
| [x] | POST  | `/auth/login`           | `auth.login`              | Вход по userName ИЛИ email ИЛИ phone                    |
| [x] | POST  | `/auth/refresh`         | `auth-tokens.ts (server)` | Обновить пару токенов                                   |
| [x] | POST  | `/auth/logout`          | `route.ts (server)`       | Выход — отзыв refresh-токена (идемпотентно)             |
| [x] | POST  | `/auth/forgot-password` | `auth.forgotPassword`     | Отправить 6-значный код на email                        |
| [x] | POST  | `/auth/resend-code`     | `auth.resendCode`         | Выслать код повторно (не чаще 1 раза в минуту)          |
| [x] | POST  | `/auth/verify-code`     | `auth.verifyCode`         | Проверить код → одноразовый resetToken (15 мин)         |
| [x] | POST  | `/auth/reset-password`  | `auth.resetPassword`      | Задать новый пароль по resetToken                       |
| [x] | PUT   | `/auth/change-password` | `auth.changePassword`     | Сменить пароль (нужен старый)                           |
| [x] | POST  | `/auth/check-username`  | `auth.checkUsername`      | Свободен ли userName (live-валидация формы регистрации) |
| [x] | GET   | `/auth/me`              | `route.ts (server)`       | Текущий пользователь + профиль                          |

## chats — 10/20

| ✓   | Метод  | Путь                            | Сервис                       | Что делает                                         |
| --- | ------ | ------------------------------- | ---------------------------- | -------------------------------------------------- |
| [x] | GET    | `/chats`                        | `chat.getChats`              | Список чатов                                       |
| [x] | POST   | `/chats`                        | `chat.create`                | Начать чат (идемпотентно)                          |
| [x] | PUT    | `/chats/messages/{id}`          | `chat.editMessage`           | Редактировать сообщение (≤15 мин, только своё)     |
| [x] | DELETE | `/chats/messages/{id}`          | `chat.deleteMessage`         | Удалить сообщение (OwnerGuard: только своё)        |
| [ ] | POST   | `/chats/messages/bulk-delete`   | `chat.bulkDeleteMessages`    | Удалить несколько своих сообщений                  |
| [ ] | POST   | `/chats/messages/{id}/reaction` | `chat.reactToMessage`        | Реакция на сообщение                               |
| [ ] | DELETE | `/chats/messages/{id}/reaction` | `chat.removeMessageReaction` | Убрать реакцию                                     |
| [x] | GET    | `/chats/requests`               | `chat.getRequests`           | Запросы на переписку (от неподписанных)            |
| [ ] | POST   | `/chats/requests/{id}/accept`   | `chat.acceptRequest`         | Принять запрос на переписку                        |
| [ ] | POST   | `/chats/requests/{id}/decline`  | `chat.declineRequest`        | Отклонить запрос (строка обновляется, не плодится) |
| [x] | GET    | `/chats/{id}`                   | `chat.getChatById`           | Детали чата                                        |
| [x] | DELETE | `/chats/{id}`                   | `chat.remove`                | Удалить чат (выйти из него)                        |
| [x] | GET    | `/chats/{id}/messages`          | `chat.getMessages`           | Сообщения чата (cursor)                            |
| [x] | POST   | `/chats/{id}/messages`          | `chat.send`                  | Отправить сообщение                                |
| [x] | POST   | `/chats/{id}/read`              | `chat.markRead`              | Отметить чат прочитанным («Просмотрено»)           |
| [ ] | PUT    | `/chats/{id}/theme`             | `chat.setTheme`              | Тема чата                                          |
| [ ] | PUT    | `/chats/{id}/nickname`          | `chat.setNickname`           | Никнейм собеседника в чате                         |
| [ ] | PUT    | `/chats/{id}/mute`              | `chat.setMuted`              | Заглушить/включить уведомления чата                |
| [ ] | POST   | `/chats/{id}/report`            | `chat.report`                | Пожаловаться на чат                                |
| [ ] | POST   | `/chats/{id}/call`              | `chat.startCall`             | Начать звонок (WebRTC-сигналинг через сокет)       |

## close-friends — 0/3

| ✓   | Метод  | Путь                      | Сервис | Что делает                                   |
| --- | ------ | ------------------------- | ------ | -------------------------------------------- |
| [ ] | GET    | `/close-friends`          | —      | Список близких друзей (зелёный круг историй) |
| [ ] | POST   | `/close-friends/{userId}` | —      | Добавить в близкие друзья (идемпотентно)     |
| [ ] | DELETE | `/close-friends/{userId}` | —      | Убрать из близких друзей                     |

## follow — 5/11

| ✓   | Метод  | Путь                            | Сервис                  | Что делает                                           |
| --- | ------ | ------------------------------- | ----------------------- | ---------------------------------------------------- |
| [x] | GET    | `/follow/requests`              | `follow.getRequests`    | Входящие заявки на подписку (для закрытого аккаунта) |
| [ ] | POST   | `/follow/requests/{id}/accept`  | `follow.acceptRequest`  | Принять заявку → подписчик видит контент             |
| [ ] | POST   | `/follow/requests/{id}/decline` | `follow.declineRequest` | Отклонить заявку                                     |
| [ ] | GET    | `/follow/blocked`               | `follow.getBlocked`     | Список заблокированных мной                          |
| [ ] | DELETE | `/follow/followers/{userId}`    | `follow.removeFollower` | Удалить подписчика (убирает ЕГО подписку на меня)    |
| [ ] | POST   | `/follow/{userId}/block`        | `follow.block`          | Заблокировать                                        |
| [ ] | DELETE | `/follow/{userId}/block`        | `follow.unblock`        | Разблокировать (подписки НЕ восстанавливаются)       |
| [x] | GET    | `/follow/{userId}/followers`    | `follow.getFollowers`   | Подписчики (у закрытого аккаунта — только своим)     |
| [x] | GET    | `/follow/{userId}/following`    | `follow.getFollowing`   | Подписки (у закрытого аккаунта — только своим)       |
| [x] | POST   | `/follow/{userId}`              | `follow.follow`         | Подписаться                                          |
| [x] | DELETE | `/follow/{userId}`              | `follow.unfollow`       | Отписаться (идемпотентно)                            |

## health — 0/1

| ✓   | Метод | Путь      | Сервис | Что делает                      |
| --- | ----- | --------- | ------ | ------------------------------- |
| [ ] | GET   | `/health` | —      | Проверка API, БД, Redis и MinIO |

## highlights — 0/5

| ✓   | Метод  | Путь                        | Сервис | Что делает                                           |
| --- | ------ | --------------------------- | ------ | ---------------------------------------------------- |
| [ ] | POST   | `/highlights`               | —      | Создать «Актуальное»                                 |
| [ ] | GET    | `/highlights/user/{userId}` | —      | Актуальное пользователя                              |
| [ ] | GET    | `/highlights/{id}`          | —      | Актуальное с историями                               |
| [ ] | PUT    | `/highlights/{id}`          | —      | Изменить актуальное (title / cover / состав историй) |
| [ ] | DELETE | `/highlights/{id}`          | —      | Удалить актуальное (истории остаются)                |

## live — 0/18

| ✓   | Метод | Путь                          | Сервис | Что делает                                                      |
| --- | ----- | ----------------------------- | ------ | --------------------------------------------------------------- |
| [ ] | POST  | `/live/start`                 | —      | Начать эфир → Live + LiveKit-комната + publisher-токен          |
| [ ] | GET   | `/live/feed`                  | —      | Активные эфиры подписок (рейл историй)                          |
| [ ] | GET   | `/live/user/{userId}`         | —      | Активный эфир пользователя (профиль → «В эфире»)                |
| [ ] | POST  | `/live/requests/{id}/accept`  | —      | Хост принял заявку → гостю publisher-токен (split-экран)        |
| [ ] | POST  | `/live/requests/{id}/decline` | —      | Хост отклонил заявку → гостю уведомление отказа                 |
| [ ] | GET   | `/live/{id}`                  | —      | Один эфир                                                       |
| [ ] | POST  | `/live/{id}/end`              | —      | Завершить эфир (статистика, комната закрывается)                |
| [ ] | POST  | `/live/{id}/join`             | —      | Зайти зрителем → subscriber-токен (Block + Privacy)             |
| [ ] | POST  | `/live/{id}/leave`            | —      | Покинуть эфир                                                   |
| [ ] | GET   | `/live/{id}/viewers`          | —      | Текущие зрители эфира                                           |
| [ ] | POST  | `/live/{id}/comment`          | —      | Комментарий в эфир                                              |
| [ ] | POST  | `/live/{id}/like`             | —      | Лайк эфира (можно много раз — всплывающие сердечки)             |
| [ ] | POST  | `/live/{id}/reaction`         | —      | Реакция-смайл (всплывает у всех)                                |
| [ ] | POST  | `/live/{id}/request-join`     | —      | Заявка на участие → уведомление хосту                           |
| [ ] | PUT   | `/live/{id}/camera`           | —      | Камера вкл/выкл (видео выкл → аватар/обложка, звук идёт всегда) |
| [ ] | PUT   | `/live/{id}/audio`            | —      | Звук вкл/выкл                                                   |
| [ ] | POST  | `/live/{id}/kick/{userId}`    | —      | Выгнать зрителя/гостя (только хост)                             |
| [ ] | GET   | `/live/{id}/stats`            | —      | Статистика эфира                                                |

## locations — 5/5

| ✓   | Метод  | Путь              | Сервис                     | Что делает                                   |
| --- | ------ | ----------------- | -------------------------- | -------------------------------------------- |
| [x] | GET    | `/locations`      | `location.getLocations`    | Список локаций (cursor, поиск по q)          |
| [x] | POST   | `/locations`      | `location.create`          | Создать локацию                              |
| [x] | GET    | `/locations/{id}` | `location.getLocationById` | Одна локация                                 |
| [x] | PUT    | `/locations/{id}` | `location.update`          | Обновить локацию (полная замена)             |
| [x] | DELETE | `/locations/{id}` | `location.remove`          | Удалить локацию (у постов locationId → null) |

## music — 0/6

| ✓   | Метод  | Путь                 | Сервис | Что делает                                            |
| --- | ------ | -------------------- | ------ | ----------------------------------------------------- |
| [ ] | GET    | `/music`             | —      | Поиск музыки (по title И artist, курсорная пагинация) |
| [ ] | GET    | `/music/trending`    | —      | В тренде                                              |
| [ ] | GET    | `/music/{id}/stream` | —      | Стриминг mp3 с поддержкой Range (перемотка)           |
| [ ] | GET    | `/music/{id}`        | —      | Трек по id                                            |
| [ ] | POST   | `/music/{id}/save`   | —      | Сохранить трек (идемпотентно)                         |
| [ ] | DELETE | `/music/{id}/save`   | —      | Убрать трек из сохранённых                            |

## notes — 0/8

| ✓   | Метод  | Путь                  | Сервис | Что делает                                            |
| --- | ------ | --------------------- | ------ | ----------------------------------------------------- |
| [ ] | GET    | `/notes`              | —      | Заметки: свои + подписок (активные)                   |
| [ ] | POST   | `/notes`              | —      | Создать заметку (text ≤60, musicId, bgColor; TTL 24ч) |
| [ ] | PUT    | `/notes/{id}`         | —      | Изменить свою заметку                                 |
| [ ] | DELETE | `/notes/{id}`         | —      | Удалить свою заметку                                  |
| [ ] | POST   | `/notes/{id}/like`    | —      | Лайк заметки (toggle) + уведомление LIKE_NOTE         |
| [ ] | GET    | `/notes/{id}/likes`   | —      | Кто лайкнул (только автору)                           |
| [ ] | POST   | `/notes/{id}/reply`   | —      | Ответить на заметку → сообщение в чат                 |
| [ ] | GET    | `/notes/{id}/replies` | —      | Ответы на заметку (только автору)                     |

## notifications — 0/5

| ✓   | Метод | Путь                           | Сервис | Что делает                                 |
| --- | ----- | ------------------------------ | ------ | ------------------------------------------ |
| [ ] | GET   | `/notifications`               | —      | Лента уведомлений (cursor, с группировкой) |
| [ ] | GET   | `/notifications/unread-count`  | —      | Количество непрочитанных                   |
| [ ] | GET   | `/notifications/profile-views` | —      | Кто заходил в твой профиль                 |
| [ ] | POST  | `/notifications/{id}/read`     | —      | Пометить прочитанным (всю группу)          |
| [ ] | POST  | `/notifications/read-all`      | —      | Пометить всё прочитанным                   |

## posts — 18/22

| ✓   | Метод  | Путь                           | Сервис                   | Что делает                                                      |
| --- | ------ | ------------------------------ | ------------------------ | --------------------------------------------------------------- |
| [x] | POST   | `/posts`                       | `post.create`            | Создать публикацию (до 10 медиа: фото И видео)                  |
| [x] | GET    | `/posts`                       | `post.getPosts`          | Explore — чужие публикации (закрытые аккаунты и блок исключены) |
| [x] | GET    | `/posts/feed`                  | `post.getFeed`           | Лента подписок                                                  |
| [x] | GET    | `/posts/reels`                 | `post.getReels`          | Reels (только видео-посты)                                      |
| [x] | GET    | `/posts/my`                    | `post.getMyPosts`        | Мои публикации                                                  |
| [x] | DELETE | `/posts/comments/{id}`         | `post.deleteComment`     | Удалить комментарий                                             |
| [x] | POST   | `/posts/comments/{id}/like`    | `post.likeComment`       | Лайк комментария (toggle)                                       |
| [x] | POST   | `/posts/comments/{id}/reply`   | `post.replyToComment`    | Ответить на комментарий                                         |
| [x] | GET    | `/posts/comments/{id}/replies` | `post.getCommentReplies` | Ответы на комментарий                                           |
| [x] | GET    | `/posts/{id}`                  | `post.getPostById`       | Публикация по id                                                |
| [x] | PUT    | `/posts/{id}`                  | `post.update`            | Изменить подпись (хэштеги пересобираются)                       |
| [x] | DELETE | `/posts/{id}`                  | `post.remove`            | Удалить публикацию (только свою)                                |
| [x] | POST   | `/posts/{id}/archive`          | `post.archive`           | В архив                                                         |
| [ ] | DELETE | `/posts/{id}/archive`          | `post.unarchive`         | Вернуть из архива                                               |
| [x] | POST   | `/posts/{id}/like`             | `post.like`              | Лайк (toggle) → { liked, likesCount }                           |
| [ ] | GET    | `/posts/{id}/likes`            | `post.getLikes`          | Кто лайкнул                                                     |
| [x] | POST   | `/posts/{id}/view`             | `post.view`              | Просмотр (считается 1 раз на пользователя)                      |
| [x] | POST   | `/posts/{id}/favorite`         | `post.favorite`          | Сохранить/убрать (toggle). collection — имя коллекции           |
| [ ] | POST   | `/posts/{id}/share`            | `post.share`             | Поделиться: в чат (toUserId) / в историю (toStory) / ссылка     |
| [ ] | POST   | `/posts/{id}/report`           | —                        | Пожаловаться на публикацию                                      |
| [x] | POST   | `/posts/{id}/comments`         | `post.addComment`        | Добавить комментарий                                            |
| [x] | GET    | `/posts/{id}/comments`         | `post.getComments`       | Комментарии к публикации (корневые, cursor)                     |

## profile — 11/14

| ✓   | Метод  | Путь                             | Сервис                   | Что делает                                       |
| --- | ------ | -------------------------------- | ------------------------ | ------------------------------------------------ |
| [x] | GET    | `/profile/me`                    | `profile.getMyProfile`   | Мой профиль                                      |
| [x] | GET    | `/profile/favorites`             | `profile.getFavorites`   | Сохранённое (только своё)                        |
| [x] | GET    | `/profile/me/reposts`            | `profile.getMyReposts`   | Мои репосты                                      |
| [ ] | GET    | `/profile/me/saved-music`        | `profile.getSavedMusic`  | Сохранённая музыка                               |
| [ ] | GET    | `/profile/me/activity`           | `profile.getMyActivity`  | Ваши действия                                    |
| [x] | PUT    | `/profile`                       | `profile.update`         | Изменить профиль                                 |
| [x] | PUT    | `/profile/privacy`               | `profile.setPrivacy`     | Закрытый аккаунт вкл/выкл                        |
| [x] | PUT    | `/profile/avatar`                | `profile.uploadAvatar`   | Загрузить аватар                                 |
| [x] | DELETE | `/profile/avatar`                | `profile.deleteAvatar`   | Удалить аватар                                   |
| [x] | GET    | `/profile/{userId}`              | `profile.getProfileById` | Профиль пользователя                             |
| [ ] | GET    | `/profile/{userId}/is-following` | `profile.isFollowing`    | Подписан ли я на этого пользователя              |
| [x] | GET    | `/profile/{userId}/posts`        | `profile.getUserPosts`   | Публикации пользователя (закрытый аккаунт → 403) |
| [x] | GET    | `/profile/{userId}/reels`        | `profile.getUserReels`   | Reels пользователя (закрытый аккаунт → 403)      |
| [x] | GET    | `/profile/{userId}/tagged`       | `profile.getUserTagged`  | Отмеченные публикации (закрытый аккаунт → 403)   |

## search — 0/4

| ✓   | Метод | Путь                     | Сервис | Что делает                                                        |
| --- | ----- | ------------------------ | ------ | ----------------------------------------------------------------- |
| [ ] | GET   | `/search`                | —      | Комбинированный поиск: аккаунты + хэштеги + локации одним ответом |
| [ ] | GET   | `/search/explore`        | —      | Сетка Explore: посты И видео вперемешку                           |
| [ ] | GET   | `/search/top`            | —      | Тренды: популярные хэштеги + аккаунты недели                      |
| [ ] | GET   | `/search/hashtag/{name}` | —      | Все посты с хэштегом (cursor)                                     |

## spotify — 0/3

| ✓   | Метод  | Путь                               | Сервис | Что делает                 |
| --- | ------ | ---------------------------------- | ------ | -------------------------- |
| [ ] | GET    | `/spotify/search`                  | —      | Поиск треков в Spotify     |
| [ ] | POST   | `/spotify/tracks/{spotifyId}/save` | —      | Сохранить трек из Spotify  |
| [ ] | DELETE | `/spotify/tracks/{spotifyId}/save` | —      | Убрать трек из сохранённых |

## stories — 9/12

| ✓   | Метод  | Путь                     | Сервис                 | Что делает                                                            |
| --- | ------ | ------------------------ | ---------------------- | --------------------------------------------------------------------- |
| [x] | POST   | `/stories`               | `story.create`         | Создать истории (мультизагрузка до 10 файлов → до 10 отдельных Story) |
| [x] | GET    | `/stories`               | `story.getRail`        | Рейл историй (сгруппировано по авторам)                               |
| [x] | GET    | `/stories/my`            | `story.getMyStories`   | Мои активные истории                                                  |
| [x] | GET    | `/stories/archive`       | `story.getArchive`     | Мои истёкшие истории (архив)                                          |
| [x] | GET    | `/stories/user/{userId}` | `story.getUserStories` | Истории пользователя                                                  |
| [ ] | GET    | `/stories/{id}`          | `story.getStoryById`   | История по id                                                         |
| [x] | DELETE | `/stories/{id}`          | `story.remove`         | Удалить свою историю                                                  |
| [x] | POST   | `/stories/{id}/view`     | `story.view`           | Отметить просмотренной (считается на сервере, 1 раз/зритель)          |
| [x] | POST   | `/stories/{id}/like`     | `story.like`           | Лайк истории (toggle → { liked, likesCount })                         |
| [ ] | POST   | `/stories/{id}/reaction` | `story.react`          | Реакция emoji → уходит сообщением в чат (можно много раз)             |
| [ ] | POST   | `/stories/{id}/reply`    | `story.reply`          | Ответ на историю → сообщением в чат                                   |
| [x] | GET    | `/stories/{id}/viewers`  | `story.getViewers`     | Список зрителей (только автору): кто смотрел + лайкнул + реакция      |

## upload — 1/2

| ✓   | Метод  | Путь            | Сервис          | Что делает                                    |
| --- | ------ | --------------- | --------------- | --------------------------------------------- |
| [ ] | POST   | `/upload`       | `upload.upload` | Загрузить до 10 файлов (фото / видео / аудио) |
| [x] | DELETE | `/upload/{key}` | `upload.remove` | Удалить файл по ключу                         |

## users — 11/12

| ✓   | Метод  | Путь                              | Сервис                    | Что делает                                                    |
| --- | ------ | --------------------------------- | ------------------------- | ------------------------------------------------------------- |
| [x] | GET    | `/users`                          | `user.search`             | Поиск пользователей (по userName И fullName, подстрокой)      |
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
| [ ] | POST   | `/users/{id}/report`              | `user.report`             | Пожаловаться на пользователя                                  |

## verification — 0/4

| ✓   | Метод | Путь                        | Сервис | Что делает                                                         |
| --- | ----- | --------------------------- | ------ | ------------------------------------------------------------------ |
| [ ] | GET   | `/verification/status`      | —      | Статус верификации (TRIAL/ACTIVE/EXPIRED/CANCELED + дней осталось) |
| [ ] | POST  | `/verification/start-trial` | —      | Начать бесплатный триал (7 дней, 1 раз на аккаунт)                 |
| [ ] | POST  | `/verification/subscribe`   | —      | Оформить подписку ($1000/мес, mock-платёж MOCK/PAID)               |
| [ ] | POST  | `/verification/cancel`      | —      | Отменить (галочка держится до конца оплаченного периода)           |
