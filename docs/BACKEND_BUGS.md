# BACKEND_BUGS — баги API `instagram-api.softclub.tj`

Ҳар банд бо **curl** ба API-и воқеӣ санҷида шудааст (сана: 2026-07-13, Фазаи 4).
Ин файл барои ҳимояи проект аст: агар дар UI чизе кор накунад, сабаб дар ин ҷост.

---

## 1. `DELETE /UserProfile/delete-user-image-profile` → аккаунт баста мешавад 🔴 CRITICAL

**Чӣ мешавад:** endpoint `200 OK` бармегардонад ва `image`-ро ба `null` мегузорад.
Пас аз ин **логини ҳамон корбар абадан 500 медиҳад**:

```json
{ "data": null, "errors": ["Value cannot be null. (Parameter 'value')"], "statusCode": 500 }
```

Яъне: корбар аз аккаунти худ бароварда мешавад ва дигар ворид шуда наметавонад.

**Сабаб (тахминӣ):** `Account/login` майдони `image`-ро бе санҷиши `null` map мекунад.
Ҳангоми `register` он `""` (сатри холӣ) аст — барои ҳамин логин кор мекунад;
`delete-image` онро `null` мекунад — ва login меафтад.

**Санҷиш (3 аккаунт, натиҷа якхела):**

| Ҳолат                                               | login                     |
| --------------------------------------------------- | ------------------------- |
| аккаунти нав (`image: ""`)                          | 200 ✅                    |
| баъд аз upload-и аватар (`image: "….png"`)          | 200 ✅                    |
| баъд аз `delete-user-image-profile` (`image: null`) | **500 ❌**                |
| баъд аз upload-и аксиnav бо токени кӯҳна            | 200 ✅ (барқарор мешавад) |

**Барқарорсозӣ:** танҳо бо **токени кӯҳна** (ҳанӯз эътибор дорад) сурати нав бор кардан →
`PUT /UserProfile/update-user-image-profile` → login дубора кор мекунад.
Агар корбар аллакай logout карда бошад — токен нест — **аккаунт гум мешавад**.

**Қарори мо (Фазаи 4):** тугмаи «Удалить текущее фото» **кор мекунад** (endpoint 11/11 пӯшида аст),
вале дар `ConfirmDialog` матни **сурхи огоҳкунанда** нишон дода мешавад
(`profile.removePhotoWarning` дар се забон):

> «Диққат: аз сабаби хатои сервер, баъд аз нест кардани сурат вуруд ба аккаунт вайрон мешавад,
> то он даме ки сурати нав бор кунед.»

Баъд аз фикси бэкенд — танҳо ин матнро аз `AvatarUploader` гирифтан лозим аст.

---

## 2. `errors: ["success"]` ≠ хато 🟡

Баъзе endpoint-ҳо ҳангоми **муваффақият** массиви `errors`-ро пур мекунанд:

```jsonc
// PUT /UserProfile/update-user-profile → 200
{ "data": null, "errors": ["success"], "statusCode": 200 }

// POST /FollowingRelationShip/add-following-relation-ship → 200
{ "data": false, "errors": ["success followed"], "statusCode": 200 }

// DELETE /FollowingRelationShip/delete-following-relation-ship → 200
{ "data": false, "errors": ["success un followed"], "statusCode": 200 }

// PUT /UserProfile/update-user-image-profile → 200
{ "data": null, "errors": ["success"], "statusCode": 200 }
```

Дар follow/unfollow ҳатто `data: false` меояд, гарчанде амал **иҷро шуд**
(санҷида шуд: `subscribersCount` 33 → 34 → 33).

**Қарори мо:** дар `src/lib/axios.ts` хато танҳо вақте партофта мешавад, ки
`statusCode >= 400`. Майдонҳои `errors` ва `data` барои муайян кардани муваффақият
истифода намешаванд.

---

## 3. `gender` асимметрӣ: read = сатр, write = рақам 🟡

- `GET /UserProfile/get-my-profile` → `"gender": "Male"` (**сатр**)
- `PUT /UserProfile/update-user-profile` бо `"gender": "Male"` → **400**:
  `The JSON value could not be converted to System.Nullable\`1[Domain.Enums.Gender]`
- Ҳамон дархост бо `"gender": 1` → **200**

**Ҷадвали воқеии enum** (санҷида шуд бо round-trip):

| Рақам (write) | Сатр (read) |
| ------------- | ----------- |
| `0`           | `"Female"`  |
| `1`           | `"Male"`    |

Дар код: `GENDER_VALUE` дар `src/types/profile.types.ts`.

