# API_REAL_DTO — DTO-ҳои ВОҚЕИИ API

Ҳама аз ҷавоби зиндаи `https://instagram-api.softclub.tj` гирифта шудаанд (curl, 2026-07-13).
Ҳар ҷо ки Swagger бо ҷавоби воқеӣ фарқ мекунад — **ҷавоби воқеӣ ҳақ аст** (CLAUDE.md).
Багҳои бэкенд: `docs/BACKEND_BUGS.md`.

---

## UserProfile

### `GET /UserProfile/get-my-profile`

```jsonc
{
  "userName": "ph4c1783888720",
  "image": "065da838-….png", // "" барои аккаунти нав, null баъд аз delete → БАГ #1
  "dateUpdated": "2026-07-12T20:39:05.360428Z",
  "gender": "Male", // САТР, на 0|1
  "postCount": 0,
  "subscribersCount": 0,
  "subscriptionsCount": 2,
  "firstName": "Phase",
  "lastName": "Four",
  "locationId": 1,
  "dob": "2026-07-12T20:17:53.968388Z",
  "occupation": "",
  "about": "x",
}
```

⚠️ **`id` НЕСТ** → id-и корбари ҷорӣ аз claims-и JWT гирифта мешавад (`SessionUser.userId`).
⚠️ Дар ТЗ `fullName` ва `posts[]` буданд — дар API **нестанд**.

### `GET /UserProfile/get-user-profile-by-id?id=`

Айнан ҳамон сохтор (бе `id`, бе `isSubscriber`).

### `GET /UserProfile/get-is-follow-user-profile-by-id?followingUserId=`

Ҳамон профил **+ `isSubscriber: boolean`**. Boolean-и танҳо намедиҳад!
Барои ҳамин `useUserProfile()` як дархост мекунад ва ҳам header, ҳам `FollowButton`-ро сер мекунад.

### `PUT /UserProfile/update-user-profile`

```jsonc
// request — танҳо ДУ майдон қабул мекунад
{ "about": "string", "gender": 1 } // 0 = Female, 1 = Male
```

`occupation`, `firstName`, `dob`, `locationId` — **тағйир дода намешаванд** (дар DTO нестанд).
Барои ҳамин дар `profile/edit` танҳо «О себе» + «Пол» ҳаст (майдони «Сайт» аз img43 дар API нест).

### `PUT /UserProfile/update-user-image-profile`

`multipart/form-data`, майдон: **`imageFile`**. Ҷавоб: `{ data: null, errors: ["success"], statusCode: 200 }`.

### `DELETE /UserProfile/delete-user-image-profile`

`200`, вале **аккаунтро мебандад** → `docs/BACKEND_BUGS.md` #1. Тугма дар UI disabled.

### `GET /UserProfile/get-post-favorites?PageNumber=&PageSize=`

Пагинатсия дар сатҳи боло + `data` = массиви **Post**-ҳои пурра (на id-ҳо):

```jsonc
{
  "pageNumber": 1,
  "pageSize": 12,
  "totalPage": 56,
  "totalRecord": 276, // totalRecord = ҲАМАИ постҳо, на нигоҳдоштаҳо!
  "data": [/* Post — поёнтар */],
}
```

⚠️ Дар `data` майдонҳои `userName` / `userImage` **`null`** мешаванд (дар `get-posts` пур ҳастанд).

---

## FollowingRelationShip

### `GET /FollowingRelationShip/get-subscribers?UserId=` · `…/get-subscriptions?UserId=`

`UserId` **ҳатмист** (бе он → 400).

```jsonc
[
  {
    "id": 92, // id-и худи алоқа (relation), на корбар
    "userShortInfo": {
      "userId": "053f4edb-…",
      "userName": "eraj",
      "userPhoto": "", // на userImage!
      "fullname": "mirzoev ", // n-и хурд: fullname, на fullName!
    },
  },
]
```

### `POST …/add-following-relation-ship?followingUserId=` · `DELETE …/delete-following-relation-ship?followingUserId=`

```jsonc
{ "data": false, "errors": ["success followed"], "statusCode": 200 } // data: false ҳангоми МУВАФФАҚИЯТ
```

Танҳо `statusCode` ҳақиқатро мегӯяд (санҷида шуд: `subscribersCount` 33 → 34 → 33).

---

## Post (12 endpoint — ҳама дар Фазаи 5 санҷида шуданд)

### Хулосаи муҳим

| Endpoint             | Нозукӣ                                                                      |
| -------------------- | --------------------------------------------------------------------------- |
| `get-my-posts`       | **Бе конверт!** массиви холис бармегардонад (на `{data,errors,statusCode}`) |
| `get-following-post` | `UserId` **ҳатмист** — бе он `data: []` бе ҳеҷ хато (тахмин: 0 пост)        |
| `like-post`          | **TOGGLE**, `data` = ҳолати НАВ (true = лайк шуд, false = лайк гирифта шуд) |
| `add-post-favorite`  | **TOGGLE** ҳам, `data` = ҳолати нав                                         |
| `add-post`           | multipart: `Title`, `Content`, `Images[]` → `data` = **postId**-и нав       |
| `view-post`          | якхела (idempotent): 2 бор занг → `postView` ҳамон 1 мемонад                |
| `comments[]`         | `userName` ва `userImage` **ҳамеша `null`** → ном аз профил гирифта мешавад |
| `add-post`           | майдони **location НЕСТ** → «Добавить место» (img33) сохта нашуд            |

