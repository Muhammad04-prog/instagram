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

## 5. `get-post-favorites` пагинатсияро дар сатҳи боло медиҳад 🟢

`{ pageNumber, pageSize, totalPage, totalRecord, data: [...] }` — вале `totalRecord`
шумораи **ҳамаи** постҳои система аст (276), на постҳои нигоҳдоштаи ман.
Барои ҳамин infinite scroll аз рӯи дарозии саҳифа қарор мегирад
(`page.length < PAGE_SIZE` → охир), на аз рӯи `totalPage`.
