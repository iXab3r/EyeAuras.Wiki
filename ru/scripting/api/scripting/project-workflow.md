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

## Изменить скрипт через IDE и вернуть его в EyeAuras

Начните с рабочего C# Script. Для проверки достаточно тела
`Log.Info("Версия из EyeAuras");`. Сохраните свою копию перед импортом:
импорт заменяет код скрипта содержимым проекта.

1. В редакторе скрипта выполните `Export` в отдельную пустую папку. Экспорт удаляет файлы и подпапки в выбранной папке, сохраняя `.git`. Не
   выбирайте папку с другими важными файлами. Путь к кнопкам и снимки экрана
   есть в [руководстве по IDE](/ru/scripting/ide-integration).
2. Откройте экспортированный `.sln` в Rider или Visual Studio. Для сборки
   нужны SDK .NET и Windows-зависимости, указанные в сгенерированном проекте.
   Используйте обычный `dotnet build` для этого проекта.
3. Измените тело скрипта на `Log.Info("Версия из IDE");`, сохраните файл.
4. Выполните `Import` проекта обратно в тот же скрипт и запустите его в
   EyeAuras. Ожидаемый результат — новое сообщение в журнале скрипта.

Сборка в IDE проверяет компиляцию, а запуск в EyeAuras — наличие живого
контекста и сервисов. Сгенерированные host stubs не заменяют работающую
песочницу. Служебная папка stubs пересоздаётся экспортом и игнорируется
импортом; свои классы храните в проекте скрипта.

## Повторять правки через Live Import

После первого успешного ручного импорта подключите `Live Import` к этому же
проекту по [инструкции](/ru/scripting/ide-integration). Меняйте код только в IDE,
сохраняйте файл и проверяйте, что изменение появилось в редакторе EyeAuras.
Для C# Overlay удобно менять текст существующего Razor-компонента и смотреть
его в окне после обновления/перезапуска поверхности.

Отслеживание файлов не означает, что старые окна, поля и подписки уже
переинициализированы. Проверяйте результат в работающем скрипте; не считайте
сборку или сохранение файла доказательством обновления UI. Точный автоматический
restart зависит от поверхности и версии host.

## Отделить основной проект от тестов и ресурсов

Импорт сопоставляет проект скрипта и его зависимости с проектами на диске.
Соседний тестовый проект сам по себе не становится частью скрипта только
из-за присутствия в solution. Но зависимость основного проекта может попасть
в импорт: направление project references имеет значение.

Для ресурса укажите явный элемент проекта:

```xml
<ItemGroup>
  <EmbeddedResource Include="docs/help.txt" />
  <None Remove="docs/help.txt" />
</ItemGroup>
```

Создайте `docs/help.txt` с текстом `Справка проекта`, импортируйте и прочитайте
его по [полному примеру](references-and-resources). Импорт читает метаданные
ресурсов; это не обещание выполнить произвольные MSBuild targets, генераторы
или pre/post-build steps. Не храните единственную копию ресурса в `bin`/`obj`.

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

- `AuraScriptSynchronizer` — текущий импорт и наблюдение; `ProjectSynchronizer` относится к устаревшему V2
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

- [scripting/runtime.md](/ru/scripting/api/scripting/runtime)
- [scripting/container-extensions.md](/ru/scripting/api/scripting/container-extensions)
- [scripting/references-and-resources.md](/ru/scripting/api/scripting/references-and-resources)
- [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows)
- [core/deployment.md](/ru/scripting/api/core/deployment)
- [recipes/recipe.md](/ru/scripting/api/recipes/recipe)
Контракты — EyeAuras `20fd3d4`, PoeEye `0e02c98`; формат проекта и символы сверяйте с экспортом и SDK/XML своей версии.

## Ресурсы после импорта проекта

После импорта проверьте не только наличие файлов в проекте, но и возможность прочитать нужный ресурс через `IScriptFileProvider`. Его путь может отличаться от физического пути экспортированного проекта.

[Операции файлового провайдера](file-provider-operations) содержат пример чтения с освобождением потока и правила приоритета нескольких источников. Подготовку embedded-ресурсов и `#r` см. в [подключении ресурсов](references-and-resources).

## Текущая реализация импорта

В срезе `c8b2304` `CsharpScriptEditor` использует `AuraScriptSynchronizer`.
Обычный Import загружает solution один раз. Live Import сначала загружает его,
затем повторяет загрузку по изменениям файлов с учётом `.gitignore`, `.eaignore`
и исключений для сгенерированных файлов. Stop прекращает наблюдение, но не
отменяет уже импортированные изменения. При `CompileOnce` оба режима запрещены.
Это контракт загрузки проекта, а не обещание завершения прежних подписок.

Исходники: [редактор](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.CsScriptAuras/Actions/CsharpScript/CsharpScriptEditor.cs),
[синхронизация](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting.Editor/Services/AuraScriptSynchronizer.cs).
