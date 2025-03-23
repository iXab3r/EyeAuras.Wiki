---
title: Порт с UOPilot #2 - WoW
description: 
published: true
date: 2025-03-23T15:59:09.828Z
tags: 
editor: markdown
dateCreated: 2025-03-23T15:59:09.828Z
---

# Что это ?
Пример скрипта на UO Pilot и как его практически полный эквивалент может выглядеть в EyeAuras - я старался делать минимум изменений, чтобы было понятно что во что превратилось.

# UO Pilot

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
      say Dctvgbpltw228         ///// YOUR PASSWORD
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

# EyeAuras C# Script
```csharp
ISendInputScriptingApi SendInput { get; init; }

ISendInputScriptingApi SendInputWindow { get; init; }

IComputerVisionExperimentalScriptingApi ComputerVision { get; init; }

IRandomNumberGenerator Rng { get; init; }

IClock Clock { get; init; }

string ScriptDirectoryPath { get; init; } = AppDomain.CurrentDomain.BaseDirectory;

int blz, disc, login, ban;
Rectangle world1, d2, ring;

DateTimeOffset Rapidfire, tPet, tHeal, tFetch, tDejunk, Buff;

int random(int max) => Rng.Next(max);

//------------------------------------------------------

SerialDisposable timerAnchor;

Log.Info($"Running the script from {ScriptDirectoryPath}");

var window = GetService<IWindowSelector>().GetWindow("1Wow.exe");

var cv = ComputerVision
    .ForWindow(window) //работать будем с окном
    .EnableOsd(10); //включаем встроенный OSD

SendInputWindow.TargetWindow = window; //этот SendInput будет работать с окном

mainLoop:
while (true)
{
    for (var i = 0; i < 350; i++)
    {

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
        SendInput.KeyDown(Key.D1);
        Sleep(50 + random(100));
        SendInput.KeyUp(Key.D1);

        Sleep(159 + random(250));
        SendInput.KeyDown(Key.D1);
        Sleep(50 + random(100));
        SendInput.KeyUp(Key.D1);

        Sleep(150 + random(250));
        SendInput.KeyDown(Key.D1);
        Sleep(50 + random(100));
        SendInput.KeyUp(Key.D1);

        Sleep(150 + random(250));
        SendInput.KeyDown(Key.D1);
        Sleep(50 + random(100));
        SendInput.KeyUp(Key.D1);

        //Rapifire
        if (Rapidfire < Clock.Now)
        {
            Sleep(175 + random(475));
            SendInput.KeyDown(Key.D2);
            Sleep(50 + random(100));
            SendInput.KeyUp(Key.D2);
            Rapidfire = Clock.Now + TimeSpan.FromMilliseconds(500 + random(100));
        }

        // Buff
        if (Buff < Clock.Now)
        {
            Sleep(175 + random(300));
            SendInput.KeyDown(Key.D4);
            Sleep(50 + random(50));
            SendInput.KeyUp(Key.D4);
            Buff = Clock.Now + TimeSpan.FromMilliseconds(600000 + random(100));
        }

        // Trueshot
        if (tDejunk < Clock.Now)
        {
            Sleep(175 + random(300));
            SendInput.KeyDown(Key.F4);
            Sleep(50 + random(50));
            SendInput.KeyUp(Key.F4);
            tDejunk = Clock.Now + TimeSpan.FromMilliseconds(120000 + random(1000));
        }

        // Fetch
        if (tFetch < Clock.Now)
        {
            Sleep(150 + random(150));
            SendInput.KeyDown(Key.F5);
            Sleep(150 + random(150));
            SendInput.KeyUp(Key.F5);
            Sleep(150 + random(150));
            SendInput.KeyDown(Key.F5);
            Sleep(150 + random(150));
            SendInput.KeyUp(Key.F5);
            tFetch = Clock.Now + TimeSpan.FromMilliseconds(5000 + random(5000));
        }

        // Volley
        if (tHeal < Clock.Now)
        {
            Sleep(150 + random(150));
            SendInput.KeyDown(Key.F7);
            Sleep(150 + random(150));
            SendInput.KeyUp(Key.F7);
            Sleep(150 + random(150));
            tHeal = Clock.Now + TimeSpan.FromMilliseconds(45000 + random(5000));
        }

        // Pet Res or Call
        if (tPet < Clock.Now)
        {
            Sleep(175 + random(300));
            SendInput.KeyDown(Key.D5);
            Sleep(50 + random(50));
            SendInput.KeyUp(Key.D5);
            Sleep(175 + random(300));
            SendInput.KeyDown(Key.F3);
            Sleep(50 + random(50));
            SendInput.KeyUp(Key.F3);
            tPet = Clock.Now + TimeSpan.FromMilliseconds(85000 + random(1000));
        }
    }

    Sleep(250 + random(300));
    SendInput.KeyDown(Key.F6);
    Sleep(1 + random(10));
    SendInput.KeyUp(Key.F6);
    Sleep(100 + random(10000));
    SendInput.KeyDown(Key.F8);
    Sleep(1 + random(10));
    SendInput.KeyUp(Key.F8);
    Sleep(3000 + random(300));
    SendInput.KeyDown(Key.D0);
    Sleep(1 + random(10));
    SendInput.KeyUp(Key.D0);
    Sleep(3000 + random(400));
    SendInput.KeyDown(Key.D8);
    Sleep(1 + random(10));
    SendInput.KeyUp(Key.D8);
    Sleep(300 + random(400));
    SendInput.KeyDown(Key.D7);
    Sleep(1 + random(10));
    SendInput.KeyUp(Key.D7);
    Sleep(3000 + random(5000));
    SendInput.KeyDown(Key.F3);
    Sleep(1 + random(10));
    SendInput.KeyUp(Key.F3);
}

reloger:
{
    blz = cv.CountPixels(12083459, 97, 146, 231, 153, 242);

    var ban = cv.ImageSearchRaw(@"\GWYN\Image\ban.bmp", 85, 196, 122, 210, 125);
    if (ban.Detected.Similarity > 90 && blz > 4)
    {
        return; //stop
    }
}

login = cv.CountPixels(50678, 193, 121, 198, 126);
// Disconnected
if (login > 3 || disc > 10 || !world1.IsEmpty)
{
    if (disc > 10 && blz > 4)
    {
        SendInput.KeyDown(Key.Escape);
        Sleep(80 + random(150));
        SendInput.KeyUp(Key.Escape);
        goto login;
    }

// Login screen
login:
    ring = cv.ImageSearch(@"\GWYN\Image\ring.bmp", 90, 2, 171, 11, 183);
    login = cv.CountPixels(50678, 193, 121, 198, 126);

    if (login > 3 && blz > 4 && ring.IsEmpty)
    {
        var text = cv.CountPixels(6710886, 113, 141, 117, 144);
        if (text > 0)
        {
            SendInput.KeyDown(Key.End);
            Sleep(80 + random(150));
            SendInput.KeyUp(Key.End);
            Sleep(100);
            SendInput.KeyDown(Key.Back);
            Sleep(5000);
            SendInput.KeyUp(Key.Back);

        }
        else
        {
            SendInput.Text("password");  ///// YOUR PASSWORD
            Sleep(500 + random(5000));
            SendInput.KeyDown(Key.Enter);
            Sleep(80 + random(150));
            SendInput.KeyUp(Key.Enter);
            Sleep(15000 + random(100));
            goto world;
        }
    }

// Enter World
world:
    ring = cv.ImageSearch(@"\GWYN\Image\ring.bmp", 90, 2, 171, 11, 183);
    var world = cv.ImageSearchRaw(@"\GWYN\Image\world.bmp", 90, 69, 237, 85, 253);
    d2 = cv.ImageSearch(@"\GWYN\Image\vopros.bmp", 90, 310, 243, 319, 253);

    if (world.Detected.Similarity > 90 && d2.IsEmpty && ring.IsEmpty)
    {
        Sleep(180 + random(5000));
        SendInput.KeyDown(Key.Enter);
        Sleep(80 + random(150));
        SendInput.KeyUp(Key.Enter);
        Sleep(5000);
        goto mainLoop;
    }
}
```