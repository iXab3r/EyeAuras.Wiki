---
title: Предварительные требования
description: Необходимые условия и требования перед началом работы
published: true
date: 2024-10-24T16:44:18.036Z
tags: ai-translated
editor: markdown
dateCreated: 2023-10-29T18:35:33.765Z
---
Все команды ниже нужно запускать через **CMD от имени администратора** — это требуется для `cvat-cli`.
{.is-info}

## 1. Установите Python 3.9.0

Более поздние версии, скорее всего, тоже подойдут.

> Не забудьте включить опцию **"Add to PATH"** / **"Add Python to environment variables"**, если установщик предложит это сделать.
{.is-warning}

*Для Windows x64:*
```
https://www.python.org/ftp/python/3.9.0/python-3.9.0-amd64.exe
```

## 2. Проверьте, что Python установлен

Выполните команду ниже. Она должна вывести `Python 3.9.0` (или другую версию):

```bash
python --version
```

## 3. Проверьте, что PIP установлен и работает

Выполните проверку версии PIP. В ответ должно появиться что-то вроде `pip 20.2.3 from c:\users\gpuvm\appdata\local\programs\python\python39\lib\site-packages\pip (python 3.9)`:

```bash
pip --version
```

## 4. Установите [Ultralytics](https://github.com/ultralytics/ultralytics)

Это модель, которую мы будем использовать для обучения. Установка может занять некоторое время, так как пакет весит довольно много — несколько гигабайт.

```bash
pip install ultralytics==8.2.78 
```

## 5. Убедитесь, что Ultralytics установлен правильно

Запустите эту команду — она использует модель по умолчанию, чтобы найти автобус на изображении из интернета:

```bash
yolo predict model=yolov8n.pt source='https://ultralytics.com/images/bus.jpg'
```

## 6. Проверьте результат распознавания

По умолчанию `yolo` сохраняет результаты в папку `runs/detect/predict` внутри текущей директории. Откройте текущую папку в Explorer и убедитесь, что папки создались, а результат распознавания выглядит корректно.

```bash
explorer .
```

[![Prediction results](https://i.imgur.com/SrwvqFM.png =x150)](https://i.imgur.com/SrwvqFM.png)

## 7. Установите зависимости Python

```bash
pip install opencv-python numpy matplotlib shapely onnxruntime==1.18.0
```

## 8. Установите [CVAT Command Line Interface](https://opencv.github.io/cvat/docs/api_sdk/cli/)

```bash
pip install cvat-cli==2.5.0 cvat_sdk==2.5.0
```

## 9. Проверьте, что CVAT CLI установлен правильно

Выполните проверку версии. В консоль должен быть выведен номер версии:

```bash
cvat-cli --version
```

## 10. Перезапустите EyeAuras или YoloEase

Если EyeAuras или YoloEase были запущены, их нужно перезапустить. Иначе они не смогут найти установленные вами инструменты.