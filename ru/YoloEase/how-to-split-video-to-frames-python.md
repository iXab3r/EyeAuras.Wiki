---
title: Как извлечь каждый N-й кадр из видео с помощью Python
description: Извлечение каждого N-го кадра из видео с помощью Python.
published: true
date: 2023-11-12T14:27:31.484Z
tags: ai-translated
editor: markdown
dateCreated: 2023-11-07T11:59:08.871Z
---
# Извлечение каждого N-го кадра из видео с помощью Python

В этом руководстве показано, как извлекать каждый N-й кадр из видео с помощью Python. Мы будем использовать скрипт на Python и библиотеку `opencv-python`. Предварительный опыт программирования не требуется.

## Шаг 1. Установите Python

Убедитесь, что Python установлен в вашей системе. Если его нет, скачайте его с [официального сайта Python](https://www.python.org/).

## Шаг 2. Установите `opencv-python`

`opencv-python` — это библиотека, которая помогает обрабатывать видео в Python. Установите её командой:

```bash
pip install opencv-python
```

## Шаг 3. Подготовьте Python-скрипт

Создайте Python-скрипт, который будет принимать путь к видео и интервал кадров.

Откройте любой текстовый редактор и сохраните файл как **extract_frames.py**.

Скопируйте и вставьте следующий код:

```python
import cv2
import os
import argparse

def main(video_path, frame_interval):
    # Extract video file name without extension and create a directory for frames
    video_name = os.path.splitext(os.path.basename(video_path))[0]
    frames_dir = os.path.join(os.path.dirname(video_path), f"{video_name}_frames")
    os.makedirs(frames_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception(f"Error opening video file: {video_path}")

    frame_count = 0
    saved_frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % frame_interval == 0:
            frame_filename = f"{video_name}_#{saved_frame_count + 1}.png"
            cv2.imwrite(os.path.join(frames_dir, frame_filename), frame)
            saved_frame_count += 1
            if saved_frame_count % 30 == 0:
                print(f"Progress: {saved_frame_count} frames saved.")
        frame_count += 1

    cap.release()
    print(f"Saved {saved_frame_count} frames to '{frames_dir}'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract frames from video.")
    parser.add_argument("video_path", type=str, help="Path to the video file.")
    parser.add_argument("-i", "--interval", type=int, default=10, help="Interval of frames to save (default is every 10th frame).")
    args = parser.parse_args()
    main(args.video_path, args.interval)
```

## Шаг 4. Запустите скрипт

Откройте CMD и перейдите в папку, где вы сохранили `extract_frames.py`.

Запустите скрипт командой:

```bash
python extract_frames.py /path/to/video.mp4 -i 10
```

Замените `/path/to/video.mp4` на путь к вашему видеофайлу, а `10` — на нужный интервал кадров.

## Шаг 5. Проверьте результат

После запуска откройте папку с кадрами и проверьте извлечённые изображения с именами вида `video_#0.png`, `video_#1.png` и т. д.

## Шаг 6. Готово

Кадры извлечены и сохранены. При необходимости можно изменить интервал или запустить скрипт для другого видео.