### `GET /Post/get-posts?UserId=&Title=&Content=&PageNumber=&PageSize=`

```jsonc
{
  "postId": 247,
  "userId": "c0b42678-…",
  "userName": "tom11",
  "userImage": null,
  "datePublished": "2025-10-27T13:47:44.861809Z",
  "images": ["174231b8-….mp4"], // МАССИВИ САТРҲО (на PostImage[]), метавонад видео бошад!
  "postLike": false,
  "postLikeCount": 7,
  "userLikes": null,
  "commentCount": 10,
  "postView": 9, // на postViewCount
  "userViews": null,
  "postFavorite": false,
  "userFavorite": null,
  "title": null,
  "content": "hello😮😮",
}
```

⚠️ Аз ТЗ фарқ: `images` массиви **сатрҳо**, `postView` (на `postViewCount`),
`postFavoriteCount` умуман нест. `comments[]` дар ҳамин ҷавоб меояд (то 10-и охир).

### `GET /Post/get-reels`

Ҳамон сохтор, вале `images` **як сатр** аст (на массив) + майдони иловагии `isSubscriber`.
**Филтр аз рӯи `UserId` НЕСТ** → таби «Reels»-и профил аз `get-posts` ҳисоб мешавад
(постҳое, ки файлашон видео аст).

---

## Story (8 endpoint — Фазаи 6)

### `GET /Story/get-stories` — **бе конверт**, гурӯҳбандӣ аз рӯи муаллиф

Swagger `GetStoryDto[]` ваъда медиҳад — дар амал **массиви холиси гурӯҳҳо**:

```jsonc
[
  {
    "userId": "5f7b27e0-…",
    "userName": "ph4c1783888720",
    "userImage": "065da838-….png",
    "stories": [
      {
        "id": 598,
        "fileName": "1f196554-….png",
        "postId": null,
        "createAt": "…",
        "liked": false,
        "likedCount": 0,
      },
    ],
  },
]
```

⚠️ Дар рӯйхат **ҳамаи** корбарон меоянд — ҳатто онҳое, ки `stories: []` доранд (ва худи ман).
Дар UI гурӯҳҳои холӣ филтр мешаванд, «Ваша история» аввал меистад.
⚠️ **Ҳеҷ майдони «ман дидаам» нест** → ҳалқаи хокистарӣ дар client (Zustand + localStorage,
`store/story.store.ts`) нигоҳ дошта мешавад.

### `GET /Story/get-user-stories/{userId}` · `get-my-stories`

Як гурӯҳ (`{userId, userName, userImage, stories[]}`) — бо конверт.

### `GET /Story/GetStoryById?id=` — сохтори ДИГАР

```jsonc
{
  "id": 598,
  "fileName": "…",
  "postId": null,
  "createAt": "…",
  "userId": "5f7b27e0-…",
  "userAvatar": null,
  "viewerDto": { "userName": "ph4c…", "name": "Phase", "viewCount": 1, "viewLike": 1 },
}
```

⚠️ `viewerDto` — **рӯйхати тамошобинон НЕСТ**, балки ду ҳисобкунак (viewCount / viewLike)-и
худи сторис. Барои ҳамин `StoryViewersSheet` рақамҳоро нишон медиҳад, на чеҳраҳоро.

### `POST /Story/AddStories` — multipart `Image` + `?PostId=` (ихтиёрӣ)

Ҷавоб: `{ data: null, errors: ["success"], statusCode: 200 }` — id-и сторисро **намедиҳад**.

### `POST /Story/LikeStory?storyId=` — **TOGGLE, сатр**

`data: "Liked"` → `data: "Disliked"`. На boolean!

### `POST /Story/add-story-view?StoryId=`

`{ data: { id, viewUserId, storyId } }`. Такрор → `id: 0` (дубора ҳисоб намешавад) ✅

### `DELETE /Story/DeleteStory?id=` → `data: true`

---

## Gender enum

| write (int) | read (string) |
| ----------- | ------------- |
| `0`         | `"Female"`    |
| `1`         | `"Male"`      |

Дар код: `GENDER_VALUE` (`src/types/profile.types.ts`).

---

## User (10 endpoint — Фазаи 8)

⚠️ Дар Swagger барои **ҳеҷ як** аз ин 10 endpoint схемаи ҷавоб нест (`responses.200` холӣ).
Ҳама сохторҳои зер аз ҷавоби зинда гирифта шудаанд.

### `GET /User/get-users?UserName=&Email=&PageNumber=&PageSize=`

Пагинатсия дар сатҳи боло (мисли `get-post-favorites`):

