---
title: Главная
description: EyeAuras — программный инструмент для создания и управления «аурами» — скриптами и функциями, которые автоматизируют задачи, обрабатывают данные и улучшают взаимодействие с компьютером и приложениями
published: true
date: 2026-02-13T11:42:11.801Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T14:50:20.232Z
---
![](/mainfull.png)

# EyeAuras

[EyeAuras](https://eyeauras.net/) — это [кликер](/ru/actions/sendinput/send-sequence) на базе [компьютерного зрения](/ru/triggers/images/imagecapturetriggers) и [машинного обучения](/ru/triggers/images/ai-search-trigger). Он умеет анализировать всё, что происходит на экране, и выполнять действия за вас: [двигать мышь](/ru/actions/sendinput/send-sequence), [нажимать клавиши](/ru/actions/sendinput/send-sequence), воспроизводить звуки, [отправлять сообщения в Telegram](/ru/actions/send-telegram-message) и [по Интернету](/ru/actions/send-network-message), а также [выполнять C#-скрипты](/ru/scripting/getting-started)!

![Main window](https://eyeauras.net/assets/img/appimages/EyeAuras_OzDyUnmzFH.webp =x400)

---

## Основные понятия

- **Aura** — комбинация Triggers, Actions, Overlays и Enabling conditions. Именно ауры вы будете делиться с другими пользователями, и именно они выполняют основную работу.
- [**Behavior Tree**](/ru/behavior-trees/gettings-started) — если кратко, это способ описать, что должен делать бот. Это его «мозг», а Actions и Triggers выступают в роли «рук» и «глаз».
- **Triggers** — любые состояния, которые можно описать как Active/NotActive. Например: Hotkey (нажата/не нажата или переключатель), проверка окна на переднем плане (активно/не активно), результат поиска Image/Text/Color (найдено/не найдено). Состояние Aura Active/NotActive определяется комбинацией состояний её дочерних Triggers. У Trigger есть три состояния:
    - Active — условие выполнено. Например, для WindowIsActive это означает, что окно с подходящим заголовком сейчас активно.
    - Not Active — условие не выполнено.
    - Unknown — по какой-то причине состояние нельзя вычислить. Например, если окно, указанное в ImageSearch, не найдено, соответствующий Trigger получит состояние Unknown, потому что без реального изображения сравнение выполнить невозможно.
- **Actions** — показ уведомлений, нажатия клавиш и мыши, отправка сообщений в Telegram или e-mail — всё это считается Action и может использоваться внутри Aura. Actions можно назначать в одну из трёх групп:
    - On Enter — выполняются, когда Aura становится Active.
    - While Active — выполняются повторно, пока Aura остаётся Active.
    - On Exit — выполняются, когда Aura становится Not Active.
- **Overlays** — always-on-top-оверлеи, которые могут показывать текст, изображения, кастомный UI и многое другое. Overlays являются частью Aura и отображаются только пока Aura находится в состоянии Active.
- [**Enabling conditions**](/ru/features/enabling-conditions) — Triggers, которые можно использовать для включения и отключения Auras и Behavior Trees. Например, чтобы отключать бота, если окно игры не существует.

![Behavior Trees](https://eyeauras.net/assets/img/appimages/EyeAuras_4GhOU01VKp.webp =x400)

---

## Подсистемы

- [Export/Import](/ru/features/export-import) — перенос, обмен и резервное копирование паков EyeAuras между разными пользователями и устройствами
- [Aura Library](/ru/aura-library) — общая библиотека паков EyeAuras, где пользователи могут находить, импортировать и использовать готовые решения
- [Window Match Expressions](/ru/features/window-matching-expressions) — выбор конкретных окон с помощью пользовательских выражений
- [Text Match Expressions](/ru/features/text-match-expressions) — мощный инструмент для проверки текстовых условий через Regex, Text и Lambda-вычислители
- [Bindings](/ru/features/bindings) — связывают свойства между triggers, actions и overlays, упрощая массовое изменение параметров и открывая новые возможности
- [Default Properties](/ru/features/default-properties)

## Triggers

- [Fixed Value](/ru/triggers/fixed-value) — самый простой trigger; его состояние можно менять вручную или через C#-скрипты
- [Color Search](/ru/triggers/images/color-search) — становится active, когда средний цвет выбранной области совпадает с Target color. Можно задать порог схожести.
- [**Image Search**](/ru/triggers/images/image-search) — становится active, когда заданное изображение найдено с указанной степенью сходства
- [**AI/ML Search**](/ru/triggers/images/ai-search-trigger) — поиск на базе машинного обучения: [object detection](https://docs.ultralytics.com/tasks/detect/), [segmentation](https://docs.ultralytics.com/tasks/segment/) или [classification](https://docs.ultralytics.com/tasks/classify/). Сейчас поддерживается только [**Yolo8**](https://docs.ultralytics.com/) **в формате ONNX**, позже список может быть расширен
- [**Text Search**](/ru/triggers/images/text-search) — становится active, когда распознанный текст совпадает с заданным выражением. Поддерживается сравнение через Contains, regexp или C# Lambda
- [**Aura Is Active**](/ru/triggers/aura-is-active) — становится active, когда связанные Auras находятся в указанном состоянии (Active/NotActive)
- [**Hotkey Is Active**](/ru/triggers/hotkey-is-active) — становится active, когда указанная комбинация клавиш зажата или включена как toggle
- [**Window Is Active**](/ru/triggers/window-is-active) — становится active, когда окно, подходящее под указанное выражение, активно (находится на переднем плане)
- [**Window Exists**](/ru/triggers/window-exists) — становится active, когда в системе существует окно, подходящее под указанное выражение
- [**Timer**](/ru/triggers/timer) — периодически активируется на заданное время
- [**Message Subscription**](/ru/triggers/network-message) — активируется и деактивируется при получении указанного сообщения с веб-сервера EyeAuras. Сообщения разделяются по Channels и могут отправляться через Action SendMessage
- [**File Contains**](/ru/triggers/file-contains-text) — активируется, когда в указанном файле найден заданный текст
- [**Telegram Subscription**](/ru/triggers/telegram-message) — активируется и деактивируется при получении указанного сообщения в Telegram-канале
- [**Volume Control**](/ru/triggers/volume-level) — активируется и деактивируется, когда уровень громкости указанного аудиоустройства или процесса достигает заданного порога
- [**C# Script**](/ru/scripting/getting-started) — пользовательские скрипты на последней версии C# с полным доступом к внутреннему API EyeAuras. Когда API стабилизируется, появятся примеры и документация

## Actions

- [**Send**](/ru/actions/sendinput/options) — эмулирует пользовательский ввод: движение мыши, клики, нажатия клавиш и т. д. Поддерживает несколько методов ввода — от базовых, работающих через WinAPI, до аппаратной эмуляции с использованием физического устройства Usb2Kbd.
    - [Input](/ru/actions/sendinput/send-input) — генерирует одно событие клавиатуры или мыши
    - [Text](/ru/actions/sendinput/send-text) — вводит указанный текст через буфер обмена или посимвольно
    - [Sequence](/ru/actions/sendinput/send-sequence) — воспроизводит заданную последовательность нажатий клавиш, кликов мыши и движений мыши
- [**Play Sound**](/ru/actions/play-sound) — воспроизводит указанный звук
- [**Win Activate**](/ru/actions/win-activate) — активирует указанное окно
- [**Delay**](/ru/actions/delay) — ждёт некоторое время перед переходом к следующему действию
- [**Send To Telegram**](/ru/actions/send-telegram-message) — отправляет сообщение в Telegram-канал
- [**Send Message**](/ru/actions/send-network-message) — отправляет сетевое сообщение через инфраструктуру EyeAuras в указанный Channel. Все остальные экземпляры EyeAuras на других компьютерах могут подписаться на эти сообщения и обрабатывать их через Trigger Message Subscription
- [**C# Script**](/ru/scripting/getting-started) — пользовательские скрипты на последней версии C# с полным доступом к внутреннему API EyeAuras. Когда API стабилизируется, появятся примеры и документация

## Overlays

- [**Text**](/ru/overlays/text) — показывает текст; содержимое можно менять вручную или через C#-скрипты
- [**Image**](/ru/overlays/image) — показывает изображение; поддерживаются анимированные и прозрачные GIF
- [**Replica**](/ru/overlays/replica) — создаёт визуальный клон любого указанного окна или его части в реальном времени. Это позволяет, например, вынести кулдауны ближе к центру экрана или показывать уменьшенную версию YouTube-плеера во время фарма
- [**Dependencies Viewer**](/ru/overlays/dependencies-viewer) — инструмент отладки, с помощью которого можно проверять состояния связанных Auras. Очень полезен при разборе сложных моделей.
- [**Custom UI**](/ru/overlays/custom-ui) — позволяет создавать полноценный пользовательский интерфейс, используя сочетание [Microsoft Razor Pages](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/?view=aspnetcore-7.0&tabs=visual-studio) (html+css+js) и **C#**, чтобы связать всё это внутри EyeAuras