---
title: Как найти ауру
description: 
published: true
date: 2024-02-23T23:14:03.060Z
tags: 
editor: markdown
dateCreated: 2024-02-20T20:35:06.280Z
---

# Прочитать состояние соседней ауры

Создадим ручной переключатель и прочитаем его из скрипта. Переключатель — это триггер `Fixed Value` в соседней ауре. Скрипт выведет в журнал её полный путь, ID и состояние: `true`, `false` или `null`.

Можно [импортировать исходный пример](https://eu.eyeauras.net/share/S202402232313367YDKhksLfySg) или собрать свою структуру в основном дереве EyeAuras:

1. Создайте папку `Examples`, внутри неё — `FindAura`.
2. В `FindAura` создайте ауру `Switch` и добавьте `Fixed Value`. Выберите `Is Active` (`true`) и проверьте, что аура включена.
3. Рядом создайте ауру `Script` и добавьте в её `On Enter` действие `C# Script`.

4. Вставьте в `Script.csx` весь код и нажмите `Run`:

```csharp
var aura = AuraTree.GetAuraByPath(@".\Switch"); // or by absolute path AuraTree.GetAuraByPath(@"Examples\FindAura\Switch");

// print the status, it will be true/false or null (for undefined state)
Log.Info($"Aura {aura.FullPath} IsActive: {aura.IsActive}");
Log.Info($"Aura ID: {aura.Id}");
```

5. В журнале появится `Examples\FindAura\Switch` с состоянием `True` и отдельная строка с ID. Теперь выберите у `Fixed Value` значение `Is NOT Active` (`false`), дождитесь обновления ауры и снова нажмите `Run` — получите `False`.

## Как выбрать нужный узел

| Обращение | Что ищет |
| --- | --- |
| `@".\Switch"` | Соседа относительно текущего контекста скрипта. В этой структуре это папка `Examples\FindAura`. |
| `@"Examples\FindAura\Switch"` | Путь от корня текущего дерева. Без начального разделителя и без имени самого корневого дерева. |
| `"."` | Текущую ауру, если скрипт работает в контексте ауры. В других хостах такой ауры может не быть. |
| `GetAuraByPath` | Требует, чтобы аура была. Если поиск ничего не вернул, выбрасывает `ArgumentException`. |
| `FindAuraByPath` | Возвращает `null`, если узел не найден. Неверный путь или несогласованный контекст всё равно могут вызвать ошибку. |

Это пути в дереве аур, а не в файловой системе. В EyePad путь ограничен деревом выбранного рабочего контекста и не даёт доступа ко всем вкладкам.

<details>
<summary>Когда аура необязательна или нужно сверить ID</summary>

Вместо основного примера можно явно проверить, что ауры нет:

```csharp
var aura = AuraTree.FindAuraByPath(@".\Switch");
if (aura == null) { Log.Info("Switch не найдена"); return; }
Log.Info($"{aura.FullPath}: {aura.IsActive}");
```

ID в журнале обозначает сам найденный узел. Чтобы найти ауру по известному ID в доступном дереве, используйте коллекцию аур. Это отдельный фрагмент для того же верхнеуровневого хоста. Замените строку своим ID:

```csharp
using System.Linq;

var expectedId = "ID из журнала вашей Switch";
var aura = AuraTree.Auras.Items.FirstOrDefault(x => x.Id == expectedId);
Log.Info(aura == null ? "Аура с этим ID не найдена" : $"Найдено: {aura.FullPath}");
```

</details>

`IsActive` — это `bool?`, значение на момент чтения. `null` значит «неизвестно», а не `false`. Чтобы следить за состоянием постоянно, нужна отдельная подписка со своим временем жизни. Найденный [объект доступа к ауре](/ru/scripting/api/IAuraAccessor) заимствован, `Dispose` ему не нужен. Через него доступны триггеры, действия и переменные ауры.

Если другой ауре нужно просто следить за Switch, настройте [Aura Is Active](/ru/triggers/aura-is-active): укажите связь с ней и нужное состояние. Тогда не понадобится скрипт, который постоянно опрашивает IsActive.

`AuraTree` и `Log` даёт верхнеуровневый хост `C# Script`. В обычный класс [службу дерева](/ru/scripting/api/IAuraTreeScriptingApi) нужно передать явно. Подробнее о границах — в [контекстах выполнения](/ru/scripting/api/core/app-runtime-contexts).
