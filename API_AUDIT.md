# API_AUDIT — фронтенд ↔ backend (169/190 endpoint пайваст)

Манбаи ҳақиқат ва рӯйхати пурраи 190 endpoint (бо ✓/✗ ва файли сервис): **[`docs/API_MAP_V2.md`](docs/API_MAP_V2.md)**.
Он файл **генератсия мешавад** (`node scripts/gen-api-map.js`) — дар ин ҷо такрор карда нашуд, то ду манбаи ҳақиqат ба вуҷуд наояд.

Пеш аз ин audit, худи скрипти генератор ду баг дошт (ROOT-и hardcode аз компютери дигар + regex-е, ки
generic-ҳои two-level-и `Page<T>`-ро намедид — бинобар ин ҳамаи endpoint-ҳои cursor-pagination хато
"нопайваст" нишон дода мешуданд). Ҳарду ислоҳ шуданд (commit `6b5491a`) — ҳоло рақамҳо дурустанд.

## Ҳолати ҳозира: 21 endpoint нопайваст

✅ **music/online (3) пайваст шуд** — `MusicPicker` акнун ба ғайр аз китобхонаи худамон, ҳангоми ҷустуҷӯ каталоги берунаро (Spotify/Deezer) низ мепурсад, мисли IG-и воқеӣ.

| Модул                                                                                                         | Пайваст | Нопайваст                                                                                 | Аҳамият                                                                        |
| ------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| auth, close-friends, health, highlights, notifications, search, spotify, stories, upload, verification, admin | 100%    | 0                                                                                         | —                                                                              |
| **socket**                                                                                                    | 0/1     | `/socket/ticket`                                                                          | 🔴 **Блокер** — бе ин ҳеҷ фичраи реал-вақт (чат, зангҳо) кор карда наметавонад |
| **chats**                                                                                                     | 19/30   | 11: group chat CRUD (5), calls (ice-servers, answer, decline, end, history, start)        | 🔴 Видеозвонок/овоз/гурӯҳ — маҳз он чизе ки дар ТЗ хоста шуд                   |
| **live**                                                                                                      | 16/20   | 4: requests accept/decline, comments, requests list                                       | 🟡                                                                             |
| **music**                                                                                                     | 9/9 ✅  | —                                                                                         | —                                                                              |
| **locations**                                                                                                 | 5/6     | 1: `/locations/{id}/posts`                                                                | 🟢                                                                             |
| **notes**                                                                                                     | 8/9     | 1: `/notes/{id}`                                                                          | 🟢                                                                             |
| **posts**                                                                                                     | 21/22   | 1: `GET /posts` — **қасдан сарфи назар шуд** (дубли `/search/explore`, экрани худаш нест) | —                                                                              |
| **profile**                                                                                                   | 14/15   | 1: `/profile/me/collections`                                                              | 🟢                                                                             |
| **users**                                                                                                     | 12/13   | 1: `/users/by-username/{userName}`                                                        | 🟢                                                                             |

## Тартиби пешниҳодшуда (як модул = як сессия/commit, мувофиқи CLAUDE.md)

1. ✅ ~~**music/online** (3) — ҷустуҷӯи мусиқии беруна барои ёддошт/пост.~~ Иҷро шуд.
2. **socket + chats/calls** (12 endpoint) — калонтарин ва мураккабтарин пора: `socket.io-client`,
   ticket handshake, WebRTC signaling барои занг, group-chat CRUD. Ин маҳз он чизест, ки дар суратҳо
   хоста будед (звонок/видеозвонок/овоз).
3. **live** (4) — join-request flow.
4. Панҷ якто-эндпоинти хурд (locations posts, notes/{id}, profile/collections, users/by-username) —
   якҷоя дар як commit.

Ҳар модул: audit → wiring → `tsc --noEmit`/`build` → commit ҷудогона бо паёми возеҳ.
