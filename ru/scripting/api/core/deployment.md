---
title: AI Core — развертывание и распространение
description: AI-ориентированная карта по экспорту и импорту EyeAuras, пакам, mini-apps, защите скриптов и сублицензированию.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, deployment, packs, licensing, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта вариантов развёртывания и дистрибуции

Справочная карта по тому, как результат работы в EyeAuras переходит из разработки к другому пользователю, на другой ПК, в опубликованный pack, portable pack или mini-app.

## Что обычно нужно

- Поделиться папкой, набором auras, скриптом, behavior tree или mini-app с другими пользователями.
- Экспортировать и импортировать работу как резервную копию или формат переноса.
- Опубликовать pack и потом обновлять его.
- Понять, должны ли пользователи импортировать контент в виде исходников или скачивать упакованный portable-продукт.
- Собрать mini-app, где пользователь в основном видит ваш UI, а не интерфейс EyeAuras.
- Защитить исходники скриптов и проверки лицензий перед распространением платного продукта.
- Добавить платные ключи доступа для pack или mini-app.

## Базовая модель

- `Export` публикует или сохраняет pack. `Import` загружает pack по ссылке, из файла, JSON или install script.
- У опубликованного pack есть владелец. Обновлять ревизию этого pack может только владелец.
- Pack — это единица распространения. Он может содержать auras, scripts, macros, behavior trees, app/config options и опциональный packed content.
- Portable pack — это загружаемый продукт в стиле ZIP, который может работать без обычной установки.
- Mini-app — это не отдельный движок. Это режим продукта, в котором под капотом работает инфраструктура EyeAuras, а основной пользовательский сценарий построен вокруг кастомного UI или целевого скрипта.
- EyePad — это общий launch/runtime shell для scripts, solutions, imported packs и mini-apps.
- Защита скриптов и sublicenses — это задача автора pack, а не стандартная настройка для обычной локальной разработки.

## Варианты распространения

- Локальный export: сохранить или скопировать JSON для бэкапа, отправки в мессенджере или переноса между своими устройствами.
- Published pack: загрузить pack в систему шаринга EyeAuras и получить ссылку.
- Import subscription: держать локальную папку связанной с исходным pack URL, чтобы пользователь получал обновления.
- Local clone: держать несколько подписанных копий рядом, с отдельными локальными ID.
- Aura Library listing: сделать published pack доступным для поиска, а не оставлять его unlisted.
- Portable pack: распространять упакованную папку приложения или ZIP, где программа, config и контент идут вместе.
- Mini-app: упаковать кастомный пользовательский сценарий, в котором EyeAuras в основном скрыт за UI автора.

## Настройки pack

- `PackDistributionPolicy.Any` — можно предлагать и import, и packed download.
- `PackDistributionPolicy.PreferPacked` — если packed content существует, он предпочтителен, но import в стиле исходников тоже может быть доступен.
- `PackDistributionPolicy.PackedOnly` — пользователи должны получать только packed-версию.
- `PackScriptCompilationMode.ScriptOnly` — включать скрипты как текст; компиляция на стороне пользователя выполняется при необходимости.
- `PackScriptCompilationMode.ScriptWithBinaries` — включать и текст скриптов, и скомпилированные binaries.
- `PackScriptCompilationMode.BinariesOnly` — исключать текст скриптов и распространять только compiled binaries.
- `PackScriptProtectionMode.None` — без дополнительной защиты скриптов.
- `PackScriptProtectionMode.PerformanceFirst` — защита с акцентом на скорость и стабильность.
- `PackScriptProtectionMode.SecurityFirst` — более сильная защита, включая более тяжёлые техники obfuscation/encryption.

## Как работает import

- `Prefer packed version` просит EyeAuras загружать подготовленный вариант packed content, если он доступен.
- `Subscribe to Updates` связывает импортированную папку с URL исходного pack.
- `Local Clone` сохраняет подписанную копию с отдельными локальными ID.
- Конфликты остаются выбором пользователя: заменить существующие элементы, скопировать как новые или проигнорировать конфликт.
- Сейчас import работает на уровне pack. Не рассчитывайте на частичный импорт.

## Запуск mini-app

Mini-app обычно запускаются с аргументами EyePad:

```text
EyeAuras.exe --pad --read-only --publish-single-file --ui splashOnly --readiness script --acceptLicense "path/to/Script.json"
```

- `--pad` запускает режим EyePad.
- `--read-only` не сохраняет изменения в aura/script между запусками.
- `--publish-single-file` просит packing pipeline собрать более самодостаточный build.
- `--ui splashOnly` скрывает основной UI EyeAuras и оставляет только splash screen.
- `--readiness script` считает продукт готовым, когда готов целевой script.
- `--acceptLicense` пропускает стандартное окно лицензионного соглашения в сценариях mini-app.
- Последний путь указывает на целевой script/config, который нужно запустить.

## Защита

