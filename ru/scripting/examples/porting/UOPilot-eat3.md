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

Исходный скрипт открывает меню, ищет один из двух образцов, выбирает найденный элемент и нажимает правой кнопкой в заранее сохранённой точке. Перенос начинайте с проверки **своего окна и изображения**: EyeAuras ищет пиксели на снимке, а не читает список предметов приложения.

## Сначала найти свой образец без кликов

Нужно полное приложение EyeAuras с C# Script и компьютерным зрением. Положите свой `Vegetarian.bmp` в `C:\Scripts\Eat`. Например, сохраните небольшой фрагмент картинки, которая открыта в вашем отдельном тестовом окне. Масштаб образца и картинки в окне должен совпадать.

1. Создайте отдельную ауру с Fixed Value в состоянии Is NOT Active и без автоматических действий. В On Enter добавьте действие `C# Script` и откройте его редактор.
2. Вставьте всю программу ниже в верхнеуровневый `Script.csx`. Нажмите `Run` и выберите своё окно инструментом выбора.
3. В журнале скрипта появится прямоугольник найденного образца относительно окна либо «Образец не найден».

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

Это программа для хоста EyeAuras: `GetService`, `Log` и `cancellationToken` даёт верхнеуровневый скрипт. Обычный C#-класс или Razor-компонент должен получить зависимости явно. CV-объект освобождается при выходе из блока. Директивы using остаются сверху.

## Что сопоставить перед полным переносом

| Исходная операция | Реализация и подготовка в EyeAuras |
| --- | --- |
| WinActivate, TL.exe | Выбор окна и Activate. Полный пример ниже рассчитан на TL.exe. Для своего окна поменяйте выражение и заново измерьте точки |
| Vegetarian.bmp / Vegetarian1.bmp | Два ваших образца в imageDirectory. Порядок тот же: первая попытка, повтор после паузы, затем запасной образец |
| ImageSearch в заданных границах | Rectangle.FromLTRB превращает левую, верхнюю, правую и нижнюю границы в прямоугольник C#. 95 — порог сходства |
| Экранная точка 1005,1005 и сохранённая F5 | SendInput с TargetWindow=null. Эти точки не должны ещё раз сдвигаться на положение окна |
| Результат поиска и точка 1499,1004 | SendInputWindow с тем же окном, что у ForWindow. У Windows Input это координаты относительно DWM-рамки, а не начала клиентской области |
| F3 / F5 / F6 | Один проход / сохранить курсор / включить и выключить повторение. Обработчики только выставляют флаги, вся работа идёт по очереди в основном цикле |
| SetTimer,100 | В порте пауза 100 ms стоит после прохода. К ней добавляется время самого поиска и ввода, так что точный период AHK не повторяется |
| GUI со строкой состояния | Сообщения Log. Для отдельного интерфейса есть [Toast](/ru/scripting/examples/basic/toast-wpf) или [Blazor Window](/ru/scripting/blazor-windows/getting-started) |

Сначала сравните [систему координат](/ru/features/coordinate-system), область и найденную рамку в своём окне.

<details>
<summary>Исходник AutoHotkey</summary>

Исходный пример написан на AutoHotkey: своё окно статуса, F5 сохраняет координаты, F3 запускает один проход, F6 включает таймер.

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

Перед запуском нужны открытое целевое окно, оба BMP, измеренные для него точки и области, подходящая раскладка и доступный Windows Input. Windows Input активирует окно. Все числа взяты из исходной конфигурации, для другого интерфейса их нужно заменить. Текст TL.exe сравнивается с названием окна, путём или именем процесса, то есть это не строгий отбор по процессу. Если подходит несколько окон, уточните [выражение окна](/ru/features/window-matching-expressions), чтобы осталось одно нужное.

Вставьте **весь** блок в Script.csx действия C# Script и нажмите Run. Сначала сохраните клавишей F5 свою точку правого клика и только потом нажимайте F3. F6 включает повторение. Повторное F6 запрещает следующие проходы, но уже идущий не отменяет. Остановка Run запрашивает отмену цикла. F3, F5 и F6 должны быть свободны в вашей конфигурации: пока скрипт работает, эти клавиши заняты его обработчиками.

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

Методы с Keybind вынесены из исполняемого блока. Это методы объекта скрипта, а не локальные функции: только так их находит хост. Флаги защищены одним lock и сбрасываются при Run. Курсор, CV и основной цикл остаются локальными. Оба объекта ввода получены через текущую регистрацию сервиса и отличаются TargetWindow: один экранный, другой оконный.

Успешный ImageSearch возвращает прямоугольник в координатах окна, из него берётся левый верхний угол. Sleep и проверки между операциями не дают продолжать после отмены. Но синхронные вызовы CV и ввода токен этого скрипта не получают и могут прекратиться не мгновенно.

</details>

Описания API: [CV](/ru/scripting/api/computer-vision/images), [ввод](/ru/scripting/api/ISendInputScriptingApi), [контекст скрипта](/ru/scripting/api/scripting/runtime).
