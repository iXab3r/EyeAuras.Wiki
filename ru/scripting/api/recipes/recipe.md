---
title: AI-рецепты — формат
description: AI-ориентированный формат для коротких рекомендательных рецептов EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Формат рецептов

Рецепты помогают собрать конкретный сценарий из нескольких API. Здесь описана предлагаемая форма таких страниц; она не устанавливает обязательный стандарт для всей Wiki.

Начните с задачи и условий запуска, покажите полезную операцию или законченную схему интеграции. Карты API помогают выбрать область, а точные сигнатуры и ограничения берите из справочника для нужной версии.

## Как описать операцию

```md
# Recipe Name

| Field | Value |
| --- | --- |
| Complexity | Low / Medium / High / Very High |
| Example | Public mini-app/product or short real-world example. |
| End Goal | One short sentence describing the desired final state. |
| Key Technologies | Public APIs, packages, or subsystems. |

## Use When

## Example Illustration

## Context and Inputs

## Operation

## Result and Constraints

## Choices

## APIs To Look Up

## Avoid

## Related Maps
```

Разделы, которые не подходят для конкретного рецепта, можно опускать.

## Правила оформления

- Весь рецепт должен оставаться коротким и быстро читаться.
- Именуйте файлы рецептов по пользовательской категории: `bot-*`, `tool-*`, `script-*`.
- Желаемое конечное состояние указывайте в шапке, до любых деталей реализации.
- Используйте простые и конкретные названия. Предпочитайте "Bot using Memory API and ImGui" вместо абстрактных формулировок вроде "target state automation".
- По возможности опирайтесь на конкретные концепции EyeAuras, а не на общие инженерные советы.
- Не объясняйте базовую гигиену кода.
- Добавляйте строку `Example`, если реальный mini-app или продукт помогает быстрее понять рецепт. Предпочтительны публичные названия, например `BankaBot`, или короткое обобщённое описание.
- Используйте `Example Illustration`, если у публичной страницы pack есть скриншоты, по которым сразу понятен конечный результат.
- Не описывайте приватные пути, DSL, бизнес-логику, секреты или точную структуру файлов.
- Укажите контекст запуска, необходимые сервисы/пакеты и источник входных данных рядом с операцией.
- Код должен выполнять полезное ядро задачи; не заменяйте его неопределённым helper или выдуманным движком.
- Для архитектурной интеграции можно обойтись без исполняемого примера: явно задайте входы, композицию, обмен данными, наблюдаемый результат и владельца ресурсов.
- Результат, ограничения адресов/потоков/отмены и версия контракта относятся к той же операции, а не только к списку ссылок.
- Раздел `Choices` используйте только для решений, которые специфичны именно для этого рецепта.
- Раздел `APIs To Look Up` помогает дальнейшему поиску, но не заменяет настройку и основную операцию.
- Для деталей давайте ссылки на maps, а не дублируйте их содержимое.
- Не превращайте страницу в пошаговый numbered build script, если это не tutorial по задумке.

## Категории имён файлов

- `bot-*` — automation/bot-сценарии, особенно memory, CV, input, Behavior Tree, ImGui и управление target-window.
- `tool-*` — переиспользуемые инструменты, встроенные интеграции, вспомогательные продукты и пользовательские утилиты.
- `script-*` — сценарии для scripting, редакторы скриптов, помощники для script runtime и AI-ассистенты для написания кода и скриптов.

## Уже существующие рецепты

- `recipes/bot-memory-imgui-interface.md` - bot using Memory API and ImGui UI.
- `recipes/bot-memory-behavior-tree.md` - bot using Memory API and Behavior Tree.
- `recipes/bot-memory-entity-list-reader.md` - primitive entity-list reader using Memory API and a small UI.
- `recipes/tool-embedded-eyeauras-host.md` - tool/integration that adds EyeAuras capabilities to another host app.
- `recipes/script-ai-editor-assistant.md` - AI chat assistant for script editors and mini-apps.