```jsonc
{
  "pageNumber": 1,
  "pageSize": 3,
  "totalPage": 19,
  "totalRecord": 55,
  "data": [
    {
      "id": "053f4edb-…",
      "avatar": "", // на userImage
      "fullName": "mirzoev ",
      "subscribersCount": 20,
      "userName": "eraj",
    },
  ],
}
```

⚠️ `UserName` **substring** аст ва ба `fullName` низ мерасад: `UserName=er` → `eraj`, `amERica`, `chessmastER`.

### `POST /User/add-search-history?Text=` → `{ data: true }`

⚠️ `Text` холӣ → **400** `["The Text field is required."]`.
✅ Такрор → сатри нав сохта **намешавад** (сервер dedupe мекунад).

### `GET /User/get-search-histories`

```jsonc
[
  { "id": 205, "text": "cat" },
  { "id": 204, "text": "eraj" },
] // навтарин аввал, userId НЕСТ
```

### `POST /User/add-user-search-history?UserSearchId=` → `{ data: true }`

`UserSearchId` = **id-и корбар** (guid). Такрор → сатри нав намесозад.

### `GET /User/get-user-search-histories` — корбар ДОХИЛИ `users` аст

```jsonc
[
  {
    "id": 541, // id-и САТРИ таърих, на корбар!
    "users": {
      "id": "053f4edb-…",
      "avatar": "",
      "fullName": "mirzoev ",
      "subscribersCount": 20,
      "userName": "eraj",
    },
  },
]
```

⚠️ Ҳамвор (flat) НЕСТ — `{id, userId, userName, …}` интизор нашавед.

### `DELETE /User/delete-search-history?id=` · `delete-user-search-history?id=`

`{ data: true }`. id-и нодуруст → **404** `["Search history not found!"]`.

### `DELETE /User/delete-search-histories` · `delete-user-search-histories`

Ҳамаро тоза мекунад. «Очистить всё» = **ҳарду** занг (ду endpoint-и ҷудогона).

### `DELETE /User/delete-user?userId=`

🔴 **403 барои ҳама** — ҳатто барои нест кардани аккаунти ХУДӢ. → `BACKEND_BUGS.md` #13.

⚠️ Дар таърих `createdAt` нест → «Недавние»-и хронологӣ ғайриимкон. → `BACKEND_BUGS.md` #14.

---

## Chat (6 endpoint — Фазаи 9)

⚠️ Мисли теги User — дар Swagger **ҳеҷ схемаи ҷавоб нест**. Ҳама аз API-и зинда (ду аккаунт).
⚠️ **SignalR/WebSocket НЕСТ**: `/chatHub`, `/chathub`, `/hub`, `/signalr` → ҳама **404**
→ ба ҷои realtime `refetchInterval: 5000` (`CHAT_POLL_MS`).

### `POST /Chat/create-chat?receiverUserId=` → `{ data: 880 }`

`data` = **chatId**. ✅ **Идемпотент**: барои ҳамон корбар боз занг занӣ — ҳамон chatId, чати нав намесозад.

### `GET /Chat/get-chats`

```jsonc
[
  {
    "sendUserId": "857681bd-…",
    "sendUserName": "ph8s…",
    "sendUserImage": "",
    "chatId": 880,
    "receiveUserId": "0fc06a8c-…",
    "receiveUserName": "ph9b…",
    "receiveUserImage": "",
  },
]
```

⚠️ **Паёми охирин, вақт ва unread НЕСТ** — танҳо ду иштирокчӣ.
→ «ҳамсуҳбат» = он ки `userId`-и ман нест (`getChatPeer`).
→ Пешнамоиши сатр (паёми охирин + вақт) аз `get-chat-by-id`-и ҳамон чат гирифта мешавад.
✅ Гиранда (B) чатро дарҳол дар `get-chats`-и худ мебинад.

### `GET /Chat/get-chat-by-id?chatId=` — **навтарин АВВАЛ**

```jsonc
[
  {
    "userId": "857681bd-…",
    "userName": "ph8s…",
    "userImage": "",
    "messageId": 4448,
    "chatId": 880,
    "messageText": "file test",
    "sendMassageDate": "2026-07-13T08:38:15.387208Z", // ОПЕЧАТКА: Massage
    "file": "9e2fb10e-….png", // null агар замима набошад
  },
]
```

Файл дар `/images/{file}` дастрас (200). chatId-и нодуруст → **400** `["Chat not found"]`.

### `PUT /Chat/send-message` — multipart

Майдонҳо: `ChatId` (ҳатмӣ), `MessageText`, `File`. Ҷавоб: `data` = **messageId**-и нав.
⚠️ Паёми **комилан холӣ** (бе матн, бе файл) қабул мешавад → `BACKEND_BUGS.md` #17.

### `DELETE /Chat/delete-message?massageId=` → `{ data: true }`

⚠️ `massageId` — **опечаткаи бэкенд**, ҳамон тавр монд.
🔴 **Санҷиши моликият НЕСТ** — паёми ҳамсуҳбатро ҳам нест мекунад → `BACKEND_BUGS.md` #15.

### `DELETE /Chat/delete-chat?chatId=` → `{ data: true }`

Чат аз `get-chats` меравад (баъди reload ҳам).
