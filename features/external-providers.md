---
title: Sign in with Google, Twitch, and Discord
description: Sign in to EyeAuras with a familiar service while keeping your account
published: true
date: 2026-09-02T00:00:00.000Z
tags: sign-in, account, google, twitch, discord, ai-translated
editor: markdown
dateCreated: 2026-09-02T00:00:00.000Z
---

# Use another service to sign into EyeAuras

You can sign into EyeAuras through an available service such as Google, Twitch or Discord. Enter that service's password on its own site; the desktop app receives an EyeAuras session, rather than your provider password. These are **account sign-in methods**, not AI model providers. The site's configuration determines which buttons are available.

If your EyeAuras account already holds licenses or history, link the service to that account first. Signing in through an unlinked identity can create a different account.

## Link your existing account first

1. Sign into [EyeAuras](https://eyeauras.net/my) using your existing method and open `Profile`.
2. In its sign-in methods, choose an available service and its linking action. Confirm your own account on that service's site.
3. Back in the profile, check that the service is linked to the intended EyeAuras account.
4. Open `Login` in the app and choose that service. Complete browser sign-in and confirm the application's request.
5. Return to EyeAuras and check the account name and existing licenses. If they differ, check the profile link before making further account changes.

The illustration shows Google, Discord and Twitch below the username and password fields. A differently configured site may offer a different selection.

![EyeAuras login with Google, Discord and Twitch](https://s3.eyeauras.net/media/2026/09/NVIDIA_Overlay_xSXrW6oAuy.png =x600)

For a new user, provider sign-in can create an EyeAuras account without a separate registration. Automatic email linking requires the site option to be enabled, a verified address and one matching account. Ambiguous matches are not merged. If an address is occupied and safe linking is unavailable, sign into the existing account and link the service in `Profile`.

| Sign-in method | What it uses |
| --- | --- |
| An available provider button | The selected external identity and its link to your EyeAuras account. |
| `Sign in with browser` | An EyeAuras website session, if present, followed by confirmation of the app's request. |
| EyeAuras username and password | EyeAuras credentials, rather than the external service's password. |
| `Sign in with key` | The separate [license-key login](/en/features/keylogin) route. |

A new sign-in needs network access to EyeAuras and the selected service. Saved application login data uses Windows protection. If `Login` closes while the browser opens, reopen it to continue or cancel the pending request. Start a new request after expiry or an app restart.

## Sign out or change accounts

`Logout` ends the **app** session. Browser sessions for the EyeAuras website and the external provider are separate. To change users, select the intended website account and, if necessary, provider account before starting app sign-in again.

The profile has a separate confirmed unlink action when permitted for the current session. Keep another available way to sign in before unlinking. Removing the link does not change the external service's password.

<details>
<summary>Create, change or recover an EyeAuras password</summary>

If you know your current EyeAuras password, change it in `Profile` using the current and new values. Sign in again afterwards.

If you have no password or have forgotten it:

1. Open `Password` in `Profile`; for an existing password, choose `Forgot this password?`.
2. Use `Confirm your linked … account` with a service that is already linked and currently available.
3. After returning, separately click `Create password` or `Reset password`. Provider confirmation alone does not create a password; `Cancel` abandons the preparation.
4. Save the displayed `Username` and generated password, then select `I've saved it`. It is shown only in that response, but remains a reusable login password, not a one-time code. Do not substitute a guessed provider email for the displayed username.

Reset replaces the old EyeAuras password and requires sign-in again; provider links remain. Restart an expired confirmation from the profile. If no linked service is available, use an existing sign-in method. This section does not rename your username.

</details>
