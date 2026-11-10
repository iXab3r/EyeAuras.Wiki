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

Создадим ручной переключатель и прочитаем его из скрипта. Источник состояния — триггер `Fixed Value` соседней ауры, а результат — её полный путь, ID и `true`, `false` или `null` в журнале. Поиск не создаёт новую ауру и не выполняет её действия.

Можно [импортировать исходный пример](https://eu.eyeauras.net/share/S202402232313367YDKhksLfySg) либо подготовить свою структуру в основном дереве EyeAuras:

1. Создайте папку `Examples`, внутри неё — `FindAura`.
2. В `FindAura` создайте ауру `Switch` и добавьте `Fixed Value`. Выберите `Is Active` (`true`) и убедитесь, что аура включена.
3. Рядом создайте ауру `Script`, в её `On Enter` добавьте действие `C# Script`.

4. Вставьте в `Script.csx` весь код и нажмите `Run`:

```csharp
var aura = AuraTree.GetAuraByPath(@".\Switch"); // or by absolute path AuraTree.GetAuraByPath(@"Examples\FindAura\Switch");

// print the status, it will be true/false or null (for undefined state)
Log.Info($"Aura {aura.FullPath} IsActive: {aura.IsActive}");
Log.Info($"Aura ID: {aura.Id}");
```

5. В журнале должна появиться `Examples\FindAura\Switch` с состоянием `True` и отдельной строкой ID. Выберите у `Fixed Value` значение `Is NOT Active` (`false`), дождитесь обновления ауры и повторите `Run`: получите `False`.

Актуальные значения проверяйте у своего `Switch`.

## Как выбрать нужный узел

| Обращение | Что ищет |
| --- | --- |
| `@".\Switch"` | Соседа относительно текущего контекста скрипта. В этой структуре это папка `Examples\FindAura`. |
| `@"Examples\FindAura\Switch"` | Путь от корня текущего дерева, без начального разделителя и без имени самого корневого дерева. |
| `"."` | Текущую ауру в контексте ауры; в других хостах такой ауры может не быть. |
| `GetAuraByPath` | Требует ауру и выбрасывает `ArgumentException`, если поиск вернул отсутствие. |
| `FindAuraByPath` | Возвращает `null`, если узел не найден; неверный путь или несогласованный контекст всё ещё могут вызвать ошибку. |

Это пути дерева, не файловой системы и не поиск первого совпавшего имени во всём приложении. В EyePad путь ограничен деревом выбранного рабочего контекста и не означает доступ ко всем вкладкам.

<details>
<summary>Когда аура необязательна или нужно сверить ID</summary>

Вместо основного примера можно проверить отсутствие явно:

```csharp
var aura = AuraTree.FindAuraByPath(@".\Switch");
if (aura == null) { Log.Info("Switch не найдена"); return; }
Log.Info($"{aura.FullPath}: {aura.IsActive}");
```

ID из журнала — идентичность найденного узла, а не ещё один вариант синтаксиса пути. Если нужно искать по известному ID в доступном дереве, используйте коллекцию аур. Это отдельный фрагмент того же верхнеуровневого хоста; замените строку своим ID:

```csharp
using System.Linq;

var expectedId = "ID из журнала вашей Switch";
var aura = AuraTree.Auras.Items.FirstOrDefault(x => x.Id == expectedId);
Log.Info(aura == null ? "Аура с этим ID не найдена" : $"Найдено: {aura.FullPath}");
```

</details>

`IsActive` — снимок состояния типа `bool?` в момент чтения: `null` означает неопределённость, а не `false`. Для непрерывного наблюдения нужна отдельная подписка с собственным временем жизни. Найденный [объект доступа к ауре](/ru/scripting/api/IAuraAccessor) заимствован и не требует `Dispose`; он даёт доступ к её триггерам, действиям и переменным.

Если другой ауре достаточно следить за Switch, настройте [Aura Is Active](/ru/triggers/aura-is-active): укажите связь с ней и требуемое состояние. Так можно повторно использовать готовое условие без скрипта, который постоянно опрашивает IsActive.

`AuraTree` и `Log` предоставляет верхнеуровневый хост `C# Script`. Обычному классу передайте [службу дерева](/ru/scripting/api/IAuraTreeScriptingApi) явно; подробнее о границах — в [контекстах выполнения](/ru/scripting/api/core/app-runtime-contexts).
