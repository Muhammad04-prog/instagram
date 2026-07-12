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

## Gender enum

| write (int) | read (string) |
| ----------- | ------------- |
| `0`         | `"Female"`    |
| `1`         | `"Male"`      |

Дар код: `GENDER_VALUE` (`src/types/profile.types.ts`).
