---
title: UOPilot #2 — WoW
description: Второй материал по UOPilot для WoW.
published: true
date: 2025-03-23T22:15:13.718Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T15:59:09.828Z
---

# Перенести цикл с таймерами и распознаванием экрана из UOPilot

В исходнике повторяются серии клавиш, а отдельные сроки разрешают более редкие действия. Изображения и цвета выбирают переход к ветке повторного входа. В EyeAuras эти условия тоже берутся из захваченных пикселей: названия world, ring или ban не являются встроенными данными WoW.

## Проверить источник цвета без ввода

Для первого опыта нужен EyeAuras с C# Script и компьютерным зрением. Покажите в своём отдельном окне изображение с красным участком RGB 255,0,0. Подойдёт созданная вами картинка; чужие аккаунты и пароль не нужны.

1. Создайте отдельную ауру с Fixed Value в состоянии Is NOT Active, добавьте в On Enter действие `C# Script` и откройте редактор.
2. Поместите всю программу ниже в `Script.csx`, нажмите `Run` и выберите своё окно инструментом выбора.
3. Журнал покажет количество пикселей, соответствующих заданному цвету в фактическом захвате. При наличии точного красного участка ожидается ненулевое число, при отсутствии совпадений — 0. Это количество, а не процент площади или вероятность состояния.

```csharp
using System.Drawing;
using EyeAuras.Shared.Osd;
using EyeAuras.OpenCVAuras.Scripting;

{
    var window = await GetService<IOsdSelectionService>().PickWindow();
    cancellationToken.ThrowIfCancellationRequested();
    if (window == null || !window.IsWindow) { Log.Warn("Окно не выбрано или недоступно"); return; }
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    var count = cv.CountPixels(Color.Red, 100);
    Log.Info($"Красных пикселей: {count}");
}
```

Если число неожиданное, проверьте окно и реальный цвет в его снимке через [Color Search](/ru/triggers/images/color-search). Полный перенос ниже требует такой же отдельной калибровки каждого признака, а не угадывания состояния по имени файла.

## Сохранить структуру алгоритма

| Часть исходника | Что сохраняет порт |
| --- | --- |
| Repeat 350 | До 350 серий основного тела, затем отдельная завершающая последовательность и новый проход |
| Rapidfire, Buff, tDejunk, tFetch, tHeal, tPet | Независимые сроки следующего допуска. В C# сравниваются с DateTimeOffset.Now; это не точная замена внутреннего timer UOPilot |
| Send_down / Send_up | Press с паузой между Down и Up и освобождением в finally; отдельное пятисекундное удержание Backspace использует тот же путь |
| findcolor | CountPixels с собственным цветом, областью и порогом. Числовой цвет в используемой перегрузке читается через Color.FromArgb, параметры UOPilot не переводятся автоматически |
| FindImage | Rectangle.Empty при отсутствии области; там, где нужен дополнительный порог сходства, ImageSearchRaw и проверка Detected.Success перед Similarity |
| Области поиска | Rectangle.FromLTRB для противоположных углов, либо X/Y/Width/Height для CountPixels |
| Переходы reloger / login / world | Отдельные ветки на основе подготовленных экранных признаков. Поиски последовательны и не составляют один атомарный кадр |
| YOUR_PASSWORD | Только фиктивный текст в учебном порте. Text журналирует часть строки; пример не является средством безопасного хранения паролей |

Директивы using остаются вверху Script.csx, исполняемая программа и using var CV находятся внутри явного блока. GetService, Log, Sleep и cancellationToken даёт хост верхнеуровневого скрипта; обычные классы и Razor не получают их автоматически. Для переноса в класс нужно передать зависимости и токен явно.

<details>
<summary>Полный исходник UOPilot</summary>

Ниже сохранены исходные команды, пути, сроки и переходы. Это текст программы для UOPilot, не файл макроса EyeAuras и не готовый импорт конфигурации.

