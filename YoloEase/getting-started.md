---
title: Getting Started
description: YoloEase: Your Quick Guide
published: true
date: 2024-05-14T17:08:10.932Z
tags: 
editor: markdown
dateCreated: 2023-10-29T19:14:56.548Z
---

# YoloEase
is a tool that automates Yolo 8+ training process. It can leverage annotation capabilities of [CVAT](https://www.cvat.ai/) (any server will work, by default it uses [unofficial](https://cvat.eyeauras.net/) instance but you can change it at any time).
Wiki is located here - https://wiki.eyeauras.net/en/YoloEase/getting-started

> The tool is currently in early alpha stage. Any [feedback](https://wiki.eyeauras.net/en/contacts) is highly appreciated
{.is-warning}

## Let's Get Started
1. Install the necessary [prerequisites](/en/YoloEase/prerequisites).
2. Download latest version [here](https://github.com/iXab3r/YoloEase/releases/)
3. [Setup](/en/YoloEase/how-to-setup-project) CVAT and YoloEase projects. These will be used together for different parts of the process.
4. Dive into [training](/en/YoloEase/how-to-use-automatic-trainer) using the automatic trainer.
5. Deploy and utilize your trained model!

First you setup CVAT/Dataset/model settings
![Main window](https://i.imgur.com/Mm7J8nc.png =x400)

Then you can start creating annotation tasks. When new task is created you can pick an option to pre-annotate the batch and/or pick only those images which will benefit model the most
![Task Settings](https://i.imgur.com/a9owC7c.png =x400)

As soon as the program will detect that something has changed - settings, annotations, images - it will re-train the model right away. As soon as the model will be ready you can use it to pre-annotate next batch
![Training process](https://i.imgur.com/gunKrAJ.png =x500)


## How it streamlines the process
- **Datasets**: Select your unannotated images for training. YoloEase treats these as read-only. Images/videos are supported. 
- **Image Management**: YoloEase automatically categorizes your images (e.g., annotated, unannotated, "broken", "outliers"), ensuring efficient use of resources and no redundant work. All you have to do is throw in more images whenever needed.
- **Configuration**: Define your base model, training settings, and other preferences. This setup is utilized once your data is prepped and ready.
- **Annotation Cycle**: Annotate a set of images using CVAT and YoloEase automaticaly will re-train the model for you as soon as it will detect that new annotations are available.


