---
title: Вход и лицензирование
description: Карта API EyeAuras для входа, входа по ключу, проекции лицензий и аренды сублицензий.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, login, licensing, sublicenses, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта логина и лицензирования

Опорная карта для сборки собственного UI логина, профиля и лицензирования в скриптах, Blazor-окнах, mini-apps и pack-продуктах.

## Что обычно нужно сделать

- Добавить стандартную кнопку логина EyeAuras в кастомное окно Blazor.
- Собрать полностью кастомный экран входа с username/password и key login.
- Показать текущий аккаунт, лицензию, срок действия, роль и состояние подключения к hub.
- Дать уже вошедшему пользователю возможность активировать дополнительный ключ лицензии.
- Ограничить доступ к платному pack или mini-app через современные sublicense leases.
- Понять, как связаны `ILicenseAccessor`, `IEyeHubService` и `ISublicenseManager`.

## Как это устроено

- EyeAuras может работать в бесплатном режиме. Обычная лицензия EyeAuras не требуется просто для использования платформы.
- Аккаунт EyeAuras может авторизоваться по username/password.
- Key login — это сокращенный вариант для пользователей, у которых есть только лицензионный ключ. Клиент вызывает логин, передавая ключ и как username, и как password; дальнейшее связывание ключа с аккаунтом определяется сервером.
- Активация ключа в уже существующем аккаунте — это отдельный сценарий, не key login. Используйте `ActivateLicenseKey(...)` только после того, как пользователь уже вошел в систему.
- `ILicenseAccessor` — это текущая локальная проекция активной подписанной лицензии и identity пользователя. Это правильный объект для UI профиля и статуса.
- Sublicenses — это выдаваемые автором pack права доступа для конкретного share или mini-app. Современные платные packs должны запрашивать явный runtime lease через `ISublicenseManager.Rent(...)`.
- Наличие sublicense key в аккаунте — это не то же самое, что активная runtime-сессия. Решения о доступе нужно принимать по состоянию lease.

## Контексты хоста и runtime

- В Blazor-окнах продукта используйте `LoginWidget`, если достаточно стандартного popup логина EyeAuras.
- В полностью кастомном UI на Blazor, ImGui, WPF или в скриптах внедряйте и используйте `IEyeHubService` для операций login/logout/activation key, а `ILicenseAccessor` — для живого отображения состояния.
- В скриптах, которым нужен доступ к paid pack, получайте `ISublicenseManager` из script container и держите возвращенный `ISublicenseLease` живым столько, сколько эта логическая сессия должна потреблять доступ.
- `ISublicenseManager.Rent(...)` предназначен для активного выполнения скрипта. В поддерживающем этот сценарий host lease связан с выполнением скрипта; ваши подписки на `WhenChanged()` все равно нужно правильно привязать и освобождать.

## Детали API

- `IEyeHubService` (`EyeAuras.Loader.Shared.Services`) предоставляет:
  `HubAddress`, `ActiveLicense`, `ConnectionState`, connection timing,
  `PerformLogin(username, password)`, `PerformLogout()`, `RefreshToken()` и
  `ActivateLicenseKey(licenseKey)`.
- `ILicenseAccessor` (`EyeAuras.Loader.Shared.Api`) реализует
  `IUserLicense` и `INotifyPropertyChanged`. Он предоставляет `IsValid`,
  `Username`, `UserId`, `Roles`, `LicenseType`, `StartsAt`, `ExpiresAt`,
  `ProductFeatures`, `ShareSublicenses`, `GetAttribute(key)` и
  совместимый только для compatibility `ActiveLicense`.
- `IUserLicense` — это общая проекция лицензии, которая возвращается из hub-операций и доступна через `IEyeHubService.ActiveLicense`.
- `LoginWidget` (`EyeAuras.Blazor.Controls`) — готовый Blazor-контрол, который открывает стандартный popup логина EyeAuras.
- `ISublicenseManager` (`EyeAuras.Loader.Shared.Api`) создает живые runtime-intent для sublicense lease через `Rent(AuraShareId shareId)`.
- `ISublicenseLease` предоставляет `LeaseId`, `ShareId`, `IsGranted`, `Status`,
  `Message`, `LastUpdatedAt` и `WhenChanged()`.

## Подготовить собственный экран входа

Сначала выберите host: примеры `GetService` ниже относятся к выполняющемуся
скрипту EyeAuras с подключёнными loader-сервисами. В Razor получите эти
зависимости через `@inject`, а в обычном классе — через конструктор.
Добавление ссылки на `EyeAuras.Loader.Shared` не регистрирует hub или
менеджер сублицензий в произвольном приложении.

В примерах входа `username`, `password`, `licenseKey` и `extraLicenseKey` —
значения полей вашей формы, полученные от пользователя. Не записывайте их
в исходный код или журнал. Дождитесь `Task` операции, покажите ошибку в форме,
а после успеха обновляйте профиль по `ILicenseAccessor`. Для lease замените
демонстрационный share id на id своего опубликованного pack.

### Что зависит от версии loader

Этот раздел сохраняет имена и сценарии существующего API. Реализации hub,
серверной авторизации и lease не входят в доступный срез исходников
EyeAuras `20fd3d4`; точные сигнатуры, поддержку отмены и поведение при
разрыве связи проверяйте по `EyeAuras.Loader.Shared` своей поставки.
В исходнике теста script visitor зафиксировано намерение освобождать lease
с завершением запуска, но это не заменяет проверку реальной версии host.
Не полагайтесь на недокументированный таймаут или автономную выдачу доступа.