---

## 4. `get-is-follow-user-profile-by-id` boolean намедиҳад 🟢 (на баг, вале Swagger хомӯш аст)

Swagger response-schema надорад. Дар амал он **тамоми профил + `isSubscriber`**-ро медиҳад,
на танҳо `true/false`. Ин ба нафъи мост: як дархост ҳам header, ҳам тугмаи Follow-ро сер мекунад.

---

## 6. `comments[]` ҳамеша бе ном меояд 🟡

Дар ҳама endpoint-ҳои Post (`get-posts`, `get-post-by-id`, `get-following-post`) майдонҳои
`comments[].userName` ва `comments[].userImage` **`null`**-анд, гарчанде `userId` ҳаст.

**Ҳалли мо:** `useProfileLite(userId)` — номи муаллифи шарҳ аз
`get-user-profile-by-id` гирифта, дар TanStack Query кэш карда мешавад (як дархост ба ҳар корбар).

---

## 7. `get-my-posts` бе конверт ҷавоб медиҳад 🟡

Ҳама endpoint-ҳои дигар `{ data, errors, statusCode }` медиҳанд, вале `get-my-posts`
**массиви холис** мебарорад. Интерсептори `lib/axios.ts` unwrap-ро танҳо ҳангоми мавҷуд будани
калиди `data` мекунад, бинобар ин ҳарду ҳолат кор мекунад.

---

## 8. `get-following-post` бе `UserId` хомӯшона холӣ медиҳад 🟡

`GET /Post/get-following-post?PageNumber=1&PageSize=5` (бе `UserId`) → `data: []`, `statusCode: 200`
— на хато, балки **лентаи холӣ**, гарчанде корбар обуна дорад. Бо `UserId=<id-и ман>` → 16 пост.
Хатари калон: касе метавонад фикр кунад, ки лента вайрон аст. `useFeed()` ҳатман `userId`-ро мефиристад.

---

## 9. `like-post` ва `add-post-favorite` toggle-анд 🟢

`data` = ҳолати **НАВ** (true/false), на «муваффақият». Барои ҳамин optimistic UI ҳолатро
худаш инверс мекунад ва танҳо ҳангоми хато rollback мешавад.

---

## 10. Story: файлҳои кӯҳна дар сервер нестанд (404) 🟡

`get-stories` `fileName`-ро медиҳад, вале барои сторисҳои кӯҳна
`GET /images/{fileName}` → **404**. Мисол: `2710078b-d06f-40f7-8bca-ed595db21fe1.jpg` (story 379/380).
Сторисҳои нав (аз ҷониби мо боршуда) → 200.

**Ҳалли мо:** `StoryViewer` `onError`-ро мегирад ва ба ҷои экрани сиёҳ матни
«Файли ин ҳикоя дигар дар сервер нест» нишон медиҳад.

---

## 11. Story: `likedCount` ҳамеша `0` мемонад 🟡

Баъд аз `LikeStory` майдони `liked` дуруст `true` мешавад, вале `likedCount` дар рӯйхат
**ҳамеша 0** аст. Дар айни замон `GetStoryById.viewerDto.viewLike` дуруст `1` мешавад.
→ дар UI шумораи лайкҳо аз `viewerDto` гирифта мешавад (StoryViewersSheet), на аз `likedCount`.

---

## 12. Story: «ман дидаам»-ро API намедиҳад 🟡

`add-story-view` намоишро сабт мекунад, вале ҳеҷ endpoint барнамегардонад, ки **ман** ин сторисро
дидаам ё не (`viewerDto` танҳо ҷамъбаст аст). Барои ҳамин ҳалқаи хокистарӣ (дидашуда) дар
браузер нигоҳ дошта мешавад — `store/story.store.ts` (Zustand + localStorage).
Маҳдудият: дар браузери дигар ҳалқаҳо боз рангин мешаванд.

---

## 5. `get-post-favorites` пагинатсияро дар сатҳи боло медиҳад 🟢

`{ pageNumber, pageSize, totalPage, totalRecord, data: [...] }` — вале `totalRecord`
шумораи **ҳамаи** постҳои система аст (276), на постҳои нигоҳдоштаи ман.
Барои ҳамин infinite scroll аз рӯи дарозии саҳифа қарор мегирад
(`page.length < PAGE_SIZE` → охир), на аз рӯи `totalPage`.

---

## 13. `delete-user` барои ҲАМА 403 медиҳад (admin-only) 🔴

