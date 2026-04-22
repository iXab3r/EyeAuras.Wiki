---
title: Профилирование AI Core
description: AI-справочник по таймингам MiniProfiler, захватам JetBrains dotTrace и dotMemory, а также сценариям профилирования.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, profiling, performance, diagnostics, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта выбора профилирования

Краткая карта, которая помогает понять, когда использовать инструментирование EyeAuras через MiniProfiler, а когда — full-process профилирование от JetBrains, и где искать нужный API, UI и сценарий диагностики.

## Что обычно хотят сделать

- Понять, почему медленно запускается приложение, загружаются модули, дерево аур или сохраняется конфиг.
- Измерить script, CV, ML, input, overlay или собственный вспомогательный код.
- Добавить локальные шаги измерения вокруг подозрительно медленного блока.
- Сравнить поведение на прогреве и в стабильном рабочем режиме.
- Снять полный CPU/performance trace, если тормозит всё приложение.
- Снять memory snapshot, если процесс со временем разрастается по памяти.
- Подготовить файлы, которые можно приложить к report о проблеме.

## Как это устроено

- В EyeAuras есть две разные группы инструментов профилирования.
- MiniProfiler — это внутрипроцессное дерево таймингов из [MiniProfiler for .NET](https://miniprofiler.com/dotnet/). Он записывает именованные шаги: фазы старта, загрузку модулей, CV-вызовы, script loop и пользовательские блоки кода.
- Данные MiniProfiler достаточно лёгкие для точечной диагностики, но они всё равно хранятся в памяти, поэтому для долгих циклов их нужно ограничивать или очищать.
- Профилирование JetBrains использует [JetBrains.Profiler.SelfApi](https://www.nuget.org/packages/JetBrains.Profiler.SelfApi), чтобы запущенное приложение могло само собирать dotTrace и dotMemory snapshot'ы.
- JetBrains dotTrace нужен для CPU/performance-диагностики всего процесса: подвисания, высокий CPU, замороженный UI, медленный запуск или проблема, которую нельзя локализовать несколькими ручными таймингами.
- JetBrains dotMemory нужен для анализа роста памяти, утечек, удерживаемых объектов и больших аллокаций.
- Захваты JetBrains могут быть большими и во время сбора заметно влиять на отзывчивость приложения.

## Когда что использовать

### MiniProfiler

Используйте MiniProfiler, если путь выполнения уже известен или его можно сузить до script, service, CV-операции, участка старта, загрузки модуля, сохранения конфига или UI-действия.

Хорошо подходит для таких вопросов:

- «Какая часть этого loop работает медленно?»
- «Тормозит image search или проблема в OSD/input?»
- «На что ушло время при старте: загрузка модулей, конфиг дерева аур или WebView?»
- «Сколько заняло это сохранение конфига и почему оно вообще сработало?»
- «Можно ли сравнить две реализации script по сотням итераций?»

MiniProfiler не заменяет CPU sampler. Он показывает, сколько заняли именованные инструментированные блоки. Он не объясняет автоматически все методы внутри этих блоков, если код не добавляет дополнительные steps.

### JetBrains dotTrace

Используйте JetBrains dotTrace, если само приложение работает тяжело, грузит CPU, а медленный участок пока не очевиден.

Хорошо подходит, если:

- EyeAuras подвисает или начинает лагать при обычной работе.
- CPU высокий, но нет подозрения на один конкретный script block.
- Startup или загрузка модуля медленные, а MiniProfiler показывает только широкую фазу.
- Проблема появляется только через 10-30 минут обычной автоматизации.
- Для support нужен performance capture, который можно открыть в dotTrace.

### JetBrains dotMemory

Используйте JetBrains dotMemory, если память продолжает расти или нужно изучить большой граф удерживаемых объектов.

Хорошо подходит, если:

- Working set растёт, пока продолжает работать один и тот же aura pack.
- Script, overlay, CV accessor, module или window, похоже, удерживает старые объекты.
- Потребление памяти уже заметно выше нормы и нужен snapshot для support.
- Для воспроизведения нужно разбирать удержание объектов, а не тайминги.

## API и основные сущности

- `StackExchange.Profiling.MiniProfiler` — базовый тип MiniProfiler.
- `MiniProfiler.Step(string name)` — создаёт дочерний шаг с таймингом; измерение заканчивается, когда освобождается возвращённый `IDisposable`.
- `MiniProfiler.Ignore()` — подавляет вложенные тайминги для блока, который не нужно записывать.
- `MiniProfiler.RenderPlainText()` — выводит данные таймингов в обычный текст.
- `IProfilerProvider.GetOrAdd(string name)` — получает или создаёт именованный общий profiler.
- `IProfilerProvider.EnumerateProfilers()` — возвращает общие profiler'ы для UI или отчётов.
- `ProfilerProvider.Default` — обычный общий profiler уровня приложения.
- `ProfilerProvider.Startup` — долгоживущий startup profiler, который используется во время инициализации приложения.
- `ProfilerProvider.Create(string name = default)` — создаёт изолированный MiniProfiler с `MemoryCacheStorage`.
- `MiniProfilerExtensions.StepInfo(...)` — обёртка над `Step(...)`, которая при завершении пишет `Info` log с временем в миллисекундах.
- `MiniProfilerExtensions.StepDebug(...)` — обёртка над `Step(...)`, которая при завершении пишет `Debug` log с временем в миллисекундах.
- `MiniProfilerExtensions.Clear(...)` — очищает MiniProfiler, если он использует `MemoryCacheStorage`.
- `ICvAccessor.EnableProfiling()` — включает внутренние CV-steps для одного accessor'а.
- `ICvAccessor.Profiler` — MiniProfiler, привязанный к одному CV accessor'у.
- `MiniProfilerViewer` / `IMiniProfilerViewer` — встроенный viewer дерева/текста для данных MiniProfiler.
- `JetBrains.Profiler.SelfApi.DotTrace` — запускает, сохраняет, архивирует и завершает performance profiling sessions.
- `JetBrains.Profiler.SelfApi.DotMemory` — создаёт memory snapshots.
- `IPerformanceProfilerService` — сервис EyeAuras, который оборачивает dotTrace/dotMemory.
- `ProfilerController` — web endpoints для статуса, `startProfiling`, `stopProfiling` и `takeSnapshot`.
- `IProfilerViewModel` — UI-состояние и команды профилирования, которые использует Settings и компактный profiler control в title bar.

## Частые сценарии

### Добавить MiniProfiler steps в код приложения

```csharp
using (ProfilerProvider.Startup.StepInfo(Log, "Loaded aura tree config"))
{
    await auraTreeConfigManager.Load();
}
```

Для фаз старта и первой загрузки используйте `ProfilerProvider.Startup`.  
Используйте `StepInfo` или `StepDebug`, если длительность шага должна ещё и попадать в логи.

### Добавить MiniProfiler steps в script

```csharp
using StackExchange.Profiling;

var profilerProvider = GetService<IProfilerProvider>();
var profiler = profilerProvider.GetOrAdd("My pack / Farm loop");

using (profiler.Step("Loop iteration"))
{
    using (profiler.Step("Read state"))
    {
        ReadGameState();
    }

    using (profiler.Step("Choose action"))
    {
        ChooseNextAction();
    }
}

Log.Info(profiler.RenderPlainText());
```

Используйте общий именованный profiler, если в одном сценарии участвуют несколько scripts или helper classes.

### Профилировать CV loop

```csharp
using StackExchange.Profiling;

var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForWindow(targetWindow)
    .EnableProfiling();

using (cv.Profiler.Step("Loop iteration"))
{
    var match = cv.ImageSearchRaw("needle.png");

    using (cv.Profiler.Step("Mouse move"))
    {
        sendInput.MouseMoveTo(match.Detected.Bounds.Value.Center());
    }
}
```

`EnableProfiling()` записывает внутренние CV-фазы: renting, preparation, refresh, model/search work и OSD.  
Добавляйте свои steps вокруг не-CV-частей, чтобы в итоговом отчёте отдельно видеть detection, input, sleeps, logging и UI.

### Посмотреть данные MiniProfiler в приложении

1. Добавьте или используйте уже существующие steps через `ProfilerProvider.Startup`, `ProfilerProvider.Default`, `ICvAccessor.Profiler` или именованный `IProfilerProvider`.
2. Откройте встроенную панель profiler'а, если она доступна.
3. Используйте Tree view, чтобы увидеть структуру parent/child таймингов.
4. Используйте Text view или `RenderPlainText()`, если результат нужно скопировать в лог или в report.
5. Для долгих сценариев очищайте profiler data или делайте ротацию.

### Собрать JetBrains performance capture

1. Откройте Settings и нажмите **Start profiling**, либо вызовите endpoint запуска profiler'а, если управляете приложением удалённо.
2. Воспроизведите лаги, пока идёт сбор профиля. Для support capture обычно достаточно 10-30 минут.
3. Нажмите **Stop profiling**. EyeAuras сохранит архив `Performance-PID...` в папку `traces` приложения.
4. Приложите полученный файл через **Report a problem**, либо передайте его через cloud storage, если он слишком большой.

### Собрать JetBrains memory snapshot

1. Дождитесь момента, когда потребление памяти уже явно стало ненормальным.
2. Используйте действие снятия memory snapshot в profiler/report workflow или вызовите endpoint `takeSnapshot`, если управляете приложением удалённо.
3. EyeAuras сохранит workspace `Memory-PID...` dotMemory в папку `traces` приложения.
4. Учитывайте, что во время записи snapshot'а приложение может подвисать или работать медленнее.
5. Приложите полученный файл к report о проблеме.

## Практические примеры

- Startup занимает 40 секунд: откройте `ProfilerProvider.Startup` в Tree view, затем добавьте `StepInfo` вокруг широкого участка, который всё ещё выглядит слишком общим.
- CV aim loop кажется медленным: вызовите `EnableProfiling()`, оберните каждую итерацию loop и добавьте отдельные steps для ML search, OSD, движения мыши, клика и sleeps.
- Сохранение конфига блокирует UI: используйте `Log.CreateProfiler(...)` или `ProfilerProvider.Default.Step(...)` вокруг serialization, записи на диск и агрегации причин изменения.
- Pack работает час, а потом начинает лагать: сначала используйте MiniProfiler, если есть подозрение на loop; переключайтесь на dotTrace, если тормозит весь процесс и виновник неизвестен.
- Память выросла с 500 MB до нескольких GB: снимите dotMemory snapshot, когда рост уже виден; тайминги MiniProfiler не объяснят удержание объектов.
- Загрузка модуля медленная только на одной машине: используйте startup steps в MiniProfiler для локальной структуры, а если нужен CPU detail на уровне методов — снимайте dotTrace capture.

## Замечания по производительности

- Названия шагов MiniProfiler должны быть достаточно стабильными, если вы хотите сравнивать повторные прогоны.
- Прогрев и стабильный режим лучше измерять отдельно; первые CV/ML/OCR-вызовы часто загружают модели, native libraries, capture resources или caches.
- Если вы измеряете производительность, не стоит логировать внутри каждого tight loop step, если только накладные расходы logging сами не являются частью сценария.
- Данные MiniProfiler живут в памяти. Для долгих loop'ов выводите summary, очищайте старые данные или ограничивайте окно профилирования.
- Захваты JetBrains — это диагностика уровня support. Они полнее, чем MiniProfiler, но тяжелее и при сборе, и при анализе.
- dotTrace объясняет CPU/time по всему процессу; dotMemory объясняет удержание heap и allocation'ы. Используйте profiler под тот симптом, который вы видите.

## Что лучше выбирать

- Лучше использовать MiniProfiler для точечных измерений конкретного code path.
- Для CV API лучше сначала включать `EnableProfiling()`, а не писать свои таймеры вокруг каждого CV-вызова.
- Для сценариев с несколькими scripts или services лучше использовать общие именованные profiler'ы.
- Используйте `StepInfo` / `StepDebug`, если длительность шага должна попадать ещё и в логи.
- Используйте dotTrace, если тормозит весь процесс, высокий CPU или причина замедления пока непонятна.
- Используйте dotMemory для утечек, удерживаемых объектов и необъяснимого роста памяти.
- При сборе JetBrains capture'ов лучше воспроизводить обычную пользовательскую нагрузку.

## Чего избегать

- Не используйте MiniProfiler как постоянно включённое безлимитное хранилище telemetry.
- Не делайте выводы только по первой итерации прогрева.
- Не объединяйте OSD, input, sleeps и detection в один безымянный блок, если сравниваете CV-алгоритмы.
- Не снимайте dotMemory snapshot до того, как проблема с памятью реально проявилась.
- Не собирайте длинные сессии dotTrace, если проблему можно воспроизвести коротко и прицельно.
- Не отправляйте profiler archives через обычную загрузку report'а, если они слишком большие; лучше использовать cloud storage и передать ссылку.

## Ключевые термины для поиска

- `MiniProfiler`
- `StackExchange.Profiling`
- `MiniProfiler.Step`
- `MiniProfiler.Ignore`
- `MiniProfiler.RenderPlainText`
- `IProfilerProvider`
- `ProfilerProvider`
- `ProfilerProvider.Startup`
- `ProfilerProvider.Default`
- `MiniProfilerExtensions`
- `StepInfo`
- `StepDebug`
- `Clear`
- `MiniProfilerViewer`
- `MiniProfilerTreeView`
- `MiniProfilerTiming`
- `ICvAccessor.EnableProfiling`
- `ICvAccessor.Profiler`
- `JetBrains.Profiler.SelfApi`
- `DotTrace`
- `DotMemory`
- `IPerformanceProfilerService`
- `ProfilerController`
- `IProfilerViewModel`

## Синонимы для поиска

- profiler
- profiling
- performance profiling
- memory profiling
- MiniProfiler
- StackExchange.Profiling
- profiler step
- timing tree
- startup profiler
- CV profiler
- RenderPlainText
- JetBrains profiler
- dotTrace
- dotMemory
- SelfApi
- performance snapshot
- memory snapshot
- traces folder
- report a problem profiler files

## Связанные материалы

- `computer-vision/profiling.md`
- `scripting/logging.md`
- `scripting/runtime.md`
- `core/app-runtime-contexts.md`
- `core/app-modules.md`
- `core/blazor.md`
- `../../../features/profiler.md`
- `../../examples/advanced/profiling-cv.md`
- [MiniProfiler .NET docs](https://miniprofiler.com/dotnet/)
- [MiniProfiler profile-code docs](https://miniprofiler.com/dotnet/HowTo/ProfileCode)
- [MiniProfiler GitHub repository](https://github.com/MiniProfiler/dotnet)
- [JetBrains dotTrace API reference](https://www.jetbrains.com/help/profiler/API_Reference.html)
- [JetBrains dotMemory self-profiling API](https://www.jetbrains.com/help/dotmemory/Profiling_Guidelines__Advanced_Profiling_Using_dotTrace_API.html)