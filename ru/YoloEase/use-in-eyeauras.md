---
title: Использование в EyeAuras
description: Короткий путь от ONNX-модели к ML Search и Behavior Tree
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning
editor: markdown
dateCreated: 2026-05-08T12:00:00.000Z
---
# Использование в EyeAuras

YoloEase готовит `.onnx` модель. EyeAuras использует ее в `ML Search`, а дальше Behavior Tree решает, что делать с найденными объектами.

`.pt` оставьте для обучения и дообучения. Для `ML Search` выбирайте `.onnx`.

Для подробного разбора откройте [EyeAuras интеграция](/ru/YoloEase/features/eyeauras-integration).

## Минимальный путь

1. Откройте папку результата из [Trainer](/ru/YoloEase/features/trainer).
2. Возьмите `.onnx` модель.
3. В EyeAuras откройте `ML Search`.
4. Нажмите кнопку загрузки модели и выберите `.onnx`.
5. Настройте область захвата так, чтобы она совпадала с данными обучения.
6. Если обучали модель на кадрах с эффектами EyeAuras, включите те же эффекты перед распознаванием.
7. Включите `Enable OSD` и проверьте рамки без кликов.
8. Подключите `ML Find Class`, затем `Mouse Move`, и только после проверки добавляйте `Key Press`.

![Load model in EyeAuras](https://s3.eyeauras.net/media/2026/05/RuS1yziKuU.png)

## Готовый пример

- [Записанная сессия](https://youtu.be/MdLETBZPeec)
- [Готовый пакет EyeAuras](https://eyeauras.net/share/S20260507232328uRAOxLRumL6o)
- [ONNX веса](https://s3.eyeauras.net/media/2026/05/Qwe_yolo11s_202605072245262GXYDdJshE3b.onnx)

## Читать дальше

- [EyeAuras интеграция](/ru/YoloEase/features/eyeauras-integration)
- [YOLO ONNX и веса моделей](/ru/YoloEase/features/yolo-onnx)
- [Диагностика](/ru/YoloEase/features/diagnostics)
- [AI Search Trigger](/ru/triggers/images/ai-search-trigger)
- [Деревья поведения](/ru/behavior-trees/gettings-started)
