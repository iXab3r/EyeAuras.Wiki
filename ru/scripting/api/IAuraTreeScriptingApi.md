---
title: Интерфейс IAuraTreeScriptingApi
description: Справка по скриптовому интерфейсу `IAuraTreeScriptingApi`.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, triggers, behavior trees, actions, folders, aura tree, ai-translated
editor: markdown
dateCreated: 2024-02-20T20:28:29.069Z
---
# IAuraTreeScriptingApi

`AuraTree` позволяет найти существующую ауру, папку или дерево поведения и работать с их состоянием. Это доступ к живому дереву EyeAuras, а не создание независимых объектов. В C# Action свойство `AuraTree` и `Log` предоставляет среда скрипта. В обычный C# класс передавайте `IAuraTreeScriptingApi` явно.

## Найти ауру и прочитать состояние

Создайте папку `MyFolder` и ауру `Aura1` в корне дерева. Выполните в C# Action:

```csharp
var aura = AuraTree.FindAuraByPath("MyFolder/Aura1");
if (aura == null)
{
    Log.Info("Аура MyFolder/Aura1 не найдена");
    return;
}
Log.Info($"Аура: {aura.FullPath}, загружена: {aura.IsLoaded}, активна: {aura.IsActive}");
```

В журнале появится путь и состояние найденной ауры. `IsActive` имеет тип `bool?`: `null` означает неизвестное состояние, а не `false`.

Путь без `./` или `../` задаётся от корня Aura Tree. Префиксы `./` и `../` разрешаются относительно `Context.Path` текущего объекта. Можно использовать `/` или `\`; это пути дерева, а не файловой системы. Не добавляйте начальный разделитель к корневому пути.

Особый путь `"."` для поиска ауры возвращает текущую ауру, для поиска папки — текущую папку. Это исключение из общего разрешения путей. Из контекста ауры `AuraTree.Folder` указывает на её родительскую папку; из контекста папки — на саму папку. `Aura` и `Folder` могут отсутствовать в другом контексте.

## Выбрать между Find и Get

| Объект | Нормально, если отсутствует | Объект обязан существовать |
|---|---|---|
| Аура | `FindAuraByPath(path)` | `GetAuraByPath(path)` |
| Папка | `FindFolderByPath(path)` | `GetFolderByPath(path)` |
| Дерево поведения | `FindBehaviorTreeByPath(path)` | `GetBehaviorTreeByPath(path)` |

`Find` возвращает `null`, если путь отсутствует или ведёт к другому виду объекта. Это не обещание «никогда не бросает»: некорректный путь и рассогласование внутреннего кэша могут дать исключение. В реализации EyeAuras `20fd3d4` методы `Get` бросают **`ArgumentException`**, если поиск вернул `null`; пример с `NotFoundException` в XML этой версии неточен.

Например, при наличии папки `MyProject/Folders/Folder1` и дерева `MyProject/BehaviorTrees/Tree1`:

```csharp
var folder = AuraTree.FindFolderByPath("MyProject/Folders/Folder1");
var tree = AuraTree.FindBehaviorTreeByPath("MyProject/BehaviorTrees/Tree1");
Log.Info($"Папка найдена: {folder != null}, дерево найдено: {tree != null}");
```

## Выполнить существующий макрос

Макрос — уже настроенное дерево поведения. Например, создайте папку
`Automation` и макрос `DailyRoutine`, затем выполните в C# Action:

```csharp
var macro = AuraTree.FindMacroByPath("Automation/DailyRoutine");
if (macro == null)
{
    Log.Info("Макрос не найден");
    return;
}
var status = await macro.ExecuteAsync(cancellationToken);
Log.Info($"Результат макроса: {status}");
```

`IMacroAccessor.ExecuteAsync(CancellationToken)` возвращает
`Task<EyeAuras.BehaviorTree.Nodes.NodeStatus>` и передаёт токен в `Tick`
дерева. После `await` получите статус `Success`, `Failure` или `Running`,
а не `bool`. Не подменяйте `Running` успехом и не добавляйте автоматический
повтор макроса без решения, нужен ли он вашему сценарию. Отмена кооперативная:
её поддержку внутри конкретных узлов нужно учитывать отдельно.

`GetMacroByPath` требует существующий путь и при отсутствии бросает
`ArgumentException`; `FindMacroByPath` допускает отсутствие. Эти методы
работают через дерево, даже несмотря на неинициализированное свойство
`Macros` в этой версии. Accessor заимствован — не освобождайте его.

## Получить настроенный компонент ауры

Путь указывает на ауру, а параметр типа — на нужный компонент. Для ауры `MyFolder/Aura1`, в которой уже настроен триггер поиска изображения:

```csharp
var trigger = AuraTree.GetTriggerByPath<IImageSearchTrigger>("MyFolder/Aura1");
Log.Info($"Триггер: {trigger.Name}");
```

Для действия последовательности ввода, уже добавленного в эту ауру:

```csharp
var action = AuraTree.GetActionByPath<ISendSequenceAction>("MyFolder/Aura1");
Log.Info($"Действие: {action.Name}");
```

Методы возвращают первый компонент совместимого типа. Для действий порядок поиска: `OnEnterActions`, `WhileActiveActions`, `OnExitActions`. Если аура отсутствует, список пуст или нужного типа нет, возникает `ArgumentException`. Нельзя таким способом выбрать второе действие того же типа: для этого изучите соответствующую коллекцию у [IAuraAccessor](./IAuraAccessor).

Полученный компонент остаётся частью ауры со своими настройками и временем жизни. Для разового нажатия клавиши используйте [SendInput](./ISendInputScriptingApi), а не создавайте действие ауры.

## Наблюдать дерево и владеть своими подписками

`Folders`, `Auras` и `BehaviorTrees` — живые `IObservableList` с объектами дерева. Например, снимок текущих аур можно вывести так:

```csharp
foreach (var aura in AuraTree.Auras.Items.ToArray())
{
    Log.Info(aura.FullPath);
}
```

Не освобождайте полученные коллекции и найденные accessors: ими управляет дерево. Подписки, созданные вашим кодом, освобождайте вместе с владельцем, например через `ExecutionAnchors` текущего запуска. Удаление элемента дерева делает долговременное хранение accessor ненадёжным.

В интерфейсе также объявлены `Macros`, `FindMacroByPath` и `GetMacroByPath`. В срезе `20fd3d4` свойство `Macros` не инициализировано реализацией, поэтому его наличие в интерфейсе не гарантирует рабочую коллекцию. Сверяйте этот участок с SDK своей версии.

## Дальше

[Контекст скрипта](./scripting/runtime), [модель аур](./auras/overview), [регистрация компонентов](./auras/entities). Точные сигнатуры — в SDK/XML вашей версии; эта страница описывает операции по срезу EyeAuras `20fd3d4`.
