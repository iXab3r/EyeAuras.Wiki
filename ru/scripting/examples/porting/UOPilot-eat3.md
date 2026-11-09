---
title: Порт с UOPilot #1
description: 
published: true
date: 2025-03-23T22:19:52.241Z
tags: 
editor: markdown
dateCreated: 2025-03-23T13:10:35.553Z
---

# Перенести поиск и выбор еды из AutoHotkey в EyeAuras

Задача исходника — открыть меню, найти один из двух образцов, выбрать найденный элемент и нажать правой кнопкой в заранее сохранённой точке. Перенос начинается с проверки **своего окна и изображения**: EyeAuras ищет пиксели снимка, а не читает список предметов приложения.

## Сначала найти свой образец без кликов

Нужно полное приложение EyeAuras с C# Script и компьютерным зрением. Подготовьте свой `Vegetarian.bmp` в `C:\Scripts\Eat`: например, сохраните небольшой фрагмент изображения, которое открыто в вашем отдельном тестовом окне. Масштаб образца и видимого изображения должен совпадать. Название файла не задаёт его содержимое.

1. Создайте отдельную ауру с Fixed Value в состоянии Is NOT Active и без автоматических действий. Добавьте в On Enter действие `C# Script`, откройте его редактор.
2. В верхнеуровневый `Script.csx` вставьте всю программу ниже. Нажмите `Run` и выберите собственное окно инструментом выбора.
3. В журнале скрипта появится прямоугольник найденного образца относительно окна либо «Образец не найден». Клавиши и клики программа не отправляет. Отмена выбора завершит её до создания CV-объекта.

```csharp
using System.Drawing;
using EyeAuras.Shared.Osd;
using EyeAuras.OpenCVAuras.Scripting;

{
    var window = await GetService<IOsdSelectionService>().PickWindow();
    cancellationToken.ThrowIfCancellationRequested();
    if (window == null || !window.IsWindow) { Log.Warn("Окно не выбрано или недоступно"); return; }
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    var found = cv.ImageSearch(@"C:\Scripts\Eat\Vegetarian.bmp", 95);
    Log.Info(found.IsEmpty ? "Образец не найден" : $"Область окна: {found}");
}
```

Это программа для хоста EyeAuras: `GetService`, `Log` и `cancellationToken` предоставляет верхнеуровневый скрипт. Обычный C#-класс или Razor-компонент должен получить зависимости явно. CV-объект освобождается при выходе из блока; директивы using остаются сверху.

## Что сопоставить перед полным переносом

| Исходная операция | Реализация и подготовка в EyeAuras |
| --- | --- |
| WinActivate, TL.exe | Выбор окна и Activate. Полный пример ниже рассчитан на TL.exe; для своего окна измените выражение и заново измерьте точки |
| Vegetarian.bmp / Vegetarian1.bmp | Два собственных образца в imageDirectory. Первая попытка, повтор после паузы и запасной образец сохраняются |
| ImageSearch в заданных границах | Rectangle.FromLTRB переводит левую/верхнюю/правую/нижнюю границы в прямоугольник C#; 95 — порог сходства, не вероятность успеха |
| Экранная точка 1005,1005 и сохранённая F5 | SendInput с TargetWindow=null; эти точки не должны повторно смещаться на положение окна |
| Результат поиска и точка 1499,1004 | SendInputWindow с тем же окном, что у ForWindow. У Windows Input это координаты относительно DWM-рамки, не начала клиентской области |
| F3 / F5 / F6 | Один проход / сохранить курсор / переключить повторение. Обработчики только выставляют флаги, работа идёт последовательно в основном цикле |
| SetTimer,100 | В порте пауза 100 ms стоит после прохода. Полная длительность включает сам поиск и ввод, точный период AHK не воспроизводится |
| GUI со строкой состояния | Сообщения Log. Для отдельного интерфейса доступны [Toast](/ru/scripting/examples/basic/toast-wpf) или [Blazor Window](/ru/scripting/blazor-windows/getting-started), но их программа здесь не создаёт |