```js
set #win findwindow (1Wow.exe)
set workwindow #win
set linedelay 50
set ShowScriptProcessing 1
set EmptyLineDelay 0
wait 150 + random ( 1000 ) /// Async char

// Init Timers
if #tFetch = null
    set #tFetch 0
end_if

if #tDejunk = null
    set #tDejunk 0
end_if

if #tHeal = null
    set #tHeal 0
end_if

if #Buff = null
    set #Buff 0
end_if

if #tPet = null
    set #tPet 0
end_if

if #Rapidfire = null
    set #Rapidfire 0
end_if

:while
while 1 = 1
//////////////LOOP/////////////////

Repeat 350    ////// REPEAT

//Reloger
set #blz findcolor (146 231 153 242 1 1 (12083459) %arr workwindow() -1 3)
set #disc findcolor (146 122 165 126 1 1 (14408) %arr workwindow() -1 15)
set #world1 FindImage(69 237 85 253 (\GWYN\Image\world.bmp) %arr workwindow() 90 2 5)
set #d2 FindImage(310 243 319 253 (\GWYN\Image\vopros.bmp) %arr workwindow() 90 2 5)
set #ring FindImage(2 171 11 183 (\GWYN\Image\ring.bmp) %arr workwindow() 90 2 5)
set #login findcolor (193 121 198 126 1 1 (50678) %arr workwindow() -1 15)


//State #1
if #blz > 4 and #disc > 10 and #ring = 0
    goto reloger
end_if

//State #2
if #world1 > 90 and #d2 = 0 and #ring = 0
    goto reloger
end_if

//State #3
if #d2 = 0 and #ring = 0 and #login > 3
    goto reloger
end_if

wait 150 + random ( 100 )
Send_down 1
wait 50 + random ( 50 )
Send_up 1

wait 159 + random ( 100 )
Send_down 1
wait 50 + random ( 50 )
Send_up 1

wait 150 + random ( 100 )
Send_down 1
wait 50 + random ( 50 )
Send_up 1

wait 150 + random ( 100 )
Send_down 1
wait 50 + random ( 50 )
Send_up 1

//Rapifire
if #Rapidfire < timer
        wait 175 + random ( 300 )
        Send_down 2
        wait 50 + random ( 50 )
        Send_up 2
		set #Rapidfire timer + 500 + random ( 100 )
end_if

//Buff
if #Buff < timer
        wait 175 + random ( 300 )
        Send_down 4
        wait 50 + random ( 50 )
        Send_up 4
		set #Buff timer + 600000 + random ( 100 )
end_if

// Trueshot
if #tDejunk < timer
        wait 175 + random ( 300 )
        Send_down {F4}
        wait 50 + random ( 50 )
        Send_up {F4}
		set #tDejunk timer + 120000 + random ( 1000 )
end_if

//Fetch
if #tFetch < timer
        wait 150 + random ( 150 )
        Send_down {F5}
        wait 150 + random (150)
        Send_up {F5}
        wait 150 + random ( 150 )
        Send_down {F5}
        wait 150 + random (150)
        Send_up {F5}
		set #tfetch timer + 5000 + random ( 5000 ) // Fetch Timer
end_if

// Volley
if #tHeal < timer
        wait 150 + random (150)
        Send_down {F7}
        wait 150 + random (150)
        Send_up {F7}
        wait 150 + random (150)
		set #tHeal timer + 45000 + random ( 5000 )
end_if

// Pet Res or Call
if #tPet < timer
        wait 175 + random ( 300 )
        Send_down 5
        wait 50 + random ( 50 )
        Send_up 5
        wait 175 + random ( 300 )
        Send_down {F3}
        wait 50 + random ( 50 )
        Send_up {F3}
		set #tPet timer + 85000 + random ( 1000 )
end_if

End_Repeat    /////////// END REPEAT


wait 250 + random ( 300 )
Send_down {F6}
wait 1 + random ( 10 )
Send_up {F6}
wait 100 + random ( 10000 )
send_down {F8}
wait 1 + random ( 10 )
Send_up {F8}
wait 3000 + random ( 400 )
Send_down 0
wait 1 + random ( 10 )
Send_up 0
wait 3000 + random ( 400 )
Send_down 8
wait 1 + random ( 10 )
Send_up 8
wait 300 + random ( 400 )
Send_down 7
wait 1 + random ( 10 )
Send_up 7
wait 3000 + random ( 5000 )
send_down {F3}
wait 1 + random ( 10 )
Send_up {F3}

//////////////END LOOP/////////////////

end_while

/// RELOGER FUNCTION
:reloger
// Ban
set #blz findcolor (146 231 153 242 1 1 (12083459) %arr workwindow() -1 3)
set #ban FindImage(196 122 210 125 (\GWYN\Image\ban.bmp) %arr workwindow() 85 2 5)
if #ban  > 90 and #blz > 4
    stop_script
end_if

// Disconnected
set #login findcolor (193 121 198 126 1 1 (50678) %arr workwindow() -1 15)
if #login > 3 or #disc > 10 or #world1 > 90
  if #disc > 10 and #blz > 4
    send_down {Esc}
    wait 80 + random ( 150 )
    send_up {Esc}
    goto login
  end_if

  // Login screen
  :login
  set #ring FindImage(2 171 11 183 (\GWYN\Image\ring.bmp) %arr workwindow() 90 2 5)
  set #login findcolor (193 121 198 126 1 1 (50678) %arr workwindow() -1 15)
  if #login > 3 and #blz > 4 and #ring = 0
    set #text findcolor (113 141 117 144 1 1 (6710886) %arr workwindow() -1 15)
    if #text > 0
      send_down {End}
      wait 80 + random ( 150 )
      send_up {End}
      wait 100
      send_down {Backspace}
      wait 5000
      send_up {Backspace}
      goto login
    else
      say YOUR_PASSWORD         ///// YOUR PASSWORD
      wait 500 + random ( 5000 )
      send_down {Enter}
      wait 80 + random ( 150 )
      send_up {Enter}
      wait 15000 + random(100)
      goto world
    end_if
  end_if

  // Enter World
  :world
  set #ring FindImage(2 171 11 183 (\GWYN\Image\ring.bmp) %arr workwindow() 90 2 5)
  set #world FindImage(69 237 85 253 (\GWYN\Image\world.bmp) %arr workwindow() 90 2 5)
  set #d2 FindImage(310 243 319 253 (\GWYN\Image\vopros.bmp) %arr workwindow() 90 2 5)
  if #world > 90 and #d2 = 0 and #ring = 0
    wait 180 + random ( 5000 )
    send_down {Enter}
    wait 80 + random ( 150 )
    send_up {Enter}
    wait 5000
    goto while
  end_if
end_if
```

