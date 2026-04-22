---
title: AI скриптинг и рабочий процесс проекта
description: AI-first карта по export import live-import, работе через IDE, структуре проекта скриптов и границам solution.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, ide, export, import, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта сценариев работы с проектами скриптов

Справочная карта по разработке script mini-app как обычных C#-проектов: export, import, live import, работа через IDE, быстрый цикл для C# Overlay, embedded resources и решения с несколькими проектами.

## Что обычно нужно пользователю

- Экспортировать скрипт в C#-решение, с которым удобно работать в IDE.
- Собирать проект скрипта обычными .NET-инструментами.
- Импортировать изменённый код обратно в EyeAuras.
- Использовать live import для быстрого цикла правок UI и скриптов.
- Держать тесты и вспомогательные проекты рядом с основным проектом скрипта.
- Понимать, какие проекты и файлы реально входят в runtime payload.
- Добавлять в проект скрипта Razor-компоненты, CSS, JS, изображения, модели или DLL.

## Модель работы

- Проект скрипта можно экспортировать как полноценные `.sln` / `.csproj`.
- Экспортированный проект должен нормально собираться обычными .NET-инструментами.
- Для компиляции script API вне приложения могут использоваться host-generated stubs.
- Import читает метаданные проекта и обновляет payload скрипта.
- Live import отслеживает изменения файлов проекта и перекомпилирует изменённые части скрипта.
- В solution могут быть отдельные вспомогательные, тестовые или инструментальные проекты.
- Не каждый проект в solution должен импортироваться как script payload.
- C# Overlay — это Blazor-поверхность, запущенная внутри script host, с особенно быстрым live feedback для UI.

## Основные понятия

- Export — создать из скрипта проект, который можно редактировать в IDE.
- Import — вернуть отредактированный проект обратно в скрипт.
- Live Import — отслеживать изменения проекта и держать runtime скрипта готовым к быстрому restart/reload.
- Open in IDE — это export + live import + запуск IDE.
- C# Overlay live workflow — редактирование Razor/C# UI с быстрым просмотром изменений в hosted overlay/window flow.
- Embedded resources — файлы проекта, помеченные как ресурсы и включённые в скомпилированную script assembly.

## Как лучше организовать проект

- Держите верхнеуровневый файл скрипта как runtime entry point и composition root.
- Выносите предметную логику в обычные `.cs`-файлы и папки.
- Размещайте Razor-компоненты в `.razor` с optional code-behind файлами при необходимости.
- Храните CSS/JS/изображения/шрифты/модели как embedded resources, если они должны поставляться вместе с mini-app.
- Держите тесты в отдельных проектах: они полезны для работы в IDE, но не должны попадать в import runtime скрипта.
- Выносите эксперименты и прототипы в отдельные проекты, если они не должны становиться частью runtime payload.
- Следите за корректностью метаданных проекта: import опирается на структуру проекта.

## Частые сценарии

### Export и работа в IDE

1. Экспортируйте проект скрипта.
2. Откройте сгенерированное solution в IDE.
3. Соберите основной проект.
4. Добавьте классы, Razor-компоненты, пакеты и ресурсы.
5. Выполните import или live import обратно в runtime скрипта.

### Быстрая работа с UI

1. Используйте C# Overlay или Blazor window, принадлежащее скрипту.
2. Экспортируйте проект или откройте его в IDE.
3. Включите live import.
4. Редактируйте файлы Razor/CSS/JS/C#.
5. Перезапускайте или обновляйте script surface в соответствии с workflow хоста.

### Solution с несколькими проектами

1. Держите проект script payload отдельно от helper/test-проектов.
2. Подключайте helper-проекты там, где это полезно для компиляции в IDE.
3. Не включайте тесты в script import payload.
4. Импортируйте обратно в EyeAuras только нужный проект и нужные файлы скрипта.

## Что предпочтительно

- Для крупных mini-app лучше использовать экспортированные проекты.
- Основной проект скрипта лучше держать в состоянии, которое нормально собирается.
- Для UI-heavy сценариев лучше использовать live import.
- Код, который не должен попадать в script payload, лучше держать в отдельных test/helper-проектах.
- Для ассетов, которые должны идти вместе с mini-app, лучше использовать embedded resources.
- Лучше использовать стабильные относительные пути проекта, а не machine-specific пути.

## Чего лучше избегать

- Не редактируйте один и тот же скрипт в EyeAuras после export, если планируете import из проекта IDE: import перезапишет изменения на стороне скрипта.
- Не рассчитывайте на то, что pre/post-build steps будут выполняться во время EyeAuras import.
- Не предполагайте, что IDE сможет запускать и отлаживать скрипт точно так же, как app host.
- Не считайте каждый проект в solution runtime-кодом скрипта.
- Не храните важные файлы только в папках build output.

## Research Anchors

- `ProjectSynchronizer`
- `AuraScriptSerializerVisitor`
- `EmbeddedResourcesScriptVisitor`
- `RazorVisitor`
- `MsbuildSdkVisitor`
- `MetadataReferenceGraphVisitor`
- `GlobalImportsVisitor`
- `IAuraScriptManager`
- `AuraScriptRuntimeManager`
- `RoslynFileProvider`
- `IScriptFileProvider`
- `CsharpAuraOverlay`
- `ScriptBlazorWindowConfigurator`

## Search Synonyms

- export script
- import script
- live import
- IDE integration
- open in IDE
- C# Overlay
- live overlay
- script project
- mini-app project
- exported solution
- embedded resource import
- project synchronizer
- Razor live import

## Related Maps

- `scripting/runtime.md`
- `scripting/container-extensions.md`
- `scripting/references-and-resources.md`
- `windows-subsystems/blazor-windows.md`
- `core/deployment.md`
- `recipes/recipe.md`