Сначала сравните [систему координат](/ru/features/coordinate-system), область и найденную рамку в своём окне. Порт не конвертирует автоматически настройки, масштаб, раскладку или способ доставки ввода.

<details>
<summary>Исходник AutoHotkey</summary>

В этом исходном примере используется синтаксис AutoHotkey: собственное окно статуса, F5 для координат, F3 для одного прохода и F6 для таймера.

```js
#NoEnv
SetWorkingDir %A_ScriptDir%
SetTitleMatchMode, Fast

; Переменные для хранения координат курсора
global CursorX := 0
global CursorY := 0
global Toggle := 0 ; Переключатель для включения/выключения

; Создаем GUI для вывода текста на экран
Gui, +AlwaysOnTop +ToolWindow -Caption +E0x20 ; Всегда поверх окон, без заголовка, кликабельно
Gui, Add, Text, vStatusText, Скрипт выключен ; Текст, который будет обновляться
Gui, Show, NoActivate X0 Y0, StatusWindow ; Показываем окно без активации в углу экрана

; Горячая клавиша F5: запись координат курсора
F5::
    CoordMode, Mouse, Screen
    MouseGetPos, CursorX, CursorY
    GuiControl,, StatusText, Координаты сохранены: X=%CursorX%, Y=%CursorY%
    Sleep, 2000 ; Показываем сообщение 2 секунды
    GuiControl,, StatusText, Скрипт выключен
return

; Горячая клавиша F3: однократное выполнение скрипта
F3::
    Gosub, MainScript
return

; Горячая клавиша F6: запуск/остановка цикла
F6::
    Toggle := !Toggle ; Переключаем состояние
    if (Toggle) {
        GuiControl,, StatusText, Скрипт включен
        SetTimer, RunMainScript, 100 ; Запускаем таймер каждые 100 мс
    } else {
        GuiControl,, StatusText, Скрипт выключен
        SetTimer, RunMainScript, Off ; Останавливаем таймер
    }
return

; Таймер для выполнения основного скрипта
RunMainScript:
    Gosub, MainScript
return

; Перемещение GUI по экрану
~LButton::
    MouseGetPos, StartMouseX, StartMouseY ; Сохраняем начальные координаты мыши
    Gui, +LastFound ; Получаем ID последнего созданного GUI
    WinGetPos, GuiStartX, GuiStartY, GuiW, GuiH ; Сохраняем начальные координаты окна
    ; Проверяем, что клик произошел внутри окна
    if (StartMouseX >= GuiStartX && StartMouseX <= GuiStartX + GuiW && StartMouseY >= GuiStartY && StartMouseY <= GuiStartY + GuiH) {
        While GetKeyState("LButton", "P") { ; Пока зажата ЛКМ
            MouseGetPos, CurrentMouseX, CurrentMouseY ; Получаем текущие координаты мыши
            ; Вычисляем смещение
            OffsetX := CurrentMouseX - StartMouseX
            OffsetY := CurrentMouseY - StartMouseY
            ; Новые координаты окна
            NewGuiX := GuiStartX + OffsetX
            NewGuiY := GuiStartY + OffsetY
            Gui, Show, x%NewGuiX% y%NewGuiY% NoActivate ; Перемещаем окно
            Sleep, 20 ; Небольшая задержка для снижения нагрузки
        }
    }
return

; Основной код скрипта
MainScript:
    WinActivate, TL.exe
    Sleep, 2500

    SendInput, {f}
    Sleep, 300

    CoordMode, Mouse, Screen
    Click, 1005, 1005
    CoordMode, Mouse, Window
    Sleep, 200

    if !MyImageSearch(FoundX, FoundY, 640, 186, 1237, 939, "Vegetarian.bmp")
    {
        Sleep, 1000
        if !MyImageSearch(FoundX, FoundY, 640, 186, 1237, 939, "Vegetarian.bmp")
        {
            if !MyImageSearch(FoundX, FoundY, 640, 186, 1237, 939, "Vegetarian1.bmp")
            {
                GuiControl,, StatusText, Объект "Vegetarian" не найден!
                Sleep, 2000
                GuiControl,, StatusText, Скрипт выключен
                return
            }
        }
    }
    Click, %FoundX%, %FoundY%
    Sleep, 200

    Click, 1499, 1004
    Sleep, 200

    SendInput, {Esc}
    Sleep, 200

    Sleep, 600
    CoordMode, Mouse, Screen
    Click, right, %CursorX%, %CursorY%
    CoordMode, Mouse, Window
return

; Функция поиска изображения
MyImageSearch(ByRef FoundX, ByRef FoundY, X1, Y1, X2, Y2, ImageFile)
{
    CoordMode, Pixel, Window
    Loop, 10
    {
        ImageSearch, FoundX, FoundY, %X1%, %Y1%, %X2%, %Y2%, %A_ScriptDir%\%ImageFile%
        if (ErrorLevel = 0)
            return true
        Sleep, 100
    }
    return false
}
```