`DELETE /User/delete-user?userId=` — endpoint танҳо ба админ иҷозат медиҳад.
Санҷида шуд (Фазаи 8, ду аккаунти яквақта сохташуда — на корбари воқеӣ):

| Кӣ → киро нест мекунад        | Ҷавоб   |
| ----------------------------- | ------- |
| корбари оддӣ → корбари дигар  | **403** |
| корбари оддӣ → **худи худаш** | **403** |

Яъне корбар аккаунти худро нест карда **наметавонад**. Дар Swagger ҳеҷ ишорае ба admin нест.
→ Тугмаи «Удалить аккаунт» дар `settings` мемонад (double-confirm), вале дар амал ҳамеша
хатои серверро дар toast нишон медиҳад: `settings.deleteAccountForbidden`.
Агар бэкенд self-delete-ро иҷоза диҳад — UI бе тағйирот кор мекунад.

---

## 14. Таърихи ҷустуҷӯ мӯҳри вақт (timestamp) надорад 🟡

`get-search-histories` → `[{ id, text }]`, `get-user-search-histories` → `[{ id, users }]`.
Дар ҳеҷ кадоме `createdAt` нест, ва `id`-ҳо аз **ду ketma-кетии гуногун** мебароянд
(матн ~205, корбар ~541), бинобар ин муқоисаи байнихудӣ маъно надорад.
→ «Недавние»-и ягонаи хронологӣ **ғайриимкон** аст. Дар UI аввал аккаунтҳо, баъд дархостҳои матнӣ
(ҳар гурӯҳ — навтарин дар боло).

Мусбат: сервер такрорро худаш филтр мекунад — `add-search-history?Text=cat` ду бор → як сатр.

---

## 15. `delete-message` моликиятро тафтиш намекунад 🔴

Корбари A паёми корбари B-ро бе ҳеҷ хато нест карда метавонад
(`DELETE /Chat/delete-message?massageId=<паёми B>` → `{data:true}`, 200).
Санҷида шуд дар ду аккаунти яквақта сохташуда.

→ Дар UI менюи «…» **танҳо дар паёми ХУДӢ** render мешавад (`MessageBubble`: `mine && !pending`).
Ин танҳо ҳимояи client-ӣ аст — бэкенд бояд ислоҳ шавад.

⚠️ Инчунин `massageId` — опечаткаи худи API (на хатои мо), ҳамон тавр монда шуд.

---

## 16. Дар Chat API ҳеҷ «хондашуда/нохонда» нест 🟡

На `get-chats`, на `get-chat-by-id` майдони `isRead` / `unreadCount` надоранд.
→ **Badge-и нохонда дар Sidebar/MobileNav сохта НАШУД** — рақами сохта нишон намедиҳем.
Инчунин `get-chats` вақти паёми охирин надорад → сортировкаи чатҳо аз рӯи `chatId` (навтарин аввал).

---

## 17. `send-message` паёми ХОЛӢ қабул мекунад 🟡

`PUT /Chat/send-message` бо танҳо `ChatId` (бе `MessageText`, бе `File`) → `200`, паёми холӣ сохта мешавад.
→ Дар UI тугмаи фиристодан ҳангоми холӣ будан ғайрифаъол аст (`MessageInput`: `canSend`).

---

## 18. Realtime нест 🟡

`/chatHub`, `/chathub`, `/hub`, `/Chat/hub`, `/signalr` → ҳама **404**. SignalR-hub вуҷуд надорад.
→ `refetchInterval: 5000` (`CHAT_POLL_MS`) барои рӯйхати чатҳо ва чати кушода.
Санҷида шуд: B паём фиристод → A онро **бе reload** дар ~5 сония гирифт.
«Печатает…» ва «Просмотрено» дар API нестанд → сохта нашуданд.

---

## 19. `update-Location` ҳамеша 400 медиҳад (AutoMapper) 🔴

```
Missing type map configuration or unsupported mapping.
Mapping types: UpdateLocationDto -> Location
```

Хатои конфигуратсияи AutoMapper дар худи сервер. Санҷида шуд бо `camelCase`, `PascalCase`
ва query-параметрҳо — натиҷа якхела. `add` ва `delete` бошанд, комилан кор мекунанд.

→ Тугмаи «Сохранить» дар `LocationForm` мемонад, хатои сервер ба toast мебарояд.
Агар бэкенд mapper-ро ислоҳ кунад — UI бе ягон тағйирот кор мекунад.

---

## 20. Location ба пост ва профил пайваст намешавад 🟡

