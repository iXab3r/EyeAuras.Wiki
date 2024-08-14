---
title: AugRelease
description: 
published: true
date: 2024-08-14T08:57:33.479Z
tags: 
editor: markdown
dateCreated: 2024-08-11T17:15:30.899Z
---

# New release
It has been a few months since the last release to stable branch(~15 weeks), so quite a lot of things have changed.
TL;DR; version of the changelog:
- new website
- rework of publish/subscribe functionality 
- server-side packing - huge feature, basically entire infrastructure which allows to create your own mini-apps leveraging EA functionality
- A LOT of scripting improvements and changes. Migration of WebUI to the new scripting engine(v3) did not happen yet,  this will be one of the goals for the next release
- many-many changes of behavior trees - they are still new to this world, but at this point you should at least consider using them instead of default auras mechanism as they tend to make things much easier AFTER initial onboarding period
- Enabling conditions rework - much more stable now
- almost dozen of different crashes has been fixed. and ~40 JIRAs in total have been closed

My main focus were server-side packing and website infrastructure around it. Hopefully, this will become main distribution method for your mini-apps as with some more tweaking and improvements simplifies process for new users to just a few clicks. 


# New website
[website](https://eyeauras.net/) lived through bunch of facelifting procedures. 

The most noticeable changes are:
- on the [main page](https://eyeauras.net/)
- on pages which show information about specific auras (e.g. [GTA5 fishing bot](https://eyeauras.net/share/S20240710235018df4VPCkM0Wan), [Blum clicker]("https://eyeauras.net/share/S20240606142306qxWxc7fy40p6"), [Lineage 2 bot](https://eyeauras.net/share/S20240628015518RjpkU2Sdkh5I))
- actualized screenshots, videos and features list - now they point to specific [Wiki](https://wiki.eyeauras.net/) pages
- download section is not right there on the main page and you can see when it was released
- pricing details are also available from the get go

![](https://i.imgur.com/aEcqbXL.jpeg)

### Thumbnails
Whenever you paste links to EyeAuras website (https://eyeauras.net/) or even to specific auras (https://eyeauras.net/share/S20240426185158EYI4GEqRm2vh),
a small preview will be shown. This applies to most modern messengers - Twitter, Discord, Telegram, etc.

![Telegram](https://i.imgur.com/6BHr4q3.png) 

### Aura Pack Revisions
The server will save all versions of your auras ever created/uploaded. This allows to download pack with some specific revision in case something is wrong with the new one. 

Here is how it looks like ("Revisions" section at the bottom of the page)
[Example - Blum clicker pack](https://eyeauras.net/share/S20240606142306qxWxc7fy40p6)

# New feature - server-side packing
From now on, any shared pack of auras could be downloaded as a separate portable application which can be running in parallel with the main EyeAuras. This should drastically reduce complexity of onboarding of new users - to them, your pack of auras will look just like a usual program, which they can download, unzip and run. This is especially powerful in combination with [Custom UI](/en/overlays/custom-ui) - you can basically create entirely new program and then distribute it as a portable app, which will have multiple layers of anti-cheat protection, almost dozen different input simulators, high-performance image capture and ML-capabilities. 

This is still in early stages and will be the recommended way of distributing your work to other users, even those who are already using a program themselves - portable format guarantees that the program will keep working even if the main version of EyeAuras was updated in some breaking way.

![Download pack](https://s3.eyeauras.net/media/2024/07/msedge_u69RD7mg80CRx0xZ.png)

P.S. Client-side packing will be enabled a bit later

# Rework - Publish/Synchronize
This is an enhanced version of the aura import mechanism. By providing a link to a pack (for example, [the clicker for the crypto-game Blum](https://eyeauras.net/share/S20240606142306qxWxc7fy40p6)), you can start receiving update notifications as soon as the author releases a new version. Additionally, there is an integrated system for "merging" your settings with the author's pack settings (details below).

The essence of this mechanism is to make it easier and more convenient for authors to distribute updated versions of aura packs, and for users to update them. In the foreseeable future, pack settings will also include the ability to specify the program version recommended by the author, and the update mechanism will be able to download and install it.
![Telegram](https://s3.eyeauras.net/media/2024/06/EyeAuras_THioGu3JIMvvu3ZO.png) 

## Permissions
Currently, only those who initially published the pack can update it. There is an ownership mechanism which will allow you to have multiple people to "own" the pack, but it is not ready yet.

## How to establish subscription to a pack of auras
In the current alpha, to establish subscription, you have to right-click on any folder and select `Publish/Syncronize`
![](https://s3.eyeauras.net/media/2024/06/EyeAuras_MaSRFftVIfcALggR.png =x200)

Then just paste the link to a pack you'd want to subscribe to OR leave the field empty to create a new pack (export + subscribe)
![Publish/Synchronize window](https://s3.eyeauras.net/media/2024/06/EyeAuras_mX3K6JJ8M7JXhDb5.png)

## Merging local pack configuration with remote (uploaded) configuration
For example, you subscribed to an aura that activates a specified window when you press F4, which is a combination of the HotkeyIsActive trigger and the WinActivate action.
In version 1, the author specified the hotkey `F4` and the window name MyGame.
You subscribed and downloaded this pack. However, `F4` is inconvenient for you, so you decided to change it to `F3`.
The author updates their pack and adds an additional action (which doesn't matter to us). You get a notification in the program that an update is available.

When you click the **Update** button, the merging mechanism will analyze what has changed. In this case, it will see the following:
Local (your) changes: **HotkeyIsActive**: hotkey `F4` changed to `F3`
Remote (author's) changes: new action added

These changes do not conflict, so the mechanism can create a unique intermediate version that includes both the author's changes (new action) and retains your changes (hotkey `F3`).

There could also be a situation where the author decides to change the hotkey as well (`F4` => `F2`). In this case, the system will detect conflicting settings. Currently, the decision is always to prioritize the author's settings.

On the Changes tab, you can press the Download button at any time to see how your local settings differ from the current author's pack—no changes will be made, this is purely a preview.
![Changes](https://s3.eyeauras.net/media/2024/06/EyeAuras_G2iMRdETXWcHY79L.png)

## Activity Log
![](https://s3.eyeauras.net/media/2024/06/EyeAuras_BtGqp4IpMW2XCqM5.png)


# Scripting improvements and bugfixes
## Added cross-aura references
Long-awaited change that allows you to link mutiple auras, that contain some C# code together and re-use methods, classes and everything else as if it would be a single script.
This allows you to write some utility functions once and then use them whenever you need. From now on, amount of copy-paste required for large programs hopefully will be close to 0.
The change affects both Auras and Behavior Trees - by referencing Aura from Behavior Tree you will make shared code available across all nodes of that tree.

To link auras together just add Reference like on the picture below
![Code references](https://s3.eyeauras.net/media/2024/06/tSL7ye5wGTRZCCo1.png)

### How cross-aura references are useful to me ?
For example, in your "library" Aura you can store a bunch of classes which will be used for storing user configuration 
or will simulate user input in some specific way. Or maybe you want to draw something on the screen using OnScreenDisplay.

## Made it possible to write custom mouse input smoother - [more on this](/en/scripting/examples/advanced/custom-input-smoother)
Input smoothers are used to make mouse movement appear.... well... smooth. There are many-many different algorithms out there and EyeAuras currently incorporates only two of them. 
In this version I've made it possible to implement custom smoother via scripts and then use it wherever you want to - in behavior trees, in auras, in other scripts. 
The next thing I am planning to allow to do is implement an entire input simulator in the code - that way you can implement input method which will be able to send inputs to background window, for example. I want to add one myself but new things keep popping up and by adding this I will unblock those who can code it themselves.

## Handling of user-script critical exceptions
Previously, whenever script did something `really` wrong, which for usual "classic" program would lead to **crash**, EyeAuras followed that same pattern. Meaning that if you made some mistake in the script - the whole program will crash as soon as this happens, bringing up Error Report window. This kinda made sense, but at this point I started getting A LOT of error reports which I can't really fix as they must be fixed `on the script side`. 

Basically, I have 3 options:
- `a)` keep everything as-is and keep informing people that they must incorporate exception handling practices just like usual apps do 
Does not work very well, especially considering in-flow of new users. Meaning that the more popular the program will get, the more new users will try scripting and the more of them will have to deal with exceptions. Kinda not scalable.

- `b)` make scripts run in an isolated environment, basically small separate executables which interact with the "main" program via some fancy transport
Best option, but from a technical perspective extremely challenging, especially considering that this "small" program will have to communicate with the main one with extremely low-latencies, otherwise it just won't work. At some point this will be my goal, but I am estimating the cost of this feature to be around 3-4 months of work at the very least, meaning that it is amongst the most expensive potential new features 

- `c)` given EyeAuras has full control over the source code and it controls how it runs, try to make the overall process around scripting as bullet- and fool-proof as possible
This is the option we'll try for now. I developed a test solution which will `try to intercept all errors` coming from user scripts and, instead of crashing the app, try to consume them, restore the state (if possible) and continue operating. Also I'll start writing automated code-improvements which will be applied to user code during compilation time - e.g. adding proper exception handling where it is missing (e.g. button click handlers) or handling exceptions throw by Tasks. 
We will see how it goes. 

Few other fixes and improvements in this release:
- [Bugfix] Previously the inner system that disposes services created by `GetService<T>` could occasionally dispose(aka kill) some important services of EyeAuras as well... 
- [Improvement] Compilation time must be shorter, especially for the first after-startup compile
- [Improvement] Mechanism that runs scripts now has much lower inner latency, meaning that your scripts could be started much-much more often - that optimization was done primarily for [Behavior Trees](/en/behavior-trees/gettings-started) as there could be dozens of small script nodes that are executed in a single cycle

# Rework - [Enabling Conditions](/en/features/enabling-conditions)
A lot of internal changes in the mechanism powering enabling conditions. Some of them were towards bugfixes, some of them towards better UX.

- Now, if trigger is disabled due to enabling conditions not bein met, there will be a huge orange label stating such. 
- If you mouse over this label, there will be a *very* detailed information which will allow you to track down what exactly is affecting that trigger. Right now this block is very technical, but it explicitly states items which have affected disablement status
- If an aura is selected and main window is in focus right now - all enabling conditions are ignored, allowing you to debug it
- Similar logic applied if a folder is selected - all child items enabling conditions are ignored, allowing you to debug groups of overlays, for example
- Fixed bug which sometimes occurred on application startup which disabled auras despite enabling conditions status

![Enabling conditions DISABLED preview](https://s3.eyeauras.net/media/2024/06/EyeAuras_q36at36WkBf43myU.png)

# Major improvements - [HotkeyIsActive](/en/triggers/hotkey-is-active)
![New HotkeyIsActive](https://s3.eyeauras.net/media/2024/06/EyeAuras_tamGDBtZFzTqqvoW.png)

Applied some face-lifting to how HotkeyIsActive looks and works. 
- Added tooltips 
- Improved mechanism of linking Auras in the Trigger - Interception Conditions, more on them below

## Interception conditions
In fact, they have existed for ages (multiple years at this point), but they were not given enough publicity despite the fact that they are extremely useful in some cases.
All-in-all, this mechanism is directly responsible for enabling/disabling hotkeys handling at any given moment. By adding one or multiple auras you can specify exact set of conditions, which must be met before Trigger will start doing anything. 

For example, by linking Aura which has [WindowIsActive](/en/triggers/window-is-active) in it, you will make Trigger react only to keys which were pressed while game window is active.
In more complex cases, you can link the trigger to some in-game condition, for example, you when you click RMB(part of HotkeyIsActive configuration) **AND** some powerful skill is off-cooldown(linked condition), instead of casting whatever is usually on RMB, you'll simulate key press of a button which casts that skill. A good example would be automating cast of Vaal Skills on Path of Exile - you have the usual version of a skill bound to some button which you spam and whenever Vaal version got enough souls, it will be automatically release without you having to remember about it.

To better understand why two next options are needed, let me provide an example:
I have HotkeyIsActive tracking presses of `F3` in `Toggle mode`, meaning that when I first press on `F3`, trigger `activates` and to `deactivate` it I have to do a second press. Very simple and very useful to enable/disable some more complex auras (like auto-potions). Also I've set the option `Suppress Key` which blocks `F3` from reaching game window at all - otherwise the game could react to something bound to `F3`. What is bad in this configuration is that if I leave it as is, `F3` would be blocked in all applications, not only in my game - not really convenient, if you ask me. 
To fix that, I can add `Interception condition` with [WindowIsActive](/en/triggers/window-is-active) and this will restrict `F3` to that single game window. Kinda works, but there are two problems with this:

### Interception conditions - Ignore if Hotkey is set
**Problem:** 
To disable HotkeyIsActive, I now have to have game window to be in focus. So if I want to disable _something_ that is bound to `F3`, I have to activate game window first. If that `F3` enabled some kind of an aggressive clicker, getting your window back to foreground could be challenging at times. 

**Solution:** 
By setting this option, you can now make it so **enabling** the trigger can be done only while game window is active, but **disabling** it could be done from anywhere. Forgot to turn off your clicker before alt-tabbing? Not a problem, just hit `F3` again and the trigger will be disabled. 
Note that this option will have effect only if toggle is currently active.

### Interception conditions - Automatically deactivate Trigger
**Problem:**
There is no way to quickly disable HotkeyIsActive - you have to click the button. In some cases this is not very convenient - you have to remember that some automation currently runs. You alt-tab and forget about it. Then, out of nowhere, some trigger condition kicks in and you start doing something in the game. That could lead to problems.
 
**Solution:**
Just set this new option. Now, if trigger interception condition is no longer met, the trigger will automatically deactivate itself. In our example, if I alt-tab out of game window, the whole functionality that is powered by `F3` will be deactivated. Note that you'll have to enable it back on again after you alt-tab back to the game. By having this option enabled you can make the overall system much more resistant to human errors.


### New option - Reset trigger state when linked auras are not active
Added a new option that resets the trigger state (deactivates the trigger) whenever linked auras are deactivated. 

The most practical application of this feature is for a linked aura that includes a WindowIsActive trigger. By default, the behavior is as follows:

- If the selected window is active, the trigger behaves normally and can be activated by a simple key press.
- If the selected window is not active, the trigger won't capture key presses. To deactivate the trigger, you must first bring the selected window to the foreground.

With the new option ("Reset trigger state when linked auras are not active") enabled, the behavior changes to:

- If the selected window is active, the trigger behaves normally and can be activated by a simple key press.
- If the selected window is not active, the trigger will automatically deactivate as soon as it detects this state.

This makes it extremely easy to set up a key that activates certain functionality only when a game is active and automatically deactivates it when you alt-tab or minimize the game.


# MouseMove validation is now disabled
For a few years, EyeAuras was using a mechanism which validated results of each and every mouse movement - it made sure that cursor has _actually_ been moved to desired location. 
Historically the main reason for this were hardware input emulators like Usb2Kbd and custom Arduino-powered devices. This made sense for them as they do not really perform the movement instantly, meaning that if you have two inputs in a row (MouseMove + Click) there is a chance that mouse won't be at desired position when Click will be performed. 
Now, the tooling around sending inputs became much more powerful - SendSequence, BehaviorTrees, Scripts, this mechanism seems to bring in more troubles than its worth.

In **test** mode, this mechanism is now `disabled` across all input methods. In theory, this should not be very noticeable in most cases, but keep in mind, that you may have to throw-in some extra delays in-between mouse movement operations. 


# Added Credits 
EyeAuras includes almost two hundreds of libraries covering different parts of its functionality and I want to give credits to authors. 
Accessible on the [website](https://eyeauras.net/credits) or in the app ("About")
![About](https://s3.eyeauras.net/media/2024/07/EyeAuras_EYZzWlMjtFWOUn3V.png)

# Other
## Triggers/Actions/Overlays are now minimizable
This state is persisted as a part of item configuration meaning it will stay that way until you'll change it again.
![Triggers/Actions/Overlays are now minimizable](https://s3.eyeauras.net/media/2024/06/EyeAuras_Nbo9rjSiy906CTC1.png)

## Auras upload/download speed improvements
Whenever you export or import aura, small (JSON) and large (binary, images, models, etc) parts will be handled separately and downloaded from different locations.
For you, as end user, this would mean that 
- Import preview will open up and work much faster for larger aura packs
- Synchronization is more efficient - the program won't need to download the whole 100+mb aura pack to perform diff anymore
- and, the most important but not implemented yet, it will allow to solve the problem with Aura Library opening for ages. These changes will come later this month.

## Aura Tree improvements - copy/paste support
Added full Ctrl+C/Ctrl+V support - previously Ctrl+C was kinda similar to Export mechanism, meaning you could not just copy some item and paste it into a different folder as it would lead to conflicts. Now you can copy and paste items all around just like you do in Windows explorer. Also the naming scheme for cloned items tries to follow the one used in Windows, e.g. if you're copying "Aura", the first copy will be named "Aura - Copy", the second one "Aura - Copy(2)" and so forth. 

Note that copy-pasting items across multiple instances of EyeAuras won't work! You have to use Export and Import for this(for now).

This should be especially noticeable by users who are connected to `EU Eye Hub`. Eventually, I'll also add separate file hub to RU region as well.
![Settings](https://i.imgur.com/pmmsLCG.png)

## Image Capture Triggers UX improvements
Historically, when you were editing settings of Image Capture Triggers (Image/Text/Color/ML), Preview window was refreshing at exactly the same `Capture rate` that you had configured (or lower, if trigger was not able to reach that FPS). In most cases this is not really a problem, but as soon as for efficiency reasons you start working with very low FPS, such as trigger refreshing `1 time` in `10 second`, or even `0 FPS` triggers which are used in combination with [C# scripts](/en/scripting/getting-started) and [Behavior Trees](/en/behavior-trees/gettings-started). Previously, you had to manually click on `Refresh` button to force a redraw, which is not very convenient. Now, you can global app-wide minimum preview FPS, which will be used instead of Trigger Capture Rate. 

> Minimum Preview FPS will take effect only while you have Preview enabled! It won't affect FPS afterwards and won't be exported as part of a trigger configuration.
{.is-info}

![](https://s3.eyeauras.net/media/2024/06/EyeAuras_ne0AQtHXACipv7AM.png)

## Triggers UI improvement - added status display
From now on, you can hover cursor over trigger state to get a better understanding of why exactly it has this value. For example, if enabling conditions are not met - trigger state description will tell exactly that. If trigger is misconfigured - it will tell what exactly is missing. Right now the coverage is far from completeness, but eventually we'll get there.

![HotkeyIsActive state](https://s3.eyeauras.net/media/2024/06/EyeAuras_x1B1uqyaYXI3U3n0.png)
![Image Search state](https://s3.eyeauras.net/media/2024/06/EyeAuras_LLrQpkkvCAOibbf4.png)
![Image Search state#2](https://s3.eyeauras.net/media/2024/06/EyeAuras_Ju063CR2rx063d9C.png)


# Bugfixes/Improvements
- **[Crash]** Fixed crash which occured in some rare cases when user changed Settings related to Send Input #EA-373 by `Godhunt`
- **[Crash]** Fixed a crash that occurred when the configuration was copy-pasted to another computer
- **[Crash]** Fixed crash which rarely occurred in TimerTrigger during startup
- **[Crash]** Muted crash which happened if overlay is already disposed #EA-441 v7008 by n1katio
- **[Crash]** Safer overlay toggling #EA-451 by n1katio
- **[Crash]** Fixed crash in PropertyEditor #EA-454 y madscream
- **[Crash]** Changed initialization routine #EA-453 by dutiful6005
- **[Crash]** Fixed crash in WindowSelector #EA-337
- **[Crash]** Fixed crash in TransformAsync #EA-339
- **[Crash]** Fixed crash in BTNodeEditorFooterMenu #EA-512  v7247 by oddessax
- **[Crash]** Fixed(?) a nasty problem with a crash that occurred in BehaviorTree sometimes #EA-510 v7247 TransformAsync

- **[Scripting]** Added [new method ToScreenPoint](https://wiki.eyeauras.net/en/scripting/api/WindowImageProcessedEventArgs)
- **[Scripting]** Exposed properties that control OnScreenDisplay in Search Triggers, allowing you to toggle them via code.
- **[Scripting]** IBehaviorTreeAccessor now offers Tick method which allows to manually control ticks of the tree
- **[Scripting]** IBehaviorTreeAccessor now allows to remotely access Blackboard
- **[Scripting]** Improved user-level exceptions visualization
- **[Scripting]** ScriptVariable now does not erase previously stored values in case of type mismatch
- **[Scripting]** Added Execute and ExecuteAsync to IAuraAccessor
- **[Scripting]** Sleep with under-10ms values now is much-much-much more accurate than before
- **[Scripting]** Fixed a bug which lead to unexpected disposal of services rented by GetService method
- **[Scripting]** Improvements in how Scripts import assemblies and metadata - should make compilation faster a bit

- **[BehaviorTree]** Added "Clear all variables" to Behavior Tree blackboard #EA-374 by `linqse`
- **[BehaviorTree]** UI refactoring - more space, moved blackboard to separate tab
- **[BehaviorTree]** Made it possible to zoom in/zoom out the whole control - that way you can make side panels occupy less space if needed
- **[BehaviorTree]** Improved Copy/Paste experience - the program will now try to position pasted nodes right where your mouse is
- **[BehaviorTree]** [Wait](/en/behavior-trees/nodes/wait) and [Cooldown](/en/behavior-trees/nodes/cooldown) nodes now allow to configure 
- **[BehaviorTree]** Fixed a very nasty bug which lead to parts of the tree not being shown after certain sequences of actions
- **[BehaviorTree]** Made the panel with nodes collapsible + changed how nodes look (they take much less space now)
- **[BehaviorTree]** Fixed problems with some nodes icons not being shown properly
- **[BehaviorTree]** Improved UX when operating with many(>3) BTs simultaneously
- **[BehaviorTree]** In BT overlay added AutoZoom option which automatically zooms in and out whenever size of an overlay changes

- **[UI]** Fixed Variables not redrawing properly #EA-509  v7247 by dutiful6005
- **[UI]** Fixed revision not being updated properly on Synchronization page after Upload
- **[UI]** Added masking to password-protected folders
- **[UI]** Fixed a crash which occurred when something bad (like disconnect) happened while you were trying to login (error "Edit Form")
reduce amount of code you need to write to click on someting 
- **[UI]** Improvements in AuraTree - previously it stuttered a bit during removal of large folders
- **[UI]** Fixed crash which happened when login server was not available during login procedure
- **[UI]** Fixed bug which crashed Event Viewer
- **[UI]** Fixed a crash which occurred when something bad (like disconnect) happened while you were trying to login (error "Edit Form")
- **[UI]** Fixed glitch which occurred on startup and made EventViewer display on top of the splash screen
- **[UI]** `Unload all`/`Load all` now affect Behavior Trees as well
randomized time spans
- **[UI]** Enabled config Version Control System by default for new users
- **[UI]** Changed folder editor UI - now there are two tabs, one for Synchronization, one for everything else
- **[UI]** Bugfixes related to absence of scrollbar in some cases, especially noticeable on smaller screens
- **[UI]** Aura Tree is now sorted by Type => Name, previously it included last modification time
- **[UI]** Error reporting now allows to include your all auras into report, unchecked by default
- **[UI]** Improved error reporting when user attempts to Import share that does not exist
- **[UI]** Aura Tree sorting is now properly updated after rename
- **[UI]** A lot of changes in mechanism that is responsible for UI updates - may be buggy a bit at first, but will end up much more effective in the long term
- **[UI]** Fixed a bug with Enter handling in numerical fields
- **[UI]** Implemented prototype of mechanism which will allow to login via license key instead of username/password - should make things 
- **[UI]** Decreased min window size to 1200x620
- **[UI]** Fixed a problem with export on older versions of the program #EA-532 v6819 by DaDoro
- **[UI]** Fixed a problem with authentication not working properly under some circumstances ("Failed to login..." after reboot)

- **[Packing]** A lot of improvements in packing and 
- **[Packing]** Improvement in Packing - now packed versions won't react to "eyeauras://" links like the main version
- **[Packing]** Fixed bug in Packing algorithm related to creating new directory
- **[Packing]** Added two new options in packing - now you can bundle your personal config 
- **[Packing]** Added option to remove icon from packed executable
- **[Packing]** Fixed a problem with packing presets 
- **[Packing]** Fixed a problem with non-URI resources (e.g. Sound) packing


- **[Overlays]** Fixed a longstanding issue where overlays were sometimes sent to the background. This fix affects all overlays in the program, 
- **[Image/Color/ML Search]** Fixed a problem with dissapearing Effects #EA-377 by `linqse` and `Rowenor`
including OSD.
improving program portability in the near future.
- **[Capture]** Restored bit of lost functionality that allowed to capture entire screen, for now I made it available only in `CopyFromScreen` method, will extend to more performant methods a bit later
- **[TimerTrigger]** Fixed trigger not activating properly
- **[Capture]** Increased default MaxFramesPerSecond from 30 to 144
- **[VCS]** Manual save now automatically commits config data to .git repository
easier for new users
- **[AuraTree]** Forbidden usage of invalid windows file name chars in aura names
- **[WinActivate]** Fixed timeout in WinActivate not being saved properly #EA-500 v7215 by dutiful6005
- **[Crash]** Fixed(?) a problem with crash related to TransformAsync #EA-526 v7265 by TheSerg12
- **[Website]** Fixed on-demand aura pack removal 
- **[Website]** Implemented download/views counter which tracks how many users viewed/downloaded your pack. Visualization will come later
- **[Website]** Pack pages UI improvements


