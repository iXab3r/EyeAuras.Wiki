---
title: Porting from UOPilot #1
description: UOPilot porting guide
published: true
date: 2025-03-23T22:19:52.241Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T22:19:29.386Z
---
# Port an eating sequence from UOPilot/AHK

The target sequence activates `TL.exe`, opens a menu with F, searches for `Vegetarian.bmp` or its fallback, selects food, closes the menu and right-clicks a saved point. The original script remains below for comparison.

The GUI status is replaced by log messages. Scheduling and input behavior are not claimed equivalent to the original timer/game integration.

An alternative would be to use the [Toast API](/scripting/examples/basic/toast-wpf), the OnScreenCanvas API, or [BlazorWindows](/scripting/blazor-windows/getting-started), but for displaying a single line of text, all of that feels like overkill.

## UO Pilot

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

## EyeAuras C# Script

Run the entire C# block as a top-level EyeAuras C# Script. Open `TL.exe`, prepare both templates in `C:\Scripts\Eat` or change `imageDirectory`, and adjust the layout/window dimensions. `1005,1005` is a screen point; the search region and `1499,1004` are window-relative, not necessarily client-area coordinates. F5 saves a screen point, F3 requests one pass, and F6 toggles repetition. Stop cancels the loop.

The main loop serializes CV/input work; key handlers only update flags under a lock. The 100 ms pause follows a completed pass, so it is not a fixed external timer period. Keybind methods must remain outside the executable block as script-instance methods. Choose a valid nonzero saved point; this example uses `Point.Empty` as its unset sentinel.



```csharp
using System.Drawing;
using System.IO;
using System.Windows.Input;
using EyeAuras.Shared.Services;
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
    SendInput.TargetWindow = null;
    var window = GetService<IWindowSelector>().GetWindow("TL.exe");
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
            Log.Info($"Right-click point: {savedCursor}");
        }
        if (run) MainScript();
        Sleep(100);
        cancellationToken.ThrowIfCancellationRequested();
    }

    void MainScript()
    {
        if (savedCursor.IsEmpty)
        {
            Log.Warn("Save a point with F5 first");
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
                    Log.Warn($"Vegetarian image not found");
                    Sleep(2000);
                    cancellationToken.ThrowIfCancellationRequested();
                    Log.Warn($"Sequence ended");
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
A match selects the template’s top-left corner. `ForWindow` image results are window-relative and are passed to a separate input accessor targeting that same window. Screen points use `TargetWindow = null` to avoid a second transform. Missing both templates ends the pass with a warning. `Rectangle.FromLTRB` converts opposite corners to size. Cancellation checkpoints follow waits; synchronous CV/input calls do not promise immediate interruption. Native input and game behavior have not been executed here.

[CV contracts](/en/scripting/api/computer-vision/images) · [Input contracts](/en/scripting/api/ISendInputScriptingApi) · [Script context](/en/scripting/api/scripting/runtime)
