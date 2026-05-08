---
title: Разметка и обучение
description: Как разметить первые кадры, обучить модель и улучшить ее через авторазметку
published: true
date: 2026-05-08T12:00:00.000Z
tags: yoloease, machine-learning
editor: markdown
dateCreated: 2026-05-08T12:00:00.000Z
---
# Разметка и обучение

Первую модель почти всегда приходится начинать с ручной разметки. Дальше YoloEase использует свежую модель для предсказаний и помогает размечать следующие задачи быстрее.

## Начните с малого, потом увеличивайте задачи

Практический ритм такой: `5-10` кадров руками, обучение, еще немного ручной разметки, первая модель, затем задачи на десятки и сотни кадров уже с авторазметкой. Не ждите, пока соберете большой набор данных вручную.

YoloEase особенно полезен именно в таком режиме: `Trainer` в фоне готовит новую модель, а вы проверяете следующую задачу. Чем лучше модель, тем крупнее можно делать партии и тем меньше рамок приходится рисовать с нуля.

## Создайте первую задачу

Откройте вкладку `Trainer`. Если модели еще нет, шаг предсказаний будет пропущен, а `Create Task` выберет кадры из доступных данных.

![Trainer before model](https://s3.eyeauras.net/media/2026/05/YoloEase_e7nteB308n.png)

Нажмите `Create Task`, затем откройте задачу через `Annotate Task` или через список задач.

Подробно про размер партии, стратегию предсказаний и ход выполнения: [Trainer](/ru/YoloEase/features/trainer).

## Разметьте первые кадры

Пустой редактор показывает метки справа, навигацию по кадрам сверху и панель инструментов слева. В начале объектов нет, а блок `Models` сообщает, что обученная ONNX-модель еще не найдена.

![Empty annotation editor](https://s3.eyeauras.net/media/2026/05/YoloEase_WpUxt25zLI.png)

Выберите метку и обведите объекты прямоугольниками. Для AimTrainer.io это маленькие цели `tgt` и кнопка `btn`.

![Annotating targets](https://s3.eyeauras.net/media/2026/05/YoloEase_AT0n2plVpV.png)

![Annotating button and targets](https://s3.eyeauras.net/media/2026/05/YoloEase_8VeAPbGp5G.png)

Когда задача готова, нажмите `Finish Job`. Это важный шаг: завершенные задачи участвуют в следующем наборе данных для обучения.

Подробно про панель инструментов, горячие клавиши, рамки, предложения модели и сопоставление меток: [редактор разметки](/ru/YoloEase/features/annotation-editor).

![Ready for first training](https://s3.eyeauras.net/media/2026/05/YoloEase_0N5rmLKhsA.png)

## Запустите обучение

Вернитесь в `Trainer` и запустите локальное обучение. YoloEase соберет набор данных из размеченных задач, разделит изображения на обучающую и проверочную части, затем запустит обучение.

![Training running](https://s3.eyeauras.net/media/2026/05/YoloEase_pNV4AW3F2r.png)

После обучения откройте метрики. Первый результат может быть шумным: это нормально, если данных мало.

![Training metrics](https://s3.eyeauras.net/media/2026/05/YoloEase_UQNGLfMszk.png)

## Посмотрите предсказания

После появления модели YoloEase может прогнать предсказания по кадрам. Это помогает понять, что модель уже выучила, где ошибается и какие кадры стоит добавить в следующую задачу.

![Prediction preview](https://s3.eyeauras.net/media/2026/05/YoloEase_eUeVre8Bbg.png)

![Prediction with button](https://s3.eyeauras.net/media/2026/05/YoloEase_fDH7TdlEga.png)

![Prediction on targets](https://s3.eyeauras.net/media/2026/05/YoloEase_jPrfbGeQtE.png)

## Используйте модель для авторазметки

Откройте следующую задачу. Теперь в блоке `Models` можно добавить `Latest`, загрузить модель и запустить ее на текущем кадре или на всей задаче.

![Editor with model](https://s3.eyeauras.net/media/2026/05/YoloEase_jEFZb2nxWc.png)

После запуска модель создаст предложения или сразу добавит рамки, если включена соответствующая настройка. Проверьте результат глазами.

![Auto annotated task](https://s3.eyeauras.net/media/2026/05/YoloEase_KMBzwXfQT9.png)

Если модель создает предложения, они остаются временными, пока вы не нажали `Accept` или `Accept all`. Не принятые предложения не попадут в обучение.

Если модель добавила лишний объект, выделите его и удалите через `Q`, `Delete` или `Backspace`.

![Removing false positive](https://s3.eyeauras.net/media/2026/05/YoloEase_UyYYi1dOFb.png)

## Повторяйте поколения

После второй и третьей итерации качество обычно становится заметно лучше: модель уже помогает разметить больше кадров, а вы исправляете только ошибки.

![Second generation metrics](https://s3.eyeauras.net/media/2026/05/YoloEase_IQStvCNnhh.png)

Завершенные задачи можно открыть повторно, если нужно разметить их новой моделью или исправить старые ошибки.

![Reopen completed tasks](https://s3.eyeauras.net/media/2026/05/IBbk1nDkee.png)

Финальные веса лежат в папке запуска обучения. Через `Open` в `Trainer` можно открыть папку результата и забрать `best.pt`, `last.pt` и `.onnx`.

![Open model folder](https://s3.eyeauras.net/media/2026/05/YoloEase_AKduA4R9xH.png)

![Model output files](https://s3.eyeauras.net/media/2026/05/1gcs8iFm66.png)

Что означают `.pt`, `.onnx`, размер модели и opset: [YOLO ONNX и веса моделей](/ru/YoloEase/features/yolo-onnx).

Если набор данных маленький или объекты выглядят слишком однообразно, переходите к [аугментациям](/ru/YoloEase/features/augmentations). Если модель уже достаточно хорошая, подключайте ее в [EyeAuras](/ru/YoloEase/use-in-eyeauras). Если что-то ломается, откройте [диагностику](/ru/YoloEase/features/diagnostics).
