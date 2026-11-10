---
title: "Limit a notification key to your own application"
description: "Use a window-state aura as a hotkey interception condition and play one cue for an eligible gesture."
published: true
date: 2026-11-10T16:05:04.371Z
tags: recipes, basic, ai-translated
editor: markdown
dateCreated: 2026-11-10T16:05:04.371Z
---

# Make a notification key belong to one application

Let F6 play a short cue only while your own Notepad window is in the foreground. A separate window-state aura controls whether the hotkey is eligible for interception. This is a notification exercise, not a key remapper or a command sent to Notepad.

Open one Notepad window with your own disposable text document and have an available audio output. F6 must be unused for a disruptive command in your test windows; choose a different unused key if necessary. Leave **Suppress Key** off throughout: the application can still receive the original key.

## Create the source condition

1. Right-click an empty area of the tree, choose **New Aura**, and name it **Notes active**.
2. In **Triggers**, click **+** and add **Window Is Active**. Set **Target Window** to `notepad`. Verify that the selected window information identifies your document. Leave its action lists and overlays empty.
3. Switch between Notepad and another application. **Notes active** should be **Active** only with the matching window in the foreground. Keep this aura loaded and enabled.

## Limit the hotkey and add its cue

1. Create another **New Aura** at the root, named **Notes notification**. In **Triggers**, add **Hotkey Is Active**. Assign **F6**, select **Hold**, and leave **Suppress Key** off. If you chose another key, use it consistently below.
2. Open that trigger's **Advanced** section. Under **Interception Condition**, click **Links**, select **Notes active**, and require its **Active** state. Keep this as the only link. Leave **Ignore If Hotkey Is Pressed** off; this exercise starts a fresh gesture after each application change.
3. In **On Enter**, click **+**, add **Play Sound**, choose **Audio notification → Ping**, and set **Volume** to **50%**. Preview the sound. Leave **While Active** and **On Exit** empty.

| Setting | Value |
| --- | --- |
| Hotkey | F6, or your unused replacement |
| Mode | Hold |
| Suppress Key | Off |
| Interception Condition → Links | Notes active, required Active |
| Ignore If Hotkey Is Pressed | Off |
| On Enter | Play Sound → Ping, Volume 50% |

4. Keep both auras enabled and EyeAuras unpaused. Leave the editor for Notepad. Press and briefly hold F6: expect one Ping. Release it so the Hold condition returns to **Not Active** before trying again. Holding it continuously should not repeat the cue.
5. Release the key, switch to a different application, then try a fresh F6 press there: the notification should not activate. Release it before returning to Notepad, where a new press should work again. Test outside EyeAuras itself so its own-window input option does not confuse the comparison.

[Window Is Active](/en/triggers/window-is-active) supplies the state, the [hotkey's Links](/en/triggers/hotkey-is-active) gate interception, and [Play Sound](/en/actions/play-sound) makes the eligible gesture observable. Putting a window trigger beside a hotkey in an ordinary AND list only combines their results; it does not configure the hotkey's interception eligibility. The link reuses the separate aura's configured state.

Because Suppress Key is off, lack of a cue in another application does not mean that application cannot receive F6. This setup neither grants focus nor sends replacement keys. Release between application changes; it does not rely on promises about automatically clearing a gesture that was already held.
