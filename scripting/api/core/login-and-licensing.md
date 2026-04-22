---
title: Login And Licensing
description: AI-first map of EyeAuras login, key login, license projection, and sublicense lease APIs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, login, licensing, sublicenses
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Login And Licensing Discovery Map

Reference map for building custom login/profile/licensing UI in scripts,
Blazor windows, mini-apps, and pack products.

## User Intents

- Add the standard EyeAuras login button to a custom Blazor window.
- Build a fully custom login screen with username/password and key login.
- Show current account, license, expiration, role, and hub connection state.
- Let an already logged-in user activate an extra license key.
- Gate a paid pack or mini-app through modern sublicense leases.
- Understand how `ILicenseAccessor`, `IEyeHubService`, and
  `ISublicenseManager` relate.

## Concept Model

- EyeAuras can run in free mode; a normal EyeAuras license is not required just
  to use the platform.
- An EyeAuras account can authenticate by username/password.
- Key login is a shortcut for users who only have a license key. The client
  calls login with the key as both username and password; the server resolves
  or creates the key-bound user account.
- Activating a key on an existing account is separate from key login. Use
  `ActivateLicenseKey(...)` only after the user is already logged in.
- `ILicenseAccessor` is the current local projection of the active signed
  license and user identity. It is the right object for profile/status UI.
- Sublicenses are pack-author access grants for a specific share or mini-app.
  Modern paid packs should request an explicit runtime lease with
  `ISublicenseManager.Rent(...)`.
- A sublicense key being present on an account is not the same thing as an
  active runtime session. Access decisions should be based on the lease state.

## Host / Runtime Contexts

- In Blazor product windows, use `LoginWidget` when the standard EyeAuras login
  popup is enough.
- In fully custom Blazor, ImGui, WPF, or script UI, inject/use
  `IEyeHubService` for login/logout/key activation operations and
  `ILicenseAccessor` for live display state.
- In scripts that need paid-pack access, resolve `ISublicenseManager` from the
  script container and keep the returned `ISublicenseLease` alive for as long
  as that logical session should consume access.
- `ISublicenseManager.Rent(...)` is intended for active script execution. The
  returned lease is attached to the script execution lifetime by EyeAuras, but
  your subscriptions to `WhenChanged()` should still be anchored/disposed.

## API Details

- `IEyeHubService` (`EyeAuras.Loader.Shared.Services`) provides:
  `HubAddress`, `ActiveLicense`, `ConnectionState`, connection timing,
  `PerformLogin(username, password)`, `PerformLogout()`, `RefreshToken()`, and
  `ActivateLicenseKey(licenseKey)`.
- `ILicenseAccessor` (`EyeAuras.Loader.Shared.Api`) implements
  `IUserLicense` and `INotifyPropertyChanged`. It exposes `IsValid`,
  `Username`, `UserId`, `Roles`, `LicenseType`, `StartsAt`, `ExpiresAt`,
  `ProductFeatures`, `ShareSublicenses`, `GetAttribute(key)`, and
  compatibility-only `ActiveLicense`.
- `IUserLicense` is the common license projection returned from hub operations
  and exposed through `IEyeHubService.ActiveLicense`.
- `LoginWidget` (`EyeAuras.Blazor.Controls`) is a ready-made Blazor control
  that opens the standard EyeAuras login popup.
- `ISublicenseManager` (`EyeAuras.Loader.Shared.Api`) creates live runtime
  sublicense lease intents with `Rent(AuraShareId shareId)`.
- `ISublicenseLease` exposes `LeaseId`, `ShareId`, `IsGranted`, `Status`,
  `Message`, `LastUpdatedAt`, and `WhenChanged()`.

## Common Flows

### Ready-made Blazor login

Use this when your window can use the standard EyeAuras login popup:

```razor
<LoginWidget/>
```

The widget reflects `ILicenseAccessor.Username` and opens the host login UI.

### Username/password login

```csharp
var eyeHub = GetService<IEyeHubService>();
var licenseAccessor = GetService<ILicenseAccessor>();

var license = await eyeHub.PerformLogin(username.Trim(), password);
Log.Info($"Logged in as {licenseAccessor.Username}");
```

### Key login

```csharp
var eyeHub = GetService<IEyeHubService>();

var key = licenseKey.Trim();
var license = await eyeHub.PerformLogin(key, key);
```

Key login is expected to use the same key value for both arguments. On the
server side, this identifies a license-key login and resolves or creates the
key-bound user. Do not log the raw key.

