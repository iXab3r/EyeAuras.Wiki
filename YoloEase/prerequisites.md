---
title: Prerequisites
description: How to prepare Python, PyTorch, and GPU support with YoloEase
published: true
date: 2026-05-08T12:00:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2023-10-29T18:35:33.765Z
---
# Prerequisites

YoloEase manages the training tools for you. In the usual setup, you do not need to install Python separately, install training packages, or configure environment variables manually. Open your project, go to the `Prerequisites` tab, and let the app check the environment.

![Prerequisites missing](https://s3.eyeauras.net/media/2026/05/YoloEase_wfJdcyvdZj.png)

## Quick start

1. Open your YoloEase project.
2. Go to the `Prerequisites` tab.
3. Click `Check all`.
4. If anything is missing, click `Install missing`.
5. Wait for the installation to finish.
6. Click `Check all` again if you want to verify everything once more.

The `Copy all` button is useful when you need to send diagnostic information. `Clear all` clears the current output in the checks list.

## What YoloEase checks

`Managed Python 3.11` checks the portable Python installation stored in the YoloEase data folder.

`Python environment` checks the app's virtual environment.

`Package installer` checks that Python packages can be installed.

`GPU driver helper` shows the detected NVIDIA GPU and whether the driver is compatible with the CUDA runtime.

`PyTorch runtime` installs either the CPU or CUDA version of PyTorch into the managed environment.

`Python packages`, `Yolo CLI`, and `GPU acceleration` check that the required packages, CLI, and acceleration support are working.

![All prerequisites installed](https://s3.eyeauras.net/media/2026/05/YoloEase_OuA9BUthjc.png)

## A GPU is optional

A GPU makes training faster, but it is not required to run YoloEase. If no compatible NVIDIA GPU is found, training can run on the CPU instead. It will be slower, but it does not require a dedicated graphics card.

If a GPU is detected and the driver is compatible, YoloEase will install the CUDA-enabled PyTorch build and automatically select the CUDA device during local training.

## If installation fails

The most common practical reason is lack of disk space. PyTorch and wheel package caches can take many gigabytes, especially when installing the CUDA build.

![No space left on device](https://s3.eyeauras.net/media/2026/05/YoloEase_5T0uv3vFkV.png)

What to do:

1. Free up disk space on the drive where the YoloEase data folder is stored.
2. Click `Clear all` to remove the old log.
3. Run `Install missing` again.
4. If the error happens again, use `Copy all` and attach the output to your error report.

Once all lines are green, you can move on to [preparing your data](/YoloEase/prepare-data).

If you want to understand why YoloEase needs PyTorch, Ultralytics, and ONNX Runtime, and why it exports with `opset 17`, see [YOLO ONNX and model weights](/YoloEase/features/yolo-onnx). If installation or training keeps failing, open the [diagnostics](/YoloEase/features/diagnostics).