- Исходные скрипты удобны во время разработки, но их не стоит считать защищённым артефактом для распространения.
- Предварительная компиляция ускоряет запуск и может убрать текст скриптов из packaged product.
- `BinariesOnly` скрывает текст скриптов, но сам по себе не делает код невозможным для reverse engineering.
- `PerformanceFirst` и `SecurityFirst` добавляют protection/obfuscation поверх compiled scripts.
- Public classes и public members сохраняются как публичный контракт. Для деталей реализации, которые должны трансформироваться агрессивнее, лучше использовать `internal`.
- Protection не даёт абсолютной гарантии безопасности и для платных продуктов должна сочетаться с аккуратной licensing-моделью и server-side design.

## Лицензирование и sublicenses

- Sublicenses — это ключи доступа автора pack для конкретного pack или mini-app.
- Самому EyeAuras не нужна отдельная пользовательская лицензия для sublicenses; ключи дают доступ к продукту автора.
- Пользователь может активировать ключ в существующем аккаунте или войти напрямую по ключу.
- Автор настраивает модель длительности, freezes, количество сессий и опциональную hardware binding.
- В современных packs доступ нужно запрашивать через `ISublicenseManager.Rent(...)`. Не полагайтесь на старые пассивные проверки вроде чтения `ILicenseAccessor.ShareSublicenses` как на основной механизм.
- Lease сначала создаётся в состоянии pending и обновляется в фоне. Считайте доступ выданным только когда `ISublicenseLease.IsGranted` равно `true`.
- Держите lease активным столько, сколько эта логическая сессия должна потреблять доступ.
- Semi-offline-поведение может сохранять уже выданный доступ при временных разрывах соединения или сбоях, но это не полноценное offline licensing.

Для платных mini-app обычное направление по hardening такое:

- `PackDistributionPolicy.PackedOnly`
- `PackScriptCompilationMode.BinariesOnly`
- `PackScriptProtectionMode.PerformanceFirst` или `PackScriptProtectionMode.SecurityFirst`
- custom UI / mini-app flow, если автору нужен больший контроль над onboarding и licensing UX.

## API

- `PackAurasConfig` — объект конфигурации pack.
- `PackDistributionPolicy` — Any / PreferPacked / PackedOnly.
- `PackScriptCompilationMode` — ScriptOnly / ScriptWithBinaries / BinariesOnly.
- `PackScriptProtectionMode` — None / PerformanceFirst / SecurityFirst.
- `IShareProvider` — преобразует share ids в URI, получает share metadata/content и обновляет конфиг pack.
- `AuraShareId` — стабильный id опубликованного share/pack.
- `ShareInfo` / `ShareInfoMetadata` — payload и metadata опубликованного share.
- `ShareDataPackDownloadPolicy` — выбор на стороне запроса между source-like и packed content.
- `ISublicenseManager` — создаёт live runtime sublicense lease intents.
- `ISublicenseLease` — текущее состояние lease: share id, статус выдачи доступа, сообщение и поток изменений.
- `IEyeHubService` — подключение к hub, login, logout, refresh token и активация license key.
- `ILicenseAccessor` — текущая проекция лицензии и legacy-список sublicenses.
- `LoginWidget` — готовый Blazor login widget для custom UI.

## Что обычно выбирать

- Для бэкапов и разового переноса лучше использовать local export.
- Для обновлений и шаринга по ссылке лучше использовать published packs.
- Если пользователи должны получать будущие ревизии, лучше использовать import subscriptions.
- Если пользователь не должен работать в обычном UI EyeAuras, лучше использовать portable packs или mini-apps.
- Для платного кода лучше использовать `BinariesOnly` вместе с protection.
- Для новых платных packs лучше использовать `ISublicenseManager.Rent(...)`.
- Для коммерческих продуктов, где onboarding, login и licensing должны ощущаться как единый продукт, лучше использовать пользовательский mini-app UI.

## Чего избегать

- Не публикуйте в packs секреты, токены, пароли и приватные данные сервера.
- Не считайте packed content и source import одним и тем же.
- Не предполагайте, что published pack может обновить кто угодно, кроме владельца.
- Не стройте новые packs на старых пассивных проверках sublicenses.
- Не храните в настройках pack volatile handles, live process ids или runtime session objects.
- Не воспринимайте protection как полную замену аккуратному дизайну продукта.

## Исходные материалы

- [Export and Import](../../../ru/features/export-import.md)
- [Packs](../../../ru/features/packs.md)
- [Mini-app](../../../ru/features/mini-app.md)
- [EyePad](../../../ru/features/eyepad.md)
- [C# Script Protection](../../../ru/features/script-protection.md)
- [Sublicenses](../../../ru/features/sublicenses.md)
- [Aura Library](../../../ru/aura-library.md)

## Поисковые синонимы

- export pack
- import pack
- share link
- published pack
- pack owner
- update subscription
- local clone
- packed content
- portable pack
- mini-app
- EyePad
- script protection
- binaries only
- packed only
- sublicense
- license key
- lease
- key login
- hardware binding
- semi-offline license

## Related Maps

- `core/eyeauras-structure.md`
- `core/app-runtime-contexts.md`
- `core/configuration-persistence.md`
- `scripting/runtime.md`
- `recipes/bot-memory-imgui-interface.md`
- `recipes/bot-memory-behavior-tree.md`