---
title: Prerequisites
description: 
published: true
date: 2024-06-14T18:12:19.406Z
tags: 
editor: markdown
dateCreated: 2023-10-29T18:35:33.765Z
---

> All these command are expected to be started using CMD with admin priveleges (requirement for cvat-cli)
{.is-info}

1. Install Python 3.9.0 (later versions will probably work as well)
> Do not forget to tick "Add to PATH" / "Add Python to environment variables", if installer will offer you to do so
{.is-warning}

*for Windows x64:*
```
https://www.python.org/ftp/python/3.9.0/python-3.9.0-amd64.exe
```

2. Verify that Python has installed by running version check, it should print "Python 3.9.0" (or other version)
```bash
python --version
```
3. Verify that Python package manager (PIP) is installed and working by running PIP version check, it should print something like "pip 20.2.3 from c:\users\gpuvm\appdata\local\programs\python\python39\lib\site-packages\pip (python 3.9)"
```bash
pip --version
```
4. Install [Ultralytics](https://github.com/ultralytics/ultralytics) which is the model we're going to use for our training. Installation may take a while as it weights quite a lot (few gigabytes)
```bash
pip install ultralytics
```
5. Now let's make sure that Ultralytics have been installed correctly. Run that command, which will use the default model to find a bus on an image pulled from internet:
```bash
yolo predict model=yolov8n.pt source='https://ultralytics.com/images/bus.jpg'
```
6. By default, "yolo" saves predicted results into the same folder that you've currently been in: "runs/detect/predict", open Explorer to navigate to the current folder, then you can double-check that the folders are there and the detection results are fine.
```
explorer .
```
[![Prediction results](https://i.imgur.com/SrwvqFM.png =x150)](https://i.imgur.com/SrwvqFM.png)
7. Install Python dependencies
```bash
pip install opencv-python numpy matplotlib shapely onnxruntime
```
8. Install [CVAT Command Line Interface](https://opencv.github.io/cvat/docs/api_sdk/cli/) 
```bash
pip install cvat-cli cvat_sdk
```
9. Verify that CVAT CLI has been installed correctly by running version check, should print the version number to console
```bash
cvat-cli --version
```
10. If EyeAuras or YoloEase were running, you'll have to restart them, otherwise they won't be able to find the tools that you've installed
