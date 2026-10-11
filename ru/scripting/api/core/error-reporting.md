---
title: Карта API для работы с отчетами об ошибках
description: Публичные API-контракты для отправки сообщений о проблемах и редактируемые комментарии к отчетам.
published: true
date: 2026-10-11T00:00:00.000Z
tags: scripting, api, reporting, ai-translated
editor: markdown
dateCreated: 2026-10-11T00:00:00.000Z
---
# Карта возможностей для отправки отчётов об ошибках

## Что можно сделать

- Открыть стандартное окно отправки отчёта о проблеме из скрипта или mini-app.
- Заранее заполнить комментарий к отчёту и дать пользователю отредактировать его перед отправкой.
- Сохранить или отправить отчёт вместе с финальным комментарием пользователя.

## Как это устроено

`PoeShared.Reporting.IErrorReportingService` открывает отчёт, который пользователь просматривает и подтверждает вручную.

`PoeShared.UI.ExceptionDialogConfig` описывает параметры одного вызова. Тип находится в `PoeShared.dll`; его пространство имён сохранено для совместимости. Реализацию диалога для desktop-host предоставляет `PoeShared.Wpf.dll`.

## Где это работает

Скрипты верхнего уровня могут получить сервис через `GetService<IErrorReportingService>()`.

Обычные вспомогательные классы получают сервис через конструктор или явный параметр. Компоненты Razor используют `[Inject]`.

Важно: одной только ссылки на SDK недостаточно, чтобы появился desktop-host для отправки отчётов.

## Подробности API

- `ReportProblem(Exception error = null)` сохраняет текущий сценарий отправки отчёта.
- `ReportProblem(ExceptionDialogConfig config)` принимает отчёт с заранее заполненными данными.
- `ExceptionDialogConfig.Comment` задаёт начальный редактируемый текст. Финальный непустой комментарий попадает в `comment.txt` и в сохранённый, и в отправленный архив.
- Если не указаны `AppName`, `Title`, `Timestamp` и `ReportHandler`, используются значения по умолчанию от хоста. Провайдеры элементов, переданные вызывающей стороной, дополняют уже зарегистрированные в хосте.
- Оба варианта вызова синхронные и возвращают управление после закрытия диалога.
- Вызов `ReportProblem(null)` неоднозначен. Используйте `ReportProblem()` для отчёта без исключения или явно укажите нужный тип аргумента.

## Типовой сценарий

```csharp
using PoeShared.Reporting;
using PoeShared.UI;

GetService<IErrorReportingService>().ReportProblem(new ExceptionDialogConfig
{
    Comment = "Describe what happened before the problem."
});
```

Пользователь может изменить комментарий или полностью очистить его. Если очистить текст, `comment.txt` добавлен не будет.

Начальное значение копируется в момент открытия окна. Обратной постоянной привязки к неизменяемому объекту конфигурации нет.

## Подсказки по сборкам и пакетам

- `EyeAuras.SDK` предоставляет контракты, которые используются внутри runtime EyeAuras.
- `PoeShared.dll` содержит `IErrorReportingService` и `ExceptionDialogConfig`.
- `PoeShared.Wpf.dll` пробрасывает перемещённый тип конфигурации для существующих потребителей.

## Опорные сущности для поиска

`IErrorReportingService`, `ExceptionDialogConfig`, `ExceptionDialogViewModel`,
`IErrorReportHandler`, `IErrorReportItemProvider`.

## Поисковые синонимы

problem report, error report, report dialog, prefilled comment, comment.txt,
support archive.

## Связанные карты

- `core/app-runtime-contexts.md`
- `core/logging.md`
- `scripting/runtime.md`