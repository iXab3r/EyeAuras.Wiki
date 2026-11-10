---
title: Главная
description: EyeAuras — программный инструмент для создания и управления «аурами» — скриптами и функциями, которые автоматизируют задачи, обрабатывают данные и улучшают взаимодействие с компьютером и приложениями
published: true
date: 2026-04-25T12:40:21.080Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T14:50:20.232Z
---
# EyeAuras — от условия к нужной реакции

Чтобы заметить изменение в своём приложении и вовремя на него отреагировать, соберите ауру: условие, действие и при необходимости изображение поверх окна. Например, появление надписи можно связать со звуковым сигналом, а состояние выбранного окна — с показом подсказки.

EyeAuras получает данные из настроенного источника. Для поиска изображения это захваченные пиксели окна, для файла — его текст, для горячей клавиши — нажатие. Реакция задаётся отдельно: найденная картинка сама по себе не нажимает кнопку.

![Логотип EyeAuras](/assets/legacy/mainfull.png)

## С чего начать

1. Установите EyeAuras со [страницы загрузки](https://eyeauras.net/#downloads). Требования к текущей поставке указаны там же. Для знакомства достаточно своего небольшого набора, без импорта чужого кода.
2. Пройдите [Fixed Value](/ru/triggers/fixed-value): вручную измените одно условие и проверьте один звуковой сигнал. Так вы увидите переход состояния и выполнение действия без поиска по экрану.
3. Замените ручное условие источником своей задачи: существованием окна, изображением, цветом или текстом. Проверьте результат триггера до добавления ввода.
4. Если нужна видимая подсказка, добавьте [Text](/ru/overlays/text). Если нужна последовательность с ожиданиями и ветвлением, переходите к [макросам](/ru/macros/getting-started) или [деревьям поведения](/ru/behavior-trees/gettings-started).

Первый результат — понятная связь «условие изменилось → выполнилось выбранное действие». Дальше можно усложнять один проверенный участок, а не разбирать сразу большой готовый сценарий.

Для законченной задачи без программирования выберите [рецепт](/ru/recipes): держите памятку рядом с заметками, различайте открытие и закрытие просмотрщика или наблюдайте небольшой визуальный источник. В каждом рецепте есть своя подготовка, настройки и ожидаемый результат.

На снимках ниже показана прежняя оболочка: дерево элементов слева и редактор выбранного элемента справа. Подписи и размещение в текущем интерфейсе могут отличаться.

![Прежнее главное окно с деревом и редактором](https://eyeauras.net/assets/img/appimages/EyeAuras_OzDyUnmzFH.webp =x400)

## Из чего состоит аура

| Часть | За что отвечает |
| --- | --- |
| Триггер | Вычисляет условие: Active, Not Active либо Unknown, если результат недоступен. При нескольких триггерах состояние ауры зависит от правила их объединения. |
| On Enter | Действия при переходе ауры в Active. Подходит для одного сигнала о наступившем событии. |
| While Active | Повторяемая работа, пока аура Active. Интервал и завершение зависят от настроенной цепочки действий. |
| On Exit | Действия при переходе из Active в Not Active. Unknown — отдельное состояние, а не синоним Not Active. |
| Оверлей | Текст, изображение или другой элемент поверх окон; его показ связан с состоянием ауры и настройками видимости. |
| Условия включения | Определяют, когда сама аура или дерево должны работать. Подробнее: [Enabling Conditions](/ru/features/enabling-conditions). |

Дерево поведения организует проверки и работу узлов через Success, Failure и Running. Это статусы выполнения узла; они отличаются от состояний триггера.

![Редактор дерева поведения](https://eyeauras.net/assets/img/appimages/EyeAuras_4GhOU01VKp.webp =x400)

## Выбрать инструмент под задачу

| Что нужно получить | С чего начать |
| --- | --- |
| Условие по окну | [Window Exists](/ru/triggers/window-exists), [Window Is Active](/ru/triggers/window-is-active), [выбор окна](/ru/features/window-matching-expressions) |
| Условие по видимой области | [Захват изображения](/ru/triggers/images/imagecapturetriggers), затем [Image Search](/ru/triggers/images/image-search), [Color Search](/ru/triggers/images/color-search) или [Text Search](/ru/triggers/images/text-search) |
| Поиск своей моделью | [AI Search](/ru/triggers/images/ai-search-trigger): совместимая ONNX-модель, её задача ([детекция](https://docs.ultralytics.com/tasks/detect/), [классификация](https://docs.ultralytics.com/tasks/classify/) или [сегментация](https://docs.ultralytics.com/tasks/segment/)), классы и порог; готового распознавания любого объекта нет |
| Ручное управление или время | [Fixed Value](/ru/triggers/fixed-value), [Hotkey Is Active](/ru/triggers/hotkey-is-active), [Timer](/ru/triggers/timer) |
| Связь с другой аурой | [Aura Is Active](/ru/triggers/aura-is-active) |
| Данные из файла или сообщения | [File Contains Text](/ru/triggers/file-contains-text), [Network Message](/ru/triggers/network-message), [Telegram Message](/ru/triggers/telegram-message) |
| Звук или уведомление | [Play Sound](/ru/actions/play-sound), [Send To Telegram](/ru/actions/send-telegram-message) |
| Сетевая команда другому EyeAuras | [Send Network Message](/ru/actions/send-network-message); получение и реакция настраиваются у получателя отдельно |
| Клавиши, мышь или текст | [Send Sequence](/ru/actions/sendinput/send-sequence), [общие настройки ввода](/ru/actions/sendinput/options). Страницы [Send Input](/ru/actions/sendinput/send-input) и [Send Text](/ru/actions/sendinput/send-text) объясняют соответствие прежних редакторов текущему механизму |
| Ожидание и выбор активного окна | [Delay](/ru/actions/delay), [Win Activate](/ru/actions/win-activate) |
| Подсказка поверх окна | [Text](/ru/overlays/text), [Image](/ru/overlays/image), [Replica](/ru/overlays/replica) — живая копия выбранного окна или области |
| Свой интерфейс и код | [C# Script](/ru/scripting/getting-started), [Blazor-окна](/ru/scripting/blazor-windows/getting-started), [Custom UI](/ru/overlays/custom-ui) |
| Разобрать связи аур | [Bindings](/ru/features/bindings), [Default Properties](/ru/features/default-properties), [Dependencies Viewer](/ru/overlays/dependenciesviewer) |
| Условие по строке | [Text Match Expressions](/ru/features/text-match-expressions): текст, регулярное выражение или поддержанный контекст Lambda |
| Уровень звука | [Volume Level](/ru/triggers/volume-level) — историческая справка об отдельном альфа-компоненте; не исходная настройка для первого опыта |
| Перенести свой набор или найти готовый | [Экспорт и импорт](/ru/features/export-import), [библиотека аур](/ru/aura-library) |

При поиске по экрану EyeAuras анализирует полученное изображение, а не внутренние игровые данные. Доступность захвата и ввода зависит от окна и выбранного механизма. Для вопросов о совместимости, нескольких окнах и лицензии откройте [FAQ](/ru/faq); если настройка ведёт себя иначе — [разбор проблем](/ru/known-problems).
