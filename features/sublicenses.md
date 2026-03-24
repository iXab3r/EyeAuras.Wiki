---
title: Sublicenses
description: Pack access keys for paid packs and mini-apps
published: true
date: 2026-03-24T00:23:40.000Z
tags: 
editor: markdown
dateCreated: 2024-10-07T20:56:26.145Z
---

> Alpha test! Some parts are already working well, some parts are still being finished.
{.is-warning}

# What are sublicenses
Sublicenses are access keys for a **specific pack** or mini-app created by that pack's **author**.

It can be a clicker, a bot, a tool, a helper, or a complete mini-app built for a specific task. The point is simple: you build your own product on top of EyeAuras and decide:

- who gets access
- how much it costs
- how long the key lasts
- how many sessions can run at once
- whether hardware binding is required

From a technical point of view, EyeAuras already allows very deep customization of these products. In practice, you can build something very close to a standalone application that already has automation, updates, protection, licensing, and similar infrastructure built in.

Example: [a mini-app built on top of EyeAuras](https://eyeauras.net/share/S20251105201607zPUUkZryl4CY)

## Important: EyeAuras itself is now free
You do **not** need a separate EyeAuras license in order to use sublicenses.

The platform is now free. Sublicenses exist for **your** paid packs and mini-apps.

## Login by key
To make onboarding easier, EyeAuras supports key-based login without a separate registration flow.

The user just clicks `I have a key`, pastes the key, and EyeAuras automatically creates an account for them. After that, they can use the pack like any other user.

![Auth via key](https://s3.eyeauras.net/media/2025/03/ShareX_829CnImJUb2PaMYZ.png)

# What pack authors get
On the pack page, authors now have a separate block related to licensing.

## Issuing keys
Sublicenses are designed around the idea that **you**, the pack author, distribute your keys however you want.

Right now EyeAuras provides the licensing infrastructure, but it does **not** provide built-in checkout or payment processing. That may change later, but at the moment there are both technical and legal questions around it.

In practice, common options are:

- the simplest option: FunPay, Plati.ru, and similar marketplaces
- the more serious option: your own website or landing page
- for niche products: manual sales through Discord or Telegram

While sublicenses are still in alpha, key issuance still goes through me. The easiest way to reach me is via [contacts](/contacts), usually Discord.

After alpha, key issuance will become automatic. The basic flow will look like this:

- you publish your mini-app or pack
- you issue your first batch of keys
- you distribute them however you want
- if sales go well and you need more keys, you request the next batch via the website
- EyeAuras takes a `15%` commission, which means `85%` stays with the author

The result is simple: if you have not earned anything yet, you do not lose anything either.

## License Settings
This is where you configure **how exactly** licensing should behave for your pack.

Important: changes are **not retroactive**. If you have already issued keys with specific rules, those rules stay as they were. Users need to know that a purchased key will not change behind their back later.

![License Setting](https://s3.eyeauras.net/media/2026/03/msedge_kjbwxZPnYk.png)

### Time tracking
This defines how license time is consumed.

`Calendar` is the classic model. A key is issued for a duration like a week or a month, and time keeps going on its own. If the program is closed, time still passes.

`Consumed` counts only the time while the user is actually using the program. If EyeAuras is closed, time does not pass.

### Freezing keys
The author can temporarily freeze licenses and stop time consumption.

This is useful if something breaks after an update and you need time to fix it. In that case you can freeze the keys, fix the issue, and then unfreeze them. Users do not lose time during downtime.

Important: for `Calendar`, this mode is still being finished. For `Consumed`, it should already work properly.

### Session counting
Every key has a certain number of sessions. By default it is usually `1`.

What counts as a "session" is defined by **you**, the pack author:

- simply the fact that the app is running
- the number of windows
- usage of a specific resource
- any other logic you implement in code

EyeAuras does not invent what a session means for your product. It only tracks and maintains those sessions.

### Hardware binding
You can issue keys that become bound to a specific PC on first use.

If the user wants to use the pack on a different machine, they can:

- buy another key
- or, if you allow it, reset the binding

### License list
For now this is primarily a list of issued licenses and their current state.

Later it will gain better search, filtering, and statistics.

### Connection list
This is useful for tracking online activity and understanding whether your product is currently being used.

The list is **anonymized**. You can see connection facts and technical license state, but not the actual identity of the user.

Later this will also include more growth and activity statistics.

# Keys and activation
## How users get keys
Users do **not** get keys from EyeAuras itself. They get them from the pack author.

The flow is simple:

- the author builds a product
- the author issues keys
- the author sells or gives away those keys
- the user activates the key in EyeAuras

## How to activate a key
There are two common scenarios.

### 1. Bind the key to an existing account
If the user already has an EyeAuras account, they can simply sign in and activate the key in their profile.

![Activate key](https://s3.eyeauras.net/media/2024/08/EyeAuras_PbHuwp3yIoKuEIHy.png)

### 2. Sign in directly with a key
If the user does not have an account yet, they can click `I have a key` and sign in using only the key.

![Authorize](https://s3.eyeauras.net/media/2025/03/ShareX_829CnImJUb2PaMYZ.png)

Both options are valid. The only difference is whether the user already has an account or EyeAuras creates one automatically during sign-in.

## What users see after activation
On the [My Account](https://eyeauras.net/my) page and right in the login window there is now a timeline of activated sublicenses.

There the user can see:

- which packs they have access to
- which licenses are active
- when they expire
- which ones are currently in use

![Login Sublicenses](https://s3.eyeauras.net/media/2026/03/EyeAuras_vKT0Nhnf8z.png)

### User-side freezing
Users can also freeze their own license for an unlimited period of time.

While the license is frozen, time is not consumed.

The number of freezes is limited. The exact value is configured by the pack author, and by default it is usually `1`.

# Two levels of customization
From the sublicensing point of view, authors usually end up in one of two very different scenarios.

## 1. You added scripts or functionality, but the user still works through the normal EyeAuras UI
This is the simplest option.

In this case you usually do **not** need to invent anything special for login:

- the user already has the EyeAuras login window
- key login already exists
- key activation in the profile already exists
- the sublicenses timeline already exists

So you simply add the lease/request logic to your pack, while the user-facing login flow remains handled by EyeAuras itself.

## 2. You build your own custom UI
This is the mini-app or near-standalone-app scenario.

This is usually the **recommended** approach for commercial products because you control the user experience better, and the pack logic and licensing logic are buried much deeper.

There are two sub-variants here:

- a mixed approach: EyeAuras still exists "around" your app, but the user launches your mini-app from a button, a script, or some part of the pack UI
- a fully custom approach: you build your own UI and structure the product as a mini-app, roughly like this: [mini-app example](https://eyeauras.net/share/S20251105201607zPUUkZryl4CY)

The most secure format in the end is a fully custom UI.

## How to add login to your own UI
If you have your own UI, there are two main options.

### Option 1. Use `LoginWidget`
This is the fastest way if you have a Blazor window and do not want to build the login form yourself.

Just place this in your window:

```razor
<LoginWidget/>
```

That way the user can open the standard EyeAuras login flow right from your interface.

### Option 2. Build a fully custom login flow
If you have your own ImGui / Blazor / WPF / any other interface, you can work directly through `IEyeHubService`.

In practice, the operations you usually need are:

- `PerformLogin(username, password)` for standard login with username and password
- `PerformLogin(licenseKey, licenseKey)` for key login without a separate registration flow
- `ActivateLicenseKey(licenseKey)` for attaching an extra key to an already logged-in account
- `ActiveLicense` for the current license state
- `ConnectionState`, `ConnectedFor`, `DisconnectedFor` for connection state

The minimal flow looks like this:

```csharp
var eyeHub = GetService<IEyeHubService>();

var userLicense = await eyeHub.PerformLogin(username, password);
var keyLicense = await eyeHub.PerformLogin(licenseKey, licenseKey); // key login
var updatedLicense = await eyeHub.ActivateLicenseKey(extraLicenseKey); // only for already logged-in user

Log.Info($"Current user: {eyeHub.ActiveLicense.Username}");
Log.Info($"Connection state: {eyeHub.ConnectionState}");
```

In practice this allows you to build your own login screen, your own profile page, your own connection state UI, and avoid showing the standard EyeAuras UI directly to the user.

# For pack authors: update your license-check code
> If you already have a pack that uses sublicenses, read this section carefully.
{.is-warning}

The sublicense validation mechanism has changed **a lot**.

Previously you could just read the list of sublicenses from the current license, for example through `ILicenseAccessor.ShareSublicenses`.

Now, for modern EyeAuras builds, the correct model is different:

- the script **explicitly** requests the sublicense
- EyeAuras keeps that request synchronized with the server in the background
- you receive a `lease` whose state changes over time
- access decisions should be made from the state of that `lease`

## What happens if you do nothing
If you keep the old passive check and **do not** migrate to the new API, behavior will be as follows:

- on old clients before build `9298`, compatibility mode may still make it work
- on newer clients after build `9298`, the sublicense is no longer requested automatically
- if your code never calls the new lease mechanism, EyeAuras will not request access to that pack at all
- as a result, the user may have a **valid purchased key**, but the pack still will not work as expected, because the sublicense was never requested

Short version: for new packs and new client versions, the old approach is no longer enough.

If you want to publish or maintain packs for recent EyeAuras versions, migration to `ISublicenseManager` is mandatory.

## The new way
Now you should use `ISublicenseManager` and request a `lease`.

Minimal example:

```csharp
using var lease = GetService<ISublicenseManager>()
    .Rent(new AuraShareId("S20260209165639iiQZB0NCruAb"));

lease.WhenChanged()
    .Subscribe(x => Log.Info($"Lease changed: {new { x.IsGranted, x.Status, x.Message, x.LastUpdatedAt }}"));
```

The recommended reactive approach is to tie **the subscription** to `ExecutionAnchors`:

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

Important details here:

- `Rent(...)` is non-blocking and returns immediately
- the initial state is usually `Pending`
- EyeAuras continues refreshing the lease in the background
- whenever something changes, `WhenChanged()` fires
- access should only be treated as granted when `lease.IsGranted == true`
- the `lease` itself is already bound to the script lifecycle by EyeAuras; `.AddTo(ExecutionAnchors)` above is for **your subscription**

## Practical rules
### 1. Keep the lease alive for as long as access is needed
One `lease` equals one logical session.

If you dispose the `lease`, that session is considered finished. When the script or pack stops, EyeAuras also releases those sessions automatically.

### 2. Do not make decisions just because `Rent(...)` was called
Calling `Rent(...)` does **not** mean access is already granted.

The real check is `lease.IsGranted` and, if needed, `lease.Status` / `lease.Message`.

### 3. If you need multiple sessions, create multiple leases
Each `Rent(...)` call is a separate session.

### 4. Do not use `ILicenseAccessor.ShareSublicenses` as the main mechanism anymore
You can treat it as a legacy compatibility path, but not as the proper validation model for new packs.

### 5. Semi-Offline, disconnects, and crashes
The current licensing model tries to be as user-friendly as possible.

EyeAuras is not designed to make users lose access every time there is a short disconnect, reconnect, or client restart.

In practice, it works like this:

- a `lease` is not issued forever, only for a limited time
- while the signed offline license is still valid, the client may continue using already granted access
- if the internet connection drops for a while, EyeAuras should not immediately stop the pack
- once the connection comes back, EyeAuras syncs state again

There is another important case: crashes.

If the app or script crashes, the local `lease` may not be released in time, so for a while the server may think that session is still occupied. But for the user this should not turn into "everything died and nothing works anymore."

Because of Semi-Offline mode and the cached signed license, EyeAuras tries to restore already granted access after restart and keep the pack running while that offline grant is still valid.

So the expected behavior is:

- a crash happens
- the user restarts EyeAuras
- the pack requests its `lease` again
- if there is still a valid cached grant, the pack keeps working
- once the client successfully resyncs with the server, the final state is aligned again

Important limits of this mode:

- this is **not** full offline support
- this is Semi-Offline: the goal is to survive temporary network issues, restarts, and crashes without unnecessary pain
- a brand new access grant without the proper cache may still require the next successful server synchronization

## Protection and packaging
For sublicenses, a small script that requests and checks the lease is basically mandatory. And if the product is paid, you usually want to hide that code as deeply as possible.

The recommended settings are:

- `PackDistributionPolicy = PackedOnly`
- `PackScriptCompilationMode = BinariesOnly`
- `PackScriptProtectionMode = PerformanceFirst` or `SecurityFirst`

What this gives you:

- `PackedOnly` means the user only gets the packaged version of the pack
- `BinariesOnly` means the script source is not distributed, only binaries
- `PerformanceFirst` / `SecurityFirst` add protection and obfuscation on top of that

Together, this makes the licensing code much harder to inspect or tamper with.

More details are in [C# Script Protection](/features/script-protection).

Important: at the moment this protection layer is still being tested. To enable it right now, you need access to the alpha group. Once the feature stabilizes, it will become available to everyone.

Even so, it is worth remembering: even with good packing and protection, the safest option is still a fully custom UI and mini-app approach.

## If this is not a mini-app, but a regular pack
Not every paid product needs to be a full mini-app with lots of code.

Sometimes the core functionality is mostly built from:

- auras
- macros
- behavior trees
- standard actions and triggers

In that case, sublicenses are still usually implemented via a small C# script that starts together with the pack, rents the sublicense, and then passes the result into the rest of the logic.

There are two practical options here.

### Option 1. Through a dedicated `IsAuthenticated` aura
The simplest path is to create a dedicated aura, for example `IsAuthenticated`, and keep a `Fixed Value Trigger` inside it.

Then your script watches the `lease` state and simply turns that aura on or off whenever the lease changes.

After that, the rest of the pack can use standard EyeAuras mechanisms:

- `AuraIsActive`
- `Enabling Condition`
- links between auras

That way the licensing logic stays in one small script, while the rest of the automation can continue working almost exactly as before.

If you need to find the target aura from code, use the approach shown here: [How to find an aura](/scripting/examples/basic/find-aura)

### Option 2. Through variables
If you prefer, the authorization state can live in a variable instead of a dedicated aura.

The idea is the same:

- the script rents the sublicense
- when the `lease` changes, it updates a variable like `isAuthenticated`
- the rest of the pack reads that state and decides whether it should run

More details about that approach are here: [Variables](/scripting/variables)

## If you are selling code, hide it
If your licensing logic lives directly inside your script, it makes sense to mark that script as [private](/permission-model), so the user cannot edit or view that code.

# F.A.Q.
## I am a pack author and I want to use sublicenses
Right now there is nothing special you need to "enable."

During alpha, key issuance still goes through me, so just message [me](/contacts).

Later you will be able to issue keys directly on the website without any manual setup in chat.

It is better if you already have a pack or a mini-app ready and it is clear what exactly you are distributing. If the product is private, that is also fine; a public page is not required.

## Where can I sell keys
Anywhere. EyeAuras does not limit your sales channel.

Common options are:

- Discord / Telegram manually
- FunPay / Plati.ru
- your own website

## Does the user need a separate EyeAuras license
No. EyeAuras is now free.

The user pays only for your product, if you choose to sell access through sublicenses.

## Can I change the rules for keys that were already issued
No, not retroactively.

New settings affect only **new** keys. Already issued keys should stay exactly as they were at the time of purchase.

## What does the `Pending` status mean
It means EyeAuras has already requested access, but the background license refresh has not finished yet.

This is usually a normal startup state.

## What happens on disconnect or crash
Usually the current model tries to preserve already granted access and avoid bothering the user for small interruptions.

If there is a short disconnect, EyeAuras will try to continue working on the already signed license and resync with the server later.

If there is a crash, after restart the pack should usually continue working as long as the client still has a valid cached offline license for that access.

But the important detail is: this is Semi-Offline, not full offline. If the proper cache is missing, a fresh grant still has to come from the server.

## Do old packs need to be updated
Yes, if you want them to work reliably on newer EyeAuras versions.

If the pack still checks access the old way and never calls `ISublicenseManager.Rent(...)`, a user with a valid purchased key may still fail to get access on modern clients.
