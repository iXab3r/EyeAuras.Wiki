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

The source opens a menu, finds one of two templates, selects the found item, then right-clicks a saved point. Begin by checking **your own window and image** without sending input. EyeAuras searches captured pixels; it does not read an application's item list.

## Find your template without clicking

You need the full EyeAuras application with C# Script and computer vision available. Prepare your own `Vegetarian.bmp` at `C:\Scripts\Eat`, for example a crop of an image visible in a separate test window you own. Match its visible scale; the filename does not define its contents.

1. Create a separate aura with Fixed Value set to Is NOT Active and no automatic work. Add a `C# Script` action under On Enter and open its editor.
2. Put this complete program in top-level `Script.csx`, click `Run`, and select your own test window with the picker.
3. The script log receives a window-relative rectangle or “Template not found”. This program sends no keys or clicks. Cancelling selection ends it before CV accessor creation.

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

This is an EyeAuras host script: `GetService`, `Log` and `cancellationToken` are top-level host capabilities. Ordinary C# helpers or Razor components need explicit dependencies and token parameters. The owned CV accessor is disposed on block exit; namespace using directives stay above that block.

## Map the original operations

| Source operation | EyeAuras path and preparation |
| --- | --- |
| WinActivate, TL.exe | Resolve a window, then Activate. Change the expression and recalibrate points for your own fixture |
| Vegetarian.bmp / Vegetarian1.bmp | Two own templates in imageDirectory; retain the first attempt, retry after a pause and fallback template |
| ImageSearch within opposite corners | Rectangle.FromLTRB converts left/top/right/bottom to a C# region; 95 is a similarity threshold, not a probability |
| Screen point 1005,1005 and point saved by F5 | SendInput with TargetWindow=null; do not add the window origin again |
| Found result and point 1499,1004 | SendInputWindow targets the same window as ForWindow. Windows Input uses DWM-frame-relative coordinates, not the client origin |
| F3 / F5 / F6 | Request one pass / save cursor / toggle repetition; handlers set flags while the main loop serializes CV and input |
| SetTimer,100 | This port pauses 100 ms after a pass; work duration is additional, so it is not the original fixed timer schedule |
| Status GUI | Log messages; a separate [Toast](/en/scripting/examples/basic/toast-wpf), OnScreenCanvas API or [Blazor Window](/en/scripting/blazor-windows/getting-started) can provide UI, but this program creates none of them |

Check [coordinate systems](/en/features/coordinate-system), capture region and found bounds in your own window first. This is not automatic conversion of configuration, layout, scale, keyboard layout or delivery backend.

<details>
<summary>Historical AutoHotkey source</summary>

The original uses AutoHotkey syntax despite the UOPilot page address: status GUI, F5 for a screen point, F3 for one pass and F6 for timer control. It remains source text, not an EyeAuras macro import.

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

Prepare an open, stable target, both BMP templates, calibrated screen/window points and regions, the intended keyboard layout and an available Windows Input backend. Use your own controlled fixture; every original coordinate must belong to it before enabling input. Windows Input activates the chosen window; background delivery to arbitrary applications is not promised.

`TL.exe` is an expression matching title, path or process name, not a strict process-only filter. Narrow the [window expression](/en/features/window-matching-expressions) to one intended target if several windows match. The two screen points must not address another window.

Put the **whole** block in the C# action's Script.csx. Click Run, use F5 to save your own right-click point, then request F3. F6 enables repetition; another F6 prevents future passes but does not cancel the current one. Stop requests loop cancellation. Use free F3/F5/F6 bindings: these script-instance handlers are active while the script runs. Point.Empty is the unset sentinel, so the saved point must be nonzero.

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

Keep the Keybind methods outside the executable block as script-instance methods, not local functions. Flags are protected by one lock and reset on Run; cursor, CV and the serialized main loop are local. The current host registration resolves two input API instances with different TargetWindow values; their context owns their controller lifetimes. The CV accessor has its explicit owned scope.

Simple ForWindow ImageSearch returns a window-relative rectangle; the port uses its top-left corner with input targeting that same window. Screen points use the other accessor with TargetWindow=null to avoid a second transform. No match ends this pass with a warning; it does not itself turn off F6 repetition.

Sleep and token checkpoints bound future work, but synchronous CV/input calls do not receive this script token and need not stop instantly. Clicks already sent are not rolled back. The observable first result is a logged region; the complete port's result must be observed in the prepared target, not inferred from a successful call.

</details>

[CV contracts](/en/scripting/api/computer-vision/images) · [Input contracts](/en/scripting/api/ISendInputScriptingApi) · [Script context](/en/scripting/api/scripting/runtime)
