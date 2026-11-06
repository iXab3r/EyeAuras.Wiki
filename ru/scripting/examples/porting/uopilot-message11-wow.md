---
title: UOPilot #2 — WoW
description: Второй материал по UOPilot для WoW.
published: true
date: 2025-03-23T22:15:13.718Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T15:59:09.828Z
---
# Перенести бой и повторный вход из UOPilot

## UO Pilot

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

## Выполнить цикл в C# Script

Код ниже целиком размещается в верхнеуровневом файле действия `C# Script` EyeAuras. Он сохраняет исходную задачу: серии нажатий, отдельные сроки для способностей и переходы к повторному входу по изображению/цвету. Откройте `1Wow.exe`, подготовьте свои `world.bmp`, `vopros.bmp`, `ring.bmp`, `ban.bmp` в `C:\Scripts\GWYN\Image`; настройте окно, раскладку, цвета и области под свой интерфейс. Здесь это входные данные примера, не универсальные координаты WoW.

Пароль задайте в локальной переменной `password` перед запуском и не публикуйте его. `Run` запускает цикл, остановка выполнения отменяет паузы. `SendInputWindow` адресует выбранное окно, но доступность игрового ввода зависит от симулятора и приложения; фоновая работа не обещается. После серии из 350 повторов выполняется завершающая последовательность из исходника. При распознавании признака блокировки скрипт возвращается. Проверяйте результат по окну игры; здесь запуск не выполнялся.

Сроки ниже сравниваются с `DateTimeOffset.Now`; это не доказательство эквивалентности таймеру UOPilot. Поиски выполняются последовательно, поэтому состояние не является одним атомарным кадром. Числа в `Rectangle.FromLTRB` — исходные противоположные углы, преобразованные в ширину/высоту. Пороги указаны явно, исходные значения допусков цвета не объявляются точной конверсией между движками.


```csharp
using System.Drawing;
using System.Windows.Input;
using System.IO;
using EyeAuras.Roxy.Api;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Shared.Services;
using PoeShared.Scaffolding;

{
    var SendInputWindow = GetService<ISendInputScriptingApi>();
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
        SendInput.KeyDown(key);
        try { Sleep(delayMs); }
        finally { SendInput.KeyUp(key); }
    }

    //------------------------------------------------------

    var window = GetService<IWindowSelector>().GetWindow("1Wow.exe");

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

            Sleep(150 + random(250));
            Press(Key.D1, 50 + random(100));

            Sleep(159 + random(250));
            Press(Key.D1, 50 + random(100));

            Sleep(150 + random(250));
            Press(Key.D1, 50 + random(100));

            Sleep(150 + random(250));
            Press(Key.D1, 50 + random(100));

            //Rapifire
            if (Rapidfire < DateTimeOffset.Now)
            {
                Sleep(175 + random(475));
                Press(Key.D2, 50 + random(100));
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
        Sleep(3000 + random(300));
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
                SendInput.KeyDown(Key.Back);
                try { Sleep(5000); }
                finally { SendInput.KeyUp(Key.Back); }
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

`ImageSearchRaw` возвращает оболочку с `Detected`; прежде чем использовать сходство, проверяем `Success`. Обычный `ImageSearch` возвращает `Rectangle.Empty` при отсутствии результата. Для `ForWindow` прямоугольники относятся к окну; здесь они используются как признаки состояния, без кликов по необработанным координатам кадра. Паузы `Sleep` длиннее 30 мс могут завершиться раньше при отмене; короткие паузы её не проверяют. Отдельные проверки ограничивают цикл, а синхронные CV/ввод не получают токен скрипта. Локальная функция `Press` освобождает нажатую клавишу в `finally`, даже если пауза отменена. Это не гарантия обработки ввода самой игрой.

[Карта CV](/ru/scripting/api/computer-vision/images), [ввод](/ru/scripting/api/ISendInputScriptingApi) и [контекст скрипта](/ru/scripting/api/scripting/runtime) ведут к контрактам SDK. Совместимость с UOPilot, игрой, драйвером и фактическое поведение повторного входа требуют отдельной проверки.
