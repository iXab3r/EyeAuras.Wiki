---
title: Debounce
description:
published: true
date: 2025-08-17T08:20:07.721Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:20:07.721Z
---

The Debounce node lets you configure the system to react only to real changes and ignore noise. Sometimes behavior logic rapidly switches back and forth—working, then not working. These flickers can interfere with your system.

The Debounce node helps fix that!

If its child node suddenly changes state (for example, success → failure → success), Debounce doesn't rush to pass the change along. It waits a bit to make sure the new state is stable and not just a flash.

![Debounce](https://s3.eyeauras.net/media/2025/08/EyeAuras_u25y8UknQG.png)

## Blocking Behavior
### Wait until Stabilizes:
The node returns `Running` until the state stabilizes, meaning the entire tree is **blocked** during this period.

### Return immediately:
The node immediately returns the current state—`Failure` if it hasn't stabilized yet, otherwise `Success`.

## Activation Timeout, ms:
How many milliseconds the child node must keep returning `Success` for that success to be considered real.

## Deactivation Timeout, ms:
How many milliseconds the child node must keep returning `Failure` for that failure to be considered real.

Example: If a door quickly opens and closes but you care only when it stays open for a while, `Debounce` lets you ignore random door flaps until it's stably open for X milliseconds.
