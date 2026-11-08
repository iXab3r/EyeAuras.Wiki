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
- Add browser sign-in to custom UI when supported by the host and server.
- Show current account, license, expiration, role, and hub connection state.
- Let an already logged-in user activate an extra license key.
- Gate a paid pack or mini-app through modern sublicense leases.
- Understand how `ILicenseAccessor`, `IEyeHubService`, and
  `ISublicenseManager` relate.

## Concept Model

- EyeAuras can run in free mode; a normal EyeAuras license is not required just
  to use the platform.
- An EyeAuras account can authenticate by username/password.
- Browser sign-in uses the website to authorize the desktop session. A browser
  session can be remembered across restarts; explicit password login does not
  save the password or automatically repeat that login on restart.
- Key login is a shortcut for users who only have a license key. The client
  calls `LoginWithLicenseKey(key)`; the server resolves
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
- For custom browser sign-in UI, resolve `IBrowserAuthenticationService` from
  the host container. Ordinary helper classes receive it through injection;
  top-level script helpers are not global APIs available to every C# class.
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
- `IBrowserAuthenticationService` (same namespace) provides `State`,
  `StartBrowserLogin()` and `CancelBrowserLogin()`, with
  `INotifyPropertyChanged` notifications. It owns the operation independently
  of the UI lifetime; it does not open the system browser itself.
- `BrowserAuthenticationState` exposes `Status`, `VerificationUri`,
  `VerificationUriComplete`, `UserCode`, `ExpiresAt` and `Error`.
  `BrowserAuthenticationStatus` describes the operation, while
  `BrowserAuthenticationError` supplies presentation categories. Accepted
  account/license identity still comes from `ILicenseAccessor`.
- `ILicenseAccessor` (`EyeAuras.Loader.Shared.Api`) implements
  `IUserLicense` and `INotifyPropertyChanged`. It exposes `IsValid`,
  `Username`, `UserId`, `Roles`, `LicenseType`, `StartsAt`, `ExpiresAt`,
  `ProductFeatures`, `ShareSublicenses`, `GetAttribute(key)`, and
  compatibility-only `ActiveLicense`.
- `IUserLicense` is the common license projection returned from hub operations.
  `IEyeHubService.ActiveLicense` publishes a new snapshot when the signed license
  changes and raises `PropertyChanged`. Observe it with
  `eyeHub.WhenAnyValue(x => x.ActiveLicense)` to refresh profile and sublicense
  display data. A previously returned snapshot keeps its original values.
- `LoginWidget` (`EyeAuras.Blazor.Controls`) is a ready-made Blazor control
  that opens the standard EyeAuras login popup.
- `ISublicenseManager` (`EyeAuras.Loader.Shared.Api`) creates live runtime
  sublicense lease intents with `Rent(AuraShareId shareId)`.
- `ISublicenseLease` exposes `LeaseId`, `ShareId`, `IsGranted`, `Status`,
  `Message`, `LastUpdatedAt`, and `WhenChanged()`.

## Prepare the host and form inputs

The `GetService` examples run inside an EyeAuras script with loader services.
Razor uses `@inject`; ordinary classes receive constructor dependencies. A
reference to `EyeAuras.Loader.Shared` does not register these services in an
arbitrary host. Relevant namespaces are `EyeAuras.Loader.Shared.Services`,
`EyeAuras.Loader.Shared.Api` and `EyeAuras.Shared.Sharing`.

`username`, `password`, `licenseKey` and `extraLicenseKey` are user-supplied form
values, not literals to save in code or logs. Await the operation, display errors
in the form and observe `ILicenseAccessor` after success. Public hub methods have
no `CancellationToken` parameter; closing the form does not cancel them. Marshal
UI updates through the owning dispatcher.

`PerformLogin` authenticates account credentials; `LoginWithLicenseKey` uses the
separate key flow. `ActivateLicenseKey` requires an accepted session and refreshes
within that same session. These paths are checked in source `c8b2304`, not by a
live login or license activation.

## Common Flows

### Ready-made Blazor login

Use this when your window can use the standard EyeAuras login popup:

```razor
<LoginWidget/>
```

The widget reflects `ILicenseAccessor.Username` and opens the host login UI.

### Custom browser sign-in

1. Observe `IBrowserAuthenticationService.State` and await
   `StartBrowserLogin()`. Completion means the challenge is ready, not that
   the user has signed in. Expected failures are reported through `State`;
   repeated starts reuse a pending challenge.
2. For `AwaitingAuthorization`, explicitly open `VerificationUriComplete`
   from the custom UI, or present `VerificationUri` with `UserCode`. Runtime
   polling continues without the UI implementing its own polling loop.
3. React to the operation state and use `ILicenseAccessor` for the accepted
   account/license. Do not treat a displayed challenge or a successful browser
   launch as successful authentication.