### Activate an extra key for an existing user

```csharp
var eyeHub = GetService<IEyeHubService>();

var updatedLicense = await eyeHub.ActivateLicenseKey(extraLicenseKey.Trim());
```

Use activation when the user is already logged in and wants to attach another
key to that account. Use key login when the key itself is the login credential.

### Profile/status display

```csharp
var licenseAccessor = GetService<ILicenseAccessor>();
var eyeHub = GetService<IEyeHubService>();

Log.Info($"User: {licenseAccessor.Username}");
Log.Info($"License: {licenseAccessor.LicenseType}, valid: {licenseAccessor.IsValid}");
Log.Info($"Expires: {licenseAccessor.ExpiresAt}");
Log.Info($"Hub: {eyeHub.ConnectionState}");
```

In reactive UI, observe `ILicenseAccessor.PropertyChanged` or use
`WhenAnyValue(...)` against `ILicenseAccessor` properties.

### Paid pack / mini-app access lease

```csharp
var sublicenseManager = GetService<ISublicenseManager>();
var lease = sublicenseManager.Rent(new AuraShareId("S20260209165639iiQZB0NCruAb"));

lease.WhenChanged()
    .Subscribe(x =>
    {
        if (!x.IsGranted)
        {
            Log.Warn($"Sublicense is not granted: {x.Status} / {x.Message}");
            return;
        }

        Log.Info("Sublicense granted");
    })
    .AddTo(ExecutionAnchors);
```

`Rent(...)` is non-blocking. The initial state is usually pending, and the
lease updates in the background. Treat access as granted only when
`ISublicenseLease.IsGranted` is true.

## Custom Login UI Checklist

- Track a busy state so repeated clicks do not run overlapping login requests.
- Validate the selected mode: username/password for account login, license key
  for key login.
- Trim usernames and keys. Do not trim passwords unless your own UX explicitly
  requires it.
- For key login, call `PerformLogin(key, key)`.
- Clear password/key fields after successful login.
- Show errors from the login operation in the local UI.
- Read profile and license display from `ILicenseAccessor`, not from copied
  login form state.
- If the product is paid, request a sublicense lease after login or at product
  startup and base access on `lease.IsGranted`.

## Assembly / Package Hints

- `EyeAuras.Loader.Shared` contains `IEyeHubService`, `ILicenseAccessor`,
  `IUserLicense`, `ISublicenseManager`, and `ISublicenseLease`.
- `EyeAuras.Blazor.Controls` contains `LoginWidget`.
- `EyeAuras.Shared` contains `AuraShareId`.

## Prefer

- Prefer `LoginWidget` when the standard host login flow is acceptable.
- Prefer `IEyeHubService.PerformLogin(key, key)` for custom key-login screens.
- Prefer `IEyeHubService.ActivateLicenseKey(...)` for attaching an extra key to
  an already logged-in account.
- Prefer `ILicenseAccessor` for current profile/license display.
- Prefer `ISublicenseManager.Rent(...)` for modern paid pack or mini-app
  authorization.

## Avoid

- Avoid logging raw license keys, passwords, signed licenses, or bearer tokens.
- Avoid treating `ILicenseAccessor.ActiveLicense` as the normal public API. It
  is compatibility-only signed license material.
- Avoid using `ILicenseAccessor.ShareSublicenses` as the primary authorization
  mechanism for new paid packs. Use `ISublicenseLease`.
- Avoid assuming a successful key activation automatically means a runtime
  sublicense session is granted. Request and check a lease.
- Avoid blocking startup forever while waiting for a lease; show pending state
  and react to `WhenChanged()`.

## Research Anchors

- `IEyeHubService`
- `ILicenseAccessor`
- `IUserLicense`
- `LoginWidget`
- `ISublicenseManager`
- `ISublicenseLease`
- `AuraShareId`
- `EyeLicenseType`
- `SublicenseLeaseGrantStatus`

## Search Synonyms

- login
- custom login
- key login
- license key login
- activate license key
- account profile
- current user
- current license
- license accessor
- active license
- sublicense
- sublicense lease
- rent license
- paid pack access
- mini-app licensing
- semi-offline license

## Related Maps

- `core/deployment.md`
- `core/blazor.md`
- `core/app-runtime-contexts.md`
- `scripting/runtime.md`
- `scripting/reactive-lifetime.md`
- `scripting/references-and-resources.md`
- `../../../features/keylogin.md`
- `../../../features/sublicenses.md`
