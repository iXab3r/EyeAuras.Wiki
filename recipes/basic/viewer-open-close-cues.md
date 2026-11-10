---
title: "Hear different cues when your viewer opens and closes"
description: "Use one sound for your local text viewer appearing and another for its window closing."
published: true
date: 2026-11-10T16:05:04.371Z
tags: recipes, basic
editor: markdown
dateCreated: 2026-11-10T16:05:04.371Z
---

# Notice your viewer opening and closing

Use **Ping** when a Notepad window appears and **Bell** when the last matching window closes. This is useful when a local viewer is opened alongside another task: you can distinguish its arrival from its disappearance without watching the tree.

Prepare your own local text file, such as `EA-Preview.txt`, and use Notepad as its viewer. Keep other Notepad windows closed. You need an available audio output; both sounds are built into the notification selector, so no sound file is required.

## Connect the two transitions

1. Right-click an empty area of the tree, choose **New Aura**, and name it **Viewer cues**.
2. In **Triggers**, click **+**, choose **Window Exists**, and set **Target Window** to `notepad`. Open your text file in Notepad and verify that the selected window information points to that viewer.
3. In **On Enter**, click **+** and add **Play Sound**. Choose **Ping** in **Audio notification** and set **Volume** to **50%**. The play button beside the selector lets you check the chosen sound and audio output.
4. In **On Exit**, add another **Play Sound**, choose **Bell**, and set **Volume** to **50%**. Leave **While Active** empty: otherwise a reaction placed there can repeat while the window remains present.

| Action list | Reaction |
| --- | --- |
| On Enter | Play Sound → Ping, Volume 50% |
| While Active | Empty |
| On Exit | Play Sound → Bell, Volume 50% |

5. Leave the aura enabled and EyeAuras unpaused. Close the whole Notepad window, not just a document tab, and wait until **Window Exists** reads **Not Active**. Reopen your file: the transition to **Active** should produce Ping. Close that window: the transition back to **Not Active** should produce Bell.
6. Repeat with the viewer left open while you switch applications. Merely losing foreground focus should not produce Bell: **Window Exists** still sees the window.

The first cue can occur while you are configuring an already open viewer. Start the comparison from the confirmed **Not Active** state. A second matching window keeps the condition Active even when you close the first; a broad match is not a per-document watcher.

[Window Exists](/en/triggers/window-exists) supplies presence, while the two [Play Sound](/en/actions/play-sound) actions distinguish transitions. If a cue is missing, check its preview, volume and action list. For action-start records, open [Event Viewer](/en/features/event-viewer) with its Aura events enabled before repeating the exercise; an event record is not confirmation that you heard a sound or that the viewer finished loading its document.