Hiding or disposing the popup does not cancel sign-in. Call
`CancelBrowserLogin()` only for an explicit cancel action; dispose the UI's
own subscriptions when it closes. Use `IEyeHubService.PerformLogout()` to
leave an accepted session, including before switching browser accounts.
Browser failure does not automatically invoke password or key login.

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
var license = await eyeHub.LoginWithLicenseKey(key);
```

Use `LoginWithLicenseKey` for this flow. At source `c8b2304`,
`PerformLogin(key, key)` takes the account-password path instead. The server
resolves or creates the key-bound user; do not log the raw key.

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

This observes status in an already running script. Replace the share ID with your
published pack's ID. The block does not await a grant or keep Run alive: follow it
with awaited work or [wait until Stop](/en/scripting/api/scripting/async), otherwise
execution cleanup immediately removes the subscription. Do not start protected
work before `IsGranted`; stop it if access is later lost. Logging status alone does
not implement that enforcement.


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

Creating or releasing a lease triggers forced background server synchronization,
including when a lease is created during initial startup synchronization.
`IUserLicense.ShareSublicenses` contains the sublicenses included in the effective
signed XML license. Cached signed summaries can restore a granted lease before
fresh XML metadata arrives. If an expiration is unavailable, keep observing
`IEyeHubService.ActiveLicense` and reread it after synchronization; use the lease
state for access decisions.

## Custom Login UI Checklist

- Track a busy state so repeated clicks do not run overlapping login requests.
- Validate the selected mode: username/password for account login, license key
  for key login.
- Trim usernames and keys. Do not trim passwords unless your own UX explicitly
  requires it.
- For key login, call `LoginWithLicenseKey(key)`.
- Clear password/key fields after successful login.
- Do not persist explicit passwords or browser challenges. Clear sensitive
  form fields when an attempt ends or the UI closes.
- Show errors from the login operation in the local UI.
- Read profile and license display from `ILicenseAccessor`, not from copied
  login form state.
- If the product is paid, request a sublicense lease after login or at product
  startup and base access on `lease.IsGranted`.

## Assembly / Package Hints

- `EyeAuras.Loader.Shared` contains `IEyeHubService`, `ILicenseAccessor`,
  `IUserLicense`, `IBrowserAuthenticationService`, `BrowserAuthenticationState`,
  `BrowserAuthenticationStatus`, `BrowserAuthenticationError`,
  `ISublicenseManager`, and `ISublicenseLease`.
- `EyeAuras.Blazor.Controls` contains `LoginWidget`.
- `EyeAuras.Shared` contains `AuraShareId`.

## Prefer

- Prefer `LoginWidget` when the standard host login flow is acceptable.
- Prefer `IEyeHubService.LoginWithLicenseKey(key)` for custom key-login screens.
- Prefer `IEyeHubService.ActivateLicenseKey(...)` for attaching an extra key to
  an already logged-in account.
- Prefer `ILicenseAccessor` for current profile/license display.
- Prefer `ISublicenseManager.Rent(...)` for modern paid pack or mini-app
  authorization.

## Avoid

- Avoid logging raw license keys, passwords, signed licenses, or bearer tokens.
- Avoid logging browser verification URLs or user codes.
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
- `IBrowserAuthenticationService`
- `BrowserAuthenticationState`
- `BrowserAuthenticationStatus`
- `BrowserAuthenticationError`
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
- browser sign-in
- device authorization
- remembered browser session
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

- [core/deployment.md](/en/scripting/api/core/deployment)
- [core/blazor.md](/en/scripting/api/core/blazor)
- [core/app-runtime-contexts.md](/en/scripting/api/core/app-runtime-contexts)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [scripting/reactive-lifetime.md](/en/scripting/api/scripting/reactive-lifetime)
- [scripting/references-and-resources.md](/en/scripting/api/scripting/references-and-resources)
- [../../../features/keylogin.md](/en/features/keylogin)
- [../../../features/sublicenses.md](/en/features/sublicenses)

## Lease ownership in the current script host

The script visitor registers `SublicenseManager`; `Rent` requires active
`ExecutionAnchors`. Every call creates a new local lease, initially `LeasePending`,
and attaches it to the current Run. `WhenChanged` replays current state. Run
completion disposes the lease; explicit earlier disposal removes the local intent,
marks it released and schedules background synchronization. This is not an awaited
server release acknowledgement. Dispose your own observer as well. Keep the lease
for the protected operation's lifetime; do not cache it as authority for a later Run.

[Hub operations](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Loader/Services/EyeHubService.cs),
[script lease owner](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Loader/Services/SublicenseManager.cs),
[lease registry](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Loader/Services/SublicenseLeaseRegistry.cs).
