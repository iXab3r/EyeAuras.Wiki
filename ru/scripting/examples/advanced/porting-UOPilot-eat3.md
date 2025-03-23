---
title: Порт с UOPilot #1
description: 
published: true
date: 2025-03-23T13:10:35.553Z
tags: 
editor: markdown
dateCreated: 2025-03-23T13:10:35.553Z
---

# Что это ?
Пример скрипта на UO Pilot и как его практически полный эквивалент может выглядеть в EyeAuras.
Единственное отличие - я перенес отображение статусных сообщений в лог. 

Альтернатива была бы использовать [Toast API](/ru/scripting/examples/basic/toast-wpf), OnScreenCanvas API или [BlazorWindows](/ru/scripting/blazor-windows/getting-started), но просто для отображения строки текста это все кажется перебором.

# UO Pilot

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