---
title: Главная
description: EyeAuras — это программа для создания и управления «аурами»: сценариями и функциями, которые помогают автоматизировать задачи, обрабатывать данные и улучшать взаимодействие с компьютером и приложениями
published: true
date: 2026-04-02T17:41:39.684Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T14:50:20.232Z
---
![](/mainfull.png)

[EyeAuras](https://eyeauras.net/) — это [кликер](/ru/actions/sendinput/send-sequence) на базе [компьютерного зрения](/ru/triggers/images/imagecapturetriggers) и [машинного обучения](/ru/triggers/images/ai-search-trigger). Он умеет анализировать всё, что происходит на экране, и выполнять за вас действия вроде [движения мыши](/ru/actions/sendinput/send-sequence) и [нажатий клавиш](/ru/actions/sendinput/send-sequence). Также EyeAuras может воспроизводить звуки, [отправлять сообщения в Telegram](/ru/actions/send-telegram-message) и [по сети через Интернет](/ru/actions/send-network-message), а ещё [выполнять C#-скрипты](/ru/scripting/getting-started)!

![Главное окно](https://eyeauras.net/assets/img/appimages/EyeAuras_OzDyUnmzFH.webp =x400)

## Основные понятия

- **Аура** — это сочетание триггеров, действий, оверлеев и условий включения. Именно Аура выполняет всю работу, и именно её обычно экспортируют и делятся с другими.
- [**Behavior Tree**](/ru/behavior-trees/gettings-started) — если коротко, это способ описать, что именно должен делать бот. По сути, это его «мозг», а триггеры и действия выступают в роли глаз и рук.
- **Триггеры** — это любые состояния, которые можно описать как `Active` / `Not Active`. Например: горячая клавиша (нажата/не нажата или переключена), проверка активного окна (активно/не активно), результат поиска изображения, текста или цвета (найдено/не найдено). Состояние Ауры определяется сочетанием состояний её дочерних триггеров. У каждого триггера есть три состояния:
  - `Active` — условие выполнено. Например, для триггера `Window Is Active` это значит, что окно с подходящим заголовком сейчас активно.
  - `Not Active` — условие не выполнено.
  - `Unknown` — по какой-то причине невозможно вычислить состояние триггера. Например, если окно, указанное в `Image Search`, не найдено, сравнение выполнить нельзя, поэтому триггер получит состояние `Unknown`.
- **Действия** — это всё, что может делать EyeAuras: показывать уведомления, нажимать клавиши и кнопки мыши, отправлять сообщения в Telegram или e-mail. Все действия внутри Ауры относятся к одной из трёх групп:
  - `On Enter` — выполняются, когда Аура становится `Active`
  - `While Active` — выполняются повторно, пока Аура находится в состоянии `Active`
  - `On Exit` — выполняются, когда Аура становится `Not Active`
- **Оверлеи** — это элементы поверх всех окон, которые могут показывать текст, изображения, собственный UI и другое. Оверлеи являются частью Ауры и отображаются только пока она активна.
- [**Условия включения**](/ru/features/enabling-conditions) — это триггеры, с помощью которых можно включать и отключать Ауры и Behavior Trees. Например, отключать бота, если окно игры не существует.

![Деревья поведения](https://eyeauras.net/assets/img/appimages/EyeAuras_4GhOU01VKp.webp =x400)

---

### Подсистемы

- [Экспорт и импорт](/ru/features/export-import) — перенос, обмен и резервное копирование паков EyeAuras между пользователями и устройствами
- [Aura Library](/ru/aura-library) — общая библиотека паков EyeAuras, где пользователи могут находить, импортировать и использовать готовые решения
- [Window Match Expressions](/ru/features/window-matching-expressions) — выбор конкретных окон с помощью пользовательского выражения
- [Text Match Expressions](/ru/features/text-match-expressions) — мощный инструмент для проверки текстовых условий через Regex, Text и Lambda-вычислители
- [Bindings](/ru/features/bindings) — связывание свойств между триггерами, действиями и оверлеями для более удобной настройки общих параметров и новых сценариев работы
- [Default Properties](/ru/features/default-properties)

### Триггеры

- [**Fixed Value**](/ru/triggers/fixed-value) — самый простой триггер. Его состояние можно менять вручную или через C#-скрипты.
- [**Color Search**](/ru/triggers/images/color-search) — активен, когда средний цвет выбранной области совпадает с целевым цветом. Можно указать порог схожести.
- [**Image Search**](/ru/triggers/images/image-search) — активен, когда находит указанное изображение с заданным уровнем схожести
- [**AI/ML Search**](/ru/triggers/images/ai-search-trigger) — поиск на базе машинного обучения: [object detection](https://docs.ultralytics.com/tasks/detect/), [segmentation](https://docs.ultralytics.com/tasks/segment/) или [classification](https://docs.ultralytics.com/tasks/classify/). Сейчас поддерживается только [**Yolo8**](https://docs.ultralytics.com/) **в формате ONNX**, позже список может быть расширен.
- [**Text Search**](/ru/triggers/images/text-search) — активен, когда распознанный текст совпадает с указанным выражением. Поддерживаются проверки через `Contains`, regexp и C# Lambda.
- [**Aura Is Active**](/ru/triggers/aura-is-active) — активен, когда связанные Ауры находятся в заданном состоянии (`Active` / `Not Active`)
- [**Hotkey Is Active**](/ru/triggers/hotkey-is-active) — активен, когда указанная комбинация клавиш либо удерживается, либо работает как переключатель
- [**Window Is Active**](/ru/triggers/window-is-active) — активен, когда окно, подходящее под указанное выражение, находится на переднем плане
- [**Window Exists**](/ru/triggers/window-exists) — активен, когда окно, подходящее под указанное выражение, существует в системе
- [**Timer**](/ru/triggers/timer) — периодически активируется на указанное время
- [**Message Subscription**](/ru/triggers/network-message) — активируется и деактивируется при получении указанного сообщения с веб-сервера EyeAuras. Сообщения разделяются по каналам и могут отправляться через действие `Send Message`.
- [**File Contains**](/ru/triggers/file-contains-text) — активируется, когда в указанном файле найден заданный текст
- [**Telegram Subscription**](/ru/triggers/telegram-message) — активируется и деактивируется при получении указанного сообщения в канале Telegram
- [**Volume Control**](/ru/triggers/volume-level) — активируется и деактивируется, когда уровень громкости указанного аудиоустройства или процесса достигает заданного порога
- [**C# Script**](/ru/scripting/getting-started) — пользовательские скрипты на последней версии C# с полным доступом к внутреннему API EyeAuras. Когда API стабилизируется, появятся примеры и документация.

### Действия

- [**Send**](/ru/actions/sendinput/options) — эмулирует пользовательский ввод: движение мыши, клики, нажатия клавиш и т. д. Поддерживает несколько способов ввода: от базовых через WinAPI до аппаратной эмуляции с использованием физического устройства Usb2Kbd.
  - [Input](/ru/actions/sendinput/send-input) — генерирует одно событие клавиатуры или мыши
  - [Text](/ru/actions/sendinput/send-text) — вводит указанный текст через буфер обмена или посимвольно
  - [Sequence](/ru/actions/sendinput/send-sequence) — воспроизводит заданную последовательность нажатий клавиш, кликов мыши и движений курсора
- [**Play Sound**](/ru/actions/play-sound) — воспроизводит указанный звук
- [**Win Activate**](/ru/actions/win-activate) — активирует указанное окно
- [**Delay**](/ru/actions/delay) — ждёт указанное время перед переходом к следующему действию
- [**Send To Telegram**](/ru/actions/send-telegram-message) — отправляет сообщение в Telegram-канал
- [**Send Message**](/ru/actions/send-network-message) — отправляет сетевое сообщение через инфраструктуру EyeAuras в указанный канал. Другие экземпляры EyeAuras на других компьютерах могут подписаться на этот канал и обрабатывать такие сообщения через триггер `Message Subscription`.
- [**C# Script**](/ru/scripting/getting-started) — пользовательские скрипты на последней версии C# с полным доступом к внутреннему API EyeAuras. Когда API стабилизируется, появятся примеры и документация.

### Оверлеи

- [**Text**](/ru/overlays/text) — показывает текст; содержимое можно менять вручную или через C#-скрипты
- [**Image**](/ru/overlays/image) — показывает изображение; поддерживаются анимированные и прозрачные GIF
- [**Replica**](/ru/overlays/replica) — создаёт визуальную копию указанного окна или его части в реальном времени. Это позволяет, например, перенести важные элементы интерфейса ближе к центру экрана или вывести уменьшенную копию YouTube-плеера во время фарма.
- [**Dependencies Viewer**](/ru/overlays/dependencies-viewer) — инструмент отладки, с помощью которого можно посмотреть состояния связанных Аур. Особенно полезен при разборе сложных моделей.
- [**Custom UI**](/ru/overlays/custom-ui) — позволяет создавать полноценный пользовательский интерфейс внутри EyeAuras, используя сочетание [Microsoft Razor Pages](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/?view=aspnetcore-7.0&tabs=visual-studio) (`html+css+js`) и **C#** для логики и связки компонентов