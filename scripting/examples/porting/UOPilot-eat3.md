---
title: UOPilot #1
description: 
published: true
date: 2025-03-23T22:19:29.386Z
tags: 
editor: markdown
dateCreated: 2025-03-23T22:19:29.386Z
---

# What is This?
An example of a UO Pilot script and how its nearly identical equivalent can be implemented in EyeAuras.

The only difference is that I moved status message display to the log.

An alternative approach would be to use the [Toast API](/en/scripting/examples/basic/toast-wpf), OnScreenCanvas API, or [BlazorWindows](/en/scripting/blazor-windows/getting-started), but for displaying a single line of text, these options seem excessive.

# UO Pilot

```js
#NoEnv
SetWorkingDir %A_ScriptDir%
SetTitleMatchMode, Fast

; Variables for storing cursor coordinates
global CursorX := 0
global CursorY := 0
global Toggle := 0 ; Toggle for enabling/disabling the script

; Create GUI for displaying text on screen
Gui, +AlwaysOnTop +ToolWindow -Caption +E0x20 ; Always on top, no title bar, clickable
Gui, Add, Text, vStatusText, Script Disabled ; Text that will be updated
Gui, Show, NoActivate X0 Y0, StatusWindow ; Show the window without activating it

; Hotkey F5: Save cursor coordinates
F5::
    CoordMode, Mouse, Screen
    MouseGetPos, CursorX, CursorY
    GuiControl,, StatusText, Coordinates saved: X=%CursorX%, Y=%CursorY%
    Sleep, 2000 ; Show message for 2 seconds
    GuiControl,, StatusText, Script Disabled
return

; Hotkey F3: Run script once
F3::
    Gosub, MainScript
return

; Hotkey F6: Start/Stop loop
F6::
    Toggle := !Toggle ; Toggle state
    if (Toggle) {
        GuiControl,, StatusText, Script Enabled
        SetTimer, RunMainScript, 100 ; Run timer every 100 ms
    } else {
        GuiControl,, StatusText, Script Disabled
        SetTimer, RunMainScript, Off ; Stop timer
    }
return

; Timer to run the main script
RunMainScript:
    Gosub, MainScript
return

; Move GUI around screen
~LButton::
    MouseGetPos, StartMouseX, StartMouseY ; Save initial mouse coordinates
    Gui, +LastFound ; Get ID of the last created GUI
    WinGetPos, GuiStartX, GuiStartY, GuiW, GuiH ; Save initial window coordinates
    ; Check if click occurred inside the window
    if (StartMouseX >= GuiStartX && StartMouseX <= GuiStartX + GuiW && StartMouseY >= GuiStartY && StartMouseY <= GuiStartY + GuiH) {
        While GetKeyState("LButton", "P") { ; While LMB is held down
            MouseGetPos, CurrentMouseX, CurrentMouseY ; Get current mouse coordinates
            ; Calculate offset
            OffsetX := CurrentMouseX - StartMouseX
            OffsetY := CurrentMouseY - StartMouseY
            ; New window coordinates
            NewGuiX := GuiStartX + OffsetX
            NewGuiY := GuiStartY + OffsetY
            Gui, Show, x%NewGuiX% y%NewGuiY% NoActivate ; Move the window
            Sleep, 20 ; Small delay to reduce load
        }
    }
return

; Main script logic
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
                GuiControl,, StatusText, Object 'Vegetarian' not found!
                Sleep, 2000
                GuiControl,, StatusText, Script Disabled
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

; Image search function
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

# EyeAuras C# Script
```csharp
ISendInputScriptingApi SendInput { get; init; }

ISendInputScriptingApi SendInputWindow { get; init; }

IComputerVisionExperimentalScriptingApi ComputerVision { get; init; }

bool Toggle { get; set; }

string ScriptDirectoryPath { get; init; } = AppDomain.CurrentDomain.BaseDirectory;

int CursorX { get; set; }

int CursorY { get; set; }

//------------------------------------------------------

SerialDisposable timerAnchor;

Log.Info("Hello, World!");
Log.Info($"Running the script from {ScriptDirectoryPath}");
timerAnchor = new SerialDisposable().AddTo(ExecutionAnchors); //stop timer when script stops

var window = GetService<IWindowSelector>().GetWindow("TL.exe");

var cv = ComputerVision
    .ForWindow(window) //работать будем с окном
    .EnableOsd(10); //включаем встроенный OSD

SendInputWindow.TargetWindow = window; //этот SendInput будет работать с окном

//эта строчка заставит скрипт ждать, пока он не будет выключен
//более эффективный эквивалент while(true) {}
cancellationToken.WaitHandle.WaitOne();

void MainScript()
{
    window.Activate();
    Sleep(2500);

    SendInput.KeyPress(Key.F);
    Sleep(300);

    SendInput.MouseClick(1005, 1005);
    Sleep(200);

    int FoundX, FoundY;

    if (!MyImageSearch(out FoundX, out FoundY, 640, 186, 1237, 939, "Vegetarian.bmp"))
    {
        Sleep(1000);
        if (!MyImageSearch(out FoundX, out FoundY, 640, 186, 1237, 939, "Vegetarian.bmp"))
        {
            if (!MyImageSearch(out FoundX, out FoundY, 640, 186, 1237, 939, "Vegetarian1.bmp"))
            {
                Log.Warn($"Объект 'Vegetarian' не найден!");
                Sleep(2000);
                Log.Warn($"Скрипт выключен");
                return;
            }
        }
    }

    SendInputWindow.MouseClick(FoundX, FoundY);
    Sleep(200);

    SendInputWindow.MouseClick(1499, 1004);
    Sleep(200);

    SendInputWindow.KeyPress(Key.Escape);
    Sleep(200);

    Sleep(600);
    SendInput.MouseRightClick(CursorX, CursorY);
}

bool MyImageSearch(out int FoundX, out int FoundY, int X1, int Y1, int X2, int Y2, string ImageFile)
{
    Rectangle result;
    for (int i = 0; i < 10; i++)
    {
        result = cv.ImageSearch(ImageFile);
        if (!result.IsEmpty)
        {
            //found the image
            FoundX = result.X;
            FoundY = result.Y;
            return true;
        }
        Sleep(100);
    }
    FoundX = FoundY = 0;
    return false;
}

[Keybind(Hotkey = "F3")]
void RunOnce()
{
    Log.Info($"Запускаем блок логики единожды");
    MainScript();
}

[Keybind(Hotkey = "F5")]
void ShowCoordinates()
{
    var cursorPosition = SendInput.CursorPosition;
    Log.Info($"Координаты мыши: {cursorPosition}");
    CursorX = cursorPosition.X;
    CursorY = cursorPosition.Y;
}

[Keybind(Hotkey = "F6")]
void ToggleScript()
{
    Log.Info($"IsEnabled: {Toggle}");
    Toggle = !Toggle;
    if (Toggle)
    {
        timerAnchor.Disposable = Observable
            .Timer(DateTimeOffset.Now, TimeSpan.FromMilliseconds(100))
            .Subscribe(MainScript); //initialize the timer
    }
    else
    {
        timerAnchor.Disposable = null; //stop timer
    }
}
```