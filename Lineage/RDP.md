---
title: Check window capture in a remote desktop session
description: Separate session visibility, captured pixels and input delivery
published: false
date: 2026-06-19T00:00:00.000Z
tags: ai-translated, retired
editor: markdown
dateCreated: 2024-03-15T03:34:12.220Z
---

# Check the source window in your remote session

When EyeAuras runs inside a remote desktop session, first establish which window and pixels are available **in that session**. Finding a window does not prove it accepts input. On another computer, the visible RDP client is not a local handle to each application running inside it.

The earlier Lineage 2 procedure depended on the separate **Input Redirect** mode. Its old controls are not a current setup path described here. Selecting TetherScript for an ordinary action does not enable forwarding of every physical key. Use [Send Sequence](/en/actions/sendinput/send-sequence) and its [input settings](/en/actions/sendinput/options) for configured actions; continuous physical-event redirection requires a distribution documenting that mode.

## Inspect a frame without sending input

Use your own authorized Windows remote session and a compatible EyeAuras build with the capture trigger. This checks a connected session only.

1. In your remote session, open EyeAuras and your own test application with visible text. Keep the session connected and the window visible.
2. Create a separate aura with no actions and add **Color Search**. Under **Capture settings → Target Window**, select that session's test window.
3. Set **Image Capture Rate = 5 Frames Per Second** and expand **Preview captured image**. If necessary, compare available **Capture Source** choices using the [capture guide](/en/triggers/images/imagecapturetriggers).
4. Change the text or another visible element in your test application. The same area should update in the preview. Resolve a missing or incorrect frame before configuring search conditions or input.

The expected result is changing pixels from the intended application while connected. This is neither a Lineage 2 restriction bypass nor a test of background key delivery.

| Situation | What it establishes |
| --- | --- |
| EyeAuras runs inside RDP | Window selection concerns the desktop available to that session. |
| EyeAuras runs elsewhere and captures the RDP client | It may capture the client's displayed image; remote application windows do not become local input recipients. |
| The session is minimized, locked or disconnected | Capture and input need separate checks for that state. Results from a connected session do not establish them. |

Changing remote-access software alone does not demonstrate game compatibility or minimized-session operation. Keep window discovery, rendering/capture, session availability, focus and acceptance of an action as separate questions.
