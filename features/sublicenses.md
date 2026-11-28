---
title: Sublicenses
description: Access keys for paid packs and mini-apps. How to activate one and how authors set them up
published: true
date: 2026-03-24T00:23:40.000Z
tags: 
editor: markdown
dateCreated: 2024-10-07T20:56:26.145Z
---
# Activate access to the pack you need

A sublicense is an access key for one pack or mini-app from a particular author. You bind the key to your account, see how long it lasts in your profile and run the pack. Here is a [mini-app example](https://eyeauras.net/share/S20251105201607zPUUkZryl4CY).

You need a key from the product's author, an EyeAuras account and a connection to the server. Check the pack name first. A key for one pack does not open the others.

1. Sign in and open [My Account](https://eyeauras.net/my). Enter your unused key in **License key** and click **Activate key**.
2. Wait for the **License key activated.** message and the updated license list.
3. Find the pack in the list and check its duration and state. In the application, you can see this in the profile and on the pack-access timeline.
4. Launch the pack as its author instructs.
5. If access is pending, expired, frozen or taken by other sessions, read the state and the message the product shows. Activating the same key again does not extend it or remove a PC binding.

You can sign in without registering first, using [Key Login](/en/features/keylogin). In the current form it is **Sign in with key → Login with key**.

![Activating a key in the older application profile](https://s3.eyeauras.net/media/2024/08/EyeAuras_PbHuwp3yIoKuEIHy.png)

![The older I have a key link for the first sign-in](https://s3.eyeauras.net/media/2025/03/ShareX_829CnImJUb2PaMYZ.png)

## Read the conditions and current state

| Condition or state | Meaning |
| --- | --- |
| Calendar time | The time runs without a break from activation, even while the application is closed. |
| Consumed time | Time is spent while a session lease is active. |
| Maximum sessions | How many logical slots are available. The author decides what counts as a session: a launch, a window, a resource or something else. |
| Hardware binding | Slots can be bound to a PC. Switching accounts or entering the key again does not release a binding. |
| Pending | Access has been requested but not granted yet. |
| Granted | The current lease allows work. |
| Expired / rejected / released | Three different reasons why there is no access now. Read the message to tell them apart. |

![Pack licenses and access timeline](https://s3.eyeauras.net/media/2026/03/EyeAuras_vKT0Nhnf8z.png)

A freeze by the user and a freeze by the author are separate operations. What you can do and how many changes you have left depends on the terms of your license. On the timeline, you first prepare a change and then commit it with **Apply**. The PC unbind button appears only where unbinding is allowed. If the list shows already signed grants without management data, these controls may be missing.

The author's **Freeze consumed time** pauses spending in Consumed time mode. For questions about a particular key, ask the author who issued it.

## Authors: configure conditions for new keys

You need your own publication and the right to manage it. On its page, open **License settings → Edit**, choose the conditions and save. Then check the summary.

![License settings on a pack page](https://s3.eyeauras.net/media/2026/03/msedge_kjbwxZPnYk.png)

| Setting or list | Scope |
| --- | --- |
| Time accounting | Calendar time or Consumed time for new keys. |
| Hardware binding | Whether slots require a PC binding. |
| Product features for new keys | Features that are copied into new keys. This form only shows them. They are managed separately through licensing. |
| Freeze consumed time | A switch that pauses Consumed time spending right now. |
| Issued licenses | Issued keys and their states. |
| Active leases | Current license sessions and their technical state. |

Time accounting, hardware binding and features are copied into a key when it is generated. If you change the policy later, keys already issued keep their old terms. The live freeze is a separate case.

In the current **License Issue** web form, only an administrator can issue keys. An ordinary author has to arrange a batch through [Contacts](/en/contacts). The form sets the count, **Duration**, a comment and the allowed overrides for accounting, binding and sessions. Keys are secrets and are not part of the public pack description.

Activating a key involves no payment. To get a key or learn the product terms, ask the author.

<details>
<summary>Add sign-in and access checks to your pack or mini-app</summary>

A regular pack can use the standard EyeAuras profile, key activation and timeline. A custom interface has to offer sign-in itself.

![Standard sign-in entry in the older profile](https://s3.eyeauras.net/media/2025/03/ShareX_829CnImJUb2PaMYZ.png)

This Razor element shows the built-in sign-in in an EyeAuras Blazor window that supports it:

```razor
<LoginWidget/>
```

In a custom ImGui, WPF or Blazor interface, you can call the sign-in operations of IEyeHubService. The fragment below lists **alternative form handlers**. Do not run them all in a row. Take the values from your form, not from keys saved in the code you distribute. The fragment is written for a top-level EyeAuras script. An ordinary helper class gets the service passed in, and a Razor component gets its dependencies from the host.

```csharp
var eyeHub = GetService<IEyeHubService>();

var userLicense = await eyeHub.PerformLogin(username, password);
var keyLicense = await eyeHub.LoginWithLicenseKey(licenseKey); // key login
var updatedLicense = await eyeHub.ActivateLicenseKey(extraLicenseKey); // only for already logged-in user

Log.Info($"Current user: {eyeHub.ActiveLicense.Username}");
Log.Info($"Connection state: {eyeHub.ConnectionState}");
```

**LoginWithLicenseKey** signs in with a key. **ActivateLicenseKey** attaches an extra key after sign-in. The connection state alone does not show that the user is signed in or has access to the product.

### Inspect profile information

The examples below are fragments of a running EyeAuras script, where the host supplies the services. These fields are for diagnostics. Do not use them to decide whether access is granted right now.

```csharp
var license = GetService<ILicenseAccessor>();

Log.Info($"Username: {license.Username}");
Log.Info($"UserId: {license.UserId}");
Log.Info($"HardwareId: {license.HardwareId}");
Log.Info($"AppVersion: {license.AppVersion}");
Log.Info($"StartsAt: {license.StartsAt}");
Log.Info($"Roles: {string.Join(", ", license.Roles)}");
```

Link your own data to the stable UserId, not to the display name. If you already have the hub service:

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

The session limit and expiry from ShareSublicenses are handy to show to the user. Listing them does not request a session:

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

Desktop builds up to and including **9298** had a compatible passive path. In newer clients the pack must request a session itself through **ISublicenseManager**. If you only read ShareSublicenses, the key can be visible in the profile while nobody has requested the lease.

The first example is a complete program for **Script.csx inside EyeAuras**. Replace ShareId with the identifier of your own pack. The user must already be signed in and have the matching key. The script watches the state until **Stop**. It does not start or block the product's logic.

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

All the waiting stays **inside** the block. On leaving it, the observer is disposed first and then the lease, even if Run goes on afterwards. For your own protected work, put your code in place of the wait, in the same block. Check IsGranted and react when access is lost. Stop cancels the wait. The objects are also disposed on an exception. Cancelling locally does not confirm that the server freed the slot at once.

Here is another reference variant. EyeAuras owns the lease for the current Run, and the observer is tied to **ExecutionAnchors**. The fragment itself does not keep Run alive, so your awaited work must continue after it:

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
| Rent | Creates one logical session at once and starts background synchronization. This does not yet mean access is granted. |
| IsGranted | The latest known positive grant. Only this allows protected work. Logging a message does not stop the product when access is lost. |
| Status / Message / LastUpdatedAt | The current diagnostic state, its explanation and a timestamp. |
| WhenChanged | Reports the current state and then every change. When access is lost, pause or stop the work that depends on it. |
| Dispose / leaving the block / end of Run | Ends the session locally. It does not confirm that the server released the slot at once. |
| Several Rent calls | Several separate sessions, not repeated checks of one lease. |

EyeAuras ties the lease to the current Run, and ExecutionAnchors above owns your subscription. Do not keep the object from a finished Run as permission for the next launch. The full context is in the [login and licensing contracts](/en/scripting/api/core/login-and-licensing).

If the connection drops for a short time, access that was already granted can be restored from the signed cache while the cache is valid, including after a crash. This is not a full offline mode. Without a suitable cached permission, a new grant may wait for the server. After a crash, the server can keep the old slot occupied for a while.

### Pass the state to ordinary auras

A small script can keep an **IsAuthenticated** aura with **Fixed Value**, or an `isAuthenticated` variable, up to date. The rest of the pack reads that state through Aura Is Active, enabling conditions or bindings. Update it both when access is granted and when it is lost. See [finding an aura](/en/scripting/examples/basic/find-aura) and [Variables](/en/scripting/variables).

A custom UI, [Private Content](/en/features/permission-model), [Packed Only and Binaries Only](/en/features/packs) and [script protection](/en/features/script-protection) each cover a different part of distribution. You still need to request a live lease and handle its state.

</details>
