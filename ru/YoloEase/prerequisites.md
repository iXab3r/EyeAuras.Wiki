---
title: Предварительные компоненты
description: Как подготовить Python, PyTorch и GPU через YoloEase
published: true
date: 2026-05-08T12:00:00.000Z
tags: yoloease, machine-learning
editor: markdown
dateCreated: 2023-10-29T18:35:33.765Z
---
# Предварительные компоненты

YoloEase сам управляет инструментами для обучения. В обычном сценарии не нужно отдельно ставить Python, пакеты для обучения или настраивать переменные окружения. Откройте проект, перейдите на вкладку `Prerequisites` и дайте приложению проверить окружение.

![Prerequisites missing](https://s3.eyeauras.net/media/2026/05/YoloEase_wfJdcyvdZj.png)

## Быстрый путь

1. Откройте проект YoloEase.
2. Перейдите на вкладку `Prerequisites`.
3. Нажмите `Check all`.
4. Если есть отсутствующие компоненты, нажмите `Install missing`.
5. Дождитесь завершения установки.
6. Снова нажмите `Check all`, если хотите перепроверить состояние.

Кнопка `Copy all` удобна, когда нужно отправить диагностическую информацию. `Clear all` очищает текущий вывод в списке проверок.

## Что проверяет YoloEase

`Managed Python 3.11` проверяет portable Python, который лежит в папке данных YoloEase.

`Python environment` проверяет виртуальное окружение приложения.

`Package installer` проверяет, что можно ставить Python-пакеты.

`GPU driver helper` показывает найденный NVIDIA GPU и совместимость драйвера со средой выполнения CUDA.

`PyTorch runtime` ставит CPU- или CUDA-вариант PyTorch в управляемое окружение.

`Python packages`, `Yolo CLI` и `GPU acceleration` проверяют рабочие пакеты, CLI и доступность ускорения.

![All prerequisites installed](https://s3.eyeauras.net/media/2026/05/YoloEase_OuA9BUthjc.png)

## GPU не обязателен

GPU ускоряет обучение, но не является обязательным для запуска YoloEase. Если совместимый NVIDIA GPU не найден, обучение может идти на CPU. Это будет медленнее, зато не требует отдельной видеокарты.

Если GPU найден и драйвер подходит, YoloEase установит CUDA-совместимый PyTorch и во время локального обучения выберет устройство CUDA автоматически.

## Если установка упала

Самая частая практическая причина — не хватает места на диске. PyTorch и кеш wheel-пакетов могут занимать много гигабайт, особенно при установке CUDA-версии.

![No space left on device](https://s3.eyeauras.net/media/2026/05/YoloEase_5T0uv3vFkV.png)

Что сделать:

1. Освободите место на диске, где лежит папка данных YoloEase.
2. Нажмите `Clear all`, чтобы убрать старый лог.
3. Запустите `Install missing` еще раз.
4. Если ошибка повторяется, используйте `Copy all` и приложите вывод к сообщению об ошибке.

Когда все строки зеленые, можно переходить к [подготовке данных](/ru/YoloEase/prepare-data).

Если хотите понять, зачем нужны PyTorch, Ultralytics, ONNX Runtime и почему YoloEase экспортирует `opset 17`, см. [YOLO ONNX и веса моделей](/ru/YoloEase/features/yolo-onnx). Если установка или обучение падают, откройте [диагностику](/ru/YoloEase/features/diagnostics).
