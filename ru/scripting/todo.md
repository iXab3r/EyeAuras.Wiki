---
title: Какие статьи нужны?
description: 
published: true
date: 2024-02-20T22:29:52.393Z
tags: 
editor: markdown
dateCreated: 2024-02-18T22:39:16.329Z
---

# Выбрать следующий пример скрипта

Первый скрипт уже запускается? Выберите одну следующую задачу: сохранить значение, найти ауру, показать окно, обработать изображение. Ниже — готовые материалы по каждой.

1. Если код ещё не запускали, начните с [первого Run](/ru/scripting/getting-started), потом пройдите полный [Hello, World!](/ru/scripting/examples/basic/hello-world).
2. Выберите задачу в таблице и откройте пример целиком. Посмотрите, куда кладутся `Script.csx`, обычные `.cs`-файлы и ресурсы.
3. Сравните результат примера с тем, что нужно вам. Для начала возьмите своё тестовое окно и одно действие. Усложняйте пример, когда он заработал.
4. Нужную область API ищите по [картам API](/ru/scripting/api/core/eyeauras-structure). Точное имя метода или тип сверяйте со справочником своей версии и зависимостями проекта.

| Задача | С чего начать |
|---|---|
| Разобраться в C# и окружении скрипта | [Контекст скрипта](/ru/scripting/sandbox): код верхнего уровня, что в нём доступно и чем он отличается от обычного класса. |
| Сохранить значение между запусками | [Пример переменных](/ru/scripting/examples/basic/variables): локальное значение, состояние запуска и переменные владельца живут разное время. |
| Найти ауру и прочитать её данные | [Find Aura](/ru/scripting/examples/basic/find-aura), потом контракты [IAuraAccessor](/ru/scripting/api/IAuraAccessor) и [AuraTree](/ru/scripting/api/IAuraTreeScriptingApi). |
| Получить нужную службу | [Зависимости и контекст](/ru/scripting/api/scripting/runtime): `GetService<T>()` возвращает зарегистрированную службу. |
| Переместить мышь или ввести текст | [Центр выбранного окна](/ru/scripting/examples/basic/send-mouse-center) и [отправка текста](/ru/scripting/examples/basic/send-text): окно и способ ввода указываются явно. |
| Нарисовать отметку или собственный интерфейс | [Метка у курсора](/ru/scripting/examples/basic/osd-cursor), [наблюдение мыши с оверлеем](/ru/scripting/examples/basic/mouse-track-with-overlay), [Blazor-окно](/ru/scripting/blazor-windows/getting-started). |
| Найти изображение перед действием | [Image Search в скрипте](/ru/scripting/examples/basic/image-search). Условие по клавише — отдельно, в [Hotkey Is Active](/ru/triggers/hotkey-is-active). Соединять условия нужно самому. |
| Дождаться работы и корректно остановиться | [Асинхронные операции](/ru/scripting/api/scripting/async): ожидание задачи, токен отмены и освобождение ресурсов. Само слово `async` не переносит операцию в другой поток. |

`Log`, `AuraTree`, `Variables`, `GetService` и `cancellationToken` доступны только коду верхнего уровня в скрипте. Обычный C#-класс или Razor-компонент получает зависимости отдельно.

<details>
<summary>Справочные ссылки из прежних примеров</summary>

Эти ссылки пригодятся, когда в листинге встретилось имя интерфейса.

| Интерфейс | Справочник |
|---|---|
| `IVariablesScriptingApi` | [Переменные](https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IVariablesScriptingApi.html). |
| `ISendInputUnstableScriptingApi` | [Прежний интерфейс отправки ввода](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.html). В новом коде сначала смотрите актуальный пример ввода и его зависимости. |
| `IOnScreenCanvasScriptingApi` | [Экранный холст](https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IOnScreenCanvasScriptingApi.html). |

</details>

Не нашли нужного разбора? Напишите в [сообщество](/ru/contacts): опишите задачу, сборку EyeAuras, свой пример и ожидаемый результат. Так мы поймём, какой материал нужен следующим.
