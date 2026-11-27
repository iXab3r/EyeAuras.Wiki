---
title: Песочница
description: 
published: true
date: 2025-03-23T11:44:49.173Z
tags: 
editor: markdown
dateCreated: 2024-02-20T19:26:43.431Z
---

# Песочница скрипта
Песочница — это штука, в которой запускаются ваши скрипты. Она даёт скрипту базовые методы и свойства. В `Script.csx` они доступны напрямую. В обычных C#-классах их нет: туда зависимости нужно передавать явно.

## Зачем она нужна?
### Хранит в себе **состояние** между запусками
Вы создали свойство или службу, нарисовали картинку на экране, распознали текст. Чтобы не делать это заново при каждом запуске, песочница сохраняет данные и использует их снова. Так скрипты работают быстрее, а писать их проще.

### Подчищает за скриптом мусор
Ресурсы одного запуска можно привязать к `ExecutionAnchors`: они освобождаются при выходе из `Run`. Сама песочница и её `Anchors` могут жить дольше и использоваться повторно. За своими подписками и другими ресурсами следите сами. Не всё, что вернул `GetService`, освобождается автоматически.
![e0219e2e257a9878d5b6b2323dcb9c37.jpg](/assets/e0219e2e257a9878d5b6b2323dcb9c37.jpg =x200)

### Предоставляет набор базового функционала
В любом скрипте по умолчанию есть базовые сервисы: запись в лог, работа с файлами программы и т.п. Их специально немного, чтобы скрипт не тащил лишнего. Всё остальное добавляют методом `GetService<>`. О нём чуть ниже.

## Что там по коду
Ниже — методы и свойства, которые есть у любого скрипта.


## Логгирование
```csharp
IFluentLog Log { get; }
```
Почти любому скрипту нужно что-то сообщать: текущие значения переменных, отладочные сообщения и т.п.
За это отвечает `Log`. Он пишет и в файлы логов программы, и в окошко `Event Log`.
У каждой строчки лога есть **уровень**: **Debug**, **Info**, **Warn**, **Error**
Чем выше уровень, тем важнее сообщение. **Error** самые важные. В `Event Log` можно выбрать, с какого уровня показывать сообщения. По умолчанию — от **Info** и выше

```csharp
Log.Info("Hello!");
Log.Debug("Hello from debug level!");
```

![](https://s3.eyeauras.net/media/wiki/scripting/sandbox/vWkUbVS.png =x300)

## Любителям поспать
```csharp
void Sleep(TimeSpan delay);
void Sleep(int delayMs);
void Sleep(double delayMs);
void Sleep(double minDelayMs, double maxDelayMs);
```
Этот метод приостанавливает скрипт на указанное время. Он использует текущий `cancellationToken`. Пауза синхронная.

```csharp
Sleep(2000); //приостанавливаем скрипт на 2 секунды
Sleep(TimeSpan.FromMilliseconds(100)); //приостанавливаем на 100 миллисекунд
cancellationToken.ThrowIfCancellationRequested();
```

> `Sleep` сам не выбрасывает исключение отмены. В desktop ожидание дольше 30 мс может закончиться раньше, если запуск отменили. Ожидание до 30 мс включительно проходит без проверки токена. Если после паузы при остановке продолжать нельзя, вызовите `cancellationToken.ThrowIfCancellationRequested()`. В асинхронном коде пишите `await Task.Delay(delay, cancellationToken)`.
{.is-info}


![](https://s3.eyeauras.net/media/wiki/scripting/sandbox/TYwJwzi.png =x300)

## [Dependency Injection](/ru/scripting/dependency-injection)
```csharp
T GetService<T>()
```
Самый могучий метод в песочнице. Через `GetService` скрипт получает доступ к разным частям программы: запрашивает нужную службу и работает через неё.

Например, передадим логгер обычному классу. В `Script.csx`:

```csharp
var reporter = new Reporter(Log);
reporter.Report(2 + 3);
```

В отдельном `Reporter.cs`:

```csharp
using PoeShared.Logging;

public sealed class Reporter
{
    private readonly IFluentLog log;
    public Reporter(IFluentLog log) => this.log = log;
    public void Report(int value) => log.Info($"Result: {value}");
}
```

В `Event Log` появится `Result: 5`. Чтобы получить зарегистрированную службу, укажите её точный интерфейс и namespace. Свои службы можно добавить через [Script Container Extensions](/ru/scripting/script-container-extensions).

## Выполнить работу с отменой одного запуска

Код для `Script.csx`:

```csharp
using System.Threading.Tasks;

var runToken = cancellationToken;
for (var step = 1; step <= 3; step++)
{
    runToken.ThrowIfCancellationRequested();
    Log.Info($"Step {step}");
    await Task.Delay(500, runToken);
}
```

Скрипт пишет три сообщения с паузами. Если запуск отменят, ожидание прервётся. `cancellationToken` и `ExecutionAnchors` выдаются на каждый `Run`, а после него сбрасываются. Поэтому сохраните токен в начале запуска и передавайте его в свою работу. Не храните его как постоянный токен всей песочницы и не оставляйте после выхода фоновые задачи без присмотра.

Состояние объекта скрипта может сохраняться между запусками, пока версия проекта та же. Изменение зависимой версии проекта пересоздаёт контекст. Долговременным хранилищем это не считайте. Для обмена данными и настроек есть [переменные](/ru/scripting/variables), для ресурсов — [управление временем жизни](/ru/scripting/api/scripting/reactive-lifetime).

Точное поведение `Sleep` видно в исходниках: [ScriptSandbox](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting.Metadata/Api/ScriptSandbox.cs) и [desktop-провайдер ожидания](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Scaffolding/WaitableTimerUtils.cs). Реальная длительность зависит от планировщика ОС. Вариант с двумя числами выбирает случайную длительность в заданном диапазоне.
