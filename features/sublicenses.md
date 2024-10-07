---
title: Sublicenses
description: 
published: true
date: 2024-10-07T20:56:26.145Z
tags: 
editor: markdown
dateCreated: 2024-10-07T20:56:26.145Z
---

> **Alpha-test! Attention! Achtung! Atención! Attention 注意 انتباه Atenção Attenzione**
> {.is-warning}

# What are licenses for packs (a.k.a. sub-licenses)?
**You**, as users of the program, get the ability to issue **your own** license keys, which grant someone access to **your** specific aura pack. You **issue** them yourself (soon), **distribute** them yourself, and set the price, and you **communicate** with your users directly. 
In essence, this gives **you** (the pack author) control over who and how they use the results of your work. The platform will oversee this process with the same mechanisms it uses to manage its own licenses, and of course, I will pay additional attention to security in the next six months.

## Key-based authorization
To simplify working with new users, the program now supports login without registration. All you need to do is enter a key, and that's it – the system will automatically create a new user and assign that key to them. These users are indistinguishable from "regular" users, except for having a strange username, and they have the same features. The idea is that users who enter the program with a key are not particularly interested in the program itself; they are mainly interested in the product created using it. Therefore, there is no need to force them to register, etc. If they like it, they can later change their username (which currently looks like `user123123123123`) and dive deeper into the infrastructure.

![Auth via key](https://s3.eyeauras.net/media/2024/08/EyeAuras_U9gCDJGiIGaWEQDV.png)

## Regarding key activation and issuance
For now, the process is as manual as it gets – you message [me](https://wiki.eyeauras.net/en/contacts) saying something like, "I need 10-15-20 keys for this pack." I press the buttons, issue the keys, and hand them over to you.
What happens next with them is entirely **your** business.

In the foreseeable future, once the system stabilizes, a mini-admin panel will appear on the pack page, where you can see the issued keys and generate them yourself, but this is likely a **2025** feature. For now, let’s socialize! :-D

# F.A.Q.

## I’m a pack author, and I want this!
Message [me](https://wiki.eyeauras.net/en/contacts) – we’ll set everything up. Before that, please configure your pack page so that people can see what it’s about. 
Here are some examples from `@linqse`:
- https://eyeauras.net/share/S20240628015518RjpkU2Sdkh5I
- https://eyeauras.net/share/S20240710235018df4VPCkM0Wan

p.s. If you're distributing something highly private, you can skip the page.

## What types of keys are there, and what can be configured?
A key has several characteristics:
- **Duration**: Simply the time for which the key grants access to your pack. The minimum is 1 day.
- **Number of computers**: How many machines can run the pack simultaneously.
- **Number of sessions**: How many instances of the pack can run simultaneously. For example, if **one** computer has **three** instances of the program running with your pack, that counts as **3** sessions. If **three** computers have **one** instance of the pack running each, that also counts as **3** sessions.

At this stage, we won’t limit **sessions** and **computers** – all issued keys will support unlimited sessions. Once the tracking mechanism stabilizes (let's give it a couple of months), you’ll be able to set limits on the number of computers. Finally, limits on the number of sessions will also be introduced later.

## How do I activate the keys?
Once someone receives the desired key, they can:
1) Bind it to their account.
![Activate key](https://s3.eyeauras.net/media/2024/08/EyeAuras_PbHuwp3yIoKuEIHy.png)
2) Log in directly using the key.
![Authorize](https://s3.eyeauras.net/media/2024/08/EyeAuras_U9gCDJGiIGaWEQDV.png)

A key can be used in one way or the other, but not both.

## How can I check if a user has access to my pack?
For the next **~month**, the system **will not** control access to auras – everything will work as it has so far.
As a pack author, you can add the following code – it retrieves the current license, checks for sub-licenses, and verifies if your pack is included.
```csharp
var hasSublicense = GetService<EyeAuras.Loader.Shared.Api.ILicenseAccessor>()
    .ShareSublicenses
    .Any(x => "<your-share-id, e.g. S20240710235018df4VPCkM0Wan>" == x.ShareId);
```

You can also use a reactive approach – this way, as soon as the license is updated (for any reason), you’ll be notified immediately.

```GetService<EyeAuras.Loader.Shared.Api.ILicenseAccessor>()
    .WhenAnyValue(x => x.ShareSublicenses) // subscribe to license updates
    .Select(x => x.Any(y => "<your-share-id, e.g. S20240710235018df4VPCkM0Wan>" == y.ShareId)) 
    .Subscribe(hasAccess => Log.Info($"User has access: {hasAccess}"))
    .AddTo(Anchors);
```
You can apply the Private permission to this script to specify that the user should not have access to edit or view this code.

Once we fine-tune the release/delivery/activation mechanism, the next phase will involve automating this process, and the script will no longer be necessary. {.is-info}

## How is the main program license related to sub-licenses?
Technically, these are two completely separate things, and you can issue keys in three ways:
- A license for the main program, which grants access to more auras, etc.
- Sub-licenses that grant access to a specific pack.
- Any combination of the main program license plus any number of sub-licenses.

For now, for convenience, issued sub-licenses will include both the main program license and the sub-license, meaning that the user only needs one key to start using your pack fully.

## Financial aspect
For the user, the price of a key consists of two parts:
- The program price (~$5, set by me).
- The pack price (set by the author).

At this stage, I personally know the pack authors interested in sub-licenses, so we’ll figure everything out in the chat – we will still need a few months to coordinate key issuance. You take the sub-keys, distribute them however you prefer. If everything goes well, feel free to come back for more.

Next year, I’ll do my best to automate this process as much as possible.


