---
title: Порт с UOPilot #1
description: 
published: true
date: 2025-03-23T22:19:52.241Z
tags: 
editor: markdown
dateCreated: 2025-03-23T13:10:35.553Z
---

# Перенести последовательность еды из UOPilot/AHK в EyeAuras

Сохраним задачу исходного скрипта: активировать `TL.exe`, открыть меню клавишей `F`, найти `Vegetarian.bmp` (или запасной `Vegetarian1.bmp`), выбрать еду, закрыть меню и нажать правой кнопкой в сохранённой точке. Исходный AHK ниже оставлен для сравнения.

## Выполнить последовательность в C# Script

Поместите весь C# блок ниже в верхнеуровневый файл действия `C# Script` EyeAuras и запустите `Run`. Окно игры должно быть открыто. Положите оба образца в `C:\Scripts\Eat` или измените `imageDirectory`. Настройте раскладку и размеры окна под координаты примера: `1005,1005` — экранная точка, область поиска и `1499,1004` — координаты относительно окна, не обещание клиентских координат без рамки. Сначала нажмите `F5`, чтобы сохранить экранную точку правого клика; `F3` запросит один проход, `F6` включит/выключит повторение. Остановка `Run` завершает цикл.

Все CV/ввод выполняются последовательно главным циклом, обработчики клавиш только меняют состояние под блокировкой. Пауза 100 мс идёт после прохода, а не задаёт точный период внешнего `SetTimer`: последовательность сама занимает время. GUI из AHK здесь заменён журналом, поведение таймеров и игровых средств ввода не заявляется эквивалентным.



## Что переносим
Ниже исходный AHK-скрипт и адаптация его основной последовательности для EyeAuras. Статусные сообщения перенесены в лог; таймер и управление выполнением устроены иначе, как описано выше.

Альтернатива была бы использовать [Toast API](/ru/scripting/examples/basic/toast-wpf), OnScreenCanvas API или [BlazorWindows](/ru/scripting/blazor-windows/getting-started), но просто для отображения строки текста это все кажется перебором.

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

```csharp
using System.Drawing;
using System.IO;
using System.Windows.Input;
using EyeAuras.Shared.Services;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Roxy.Api;
using EyeAuras.Scripting.Api;
using PoeShared.Scaffolding;

var imageDirectory = @"C:\Scripts\Eat";
var stateGate = new object();
bool enabled = false, runOnce = false, captureCursor = false;
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
        Log.Info($"Точка правого клика: {savedCursor}");
    }
    if (run) MainScript();
    Sleep(100);
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
    }
    FoundX = FoundY = 0;
    return false;
}

[Keybind(Hotkey = "F3")]
void RunOnce() { lock (stateGate) runOnce = true; }

[Keybind(Hotkey = "F5")]
void SaveCursor() { lock (stateGate) captureCursor = true; }

[Keybind(Hotkey = "F6")]
void ToggleScript() { lock (stateGate) enabled = !enabled; }
```

При успешном поиске выбирается левый верхний угол найденного образца. `ImageSearch` для `ForWindow` уже возвращает координаты окна; их передаём в отдельный `SendInputWindow` с тем же `TargetWindow`. Для экранных точек используем `SendInput.TargetWindow = null`, чтобы стандартный контроллер не преобразовал их повторно. При отсутствии обоих образцов выводится предупреждение и проход заканчивается.

`Rectangle.FromLTRB` переводит правую/нижнюю границу исходной области в ширину/высоту C# прямоугольника. `Sleep` и проверки между поисками учитывают отмену, синхронные CV/ввод не гарантируют немедленного прерывания. Симулятор должен быть доступен; Windows/игровой запуск здесь не проверен. [Карта CV](/ru/scripting/api/computer-vision/images) и [карта ввода](/ru/scripting/api/windows-subsystems/input-hooks-hotkeys) ведут к контрактам SDK.
