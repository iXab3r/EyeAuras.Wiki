---
title: Lifecycle Events
description: React to remembered EyeAuras startup and shutdown events and understand retained state
published: true
date: 2025-02-27T15:07:04.010Z
tags: 
editor: markdown
dateCreated: 2025-02-27T15:07:04.010Z
---

# Show that EyeAuras has started

**Lifecycle Events** remembers events from EyeAuras itself. For example, **AppStarted** can show “EyeAuras ready” after its application window loads. This does not monitor every Windows program or the activity of a target window.

1. Create an aura with **Lifecycle Events**.
2. Choose **+ AppStarted**. If EyeAuras has already reported startup in this session, the event becomes active immediately; you do not need to restart it for this check.
3. Add a [Text overlay](/en/overlays/text) containing `EyeAuras ready`, visible while the aura is active. Turn off forced editor preview.
4. Observe AppStarted and the text. If **Pause Everything if Active** is enabled, the reaction may wait until EyeAuras loses focus; see below. Remove the subscription with its cross: with no events selected, the trigger becomes **Unknown**. Add AppStarted again and the remembered event is considered immediately.

The image shows AppStarted selected and AppClosed available to add. A selected event's tooltip shows its time or **Not triggered yet**.

![Selected lifecycle event and another available subscription](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_mrej2NiRxEGWybKN.png)

## Events and state

| Event or state | Meaning |
| --- | --- |
| AppStarted | EyeAuras reports loading its window. Useful for a startup reaction, but not a guarantee that all user background tasks have completed |
| AppClosed | EyeAuras reports its window closing before further shutdown. Not another application's close event, or guaranteed time for long asynchronous work |
| Active | At least one selected event has occurred during this EyeAuras run |
| Inactive | Events are selected but none has occurred yet |
| Unknown | No event selected |
| Multiple subscriptions | Any one is sufficient. Use separate auras for separate startup and shutdown reactions |

The result is retained rather than pulsed. Late subscriptions receive an event already reported during the same application run. Removing and re-adding AppStarted does not erase the application's memory of it; a new application run starts a new session.

For a startup action rather than text, put that action in **On Enter**. AppClosed does not create another entry if the same aura is already active because AppStarted happened. Do not make mandatory long sends or saves depend on shutdown time without their own completion guarantee. A C# action still needs its normal host context, dependencies and lifetime; this trigger does not make arbitrary script globals available to helper classes.

To watch another application’s window appearing, use [Window Exists](/en/triggers/window-exists); AppStarted belongs to EyeAuras itself. If you choose a startup action instead of text, use [Event Viewer](/en/features/event-viewer) to inspect its reported messages or errors before assuming the intended work finished.

<details>
<summary>The event is active but its reaction is paused</summary>

**Pause Everything if Active** pauses auras and trees while the main EyeAuras window or its overlays are active. Startup can already have occurred while the pause prevents the reaction.

![Pause Everything if Active in application settings](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_Rfv0Ke9HBt2WiKd7.png)

During normal setup, account for this pause and check the reaction after focus leaves EyeAuras. Turning the option off changes conditions for every aura; it is not a general fix for an unrelated failing action.

For a distributed Pack, **Packing configuration** controls the same behavior. Choose and check the intended policy before distribution. These older images show its web and application forms.

![Pause policy in the Pack web configuration](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_Ki4uH7viSSvyQ07p.png)
![Pause policy in the Pack application configuration](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_VGeE1h6tXZrwM8BB.png)

</details>
