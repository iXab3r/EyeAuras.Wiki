---
title: API SendInput для скриптов
description: 
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-21T23:36:13.915Z
---
# ISendInputScriptingApi

Отправляет текст, нажатия клавиш и движения мыши через выбранный симулятор ввода. Сервис внедряется в C# Action; обычный C# класс получает его через конструктор или параметр. Регистрацию предоставляет модуль Roxy работающего EyeAuras, одной ссылки на SDK недостаточно.

## Отправить текст и клавишу

Откройте редактор текста и оставьте его активным перед выполнением этого C# Action:

```csharp
ISendInputScriptingApi SendInput { get; init; }

SendInput.TargetWindow = null;
SendInput.Text("hello");
SendInput.KeyPress(Key.Enter);
```

При стандартном `Windows Input` текст и Enter отправляются активному приложению. Методы синхронные, результат — побочный эффект в приложении, а не возвращённое значение или подтверждение обработки ввода.

`Text` принимает текст, а не грамматику AutoHotkey `Send`. Для отдельных клавиш используйте `KeyPress`, `KeyDown`, `KeyUp`; для сочетания — `Gesture(HotkeyGesture, InputEventType, int?)`. После ручного `KeyDown` нужен парный `KeyUp`.

## Кликнуть в точке экрана

Для стандартного `Windows Input` без целевого окна координаты абсолютные, в пространстве виртуального рабочего стола:

```csharp
ISendInputScriptingApi SendInput { get; init; }

SendInput.TargetWindow = null;
SendInput.MouseLeftClick(100, 200);
Log.Info($"Курсор после клика: {SendInput.CursorPosition}");
```

Перегрузка с координатами сначала двигает курсор, затем кликает. Положение не восстанавливается. `MouseMoveTo(x, y)` задаёт точку, `MouseMoveBy(x, y)` — смещение; есть перегрузки с `WinPoint`. `MouseRightClick`, `MouseClick`, `MouseDown`, `MouseUp` работают с кнопками `MouseButton`; `MouseLeftDoubleClick` выполняет два клика с интервалом.

`TargetWindow` передаётся контроллеру, но **не гарантирует фоновый ввод**. Стандартный `Windows Input` обёрнут в `ForegroundInputController`: при ненулевом `TargetWindow` он запрашивает активацию окна, а абсолютную точку переводит через начало `DwmFrameBounds` в экранную перед передачей mapper. Без цели точка уже экранная. Относительное движение остаётся смещением. У других контроллеров семантика может отличаться; это не универсальный режим AHK `CoordMode` и не Win32 client origin. Преобразования относительно рамки окна описаны в [карте окон](./windows-subsystems/window-handles).

## Настроить задержки и симулятор

В реализации EyeAuras `20fd3d4`:

| Настройка | Начальное значение / назначение |
|---|---|
| `InputSimulatorId` | Не задан: используется зарегистрированный стандартный `Windows Input` |
| `InputSmootherId` | Не задан: сглаживание отсутствует |
| `TargetWindow` | `null` |
| `KeyPressDelay` | `RandomInteger(1, 5)`, мс |
| `ClickDelay` | `RandomInteger(50, 100)`, мс |
| `DoubleClickDelay` | `RandomInteger(150, 300)`, мс |

Аргумент задержки `int?` переопределяет настройку конкретного вызова. Например, `SendInput.KeyPress(Key.F1, 20)` задаёт явную задержку. Доступные id берите из `IInputSimulatorProvider` / `IUserInputSmootherProvider`, а не из предположения, что драйвер установлен на любой машине.

## Проверить состояние и остановить последовательность

`IsKeyDown(Key)` и `IsMouseDown(MouseButton)` возвращают `bool` через состояние выбранного контроллера. Это не подтверждённый эквивалент всех режимов logical/physical AutoHotkey.

```csharp
ISendInputScriptingApi SendInput { get; init; }

for (var i = 0; i < 3; i++)
{
    cancellationToken.ThrowIfCancellationRequested();
    SendInput.KeyPress(Key.F1);
    Sleep(250);
}
```

Пример отправляет до трёх нажатий F1. Остановка скрипта прерывает `Sleep` и предотвращает следующие итерации. Однако сами операции API этой версии не принимают токен: внутренний `Send` использует `CancellationToken.None`, а `Text` синхронно ждёт контроллер без токена запуска. Не считайте остановку скрипта мгновенной отменой уже начатого ввода. Неготовый симулятор или запрещённое foreground-окно могут вызвать исключение.

Сервис привязан к контексту скрипта; не освобождайте внедрённые общие сервисы самостоятельно. Для UI-кода учитывайте синхронное ожидание: это не асинхронный API диспетчера.

## Связанные операции и справка

[Хоткеи и хуки](./windows-subsystems/input-hooks-hotkeys), [окна](./windows-subsystems/window-handles), [перенос ввода с AHK](./ahk/keyboard-mouse). Полный контракт, включая координатные перегрузки, сверяйте с `EyeAuras.Roxy.Api.ISendInputScriptingApi` в SDK/XML своей версии. Устаревший [ISendInputUnstableScriptingApi](./ISendInputUnstableScriptingApi) не добавляет возможностей.