</details>

<details>
<summary>Полный порт последовательности для C# Script</summary>

Перед запуском нужны открытое целевое окно, оба BMP, измеренные для него точки и области, подходящая раскладка и доступный Windows Input. Последний активирует окно; фонового ввода в любое приложение пример не обещает. Все заданные числа относятся к исходной конфигурации и требуют замены для другого интерфейса. Текст TL.exe сопоставляется с названием, путём или именем процесса; это не строгое ограничение по процессу. При нескольких совпадениях уточните [выражение окна](/ru/features/window-matching-expressions) до своего единственного адресата.

Поместите **весь** блок в Script.csx действия C# Script, запустите Run, сохраните F5 свою точку правого клика и только затем запросите F3. F6 разрешает повторение; повторное F6 запрещает следующие проходы, но не отменяет уже выполняемый. Остановка Run запрашивает отмену цикла. Выбранные F3/F5/F6 должны быть свободны в вашей конфигурации: пока скрипт работает, его обработчики используют эти клавиши.

```csharp
using System.Drawing;
using System.IO;
using System.Windows.Input;
using EyeAuras.Shared.Services;
using EyeAuras.Shared.Scaffolding;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Roxy.Api;
using EyeAuras.Scripting.Api;
using PoeShared.Scaffolding;

private object stateGate { get; } = new object();
private bool enabled { get; set; }
private bool runOnce { get; set; }
private bool captureCursor { get; set; }

{
    var imageDirectory = @"C:\Scripts\Eat";
    lock (stateGate)
    {
        enabled = false;
        runOnce = false;
        captureCursor = false;
    }
    Point savedCursor = Point.Empty;
    var SendInput = GetService<ISendInputScriptingApi>();
    var SendInputWindow = GetService<ISendInputScriptingApi>();
    SendInput.InputSimulatorId = "Windows Input";
    SendInputWindow.InputSimulatorId = "Windows Input";
    SendInput.TargetWindow = null;
    var window = GetService<IWindowSelector>().GetWindow("TL.exe");
    cancellationToken.ThrowIfCancellationRequested();
    if (!window.IsWindow) { Log.Warn("Окно недоступно"); return; }
    SendInputWindow.TargetWindow = window;
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window).EnableOsd(10);

    while (!cancellationToken.IsCancellationRequested)
    {
        bool run, capture;
        lock (stateGate)
        {
            capture = captureCursor;
            captureCursor = false;
            run = enabled || runOnce;
            runOnce = false;
        }
        if (capture)
        {
            savedCursor = SendInput.CursorPosition;
            Log.Info($"Точка правого клика: {savedCursor}");
        }
        if (run) MainScript();
        Sleep(100);
        cancellationToken.ThrowIfCancellationRequested();
    }

    void MainScript()
    {
        if (savedCursor.IsEmpty)
        {
            Log.Warn("Сначала сохраните точку клавишей F5");
            return;
        }
        window.Activate();
        Sleep(2500);
        cancellationToken.ThrowIfCancellationRequested();

        SendInput.KeyPress(Key.F);
        Sleep(300);
        cancellationToken.ThrowIfCancellationRequested();

        SendInput.MouseClick(1005, 1005);
        Sleep(200);
        cancellationToken.ThrowIfCancellationRequested();

        int FoundX, FoundY;

        if (!MyImageSearch(out FoundX, out FoundY, 640, 186, 1237, 939, "Vegetarian.bmp"))
        {
            Sleep(1000);
            cancellationToken.ThrowIfCancellationRequested();
            if (!MyImageSearch(out FoundX, out FoundY, 640, 186, 1237, 939, "Vegetarian.bmp"))
            {
                if (!MyImageSearch(out FoundX, out FoundY, 640, 186, 1237, 939, "Vegetarian1.bmp"))
                {
                    Log.Warn($"Объект 'Vegetarian' не найден!");
                    Sleep(2000);
                    cancellationToken.ThrowIfCancellationRequested();
                    Log.Warn($"Скрипт выключен");
                    return;
                }
            }
        }

        SendInputWindow.MouseClick(FoundX, FoundY);
        Sleep(200);
        cancellationToken.ThrowIfCancellationRequested();

        SendInputWindow.MouseClick(1499, 1004);
        Sleep(200);
        cancellationToken.ThrowIfCancellationRequested();

        SendInputWindow.KeyPress(Key.Escape);
        Sleep(200);
        cancellationToken.ThrowIfCancellationRequested();

        Sleep(600);

        cancellationToken.ThrowIfCancellationRequested();
        SendInput.MouseRightClick(savedCursor.X, savedCursor.Y);
    }

    bool MyImageSearch(out int FoundX, out int FoundY, int X1, int Y1, int X2, int Y2, string ImageFile)
    {
        Rectangle result;
        for (int i = 0; i < 10; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            result = cv.ImageSearch(Path.Combine(imageDirectory, ImageFile),
                similarityThreshold: 95, region: Rectangle.FromLTRB(X1, Y1, X2, Y2));
            if (!result.IsEmpty)
            {
                //found the image
                FoundX = result.X;
                FoundY = result.Y;
                return true;
            }
            Sleep(100);
            cancellationToken.ThrowIfCancellationRequested();
        }
        FoundX = FoundY = 0;
        return false;
    }

}

[Keybind(Hotkey = "F3")]
public void RunOnce() { lock (stateGate) runOnce = true; }

[Keybind(Hotkey = "F5")]
public void SaveCursor() { lock (stateGate) captureCursor = true; }

[Keybind(Hotkey = "F6")]
public void ToggleScript() { lock (stateGate) enabled = !enabled; }
```

Методы с Keybind находятся вне исполняемого блока как методы объекта скрипта, а не локальные функции: так их обнаруживает хост. Флаги защищены одним lock и сбрасываются при Run; курсор, CV и основной цикл остаются локальными. Два объекта ввода получаются через текущую регистрацию сервиса и имеют разные TargetWindow: экранный и оконный.

Успешный ImageSearch возвращает прямоугольник окна; берётся его левый верхний угол. Отсутствие обоих образцов заканчивает текущий проход предупреждением. Sleep и проверки между операциями ограничивают продолжение при отмене, но синхронные CV/ввод не получают токен этого скрипта и не обязаны прекратиться мгновенно. Применённые клики не откатываются.

</details>

Видимый результат первого опыта — найденная область в журнале, полного порта — только наблюдаемая последовательность в вашем настроенном окне. Источники контрактов: [CV](/ru/scripting/api/computer-vision/images), [ввод](/ru/scripting/api/ISendInputScriptingApi), [контекст скрипта](/ru/scripting/api/scripting/runtime).