Сам вызов `Rent` не должен запускать платную работу: до `IsGranted == true`
показывайте ожидание. При последующей потере доступа остановите защищённую
операцию; приведённая ниже подписка только показывает изменение статуса,
а не реализует всю логику авторизации.

## Частые сценарии

### Готовый логин для Blazor

Используйте этот вариант, если вашему окну подходит стандартный popup логина EyeAuras:

```razor
<LoginWidget/>
```

Виджет отображает `ILicenseAccessor.Username` и открывает host UI логина.

### Логин по username/password

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

Для key login ожидается, что одно и то же значение ключа передается в оба аргумента. Сервер должен поддерживать этот режим; создание или выбор аккаунта — его политика. Не логируйте сырой ключ.

### Активация дополнительного ключа для существующего пользователя

```csharp
var eyeHub = GetService<IEyeHubService>();

var updatedLicense = await eyeHub.ActivateLicenseKey(extraLicenseKey.Trim());
```

Используйте активацию, когда пользователь уже вошел в систему и хочет привязать к этому аккаунту еще один ключ. Используйте key login, когда сам ключ является логин-учетными данными.

### Отображение профиля и статуса

```csharp
var licenseAccessor = GetService<ILicenseAccessor>();
var eyeHub = GetService<IEyeHubService>();

Log.Info($"User: {licenseAccessor.Username}");
Log.Info($"License: {licenseAccessor.LicenseType}, valid: {licenseAccessor.IsValid}");
Log.Info($"Expires: {licenseAccessor.ExpiresAt}");
Log.Info($"Hub: {eyeHub.ConnectionState}");
```

В реактивном UI отслеживайте `ILicenseAccessor.PropertyChanged` или используйте
`WhenAnyValue(...)` для свойств `ILicenseAccessor`.

### Lease доступа для paid pack / mini-app

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

`Rent(...)` работает неблокирующе. Начальное состояние обычно pending, а сам lease обновляется в фоне. Считайте доступ выданным только тогда, когда `ISublicenseLease.IsGranted` равен `true`.

## Чеклист для кастомного UI логина

- Отслеживайте busy state, чтобы повторные клики не запускали несколько login-запросов одновременно.
- Проверяйте выбранный режим: username/password для входа в аккаунт, license key — для key login.
- Вызывайте `Trim()` для usernames и keys. Для passwords этого делать не нужно, если только ваш собственный UX явно этого не требует.
- Для key login вызывайте `PerformLogin(key, key)`.
- Очищайте поля password/key после успешного логина.
- Показывайте ошибки операции логина в локальном UI.
- Читайте профиль и отображение лицензии из `ILicenseAccessor`, а не из скопированного состояния формы логина.
- Если продукт платный, запрашивайте sublicense lease после логина или при запуске продукта и основывайте доступ на `lease.IsGranted`.

## Подсказки по assembly / package

- `EyeAuras.Loader.Shared` содержит `IEyeHubService`, `ILicenseAccessor`,
  `IUserLicense`, `ISublicenseManager` и `ISublicenseLease`.
- `EyeAuras.Blazor.Controls` содержит `LoginWidget`.
- `EyeAuras.Shared` содержит `AuraShareId`.

## Что предпочтительно

- Используйте `LoginWidget`, если подходит стандартный host flow логина.
- Используйте `IEyeHubService.PerformLogin(key, key)` для кастомных экранов key login.
- Используйте `IEyeHubService.ActivateLicenseKey(...)`, чтобы привязать дополнительный ключ к уже вошедшему аккаунту.
- Используйте `ILicenseAccessor` для отображения текущего профиля и лицензии.
- Используйте `ISublicenseManager.Rent(...)` для авторизации современных платных packs или mini-apps.

## Чего стоит избегать

- Не логируйте сырые license keys, passwords, signed licenses или bearer tokens.
- Не используйте `ILicenseAccessor.ActiveLicense` как обычный публичный API. Это материал подписанной лицензии, оставленный только для compatibility.
- Не используйте `ILicenseAccessor.ShareSublicenses` как основной механизм авторизации для новых платных packs. Используйте `ISublicenseLease`.
- Не считайте, что успешная активация ключа автоматически означает выданную runtime sublicense session. Запрашивайте lease и проверяйте его состояние.
- Не блокируйте запуск навсегда в ожидании lease; показывайте pending state и реагируйте на `WhenChanged()`.

## Опорные точки для изучения

- `IEyeHubService`
- `ILicenseAccessor`
- `IUserLicense`
- `LoginWidget`
- `ISublicenseManager`
- `ISublicenseLease`
- `AuraShareId`
- `EyeLicenseType`
- `SublicenseLeaseGrantStatus`

## Синонимы для поиска

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

## Смежные карты

- [deployment](deployment)
- [blazor](blazor)
- [app-runtime-contexts](app-runtime-contexts)
- [runtime](../scripting/runtime)
- [reactive-lifetime](../scripting/reactive-lifetime)
- [references-and-resources](../scripting/references-and-resources)
- [keylogin](../../../../features/keylogin)
- [sublicenses](../../../../features/sublicenses)