`add-post` майдони локатсия надорад; `update-user-profile` танҳо `about` + `gender` мегирад.
Ҳол он ки `get-my-profile` майдони `locationId` **бармегардонад** (танҳо барои хондан).
→ Location феҳристи мустақил аст; «Добавить место» (img33) сохта нашуд — сохтакорӣ мебуд.

---

## 21. `get-following-post` пагинатсияро НОДИДА мегирад 🔴

`PageNumber` ва `PageSize` тамоман кор намекунанд — endpoint **ҳамеша тамоми лентаро** бармегардонад:

| Дархост                    | Натиҷа                           |
| -------------------------- | -------------------------------- |
| `?PageNumber=1&PageSize=5` | 56 пост (ids: 77, 79, 81, 82, …) |
| `?PageNumber=2&PageSize=5` | **ҳамон 56 пост, ҳамон ids**     |
| `?PageNumber=3&PageSize=5` | **ҳамон 56 пост**                |

→ Infinite scroll саҳифаи 2-ро мегирифт ва ҳамон постҳоро **такрор** ба лента илова мекард
(калидҳои такрории React). `useFeed()` ҳоло як саҳифа мехонад: `getNextPageParam: () => undefined`.

⚠️ Инчунин **сует аст**: бо 5 обуна ҷавоб ~21 сония тӯл мекашад (56 пост бо ҳамаи шарҳҳо).

✅ `get-posts` ва `get-reels` пагинатсияро дуруст иҷро мекунанд — танҳо ҳамин endpoint шикастааст.

---

# ҶАМЪБАСТ — 21 боги ёфташуда

| #   | Endpoint / мавзӯъ                                  | Дараҷа | Таъсир ба UI                                   |
| --- | -------------------------------------------------- | ------ | ---------------------------------------------- |
| 1   | `delete-user-image-profile` аккаунтро мебандад     | 🔴     | Тугма ҳаст + огоҳии сурх дар ConfirmDialog     |
| 2   | `errors: ["success"]` дар ҷавоби муваффақ          | 🟡     | Интерцептор танҳо ба `statusCode` такя мекунад |
| 3   | `gender` асимметрӣ (хондан сатр, навиштан рақам)   | 🟡     | `GENDER_VALUE`                                 |
| 4   | `get-is-follow…` профили пурра медиҳад, на boolean | 🟢     | Як дархост ҳам header, ҳам FollowButton        |
| 5   | `get-post-favorites` → `totalRecord` ҳамаи постҳо  | 🟢     | Infinite scroll аз рӯи дарозии саҳифа          |
| 6   | `comments[].userName` ҳамеша `null`                | 🟡     | Ном аз `useProfileLite`                        |
| 7   | `get-my-posts` бе конверт                          | 🟡     | Unwrap шартӣ                                   |
| 8   | `get-following-post` бе `UserId` → лентаи холӣ     | 🟡     | Ҳамеша id аз JWT фиристода мешавад             |
| 9   | `like-post` / `add-post-favorite` toggle-анд       | 🟢     | Optimistic UI инверсия мекунад                 |
| 10  | Файлҳои кӯҳнаи сторис 404                          | 🟡     | Матни ростқавлона дар вьюер                    |
| 11  | Story `likedCount` ҳамеша 0                        | 🟡     | Ҳисоб аз `viewerDto.viewLike`                  |
| 12  | «Ман дидаам»-и сторис дар API нест                 | 🟡     | Ҳалқаи хокистарӣ дар localStorage              |
| 13  | `delete-user` → **403 ба ҳама** (admin-only)       | 🔴     | Тугма ҳаст, хато ба toast                      |
| 14  | Таърихи ҷустуҷӯ timestamp надорад                  | 🟡     | «Недавние» аввал аккаунтҳо, баъд матн          |
| 15  | `delete-message` моликиятро тафтиш намекунад       | 🔴     | Меню танҳо дар паёми худӣ (ҳимояи client)      |
| 16  | «Хондашуда/нохонда» дар Chat нест                  | 🟡     | Badge сохта нашуд                              |
| 17  | `send-message` паёми холӣ қабул мекунад            | 🟡     | Фиристодани холӣ баста шуд                     |
| 18  | SignalR/realtime нест                              | 🟡     | Polling 5s                                     |
| 19  | `update-Location` → 400 (AutoMapper)               | 🔴     | Тугма ҳаст, хато ба toast                      |
| 20  | Location ба пост/профил пайваст намешавад          | 🟡     | CRUD дар settings, на дар post/create          |

**6 боги 🔴** — UI онҳоро пинҳон намекунад: тугма мемонад, хатои воқеии сервер ба корбар нишон дода мешавад.
