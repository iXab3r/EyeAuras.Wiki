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

The source repeats key sequences while independent deadlines admit less frequent actions. Image and color checks choose recovery branches. In EyeAuras those conditions also come from captured pixels: names such as world, ring and ban are not built-in WoW data.

## Observe a color count without input

You need EyeAuras with C# Script and computer vision. Show an image with a red RGB 255,0,0 region in a separate window you own. Your own picture is enough; no account or password is needed.

1. Create a separate aura with Fixed Value set to Is NOT Active. Add a `C# Script` action under On Enter and open its editor.
2. Put this complete program in `Script.csx`, click `Run` and select your own window with the picker.
3. The log shows a count of matching pixels in the actual capture. An exact red region should give a nonzero count; no match gives 0. This is a count, not an area percentage or probability of an application state.

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

If the count is unexpected, inspect the selected window and captured color with [Color Search](/en/triggers/images/color-search). The complete port requires the same calibration for every indicator rather than guessing states from filenames.

## Preserve the algorithm's structure

| Source element | Port behavior and boundary |
| --- | --- |
| Repeat 350 | Up to 350 main-body series, then a final sequence and another outer pass |
| Rapidfire, Buff, tDejunk, tFetch, tHeal, tPet | Independent next-admission deadlines compared with DateTimeOffset.Now; not an exact replacement for UOPilot timer |
| Send_down / Send_up | Press holds between Down and Up and attempts release in finally; the five-second Backspace hold uses the same path |
| findcolor | CountPixels with a calibrated color, region and threshold. The integer overload uses Color.FromArgb; UOPilot parameters are not automatically equivalent |
| FindImage | Rectangle.Empty for absence; use ImageSearchRaw and check Detected.Success before an additional Similarity comparison |
| Regions | Rectangle.FromLTRB for opposite corners, or X/Y/Width/Height for CountPixels |
| reloger / login / world | Branches driven by prepared screen indicators; sequential searches do not share one atomic frame |
| Interpreter timing | UOPilot linedelay/EmptyLineDelay and initial startup jitter are not emulated as per-line C# timing; explicit body waits remain separate |
| YOUR_PASSWORD | Fictional literal only. Text logs part of its argument; this demonstration is not password storage |

Namespace using directives stay above Script.csx's executable block; CV's using var stays inside it. The top-level host supplies GetService, Log, Sleep and cancellationToken. An ordinary class or Razor component requires explicit dependencies and context.

<details>
<summary>Historical UOPilot source</summary>

These are the original commands, paths, timings and jumps, not an EyeAuras macro file or automatic configuration import. Treat credential-like example text as inert sample data, not account instructions.

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

</details>

<details>
<summary>Complete C# Script port</summary>

Prepare an open window matching `1Wow.exe`, your own world.bmp, vopros.bmp, ring.bmp and ban.bmp under `C:\Scripts\GWYN\Image`, calibrated regions/colors, a suitable layout and an available Windows Input backend. For an owned test interface, replace the expression, templates and coordinates. These historical constants are not universal WoW coordinates or evidence of a particular client state.

Windows Input activates its target. The expression can match a title, path or process name; narrow [window matching](/en/features/window-matching-expressions) if several windows match. Capture and input use the same window. This complete variant sends actual input, unlike the first program. Keep YOUR_PASSWORD **fictional** in a local demonstration; do not substitute a real secret into logged Text. Recognition can be understood with the read-only program alone.

Put the entire block in the C# action's Script.csx and use Run only after preparing your own controlled target. Stop requests cancellation; the blocking-indicator branch can also return from the script. Body delays use a base value plus Random.Next, whose upper bound is excluded; equivalent random distributions or elapsed timing across engines are not promised.

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

Deadlines are assigned after their actions, so capture and waiting time also contribute to the real interval. Explicit token checks prevent new iterations after cancellation. Sleep can return early; Press checks the token inside try and then attempts KeyUp in finally for the same target/backend. The synchronous input call receives no script token, so neither Stop nor an elapsed pause guarantees immediate completion. KeyUp can itself fail, and completed effects are not rolled back.

The input variables intentionally alias one context-owned API instance for the same window; do not dispose a borrowed host controller separately. The owned CV accessor is disposed on block exit. ImageSearchRaw exposes detection metadata; Success must be checked before Similarity. Simple ImageSearch rectangles are window-relative and used here as state indicators, not clicks or internal game values.

</details>

The first observable result is the pixel count from your own window. Assess a full loop only after every indicator has a real prepared source. Call completion is not confirmation that another application processed a key or login. [CV contracts](/en/scripting/api/computer-vision/images) · [Input contracts](/en/scripting/api/ISendInputScriptingApi) · [Script context](/en/scripting/api/scripting/runtime).
