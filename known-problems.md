---
title: Known Issues
description: Common EyeAuras issues and how to fix them
published: true
date: 2026-04-25T13:15:00.000Z
tags: faq, troubleshooting, webview2, network, login, ai-translated
editor: markdown
dateCreated: 2026-04-25T13:15:00.000Z
---
This page collects rare but real issues that EyeAuras users may run into, along with proven ways to fix them.

# EyeAuras says WebView2 is not installed

> This is a rare issue. In this state, EyeAuras may show `WebView2 is not installed`, while the built-in Microsoft installer says that `Microsoft Edge WebView2 Runtime is already installed on the system`.

![EyeAuras shows a message saying that WebView2 is not installed](https://s3.eyeauras.net/media/2026/04/sj5qeboNcx.png =x320)

![The Microsoft installer says that WebView2 is already installed](https://s3.eyeauras.net/media/2026/04/jH1zi6zLsH.png =x420)

### Why this happens

On some systems, WebView2 may be installed incorrectly, become corrupted, or require elevated permissions to repair. As a result, Windows thinks WebView2 is already present, but EyeAuras cannot detect or use it correctly.

### What to do

1. Close EyeAuras.
2. Download the official Microsoft Edge WebView2 Runtime installer:  
   [WebView2 download page](https://developer.microsoft.com/en-us/microsoft-edge/webview2/consumer)
3. If you need the direct installer link, use:  
   [download WebView2 Runtime installer](https://go.microsoft.com/fwlink/p/?LinkId=2124703)
4. Run the installer **as Administrator**.
5. If the installer says WebView2 is already installed, still complete the installation with administrator rights. In a real case, this was exactly what fixed the problem.
6. Start EyeAuras again.

### If that did not help

1. Restart your PC and repeat the steps above.
2. If the problem is still there, open [Report a problem](/report-a-problem) and send the logs.

### Important

This does not necessarily mean WebView2 is actually missing from your system. Most often, it is a detection issue or a damaged installation, and rerunning the installer as Administrator fixes it.

# EyeAuras says Not connected and will not let you sign in

> This is usually not several different bugs. In most cases, it is the same network-related scenario: EyeAuras cannot connect to the Eye Hub server.

### What it looks like

- `Not connected` is shown in the bottom-left corner
- the app cannot sign you in
- auras show hourglasses instead of ready icons
- the actions, triggers, or overlays list is empty
- the list shows only `C# Script`, or a very limited set of items

![In some cases, only C# Script remains in the list](https://s3.eyeauras.net/media/2026/04/19Qz4dvbG5.png =x260)

![Instead of the full set of items, only a limited list may load](https://s3.eyeauras.net/media/2026/04/E85mS45HQE.png =x420)

### Why this happens

EyeAuras uses the Eye Hub server infrastructure for authentication, loading some data, and other network-related features. If the app cannot reach the server, all of the symptoms above can appear.

Most of the time, the cause is not EyeAuras itself, but network restrictions such as:

- ISP-side blocking
- unstable routing
- a system proxy
- a VPN that breaks the route
- antivirus, firewall, AdGuard, or other filtering software

Right now, EyeAuras has two main hubs:

- a European hub, with servers in Germany (Frankfurt) and Finland (Helsinki)
- a hub in Russia (Saint Petersburg)

Newer versions include automatic server selection. It can switch between available regional Eye Hub endpoints if the main route is not working.

Read more:

- [1.9.9164 - New RU hub](/en/changelogs/9164)
- [1.9.9339 - Automatic server selection](/en/changelogs/9339)

### What to do

1. Fully close EyeAuras and launch it again.
2. Make sure you are using a recent enough version of EyeAuras (*9339+*), where automatic hub selection is already available.
3. If your settings include an option related to `Auto-select Server Location` or automatic server selection, turn it on.
4. If you use a system proxy, VPN, AdGuard, corporate firewall, or antivirus web filter, temporarily disable it and try signing in again.
5. If the problem is caused by ISP blocking, the opposite can also help: enable a VPN and try again.

### If that did not help

1. Try a different network or a VPN.
2. Update EyeAuras to the latest version.
3. If the problem continues, open [Report a problem](/report-a-problem) and send the logs along with a description of your network, ISP, and country.