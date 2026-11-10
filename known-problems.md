---
title: Known Issues
description: Common EyeAuras issues and how to fix them
published: true
date: 2026-04-25T13:15:00.000Z
tags: faq, troubleshooting, webview2, network, login, ai-translated
editor: markdown
dateCreated: 2026-04-25T13:15:00.000Z
---

# Diagnose startup, connection and unavailable components

Identify where EyeAuras stopped before changing settings. Similar icons do not establish the same cause.

| Symptom | Start here |
| --- | --- |
| WebView2 is not installed | Check the UI runtime below |
| Not connected or sign-in does not complete | Check the Eye Hub connection |
| Connected, but an item says Proxy Not Available | Check sign-in, distribution and module availability |
| Hourglass icons or a list containing only C# Script | Check both connection and module readiness; the icon alone is not a diagnosis |
| The process closes without an error window | [Preserve the crash context](/en/report-a-problem) |

## Windows lists WebView2, but EyeAuras cannot use it

EyeAuras uses Microsoft WebView2 for its interface. Having Microsoft Edge installed does not establish that the required runtime is available to this process.

![EyeAuras reports that WebView2 is unavailable](https://s3.eyeauras.net/media/2026/04/sj5qeboNcx.png =x320)

1. Close EyeAuras and open Microsoft's [WebView2 Runtime page](https://developer.microsoft.com/en-us/microsoft-edge/webview2/consumer). EyeAuras uses this [official installer link](https://go.microsoft.com/fwlink/p/?LinkId=2124703).
2. Follow Microsoft's installation or repair instructions. In the documented April 2026 case, an ordinary installer run said the runtime already existed, while running the official installer as administrator resolved the problem. That is a case-specific recovery option, not the diagnosis of every WebView2 error.
3. Start EyeAuras again after installation finishes. The expected result is the interface opening instead of the missing-runtime message.
4. If it still fails, restart Windows and preserve the exact application and installer messages for a [report](/en/report-a-problem). “Already installed” does not prove that WebView2 opened successfully inside EyeAuras.

![Example installer response reporting an existing runtime](https://s3.eyeauras.net/media/2026/04/jH1zi6zLsH.png =x420)

## Not connected and sign-in fails

**Not connected** concerns the Eye Hub connection. It differs from a missing license or an unavailable individual module. Connection trouble can affect sign-in, network functions and loading some capabilities. A short editor list also needs a module check.

1. Record the application version and exact connection status. Compare relevant [release notes](/en/changelogs/9339) before applying advice from another version.
2. Open **Settings → Network**, enable **Auto-select server location**, then **Save**. This permits endpoint rotation when connection checks fail.
3. To compare a particular route, disable automatic selection, choose **Preferred server location** and save. The configured choices include **Default Eye Hub**, **EU Eye Hub** and **RU Eye Hub**. Change one setting at a time.
4. Compare another network you are permitted to use. A system proxy, VPN, network filter or corporate policy can affect routing; a change can help or hinder. Broadly disabling security software is not a diagnostic requirement.

| Setting | Effect |
| --- | --- |
| Auto-select server location | Allows switching among regional endpoints after failed connection checks; it cannot guarantee access through every network |
| Preferred server location | Selects an endpoint explicitly; unavailable while automatic selection is enabled |

Automatic selection was introduced in [1.9.9339](/en/changelogs/9339), and the separate RU hub in [1.9.9164](/en/changelogs/9164). Those are feature-history facts, not evidence that every present connection failure is fixed. A useful result is either restored connectivity or the recorded version, network, endpoint and error for a report.

Earlier screenshots show only C# Script or a partial list. The list alone does not identify the cause.

![Only C# Script appears in this earlier case](https://s3.eyeauras.net/media/2026/04/19Qz4dvbG5.png =x260)
![An earlier partially loaded list](https://s3.eyeauras.net/media/2026/04/E85mS45HQE.png =x420)

## Connected, but saved items remain unavailable

**Proxy Not Available** or **Not Available** means a saved item could not be materialized as an available component. Check the distribution, module loading and required permissions separately from connectivity.

![Tree and editor from an earlier configuration](https://s3.eyeauras.net/media/2026/04/g7bXMfBokZ.png =x420)

1. Check the connection separately from sign-in. In the historical case after 1.9.9339, an ordinary **Login** followed by reopening or restarting helped load old auras; this did not imply a required subscription purchase.
2. If already signed in, compare your version with the pack's requirements. The component must be supplied and loaded; sign-in alone does not grant every optional module.
3. Before replacing your set with an author's update, [save your copy](/en/features/export-import) and review the new contents. Avoid overwriting local changes blindly.
4. If the component is still unavailable, record its full name, pack, version and connection state, then include the relevant startup logs in a [report](/en/report-a-problem).

The expected result is the required editor becoming available and its item loading. Otherwise, those details help distinguish a network problem from a missing implementation or access requirement.
