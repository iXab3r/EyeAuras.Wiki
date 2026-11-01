---
title: Интерфейс IAuraAccessor
description: Описание интерфейса IAuraAccessor в C#
published: true
date: 2026-04-21T00:00:00.000Z
tags: C#, Interface, Programming, ai-translated
editor: markdown
dateCreated: 2024-02-20T20:32:05.134Z
---
# IAuraAccessor

Дескриптор ауры даёт её текущее состояние, переменные, триггеры, оверлеи и списки действий. Получите его через `AuraTree` в C# Script. Обычному классу передайте `IAuraTreeScriptingApi` или уже найденный `IAuraAccessor` через параметр.

## Прочитать состояние ауры

Создайте рядом со скриптом ауру `TargetAura`, затем выполните:

```csharp
var aura = AuraTree.GetAuraByPath("./TargetAura");
Log.Info($"Состояние: {aura.IsActive}; загружена: {aura.IsLoaded}");
```

`IsActive` имеет тип `bool?`: `true` — активна, `false` — неактивна, `null` — состояние неизвестно. `IsLoaded` показывает загрузку ауры, это отдельное состояние. Если отсутствие ауры допустимо, используйте `FindAuraByPath` и проверяйте результат на `null`; `GetAuraByPath` требует существующий путь и при его отсутствии бросает `ArgumentException`.

Интерфейс также объявляет `bool IsEnabled`, но в реализации `AuraAccessor` среза `20fd3d4` это свойство не привязано к состоянию ауры. Его `false` нельзя использовать как доказательство того, что аура выключена. [Исходная реализация](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.UI/Scripting/AuraAccessor.cs) важна здесь наряду с XML-контрактом.

## Выполнить списки действий ауры

Создайте ауру `TargetAura` и настройте в ней нужные действия. В отдельном C# Script:

```csharp
var aura = AuraTree.GetAuraByPath("./TargetAura");
await aura.ExecuteAsync(cancellationToken);
Log.Info("Выполнение действий завершено");
```

Этот вызов последовательно выполняет действия из списков `OnEnter`, `WhileActive`, `OnExit` без необходимости сначала менять активное состояние ауры. `WhileActive` здесь проходится один раз, а не запускает цикл. Вызов не является присваиванием `IsActive`. Явно передайте токен скрипта: он проверяется перед каждым действием и передаётся самому действию; отмена уже начатого действия зависит и от его реализации. Значение параметра по умолчанию — `default`. Синхронный вариант — `Execute(cancellationToken)`; учитывайте ограничения самих действий на поток выполнения.

## Состав и версия

`EnablingConditions`, `Triggers`, `Overlays`, `OnEnterActions`, `WhileActiveActions`, `OnExitActions` — наблюдаемые коллекции соответствующих компонентов. Переменные и путь доступны через унаследованные `IHasVariables` и `IHasPath`.

Контракт: [IAuraAccessor версии EyeAuras 20fd3d4](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Scripting/Api/IAuraAccessor.cs). Модель сущностей объясняется в [обзоре аур](/ru/scripting/api/auras/overview), поиск — в [AuraTree](/ru/scripting/api/IAuraTreeScriptingApi).
