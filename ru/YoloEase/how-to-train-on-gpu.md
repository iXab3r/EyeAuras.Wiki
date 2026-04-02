---
title: Как настроить обучение на GPU
description: Краткое руководство по настройке PyTorch и Yolo для использования GPU вместо CPU
published: true
date: 2023-11-12T14:28:26.467Z
tags: ai-translated
editor: markdown
dateCreated: 2023-10-30T23:01:58.257Z
---
> Незавершённая статья
{.is-warning}

# Проверка и настройка CUDA для YOLO

Использование CUDA при обучении YOLO может заметно ускорить процесс. Ниже — кратко о том, зачем обучать на GPU, как проверить использование CUDA и как правильно настроить PyTorch.

## Зачем обучать на GPU?

Обучение моделей машинного обучения, особенно глубоких нейронных сетей, требует большого количества вычислений. Сложные математические операции, которые выполняются во время прямого и обратного проходов сети, хорошо распараллеливаются, поэтому GPU особенно подходят для таких задач.

### Скорость и эффективность

- **Параллельная обработка**: в отличие от CPU, которые одновременно обрабатывают лишь ограниченное число задач, GPU рассчитаны на тысячи параллельных операций, что делает обучение быстрее и эффективнее.
- **Пропускная способность памяти**: у GPU она часто выше, чем у CPU, благодаря чему данные считываются и обрабатываются быстрее.

### Примеры и реальные цифры

- Согласно [benchmark study by NVIDIA](https://developer.nvidia.com/deep-learning-performance-training-inference), время обучения некоторых моделей глубокого обучения при переходе с CPU на GPU сокращалось с дней до часов.
- Крупные технологические компании, такие как Google и Facebook, активно используют GPU-кластеры для обучения своих продвинутых AI-моделей.

## Как проверить, использует ли YOLO CUDA

Если вы используете реализацию YOLO на PyTorch, выполните следующие команды Python:

```python
import torch
print(torch.cuda.is_available())
```

## Настройка CUDA для PyTorch и YOLO

Использование CUDA вместе с PyTorch может значительно ускорить работу YOLO. Ниже — что нужно проверить, чтобы PyTorch и YOLO были правильно настроены для использования CUDA.

### 1. Что потребуется

Перед началом убедитесь, что у вас есть:

- GPU от NVIDIA.
- Установленный [NVIDIA CUDA Toolkit](https://developer.nvidia.com/cuda-downloads).
- Установленный [cuDNN](https://developer.nvidia.com/cudnn) (CUDA Deep Neural Network library).

### 2. Установите PyTorch с поддержкой CUDA

При установке PyTorch убедитесь, что вы выбираете версию, совместимую с установленной у вас версией CUDA. Для генерации подходящей команды установки используйте официальный сайт [PyTorch](https://pytorch.org/get-started/locally/). Например:

```bash
pip install torch torchvision torchaudio -f https://download.pytorch.org/whl/cu111/torch_stable.html
```

Эта команда устанавливает PyTorch с поддержкой CUDA 11.1.

### 3. Проверьте интеграцию PyTorch и CUDA

В Python можно проверить, использует ли PyTorch CUDA:

```python
import torch
print("CUDA available:", torch.cuda.is_available())
print("CUDA version:", torch.version.cuda)
```

Ожидаемый вывод будет выглядеть примерно так:

```bash
CUDA available: True
CUDA version: 11.6
```