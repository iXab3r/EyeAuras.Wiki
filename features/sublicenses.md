---
title: Sublicenses
description: Pack access keys for paid packs and mini-apps
published: true
date: 2026-03-24T00:23:40.000Z
tags: 
editor: markdown
dateCreated: 2024-10-07T20:56:26.145Z
---
# Activate access to the pack you need

A sublicense is an access key for a particular author's pack or mini-app. You can bind a key to your account, inspect its duration and run the corresponding product. It does not grant publication editing rights or access to private source code. A [mini-app example](https://eyeauras.net/share/S20251105201607zPUUkZryl4CY) shows one form such a product can take.

You need a key from that product's author, an EyeAuras account and a server connection. Check the pack name first: one pack's key does not unlock every other pack.

1. Sign in and open [My Account](https://eyeauras.net/my). Enter your unused key in **License key** and click **Activate key**.
2. Wait for **License key activated.** and the updated license list. An error or a key already assigned elsewhere is not a successful activation.
3. Find the intended pack and check its duration and state. The application also exposes this information in its profile and pack-access timeline.
4. Launch the pack as its author instructs. Its logic must request a current license session; a key's presence in the profile alone does not establish permission to continue running.
5. If access is pending, expired, frozen or occupied by other sessions, read the product's state and message. Reactivating the same key does not extend it or remove a PC binding.

This older image shows activation in the application's profile.

![Activating a key in the older application profile](https://s3.eyeauras.net/media/2024/08/EyeAuras_PbHuwp3yIoKuEIHy.png)

For a first sign-in without prior registration, use [Key Login](/en/features/keylogin): **Sign in with key → Login with key** in the current form. The older link below is **I have a key**.

![Older first-sign-in link](https://s3.eyeauras.net/media/2025/03/ShareX_829CnImJUb2PaMYZ.png)

## Read the conditions and current state

| Condition or state | Meaning |
| --- | --- |
| Calendar time | The license's calendar duration continues after activation, including while the application is closed. |
| Consumed time | Time is consumed while a session lease is active. It is not a timer of how long someone looks at the window. |
| Maximum sessions | Available logical slots. The author determines whether one session represents a launch, window, resource or another unit of work. |
| Hardware binding | Slots can be bound to a PC. Switching accounts or re-entering the key does not release a binding. |
| Pending | A request exists, but access has not yet been granted. Protected work should not start. |
| Granted | The current lease permits work. The product must also handle later state changes. |
| Expired / rejected / released | Different reasons for lacking current access. Use the message to distinguish them. |

The timeline relates the pack, license, duration and usage. This image shows an older profile layout.

![Pack licenses and access timeline](https://s3.eyeauras.net/media/2026/03/EyeAuras_vKT0Nhnf8z.png)

User freezes and author freezes are separate operations. The license determines the available actions and remaining change budget; a historical default of one freeze is not a universal rule. Timeline changes are staged and committed with **Apply**. PC unbinding is available only where permitted. A view of already signed grants without management data may omit these controls.

The author's **Freeze consumed time** pauses consumption in Consumed time mode. It is not a universal pause of calendar expiry. Freezing, expiration and permanent revocation are different states; freezing does not permanently revoke a key. Ask the issuing author about a particular license.

## Authors: configure conditions for new keys

You need your publication and permission to manage it. Open **License settings → Edit** on its page, choose the conditions, save and check the summary. This changes policy; it does not itself issue or sell keys.

![License settings on a pack page](https://s3.eyeauras.net/media/2026/03/msedge_kjbwxZPnYk.png)

| Setting or list | Scope |
| --- | --- |
| Time accounting | Calendar time or Consumed time for new keys. |
| Hardware binding | Whether slots require a PC binding. |
| Product features for new keys | Features copied into new keys. Shown read-only in this form; managed separately through licensing. |
| Freeze consumed time | A live switch pausing Consumed time consumption, separate from terms stored in a key. |
| Issued licenses | Issued keys and their states, not folder editing permissions. |
| Active leases | Current sessions and technical state, not a complete history of the user's actions. |

Time accounting, hardware binding and features are copied when a key is generated. Later policy edits do not rewrite those terms on issued keys. Live freeze state is separate.

The current **License Issue** web form requires administrator access. An ordinary author needs an agreed issuance route through [Contacts](/en/contacts); owning a publication does not provide an administrative issue button. Issuance sets the count, **Duration**, comment and allowed accounting, binding and session overrides. Keys are secrets, not part of the public pack description.

A publication link, a portable download and a sublicense are separate things. Ask the author about obtaining keys and product terms; the activation flow does not provide a checkout or payment transaction.

<details>
<summary>Add sign-in and access checks to your pack or mini-app</summary>

A regular pack can keep the standard EyeAuras profile, key activation and timeline. A custom interface needs to expose the appropriate sign-in route itself. The older profile below shows where the standard UI supplied it.

![Standard sign-in entry in the older profile](https://s3.eyeauras.net/media/2025/03/ShareX_829CnImJUb2PaMYZ.png)

In a supported EyeAuras Blazor window, this Razor fragment provides the built-in sign-in component:

```razor
<LoginWidget/>
```

For a custom ImGui, WPF or Blazor interface, IEyeHubService exposes sign-in operations. This reference fragment lists **alternative form handlers**, not a sequence to execute together. Values come from your form, not keys saved in distributed source. It uses top-level EyeAuras script context; ordinary helpers receive the service explicitly, and Razor components need their host-provided dependencies.

```csharp
var eyeHub = GetService<IEyeHubService>();

var userLicense = await eyeHub.PerformLogin(username, password);
var keyLicense = await eyeHub.LoginWithLicenseKey(licenseKey); // key login
var updatedLicense = await eyeHub.ActivateLicenseKey(extraLicenseKey); // only for already logged-in user

Log.Info($"Current user: {eyeHub.ActiveLicense.Username}");
Log.Info($"Connection state: {eyeHub.ConnectionState}");
```

**LoginWithLicenseKey** is the key-sign-in operation. **ActivateLicenseKey** attaches an additional key after sign-in. Connection state alone does not prove authentication or product access.

### Inspect profile information

These are fragments of an already running EyeAuras script with host services. They describe the local license snapshot, rather than deciding whether a runtime lease is granted.

```csharp
var license = GetService<ILicenseAccessor>();

Log.Info($"Username: {license.Username}");
Log.Info($"UserId: {license.UserId}");
Log.Info($"HardwareId: {license.HardwareId}");
Log.Info($"AppVersion: {license.AppVersion}");
Log.Info($"StartsAt: {license.StartsAt}");
Log.Info($"Roles: {string.Join(", ", license.Roles)}");
```

Use stable UserId rather than a display name to associate your own data. With an existing hub service:

```csharp
var eyeHub = GetService<IEyeHubService>();
var userId = eyeHub.ActiveLicense.UserId;

Log.Info($"Current user id: {userId}");
```

You can also read one attribute without printing the whole signed license:

```csharp
var license = GetService<ILicenseAccessor>();
var userId = license.GetAttribute("UserId");
```

Sublicense limits and expiry are useful for display, but listing them does not request a session:

```csharp
var license = GetService<ILicenseAccessor>();

foreach (var sublicense in license.ShareSublicenses)
{
    Log.Info($"ShareId: {sublicense.ShareId}");
    Log.Info($"MaximumSessions: {sublicense.MaximumSessions}");
    Log.Info($"ExpiresAt: {sublicense.ExpiresAt}");
}
```

### Request a session and keep it alive

Desktop builds through **9298** have the compatible passive path. Newer clients require an explicit **ISublicenseManager** request. A key can appear in ShareSublicenses without the product having requested its required lease.

The following complete program runs in **Script.csx inside EyeAuras**. Replace ShareId with your own pack's identifier; the matching key and sign-in are prerequisites. It observes state until **Stop**. It does not launch protected product logic or enforce access for it.

```csharp
using System;
using System.Reactive.Linq;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.Loader.Shared.Api;
using EyeAuras.Shared.Sharing;

{
    using var lease = GetService<ISublicenseManager>()
        .Rent(new AuraShareId("S20260209165639iiQZB0NCruAb"));
    using var observer = lease.WhenChanged()
        .Subscribe(x => Log.Info($"Lease: {x.IsGranted} / {x.Status} / {x.Message}"));

    // Put work that needs the lease here. This example only observes until Stop.
    await Task.Delay(Timeout.Infinite, cancellationToken);
}
```

All waiting stays **inside** the block. Leaving it disposes the observer first, then the lease, even if Run continues afterwards. For your own protected work, replace the wait with work inside the same block, checking IsGranted and responding to loss of access. Stop cancels the wait; disposal also occurs on an exception. Local cancellation is not confirmation of an immediately freed server slot.

This separate reference fragment ties the observer to **ExecutionAnchors**; EyeAuras owns the lease for the current Run. Your awaited work must continue after the fragment, because the fragment itself does not keep Run alive:

```csharp
var lease = GetService<ISublicenseManager>()
    .Rent(new AuraShareId("S20260209165639iiQZB0NCruAb"));

lease.WhenChanged()
    .Subscribe(x =>
    {
        if (!x.IsGranted)
        {
            Log.Warn($"Sublicense is not granted yet: {x.Status} / {x.Message}");
            return;
        }

        Log.Info("Sublicense granted, pack can continue working");
    })
    .AddTo(ExecutionAnchors);
```

| Operation or property | What it establishes |
| --- | --- |
| Rent | Immediately creates one logical session intent and starts background synchronization. It does not mean access was granted. |
| IsGranted | The latest known positive grant. Logging a message does not stop the product after access is lost. |
| Status / Message / LastUpdatedAt | Current diagnostic state, explanation and timestamp. A timestamp is not a new permission. |
| WhenChanged | Replays current state and reports changes. Pause or stop dependent work on loss of access. |
| Dispose / leaving the block / end of Run | Ends the local session intent, without confirming immediate server-side release. |
| Several Rent calls | Several distinct sessions, rather than repeated checks on one lease. |

ExecutionAnchors above owns your subscription; the runtime also ties the lease to Run. Do not retain a completed Run's object as permission for a later launch. See the [login and licensing contracts](/en/scripting/api/core/login-and-licensing) for context.

During a temporary disconnect, an unexpired signed cache can preserve already granted access, including recovery after a crash. This is not a full offline mode: a fresh grant without suitable cached permission may wait for the server. After a crash, the server can temporarily retain the old occupied slot.

### Pass the state to ordinary auras

A small script can maintain an **IsAuthenticated** aura with **Fixed Value**, or an `isAuthenticated` variable. The rest of the set can use Aura Is Active, enabling conditions or bindings to that state. Update it both on grant and on loss of access; once set to true, it must not remain an old authorization result. See [finding an aura](/en/scripting/examples/basic/find-aura) and [Variables](/en/scripting/variables).

A custom UI, [Private Content](/en/features/permission-model), [Packed Only and Binaries Only](/en/features/packs), and [script protection](/en/features/script-protection) address different exposure and distribution concerns. None replaces requesting a live lease and handling its state, or makes extracted code impossible to inspect.

</details>
