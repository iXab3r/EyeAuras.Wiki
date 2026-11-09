---
title: Key Login
description: Sign in to EyeAuras with a license key
published: true
date: 2025-03-31T00:31:44.217Z
tags: 
editor: markdown
dateCreated: 2025-03-31T00:31:44.217Z
---
# Sign in with a key you received

If a pack author gives you a key and offers key-based sign-in, you do not need to fill out a separate registration form first. EyeAuras sends the key to the sign-in service, which finds its associated account or creates one on its first permitted use. Check the resulting account and access to the intended pack.

You need your own valid key, access to the EyeAuras server and a compatible application version. The key is a sign-in secret: keep it out of public descriptions and aura settings you distribute.

1. Open the sign-in window from the connection or user information in EyeAuras.
2. Choose **Sign in with key**. The older UI calls this **I have a key**.
3. Enter your key in **License key** and click **Login with key**. Do not enter it twice in the ordinary **Username** and **Password** fields: that is a different sign-in route.
4. Wait for the result. An accepted username and profile indicate sign-in; a server connection indicator alone does not. An error means sign-in has not succeeded.
5. Open your license information and find the intended pack, then follow its launch instructions. Sign-in does not bypass expiry, session limits or PC binding.

The image shows the older **I have a key** link and sign-in entry point. Use the current labels in the steps above.

![Key-based sign-in in the older Login window](https://s3.eyeauras.net/media/2025/03/ShareX_829CnImJUb2PaMYZ.png)

## Choose the right route

| Goal | Route |
| --- | --- |
| First sign-in with a key | Sign in with key → License key → Login with key. The service can create the account automatically. |
| Add an unused key to an existing account | Sign into that account and use **Activate Key / Activate key** in its profile. This binds the key to the current user instead of creating another account. |
| Register normally | [Create account](https://eyeauras.net/register), then sign in. |
| Inspect linked keys and profile | The application's profile window or [My Account](https://eyeauras.net/my). |
| Avoid retaining sign-in between launches | Turn off **Remember sign-in** in settings. Sign in again after restarting. |

Activation binds the key to an account. Entering an activated key elsewhere does not make it unassigned. Automatically created names commonly look like `User-…`; such an account is not a disposable temporary session.

For an account first created from a key, the key supplies the initial sign-in secret. If you change the password, use the current credentials rather than expecting the old key to remain a permanent password. Account management is available in the profile.

The product's license determines its duration and conditions. Account binding and a license session's PC binding are separate. Signing in again does not extend expired access, unfreeze it or release an occupied session. See [Sublicenses](/en/features/sublicenses) for these states.

For a custom pack interface, use the supported sign-in flow or LoginWidget. A username alone is not an access decision; the same guide describes the technical options.