</details>

<details>
<summary>Полный порт для C# Script</summary>

Нужны открытое окно, соответствующее выражению `1Wow.exe`, ваши world.bmp, vopros.bmp, ring.bmp и ban.bmp в `C:\Scripts\GWYN\Image`, заново проверенные цвета/области, раскладка и доступный Windows Input. Для собственного тестового интерфейса замените выражение, изображения и координаты. Windows Input активирует выбранное окно; универсальная фоновая работа не предполагается. Текст 1Wow.exe — широкое выражение по названию, пути или имени процесса. Перед включением ввода уточните [выражение окна](/ru/features/window-matching-expressions), если ему соответствуют несколько окон.

Этот вариант выполняет реальный ввод, в отличие от первого опыта. Ветка авторизации оставлена с фиктивным YOUR_PASSWORD: не подставляйте настоящий секрет в демонстрацию с журналируемым Text. Для первичной проверки распознавания достаточно программы выше. Автоматической конвертации старого файла и готовой совместимости с любым клиентом WoW нет.

Полностью вставьте программу в Script.csx действия C# Script и запускайте Run только после подготовки своего адресата. Цикл продолжается до остановки Run либо выхода по распознанному признаку. Числа задержек выражены как базовая величина плюс Random.Next; верхняя граница Next исключается, распределение другого движка не обещается.

