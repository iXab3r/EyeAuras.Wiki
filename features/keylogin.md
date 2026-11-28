---
title: Key Login
description: How to sign in to EyeAuras with a license key, without a separate registration
published: true
date: 2025-03-31T00:31:44.217Z
tags: 
editor: markdown
dateCreated: 2025-03-31T00:31:44.217Z
---
# Sign in with a key you received

If a pack author gave you a key and offers sign-in by key, you do not have to register separately. EyeAuras sends the key to the sign-in service. The service finds the account linked to the key, or creates one the first time the key is allowed to be used.

You need your own valid key, access to the EyeAuras server and a compatible version of the app. The key is a secret. Do not publish it and do not put it into aura settings you plan to share.

1. Open the sign-in window from the connection or user information in EyeAuras.
2. Choose **Sign in with key**. In the older UI the link was called **I have a key**.
3. Paste your key into **License key** and click **Login with key**. Do not type it twice into the ordinary **Username** and **Password** fields. That is a different way to sign in.
4. Wait for the result. You are signed in when the app shows the account name and its profile. The server connection indicator alone is not enough.
5. Open your license information, find the pack you need and start it as usual.

![Key-based sign-in in the older Login window](https://s3.eyeauras.net/media/2025/03/ShareX_829CnImJUb2PaMYZ.png)

## Choose the right route

| Goal | Route |
| --- | --- |
| I have a key for my first sign-in | Sign in with key → License key → Login with key. The service can create the account automatically. |
| I already have an account and one more unused key | Sign into that account and click **Activate Key / Activate key** in its profile. The key is bound to the current user and no second account is created. |
| I want to register normally | [Create account](https://eyeauras.net/register), then sign in. |
| I want to see my linked keys and profile | The app's profile window or [My Account](https://eyeauras.net/my). |
| Do not keep me signed in between launches | Turn off **Remember sign-in** in settings. You will have to sign in again after a restart. |

A key is bound to an account when it is activated. Entering an already activated key on another account does not free it. An automatically created name usually looks like `User-…`. It is a normal permanent account, not a one-time session.

For an account first created from a key, the key is the initial sign-in secret. If you changed the password, sign in with the new details and do not count on the old key as a permanent password.

The pack's license sets how long access lasts and on what terms. Binding to an account and binding a license session to a PC are two different things. If access has expired, is frozen or is in use, signing in again will not extend the key or lift the limit. What these states mean is explained in [Sublicenses](/en/features/sublicenses).

To add sign-in to your own panel, take the complete [LoginWidget window example](/en/scripting/examples/advanced/window-login-widget). It has two files. They show the account button and keep the script's window open until it is closed or you press Stop. Check that button first, then connect your own pack access logic.

Do not assume a user has access just because there is a username.
