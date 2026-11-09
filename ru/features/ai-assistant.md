---
title: AI Assistant
description: Как начать чат, выбрать подключение к модели и настроить AI Assistant
published: true
date: 2026-04-21T22:30:00.000Z
tags: ai, assistant, gateway, mcp, guidance, ai-translated
editor: markdown
dateCreated: 2026-03-29T00:00:00.000Z
---

# AI Assistant

AI Assistant — чат во вкладке AI. Здесь можно спросить о настройке EyeAuras, найти нужную статью или разобрать пример скрипта. Для запуска выберите профиль подключения к модели.

Функция развивается. Ответы и предложенный код могут содержать ошибки — проверяйте их перед использованием.

## Как начать

1. Откройте вкладку AI и выберите профиль. Он определяет модель, адрес сервера и способ входа.
2. Если нужен свой ключ, откройте Manage Profiles и укажите его в API Key. Можно указать переменную окружения, например `%OPENAI_API_KEY%`.
3. Нажмите Start Session.
4. Задайте конкретный вопрос, например: «Как запускать ауру только при активном окне игры?» Для разбора ошибки приложите её текст и укажите версию EyeAuras.

![Вкладка AI в EyeAuras](https://s3.eyeauras.net/media/2026/04/EyeAuras_vuJB3YPFza.png)

## Какой профиль выбрать

- **OpenAI** — подключение со своим API-ключом. Используйте профиль из шаблона; расходы зависят от вашего аккаунта у провайдера.
- **EyeAuras Gateway** — подключение через сервер EyeAuras. Вручную: API Key — `%EYEAURAS_TOKEN%`, Endpoint — `https://eu.openai.eyeauras.net`. Доступность и лимиты зависят от условий сервиса.
- **Ollama** — модель на вашем компьютере. Сначала запустите Ollama; для подключения укажите Endpoint `http://localhost:11434/v1` и имя установленной модели в Model Id.

Для другого совместимого сервера понадобятся его адрес, имя модели и, если требуется, ключ доступа.

## Настройки профиля

Окно Manage Profiles:

<dl>
<dt><strong>Name</strong></dt>
<dd>Имя профиля в списке. Например: OpenAI или Ollama.</dd>

<dt><strong>API Key</strong></dt>
<dd>Ключ доступа или переменная окружения, например <code>%OPENAI_API_KEY%</code>.</dd>

<dt><strong>Endpoint</strong></dt>
<dd>Адрес API. Для OpenAI оставьте шаблонный; для другого сервера укажите его адрес.</dd>

<dt><strong>Model Id</strong></dt>
<dd>Имя модели у провайдера. Начните со значения из шаблона.</dd>

<dt><strong>API Type</strong></dt>
<dd>Responses или ChatCompletions — выберите вариант, который поддерживает сервер.</dd>

<dt><strong>Reasoning Effort</strong></dt>
<dd>Сколько усилий модель тратит на обдумывание ответа. Для начала оставьте значение из шаблона.</dd>

<dt><strong>Max Context Tokens</strong></dt>
<dd>Размер контекста для отслеживания его заполнения. Сам по себе не меняет лимит модели.</dd>

<dt><strong>Function Calling</strong></dt>
<dd>Доступ модели к инструментам EyeAuras, включая поиск по документации. Обычно стоит оставить включённым.</dd>
</dl>

## Если чат не запускается

**Unavailable / ключ недоступен:** проверьте API Key и значение указанной переменной окружения. Для Gateway нужен доступный токен EyeAuras.

**Нет соединения:** проверьте Endpoint. Для Ollama убедитесь, что локальный сервер запущен.

**Ошибка модели или API:** сверьте Model Id и API Type с настройками вашего провайдера. Полный текст ошибки полезнее, чем описание «не работает».

<details>
<summary>Дополнительные настройки — Show Settings</summary>

Для обычного чата их обычно менять не нужно.

| Настройка | Что делает |
| --- | --- |
| Docs Knowledge Base | Подключает базу документации к AI-чату и MCP. |
| Docs Repository / Docs Path | Репозиторий документации и папка её локального кэша. |
| Artifact Store | Разрешает сохранять артефакты, если это поддерживает сервер. |
| MCP Port / Enable MCP On Startup | Порт MCP-сервера и его автоматический запуск. |
| Enable Browser Automation / Browser Debug Port | Включает инструменты работы с браузером и задаёт порт отладки. После изменения Browser Automation перезапустите EyeAuras. |

</details>

## Для внешнего AI-агента

В Show Settings → Agent Guidance можно собрать документацию и сведения об EyeAuras в папку для Codex, Claude Code или другого агента:

1. Нажмите Rebuild.
2. Откройте результат через Open Guidance Pack или сохраните через Export Guidance Pack.
3. Чтобы добавить его к проекту, используйте Add to C# Project или Add to Solution. Агенту укажите папку `generated/ai`.

При повторном добавлении эта папка заменяется целиком: свои файлы храните отдельно. Существующий AGENTS.md проекта не переписывается.

Если агенту нужны запросы к работающему EyeAuras, включите MCP. После изменения состояния MCP заново нажмите Rebuild, чтобы обновить сведения в пакете.

Связанные статьи: [AI Codex Coding Assistant](/ru/features/ai-codex-coding-assistant), [бот в Discord](/ru/features/discord-bot), [примеры и рекомендации по скриптам](/ru/scripting/best-practices).
