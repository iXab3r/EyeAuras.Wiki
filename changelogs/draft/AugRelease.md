---
title: August Release
description: August release notes and updates
published: true
date: 2024-08-14T08:57:33.479Z
tags: ai-translated
editor: markdown
dateCreated: 2024-08-11T17:15:30.899Z
---
# New release

It has been several months since the last release on the stable branch (~15 weeks), so this update includes a lot of changes.

In short:
- a new website
- a reworked publish/subscribe workflow
- server-side packing — a major feature, essentially a whole new distribution infrastructure that lets you build your own mini-apps on top of EyeAuras
- a *lot* of scripting improvements and changes. WebUI has not yet been migrated to the new scripting engine (v3); that will be one of the goals for the next release
- many changes in Behavior Trees — the technology is still relatively new, but even now it is worth considering them as an alternative to the standard aura system: after the initial learning curve, they often make things noticeably simpler
- Enabling Conditions were reworked and now behave much more reliably
- nearly a dozen different crashes were fixed, and around 40 JIRA issues were closed in total

The main focus of this release is server-side packing and the related website infrastructure. Hopefully, over time this will become the main way to distribute your mini-apps: after a few more improvements, the process for new users should come down to just a few clicks.

## New website

The [website](https://eyeauras.net/) has been significantly refreshed, both visually and functionally.

The most noticeable changes:
- the [homepage](https://eyeauras.net/) has been updated
- pages for specific auras were redesigned, for example: [GTA5 fishing bot](https://eyeauras.net/share/S20240710235018df4VPCkM0Wan), [Blum clicker](https://eyeauras.net/share/S20240606142306qxWxc7fy40p6), [Lineage 2 bot](https://eyeauras.net/share/S20240628015518RjpkU2Sdkh5I)
- screenshots, videos, and the feature list were updated — they now link to specific [Wiki](https://wiki.eyeauras.net/) pages
- the download section is no longer hidden away on the homepage, and the release date is now visible
- pricing information is also available right away

![](https://i.imgur.com/aEcqbXL.jpeg)

### Link previews

If you paste links to the EyeAuras website (https://eyeauras.net/) or even to a specific aura (https://eyeauras.net/share/S20240426185158EYI4GEqRm2vh), a small preview will be shown. This works in most modern messengers and platforms: Twitter, Discord, Telegram, and so on.

![Telegram](https://i.imgur.com/6BHr4q3.png)

### Aura Pack revisions

The server now stores every version of your auras that has ever been created or uploaded. This means you can download a pack from a specific revision if something goes wrong in a newer version.

This is how it looks — see the `Revisions` section at the bottom of the page:  
[Example — Blum clicker pack](https://eyeauras.net/share/S20240606142306qxWxc7fy40p6)

## New feature — server-side packing

Any published aura pack can now be downloaded as a standalone portable application that can run alongside the main EyeAuras installation. This should make onboarding much easier for new users: to them, your aura pack will look like a normal app they can download, unpack, and run.

This becomes especially powerful when combined with [Custom UI](/overlays/custom-ui): in practice, you can build a full standalone application and then distribute it as a portable app with several layers of anti-cheat protection, almost a dozen different input simulators, high-performance image capture, and ML capabilities.

The feature is still at an early stage, but over time this will become the recommended way to distribute your work — even for users who already have EyeAuras installed. The portable format guarantees that your pack will keep working even if the main EyeAuras version gets updated with breaking changes.

![Download pack](https://s3.eyeauras.net/media/2024/07/msedge_u69RD7mg80CRx0xZ.png)

P.S. Client-side packing will be enabled a bit later.

## Reworked — Publish/Synchronize

This is an improved version of the aura import workflow. If you have a link to a pack (for example, the [Blum crypto game clicker](https://eyeauras.net/share/S20240606142306qxWxc7fy40p6)), you can subscribe to it and receive notifications as soon as the author publishes a new version. There is also now a built-in mechanism for merging your local settings with the author’s pack settings.

The goal of this system is to make updated aura packs easier to distribute for authors and easier to update for users. In the near future, pack settings will also allow authors to specify a recommended app version, and the update system will be able to download and install it automatically.

![Telegram](https://s3.eyeauras.net/media/2024/06/EyeAuras_THioGu3JIMvvu3ZO.png)

### Access rights

Right now, only the person who originally published a pack can update it. The ownership system that will allow assigning multiple owners to one pack is already planned, but it is not ready yet.

### How to subscribe to an aura pack

In the current alpha version, to subscribe you need to right-click any folder and select `Publish/Syncronize`.

![](https://s3.eyeauras.net/media/2024/06/EyeAuras_MaSRFftVIfcALggR.png =x200)

Then just paste the link to the pack you want to subscribe to, or leave the field empty to create a new pack (export + subscribe).

![Publish/Synchronize window](https://s3.eyeauras.net/media/2024/06/EyeAuras_mX3K6JJ8M7JXhDb5.png)

### Merging your local pack configuration with the remote one

Suppose you subscribed to an aura that activates a specific window when you press `F4`. This is a combination of the HotkeyIsActive trigger and the WinActivate action.

In version 1, the author set the hotkey to `F4` and the window name to MyGame. You subscribed and downloaded the pack. But `F4` is inconvenient for you, so you changed the hotkey to `F3`.

Later, the author updates the pack and adds another action, which is not important for this example. A notification appears in the app saying that an update is available.

When you click **Update**, the merge system analyzes the changes. In this case, it will see the following:

Local changes (yours): **HotkeyIsActive** — hotkey changed from `F4` to `F3`  
Remote changes (author’s): a new action was added

These changes do not conflict, so the system can create an intermediate version that includes both the author’s changes (the new action) and your edits (the `F3` hotkey).

Another situation is also possible: the author may decide to change the hotkey too (`F4` => `F2`). In that case, the system will detect a settings conflict. Right now, in such cases the author’s settings always take priority.

On the Changes tab, you can click the Download button at any time to preview how your local configuration differs from the author’s current pack. No changes are applied at that point — it is only a preview.

![Changes](https://s3.eyeauras.net/media/2024/06/EyeAuras_G2iMRdETXWcHY79L.png)

### Activity Log

![](https://s3.eyeauras.net/media/2024/06/EyeAuras_BtGqp4IpMW2XCqM5.png)

## Scripting improvements and fixes

### Aura-to-aura references

This long-awaited change lets you link multiple auras with C# code and reuse methods, classes, and everything else as if it were one shared script.

You can now write helper functions once and use them anywhere you need. Hopefully this will bring copy-paste in larger projects close to zero.

This works for both regular Auras and Behavior Trees: if a Behavior Tree references an Aura, the shared code becomes available in all nodes of that tree.

To link auras, just add a `Reference`, as shown in the screenshot:

![Code references](https://s3.eyeauras.net/media/2024/06/tSL7ye5wGTRZCCo1.png)

#### What is this useful for?

For example, you can keep a set of classes for custom configuration in a “library” Aura, or code that simulates input in a special way. Or you can move your on-screen drawing logic there via OnScreenDisplay.

### You can now write your own mouse smoother — [read more here](/scripting/examples/advanced/custom-input-smoother)

Input smoothers are used to make mouse movement look... well, smooth. There are dozens of different algorithms, and EyeAuras currently only includes two built-in ones.

In this release, I added the ability to implement your own smoother in scripts and use it anywhere: in behavior trees, in auras, and in other scripts.

The next step I want to add is the ability to implement an entire input simulator in code. For example, that would make it possible to create your own way of sending input to a background window. I want this feature myself too, but new priorities keep coming up, so at least this change unblocks those who can implement it on their own.

### Handling critical exceptions in user scripts

Previously, if a script did something `really` wrong and that would normally cause a **crash** in a regular application, EyeAuras behaved the same way. In other words, if you made that kind of mistake in a script, the entire application would crash at the moment it happened and show the Error Report window.

To some extent that was logical, but over time I started receiving a *lot* of error reports that I cannot actually fix, because the fix needs to happen `in the script itself`.

In practice, I have 3 options:

- `a)` leave everything as-is and keep explaining to people that they need to implement exception handling the same way it is done in normal applications.  
  This does not scale well, especially with new users constantly joining. The more popular the app becomes, the more beginners will try scripting, and more of them will run into exceptions.

- `b)` run scripts in an isolated environment — essentially in separate small executables that communicate with the “main” app through some transport layer.  
  This is the best option, but technically extremely difficult, especially because that “small” program would need to interact with the main one with very low latency. Otherwise, a lot of things simply would not work. One day this may become a goal, but I estimate a feature like this would cost at least 3–4 months of work, which makes it one of the most expensive potential features.

- `c)` since EyeAuras fully controls the source code and how it is executed, try to make the scripting process as bullet- and fool-proof as possible.  
  This is the option we are trying for now. I created a test solution that will `try to catch all errors` from user scripts and, instead of crashing the application, swallow them, restore state where possible, and continue running. On top of that, I will start adding automatic improvements to user code during compilation — for example, inserting proper exception handling where it is missing (such as button click handlers), or catching exceptions thrown by `Task`.

We will see how well this works in practice.

A few more scripting fixes and improvements in this release:
- **[Bugfix]** Previously, the internal system that disposes services created via `GetService<T>` could sometimes accidentally dispose important EyeAuras services as well
- **[Improvement]** Compilation time should be lower, especially for the first compilation after launch
- **[Improvement]** The script startup mechanism now has noticeably less internal latency, which means your scripts can be run much more frequently. This optimization was primarily made for [Behavior Trees](/behavior-trees/gettings-started), where dozens of small script nodes can be executed in a single cycle

## Reworked — [Enabling Conditions](/features/enabling-conditions)

The internal Enabling Conditions mechanism has been significantly reworked. Some changes fix bugs, while others improve UX.

- If a trigger is disabled because its enabling conditions are not met, a large orange status banner is now shown at the top
- If you hover over this banner, you will see *very* detailed information that helps track exactly what caused the trigger to be disabled. The block is still quite technical for now, but it clearly shows which elements affected the status
- If an Aura is selected and the main window is currently focused, all enabling conditions are ignored — this is convenient for debugging
- The same logic also works for folders: if a folder is selected, enabling conditions for all child elements are ignored, which is useful, for example, when debugging an overlay group
- Fixed a bug where auras could sometimes become disabled on application startup despite the enabling conditions status

![Enabling conditions DISABLED preview](https://s3.eyeauras.net/media/2024/06/EyeAuras_q36at36WkBf43myU.png)

## Major improvements — [HotkeyIsActive](/triggers/hotkey-is-active)

![New HotkeyIsActive](https://s3.eyeauras.net/media/2024/06/EyeAuras_tamGDBtZFzTqqvoW.png)

HotkeyIsActive received a major rework, both visually and behavior-wise.

- Tooltips were added
- The Aura linking mechanism inside the Trigger was improved — this refers to Interception Conditions, explained below

### Interception Conditions

These have actually existed for a long time — several years — but were rarely discussed, even though they are very useful in some scenarios.

In practice, this is what determines whether hotkey processing is enabled or disabled at a given moment. By linking one or more auras, you can define the exact set of conditions that must be met before the Trigger starts doing anything.

For example, if you link an Aura with [WindowIsActive](/triggers/window-is-active), the Trigger will only respond to key presses when the game window is active.

In more advanced scenarios, you can tie a trigger to some in-game condition. For example: you press RMB (this is part of the HotkeyIsActive configuration) **AND** a powerful skill is already off cooldown (linked condition). In that case, instead of the normal RMB behavior, the system will simulate pressing another key that casts that skill. A good example is automating Vaal Skills in Path of Exile: you keep spamming the regular version of the skill on its normal key, and once the Vaal version has enough souls, it gets triggered automatically without you having to remember it manually.

To make the next two options easier to understand, here is an example.

I have a HotkeyIsActive trigger that tracks `F3` in `Toggle mode`. That means pressing `F3` once `activates` the trigger, and pressing it again `deactivates` it. This is a simple and convenient way to turn more complex auras on and off, for example auto-potions.

I also have the `Suppress Key` option enabled, which completely blocks `F3` from being passed into the game window — otherwise the game itself might also react to the action bound to `F3`.

The problem is that if you leave it like that, `F3` will be blocked in *all* applications, not just in the game. That is not very convenient.

To fix this, I can add an `Interception condition` with [WindowIsActive](/triggers/window-is-active), and then `F3` will only be restricted inside that specific game window. That sounds good, but it introduces two more issues.

#### Interception conditions — Ignore if Hotkey is set

**Problem:**  
To disable HotkeyIsActive, the game window now has to be focused. So if I want to turn off something bound to `F3`, I first need to bring the game back to the foreground. And if that `F3` enabled some aggressive clicker, getting the window back into the foreground may not be easy.

**Solution:**  
This option allows the trigger to be **enabled** only while the game window is active, but **disabled** from anywhere. Forgot to turn off your clicker before alt-tabbing? No problem: just press `F3` again and the trigger will turn off.

Please note: this option only works if the toggle is already active.

#### Interception conditions — Automatically deactivate Trigger

**Problem:**  
It is not always convenient to disable HotkeyIsActive quickly — you need to remember that some automation is currently running. You alt-tab, forget about it, and then suddenly the trigger condition fires and your character starts doing something in-game. That can cause problems.

**Solution:**  
Just enable this new option. If the interception condition for the trigger stops being true, the trigger will automatically deactivate. In our example, if I alt-tab out of the game window, everything tied to `F3` will automatically turn off.

Please note: when you return to the game, you will need to enable the trigger again. But overall, this option makes the setup much more resistant to human error.

### New option — Reset trigger state when linked auras are not active

A new option was added that resets the trigger state (that is, deactivates it) when linked auras become inactive.

The most practical use case is a linked aura with a WindowIsActive trigger. The default behavior is:

- if the selected window is active, the trigger works as usual and can be enabled with a simple key press
- if the selected window is not active, the trigger will not intercept key presses, and to disable it you first need to bring that window back to the foreground

If you enable the new option (`Reset trigger state when linked auras are not active`), the behavior changes:

- if the selected window is active, the trigger works as usual and can be enabled with a simple key press
- if the selected window is not active, the trigger will automatically deactivate as soon as it detects that state

This makes the setup especially convenient: you can bind functionality to a key so that it only works while the game is active and automatically turns off when you alt-tab or minimize the game.

## MouseMove verification is now disabled

For several years, EyeAuras used a mechanism that checked the result of every mouse movement — it made sure the cursor had *actually* moved to the intended position.

Historically, this mattered mostly for hardware input emulators such as Usb2Kbd and custom Arduino-based devices. For those, this check made sense, because movement was not always instant. So if you had two actions in a row (`MouseMove + Click`), there was a chance that at the moment of the click, the mouse had not yet reached the target position.

Now the tools used to send input have become much more powerful — SendSequence, BehaviorTrees, Scripts — and this mechanism now seems to cause more problems than it solves.

In the **test** branch, this check is now `disabled` for all input methods. In most cases this should go almost unnoticed, but keep in mind: you may need to add extra delays between mouse movement operations.

## Credits added

EyeAuras uses almost two hundred libraries that power different parts of the application, and I want to give proper credit to their authors.

You can view Credits on the [website](https://eyeauras.net/credits) or in the app under `About`.

![About](https://s3.eyeauras.net/media/2024/07/EyeAuras_EYZzWlMjtFWOUn3V.png)

## Other changes

### Triggers/Actions/Overlays can now be collapsed

This state is saved as part of the element configuration, so it will stay that way until you change it yourself.

![Triggers/Actions/Overlays are now minimizable](https://s3.eyeauras.net/media/2024/06/EyeAuras_Nbo9rjSiy906CTC1.png)

### Improved aura load/unload speed

When exporting and importing auras, small parts (JSON) and large data (binary, images, models, etc.) are now handled separately and downloaded from different locations.

For normal users, this means:
- the import preview window should open and work much faster for large aura packs
- synchronization is now more efficient — the app no longer has to download an entire 100+ MB aura pack just to calculate a diff
- and most importantly, although this is not implemented yet: these changes should help solve the issue where the Aura Library sometimes takes a very long time to open. That should arrive later this month

This will be especially noticeable for users connected to `EU Eye Hub`. Over time, I will also add a separate file hub for the RU region.

![Settings](https://i.imgur.com/pmmsLCG.png)

### Aura Tree improvements — copy/paste support

Full `Ctrl+C`/`Ctrl+V` support has been added. Previously, `Ctrl+C` behaved more like an Export mechanism, so you could not simply copy an element and paste it into another folder — that led to conflicts.

Now you can copy and paste elements within the tree much more like Windows Explorer. Copy naming also tries to follow Windows behavior: if you copy `"Aura"`, the first copy will be named `"Aura - Copy"`, the second one `"Aura - Copy(2)"`, and so on.

Please note: copy/paste between multiple simultaneously running EyeAuras instances **does not work**. For that, you still need to use Export and Import.

### UX improvements for Image Capture Triggers

Historically, when editing Image Capture Trigger settings (Image/Text/Color/ML), the Preview window updated exactly at the `Capture rate` set in the trigger — or even more slowly if the trigger could not sustain that FPS.

Usually that is not a problem. But as soon as you start using very low FPS values for efficiency — for example, updating `1 time` in `10 second` — or even `0 FPS` triggers together with [C# scripts](/scripting/getting-started) and [Behavior Trees](/behavior-trees/gettings-started), it becomes inconvenient.

Previously, you had to click the `Refresh` button manually to force the preview to update. Now you can set a global minimum preview FPS for the whole application — it will be used instead of the Trigger Capture Rate.

> Minimum Preview FPS only applies when Preview is enabled. It does not affect the real FPS and is not exported as part of the trigger configuration.
{.is-info}

![](https://s3.eyeauras.net/media/2024/06/EyeAuras_ne0AQtHXACipv7AM.png)

### Trigger UI improvement — status display added

You can now hover over a trigger’s state and get a clearer explanation of why it currently has that value.

For example, if enabling conditions are not met, the status description will say so. If a trigger is configured incorrectly, it will explain what exactly is missing. Coverage is still far from complete, but it will improve over time.

![HotkeyIsActive state](https://s3.eyeauras.net/media/2024/06/EyeAuras_x1B1uqyaYXI3U3n0.png)
![Image Search state](https://s3.eyeauras.net/media/2024/06/EyeAuras_LLrQpkkvCAOibbf4.png)
![Image Search state#2](https://s3.eyeauras.net/media/2024/06/EyeAuras_Ju063CR2rx063d9C.png)

## Fixes and improvements

- **[Crash]** Fixed a crash that could rarely occur when changing Send Input settings #EA-373 by `Godhunt`
- **[Crash]** Fixed a crash that occurred when copy-pasting configuration to another computer
- **[Crash]** Fixed a rare crash in TimerTrigger during startup
- **[Crash]** Suppressed a crash that occurred if an overlay had already been disposed #EA-441 v7008 by n1katio
- **[Crash]** Made overlay switching safer #EA-451 by n1katio
- **[Crash]** Fixed a crash in PropertyEditor #EA-454 y madscream
- **[Crash]** Changed the initialization procedure #EA-453 by dutiful6005
- **[Crash]** Fixed a crash in WindowSelector #EA-337
- **[Crash]** Fixed a crash in TransformAsync #EA-339
- **[Crash]** Fixed a crash in BTNodeEditorFooterMenu #EA-512 v7247 by oddessax
- **[Crash]** Fixed(?) an unpleasant crash issue that sometimes occurred in BehaviorTree #EA-510 v7247 TransformAsync

- **[Scripting]** Added a [new ToScreenPoint method](https://wiki.eyeauras.net/en/scripting/api/WindowImageProcessedEventArgs)
- **[Scripting]** Exposed properties that control OnScreenDisplay in Search Triggers so they can be toggled from code
- **[Scripting]** IBehaviorTreeAccessor now provides a Tick method, which allows manual control of tree ticks
- **[Scripting]** IBehaviorTreeAccessor now allows remote access to the Blackboard
- **[Scripting]** Improved visualization of user exceptions
- **[Scripting]** ScriptVariable no longer erases previously saved values when types do not match
- **[Scripting]** Added Execute and ExecuteAsync to IAuraAccessor
- **[Scripting]** Sleep with values below 10ms now works much more accurately than before
- **[Scripting]** Fixed a bug that caused services leased via GetService to be unexpectedly disposed
- **[Scripting]** Improved assembly and metadata import in Scripts — this should speed up compilation a bit

- **[BehaviorTree]** Added `Clear all variables` to the behavior tree Blackboard #EA-374 by `linqse`
- **[BehaviorTree]** UI refactor — more space, and the Blackboard was moved to a separate tab
- **[BehaviorTree]** Added the ability to scale the entire control, which helps make side panels less bulky when needed
- **[BehaviorTree]** Improved Copy/Paste — the app now tries to place pasted nodes exactly where the mouse cursor is
- **[BehaviorTree]** [Wait](/behavior-trees/nodes/wait) and [Cooldown](/behavior-trees/nodes/cooldown) nodes now support random time intervals
- **[BehaviorTree]** Fixed a very unpleasant bug where parts of the tree stopped rendering after certain action sequences
- **[BehaviorTree]** The node panel can now be collapsed, and node visuals were updated so they take noticeably less space
- **[BehaviorTree]** Fixed issues where icons for some nodes were displayed incorrectly
- **[BehaviorTree]** Improved UX when working with many (>3) BTs at the same time
- **[BehaviorTree]** Added an AutoZoom option to the BT overlay, which automatically changes zoom when the overlay is resized

- **[UI]** Fixed incorrect Variables updates #EA-509 v7247 by dutiful6005
- **[UI]** Fixed incorrect revision updates on the Synchronization page after Upload
- **[UI]** Added masking for password-protected folders
- **[UI]** Fixed a crash that occurred if something went wrong during login (for example, a disconnect) — `"Edit Form"` error
- **[UI]** Reduced the amount of code needed to click something
- **[UI]** Improvements in AuraTree — previously the tree lagged a bit when deleting large folders
- **[UI]** Fixed a crash that occurred if the login server was unavailable during the login process
- **[UI]** Fixed a bug that caused Event Viewer to crash
- **[UI]** Fixed a startup glitch where EventViewer was displayed over the splash screen
- **[UI]** `Unload all`/`Load all` now also affect Behavior Trees
- **[UI]** Configuration VCS is now enabled by default for new users
- **[UI]** Changed the folder editor UI — it now has two tabs: one for Synchronization and one for everything else
- **[UI]** Fixed bugs related to missing scrollbars in some cases, especially noticeable on smaller screens
- **[UI]** Aura Tree is now sorted by Type => Name; previously it also considered the time of last modification
- **[UI]** Error reports can now include all of your auras; the option is off by default
- **[UI]** Improved error handling when a user tries to import a share that does not exist
- **[UI]** Aura Tree sorting now updates correctly after renaming
- **[UI]** Many changes were made to the internal UI update mechanism — it may have some rough edges at first, but in the long run it will become much more efficient
- **[UI]** Fixed a bug with Enter handling in numeric fields
- **[UI]** Implemented a prototype of a mechanism that will allow logging in with a license key instead of username/password — this should simplify onboarding for new users
- **[UI]** Reduced the minimum window size to 1200x620
- **[UI]** Fixed an export issue in older versions of the program #EA-532 v6819 by DaDoro
- **[UI]** Fixed an issue where authentication sometimes behaved incorrectly (`"Failed to login..."` after reboot)

- **[Packing]** Many improvements to packing
- **[Packing]** Packed versions no longer respond to `eyeauras://` links the way the main version does
- **[Packing]** Fixed a bug in the Packing algorithm related to creating a new directory
- **[Packing]** Added two new packing options — you can now include your personal config in the build
- **[Packing]** Added the ability to remove the icon from the packed executable
- **[Packing]** Fixed an issue with packing presets
- **[Packing]** Fixed an issue with packing non-URI resources (for example, Sound)

- **[Overlays]** Fixed a long-standing issue where overlays could sometimes be sent to the background. This fix affects all overlays in the program, including OSD
- **[Image/Color/ML Search]** Fixed an issue with disappearing Effects #EA-377 by `linqse` and `Rowenor`
- **[Capture]** Restored part of the lost functionality that allowed capturing the full screen; for now this is only available in the `CopyFromScreen` method, and I will add it to the faster methods later
- **[TimerTrigger]** Fixed incorrect trigger firing
- **[Capture]** Increased the default MaxFramesPerSecond value from 30 to 144
- **[VCS]** Manual saves now automatically commit configuration data into the `.git` repository
- **[AuraTree]** It is now forbidden to use characters in aura names that are invalid for Windows file names
- **[WinActivate]** Fixed an issue where the timeout in WinActivate was saved incorrectly #EA-500 v7215 by dutiful6005
- **[Crash]** Fixed(?) a crash issue related to TransformAsync #EA-526 v7265 by TheSerg12
- **[Website]** Fixed deleting aura packs on request
- **[Website]** Implemented a view/download counter that tracks how many users viewed or downloaded your pack. Visualization will be added later
- **[Website]** Improved the UI of pack pages