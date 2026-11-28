---
title: Porting from UOPilot #1
description: UOPilot porting guide
published: true
date: 2025-03-23T22:19:52.241Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T22:19:29.386Z
---

# Port a menu search and selection flow from AutoHotkey

The source script opens a menu, looks for one of two templates, selects the item it found and right-clicks a point saved earlier. Start the port by checking **your own window and image**: EyeAuras searches pixels in a capture. It does not read the application's item list.

## Find your template without clicking

You need the full EyeAuras application with C# Script and computer vision. Put your own `Vegetarian.bmp` in `C:\Scripts\Eat`. For example, save a small crop of a picture that is open in a separate test window of yours. The template and the picture in the window must be at the same scale.

1. Create a separate aura with Fixed Value set to Is NOT Active and no automatic actions. Add a `C# Script` action under On Enter and open its editor.
2. Paste the whole program below into top-level `Script.csx`. Click `Run` and pick your window with the picker.
3. The script log shows the rectangle of the found template relative to the window, or “Template not found”.

```csharp
using System.Drawing;
using EyeAuras.Shared.Osd;
using EyeAuras.OpenCVAuras.Scripting;

{
    var window = await GetService<IOsdSelectionService>().PickWindow();
    cancellationToken.ThrowIfCancellationRequested();
    if (window == null || !window.IsWindow) { Log.Warn("Window not selected or unavailable"); return; }
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    var found = cv.ImageSearch(@"C:\Scripts\Eat\Vegetarian.bmp", 95);
    Log.Info(found.IsEmpty ? "Template not found" : $"Window region: {found}");
}
```

This program is for the EyeAuras host: `GetService`, `Log` and `cancellationToken` come from the top-level script. An ordinary C# class or a Razor component must get its dependencies explicitly. The CV object is disposed when the block exits. The using directives stay at the top.

## Map the original operations

| Source operation | How EyeAuras does it and what to prepare |
| --- | --- |
| WinActivate, TL.exe | Find the window, then Activate. For your own window, change the expression and measure the points again |
| Vegetarian.bmp / Vegetarian1.bmp | Two templates of your own in imageDirectory. The order is the same: first attempt, a retry after a pause, then the fallback template |
| ImageSearch within opposite corners | Rectangle.FromLTRB turns left, top, right and bottom into a C# rectangle. 95 is a similarity threshold, not a probability |
| Screen point 1005,1005 and point saved by F5 | SendInput with TargetWindow=null. These points must not be shifted by the window position a second time |
| Found result and point 1499,1004 | SendInputWindow with the same window as ForWindow. For Windows Input these coordinates are relative to the DWM frame, not to the client-area origin |
| F3 / F5 / F6 | One pass / save the cursor / turn repetition on and off. The handlers only set flags, and all the work runs in turn in the main loop |
| SetTimer,100 | The port pauses 100 ms after a pass. The time of the search and input is added to that, so the exact AHK period is not reproduced |
| Status GUI | Log messages. For a separate UI there is [Toast](/en/scripting/examples/basic/toast-wpf), the OnScreenCanvas API or a [Blazor Window](/en/scripting/blazor-windows/getting-started) |

First compare the [coordinate system](/en/features/coordinate-system), the capture region and the found bounds in your own window.

<details>
<summary>Historical AutoHotkey source</summary>

The original is written in AutoHotkey, despite the UOPilot page address: its own status window, F5 saves a screen point, F3 runs one pass and F6 switches the timer.

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
<summary>Complete C# Script port</summary>

Before you run it you need an open target window, both BMP templates, points and regions measured for that window, a suitable keyboard layout and available Windows Input. Windows Input activates the window. All the numbers come from the original setup, so replace them for another interface.

`TL.exe` is compared with the window title, path or process name, so it is not a strict process-only filter. If several windows match, narrow the [window expression](/en/features/window-matching-expressions) until only the one you need is left.

Paste the **whole** block into the C# action's Script.csx and click Run. First save your right-click point with F5, and only then press F3. F6 turns repetition on. Pressing F6 again blocks further passes but does not cancel the one in progress. Stopping Run requests cancellation of the loop. F3, F5 and F6 must be free in your configuration: while the script runs, its handlers hold these keys. The saved point must not be (0, 0): the script treats Point.Empty as not saved.

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
    if (!window.IsWindow) { Log.Warn("Window unavailable"); return; }
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
                    Log.Warn($"Pass ended");
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

The Keybind methods sit outside the executable block. They are methods of the script object, not local functions. The flags are protected by one lock and reset on Run. The cursor, CV and the main loop stay local. Both input objects come from the current service registration and differ in TargetWindow: one works in screen coordinates, the other in the window.

A successful ImageSearch returns a rectangle in window coordinates, and the port takes its top-left corner. If nothing is found, the pass ends with a warning and F6 repetition stays on. Sleep and the checks between operations keep the script from going on after cancellation. But the synchronous CV and input calls do not receive this script's token and may not stop instantly. Clicks that were already sent are not undone.

</details>

API descriptions: [CV](/en/scripting/api/computer-vision/images), [input](/en/scripting/api/ISendInputScriptingApi), [script context](/en/scripting/api/scripting/runtime).
