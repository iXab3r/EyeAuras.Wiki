---
title: UOPilot #2 - WoW
description: 
published: true
date: 2025-03-23T22:15:13.718Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T22:15:13.718Z
---

# Port a timed loop with screen-based conditions from UOPilot

The source script presses series of keys in a loop and runs rarer actions on their own timers. Images and colors on the screen tell it when to switch to the re-login branch. In EyeAuras these conditions also come from captured pixels: names such as world, ring and ban are not built-in WoW data.

## Observe a color count without input

For the first try you need EyeAuras with C# Script and computer vision. Open a picture with a red RGB 255,0,0 area in a separate window of your own. Any picture you drew yourself will do.

1. Create a separate aura with Fixed Value set to Is NOT Active, add a `C# Script` action under On Enter and open its editor.
2. Paste the whole program below into `Script.csx`, click `Run` and pick your window with the picker.
3. The log shows how many pixels of that color are in the actual capture. If there is an exact red area, the number is above zero. With no matches it is 0.

```csharp
using System.Drawing;
using EyeAuras.Shared.Osd;
using EyeAuras.OpenCVAuras.Scripting;

{
    var window = await GetService<IOsdSelectionService>().PickWindow();
    cancellationToken.ThrowIfCancellationRequested();
    if (window == null || !window.IsWindow) { Log.Warn("Window not selected or unavailable"); return; }
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    var count = cv.CountPixels(Color.Red, 100);
    Log.Info($"Red pixels: {count}");
}
```

If the number is not what you expect, check the window and the real color in its capture with [Color Search](/en/triggers/images/color-search). For the full port below, calibrate every indicator separately in the same way.

## Preserve the algorithm's structure

| Source element | What the port keeps |
| --- | --- |
| Repeat 350 | Up to 350 series of the main body, then a separate final sequence and a new outer pass |
| Rapidfire, Buff, tDejunk, tFetch, tHeal, tPet | Independent deadlines before which an action is not repeated. In C# they are compared with DateTimeOffset.Now. This is not an exact replacement for the UOPilot timer |
| Send_down / Send_up | Press with a pause between Down and Up and a key release in finally. The separate five-second Backspace hold goes the same way |
| findcolor | CountPixels with your own color, region and threshold. The integer color in this overload is read through Color.FromArgb. UOPilot parameters are not converted for you |
| FindImage | Rectangle.Empty when nothing is found. Where an extra similarity threshold is needed, use ImageSearchRaw and check Detected.Success before Similarity |
| Regions | Rectangle.FromLTRB for opposite corners, or X/Y/Width/Height for CountPixels |
| reloger / login / world | Separate branches driven by prepared screen indicators. The searches run one after another and do not share one frame |
| Interpreter timing | UOPilot linedelay/EmptyLineDelay and the startup jitter are not reproduced per C# line. The explicit waits in the body stay as they are |
| YOUR_PASSWORD | A fictional text only. Text writes part of its argument to the log, so the example is not suitable for storing passwords |

The using directives stay at the top of Script.csx. The program itself and the CV using var are inside an explicit block. GetService, Log, Sleep and cancellationToken come from the top-level script host. Ordinary classes and Razor components do not get them automatically: pass the dependencies and the token explicitly.

<details>
<summary>Historical UOPilot source</summary>

Below are the original commands, paths, timings and jumps.

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
<summary>Complete C# Script port</summary>

You need an open window that matches the `1Wow.exe` expression and your own world.bmp, vopros.bmp, ring.bmp and ban.bmp in `C:\Scripts\GWYN\Image`. You also need rechecked colors and regions, a suitable keyboard layout and available Windows Input. For your own test interface, replace the expression, images and coordinates.

Windows Input activates the chosen window. `1Wow.exe` is a broad expression: it is compared with the title, path or process name. If several windows match, narrow the [window expression](/en/features/window-matching-expressions) before you turn input on. Capture and input use the same window.

Unlike the first try, this variant sends real input. The login branch keeps a **fictional** YOUR_PASSWORD. Do not put a real password there: Text writes part of it to the log.

Paste the whole program into the C# action's Script.csx. Click Run only after you have prepared your own window. The loop runs until you stop Run or until it exits on a recognized indicator. Delays are a base value plus Random.Next, whose upper bound is excluded.

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
    var SendInput = SendInputWindow; // all keys in this flow target the same window
    var rng = new Random();
    var imageDirectory = @"C:\Scripts\GWYN\Image";
    var password = "YOUR_PASSWORD"; // fictional placeholder for this example
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
    if (!window.IsWindow) { Log.Warn("Window unavailable"); return; }

    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForWindow(window) //capture this window
        .EnableOsd(10); //enable the capture OSD

    SendInputWindow.TargetWindow = window; //input uses this same window

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

    return; // cancellation must not fall through into reloger

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

Deadlines are set after their actions. Search and waiting take time too, and that time is part of the real interval between presses. After Stop, the explicit token checks keep new iterations from starting. Sleep can return early. Press checks for cancellation inside try and then, in finally, tries to send KeyUp to the same window through the same backend. The input call itself takes no script token, so neither the end of a pause nor Stop guarantees that a call already in progress stops instantly.

</details>

API descriptions: [CV](/en/scripting/api/computer-vision/images), [input](/en/scripting/api/ISendInputScriptingApi), [script context](/en/scripting/api/scripting/runtime).