```csharp
using System;
using System.Drawing;
using System.Windows.Input;
using System.IO;
using EyeAuras.Roxy.Api;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Shared.Services;
using EyeAuras.Shared.Scaffolding;
using PoeShared.Scaffolding;

{
    var SendInputWindow = GetService<ISendInputScriptingApi>();
    SendInputWindow.InputSimulatorId = "Windows Input";
    var SendInput = SendInputWindow; // все клавиши этого сценария адресованы одному окну
    var rng = new Random();
    var imageDirectory = @"C:\Scripts\GWYN\Image";
    var password = "YOUR_PASSWORD"; // задайте локально перед запуском
    string Image(string name) => Path.Combine(imageDirectory, name);
    int blz = 0, disc = 0, login = 0;
    Rectangle world1 = default, d2 = default, ring = default;

    DateTimeOffset Rapidfire = default, tPet = default, tHeal = default,
        tFetch = default, tDejunk = default, Buff = default;

    int random(int max) => rng.Next(max);
    void Press(Key key, int delayMs)
    {
        cancellationToken.ThrowIfCancellationRequested();
        try
        {
            SendInput.KeyDown(key);
            Sleep(delayMs);
            cancellationToken.ThrowIfCancellationRequested();
        }
        finally { SendInput.KeyUp(key); }
    }

    //------------------------------------------------------

    var window = GetService<IWindowSelector>().GetWindow("1Wow.exe");

    cancellationToken.ThrowIfCancellationRequested();
    if (!window.IsWindow) { Log.Warn("Окно недоступно"); return; }

    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForWindow(window) //работать будем с окном
        .EnableOsd(10); //включаем встроенный OSD

    SendInputWindow.TargetWindow = window; //этот SendInput будет работать с окном

    mainLoop:
    while (!cancellationToken.IsCancellationRequested)
    {
        for (var i = 0; i < 350; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            blz = cv.CountPixels(12083459, 97, 146, 231, 7, 11);
            disc = cv.CountPixels(14408, 95, 146, 122, 19, 4);
            login = cv.CountPixels(50678, 95, 193, 121, 5, 5);
            world1 = cv.ImageSearch(Image("world.bmp"), 90, Rectangle.FromLTRB(69, 237, 85, 253));
            d2 = cv.ImageSearch(Image("vopros.bmp"), 90, Rectangle.FromLTRB(310, 243, 319, 253));
            ring = cv.ImageSearch(Image("ring.bmp"), 90, Rectangle.FromLTRB(2, 171, 11, 183));


            if (blz > 4 && disc > 10 && ring.IsEmpty)
            {
                goto reloger;
            }

            if (!world1.IsEmpty && d2.IsEmpty && ring.IsEmpty)
            {
                goto reloger;
            }


            //State #3
            if (d2.IsEmpty && ring.IsEmpty && login > 3)
            {
                goto reloger;
            }

            Sleep(150 + random(100));
            Press(Key.D1, 50 + random(50));

            Sleep(159 + random(100));
            Press(Key.D1, 50 + random(50));

            Sleep(150 + random(100));
            Press(Key.D1, 50 + random(50));

            Sleep(150 + random(100));
            Press(Key.D1, 50 + random(50));

            //Rapifire
            if (Rapidfire < DateTimeOffset.Now)
            {
                Sleep(175 + random(300));
                Press(Key.D2, 50 + random(50));
                Rapidfire = DateTimeOffset.Now + TimeSpan.FromMilliseconds(500 + random(100));
            }

            // Buff
            if (Buff < DateTimeOffset.Now)
            {
                Sleep(175 + random(300));
                Press(Key.D4, 50 + random(50));
                Buff = DateTimeOffset.Now + TimeSpan.FromMilliseconds(600000 + random(100));
            }

            // Trueshot
            if (tDejunk < DateTimeOffset.Now)
            {
                Sleep(175 + random(300));
                Press(Key.F4, 50 + random(50));
                tDejunk = DateTimeOffset.Now + TimeSpan.FromMilliseconds(120000 + random(1000));
            }

            // Fetch
            if (tFetch < DateTimeOffset.Now)
            {
                Sleep(150 + random(150));
                Press(Key.F5, 150 + random(150));
                Sleep(150 + random(150));
                Press(Key.F5, 150 + random(150));
                tFetch = DateTimeOffset.Now + TimeSpan.FromMilliseconds(5000 + random(5000));
            }

            // Volley
            if (tHeal < DateTimeOffset.Now)
            {
                Sleep(150 + random(150));
                Press(Key.F7, 150 + random(150));
                Sleep(150 + random(150));
                tHeal = DateTimeOffset.Now + TimeSpan.FromMilliseconds(45000 + random(5000));
            }

            // Pet Res or Call
            if (tPet < DateTimeOffset.Now)
            {
                Sleep(175 + random(300));
                Press(Key.D5, 50 + random(50));
                Sleep(175 + random(300));
                Press(Key.F3, 50 + random(50));
                tPet = DateTimeOffset.Now + TimeSpan.FromMilliseconds(85000 + random(1000));
            }
        }

        Sleep(250 + random(300));
        Press(Key.F6, 1 + random(10));
        Sleep(100 + random(10000));
        Press(Key.F8, 1 + random(10));
        Sleep(3000 + random(400));
        Press(Key.D0, 1 + random(10));
        Sleep(3000 + random(400));
        Press(Key.D8, 1 + random(10));
        Sleep(300 + random(400));
        Press(Key.D7, 1 + random(10));
        Sleep(3000 + random(5000));
        Press(Key.F3, 1 + random(10));
    }

    return; // отмена главного цикла не должна проваливаться в reloger

    reloger:
    {
        cancellationToken.ThrowIfCancellationRequested();
        blz = cv.CountPixels(12083459, 97, 146, 231, 7, 11);

        var banResult = cv.ImageSearchRaw(Image("ban.bmp"), 85, Rectangle.FromLTRB(196, 122, 210, 125));
        if (banResult.Detected.Success && banResult.Detected.Similarity > 90 && blz > 4)
        {
            return; //stop
        }
    }

    login = cv.CountPixels(50678, 95, 193, 121, 5, 5);
    // Disconnected
    if (login > 3 || disc > 10 || !world1.IsEmpty)
    {
        if (disc > 10 && blz > 4)
        {
            Press(Key.Escape, 80 + random(150));
            goto login;
        }

    // Login screen
    login:
        cancellationToken.ThrowIfCancellationRequested();
        ring = cv.ImageSearch(Image("ring.bmp"), 90, Rectangle.FromLTRB(2, 171, 11, 183));
        login = cv.CountPixels(50678, 95, 193, 121, 5, 5);

        if (login > 3 && blz > 4 && ring.IsEmpty)
        {
            var text = cv.CountPixels(6710886, 95, 113, 141, 4, 3);
            if (text > 0)
            {
                Press(Key.End, 80 + random(150));
                Sleep(100);
                Press(Key.Back, 5000);
                goto login;
            }
            else
            {
                SendInput.Text(password);  ///// YOUR PASSWORD
                Sleep(500 + random(5000));
                Press(Key.Enter, 80 + random(150));
                Sleep(15000 + random(100));
                goto world;
            }
        }

        Sleep(500);
        goto login;

    // Enter World
    world:
        cancellationToken.ThrowIfCancellationRequested();
        ring = cv.ImageSearch(Image("ring.bmp"), 90, Rectangle.FromLTRB(2, 171, 11, 183));
        var world = cv.ImageSearchRaw(Image("world.bmp"), 90, Rectangle.FromLTRB(69, 237, 85, 253));
        d2 = cv.ImageSearch(Image("vopros.bmp"), 90, Rectangle.FromLTRB(310, 243, 319, 253));

        if (world.Detected.Success && world.Detected.Similarity > 90 && d2.IsEmpty && ring.IsEmpty)
        {
            Sleep(180 + random(5000));
            Press(Key.Enter, 80 + random(150));
            Sleep(5000);
            goto mainLoop;
        }
        Sleep(500);
        goto world;
    }
    Sleep(500);
    goto mainLoop;
}
```

Сроки выставляются после соответствующего действия; работа поиска и ожидания тоже входит в реальное время между нажатиями. При остановке явные проверки токена не допускают новые итерации. Sleep может вернуться раньше; Press проверяет отмену внутри try и затем в finally пытается отправить KeyUp тем же адресату и механизмом. Сам ввод токен скрипта не принимает, поэтому окончание паузы или Stop не гарантируют мгновенной остановки уже выполняемого вызова. Ошибка отправки KeyUp также остаётся ошибкой, уже выполненные эффекты не откатываются.

</details>

Первый наблюдаемый результат здесь — реальный счётчик пикселей своего окна. Только после проверки каждого признака имеет смысл оценивать полный цикл по целевому интерфейсу. Контракты: [CV](/ru/scripting/api/computer-vision/images), [ввод](/ru/scripting/api/ISendInputScriptingApi), [Script.csx](/ru/scripting/api/scripting/runtime).
