---
title: Getting Started
description: CVATAAT: Your Quick Guide
published: true
date: 2024-03-26T22:31:53.507Z
tags: 
editor: markdown
dateCreated: 2023-10-29T19:14:56.548Z
---

## Why Use YoloEase
Using ML for game bots can make them smarter. Object detection and classification help bots recognize in-game items better. But starting with ML can be tough. That's where YoloEase comes in.

> The tool is currently in early-alpha stage. Any [feedback](https://wiki.eyeauras.net/en/contacts) is highly appreciated
{.is-warning}


## How it streamlines the process
- **Datasets**: Select your images for training. Rest assured, YoloEase treats these as read-only.
- **Configuration**: Define your base model, training settings, and other preferences. This setup is utilized once your data is prepped and ready.
- **Image Management**: YoloEase automatically categorizes your images (e.g., annotated, unannotated, "broken", "outliers"), ensuring efficient use of resources and no redundant work. All you have to do is throw in more images whenever needed.
- **Annotation Cycle**: Annotate a set of images using CVAT and YoloEase automaticaly will re-train the model for you.

## **Training Made Easy**:
1. **Start**: Click 'Start'. YoloEase begins by checking tasks and annotations.
2. **Build Your Dataset**: YoloEase links your local game images with annotations for training.
3. **Train Now**: If you've got finished annotations, model training starts.
4. **See Your Model in Action**: After training, your model predicts on all your images. You can check the results right away!
5. **Add Annotations**: Add new images for annotations anytime. With a good model already, use 'Auto-annotate' for quick annotations you can tweak in CVAT editor later.
6. **Keep Improving**: Finish your annotations, and YoloEase will start the new training cycle, taking into consideration newer data.
With YoloEase, you get a straightforward tool that takes you from image annotations to a trained game bot model.

## Features
- **Workspace Isolation**: Each project is maintained in its dedicated workspace, allowing for version control, rollbacks, and performance comparisons.
- **Diverse Image Sources**: Add images from multiple sources. While currently supporting local sources, future updates will expand this capability.
- **Unified Image Storage**: YoloEase consolidates images from all sources, creating a centralized workspace for ease of access.
- **Intelligent Annotation**: If a model version already exists, YoloEase can utilize it to pre-annotate images, potentially saving annotation time.
- **Batch Selection Modes**: Choose from "Random" or the more strategic "Active Learning" method to select the next batch of images for maximum model improvement.

## Let's Get Started
1. Install the necessary [prerequisites](/en/YoloEase/prerequisites).
2. Download latest version of EyeAuras ```https://eyeauras.net/download```. Preferably **Alpha**. YoloEase is distributed as a part of it *for now*. 
3. [Setup](/en/YoloEase/how-to-setup-project) CVAT and YoloEase projects. These will be used together for different parts of the process.
4. Dive into [training](/en/YoloEase/how-to-use-automatic-trainer) using the automatic trainer.
5. Deploy and utilize your trained model!
