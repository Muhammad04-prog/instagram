# Куда класть скриншоты Instagram, чтобы Claude Code их видел

Claude Code читает изображения через инструмент **Read** по пути файла (`.png`, `.jpg`, `.webp`).
Значит скриншоты нужно положить **внутрь репозитория** (не в `public/` — там только ассеты приложения) и **дать на них ссылку в `CLAUDE.md`**.

## 1. Структура папки

```
<корень-проекта>/
├── CLAUDE.md                    ← здесь ссылки на скрины (Claude читает автоматически)
├── docs/
│   ├── TZ.md
│   ├── ROADMAP.md
│   ├── API_MAP.md
│   └── design/                  ← ⬅️ СЮДА КЛАДЁШЬ ВСЕ СКРИНШОТЫ
│       ├── README.md            ← индекс: файл → что на нём
│       ├── light/
│       │   ├── 01-login.png
│       │   ├── 02-register.png
│       │   ├── 03-feed.png
│       │   ├── 04-story-viewer.png
│       │   ├── 05-explore.png
│       │   ├── 06-reels.png
│       │   ├── 07-chat-list.png
│       │   ├── 08-chat-window.png
│       │   ├── 09-profile.png
│       │   ├── 10-profile-edit.png
│       │   ├── 11-post-modal.png
│       │   ├── 12-post-create.png
│       │   ├── 13-search-panel.png
│       │   ├── 14-settings.png
│       │   └── 15-saved.png
│       ├── dark/
│       │   └── (те же 15 экранов в тёмной теме)
│       ├── mobile/
│       │   ├── feed.png, reels.png, chat.png, profile.png, nav-bottom.png
│       └── components/
│           ├── sidebar.png, post-card.png, story-ring.png,
│           ├── follow-button.png, comment-row.png, buttons-states.png
```

> Формат: PNG, ширина 1440px (desktop) / 390px (mobile). Имя файла — **латиницей, без пробелов**.

## 2. `docs/design/README.md` (индекс)

```md
| Файл                   | Экран        | Что важно скопировать                            |
| ---------------------- | ------------ | ------------------------------------------------ |
| light/03-feed.png      | Лента        | ширина колонки 470px, сторис-бар, правый сайдбар |
| light/09-profile.png   | Профиль      | шапка, статистика, вкладки, сетка 3×3            |
| dark/03-feed.png       | Лента (dark) | #000 фон, #262626 границы                        |
| components/sidebar.png | Сайдбар      | иконки, отступы, активное состояние              |
```

## 3. Что дописать в `CLAUDE.md` (корень проекта)

```md
## Дизайн — источник истины

Перед вёрсткой любого экрана **обязательно прочитай** соответствующий скриншот из `docs/design/`:

- лента → `docs/design/light/03-feed.png` и `docs/design/dark/03-feed.png`
- профиль → `docs/design/light/09-profile.png`
- чат → `docs/design/light/08-chat-window.png`
- мобильный вид → `docs/design/mobile/`
  Индекс всех скринов: `docs/design/README.md`.
  Отступы, размеры, цвета и иконки должны совпадать со скриншотом (допуск ±2px).
  Токены цветов — только из `src/app/globals.css`, хардкод HEX запрещён.

## Документы проекта

- ТЗ: `docs/TZ.md`
- Роадмап (идти строго по нему): `docs/ROADMAP.md`
- Карта API (57 endpoints): `docs/API_MAP.md`
```

## 4. Как заставить Claude Code реально посмотреть картинку

В сессии пиши явно, например:

> «Прочитай `docs/design/light/03-feed.png` и `docs/design/dark/03-feed.png`, затем сверстай `PostCard` и `Feed` пиксель-в-пиксель по ним.»

Или просто перетащи файл в терминал Claude Code — он подставит путь.

## 5. Где взять скриншоты

- Открой instagram.com в браузере → DevTools → Cmd/Ctrl+Shift+P → «Capture full size screenshot» (в обеих темах).
- Мобильные — DevTools device toolbar (iPhone 14 Pro / 390px).
- Дополнительно: Figma-комьюнити-файлы «Instagram UI Kit» (экспорт PNG).
