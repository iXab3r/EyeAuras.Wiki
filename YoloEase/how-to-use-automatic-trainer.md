---
title: How to use Automatic Trainer
description: 
published: true
date: 2023-11-12T14:28:45.905Z
tags: 
editor: markdown
dateCreated: 2023-10-29T18:38:33.666Z
---

Automatic trainer is available in a separate "Trainer" tab and is basically the main thing, that does data processing, training, model conversion, etc. It is expected, that you've already dealt with Settings before, i.e. added credentials, folders, etc.
Check out [getting started guide](/en/YoloEase/getting-started) if you have not done so yet.

1. First of all, Training should never break anything. It is designed in a way that each and every training iteration does not affect previous ones, so do not be afraid of losing your data.
> Take it with a pile of salt, it is in alpha stage after all :D
{.is-warning}

2. Let's click on "Start" and see how it goes.
[![First iteration](https://i.imgur.com/J1eA4T7.png =x100)](https://i.imgur.com/J1eA4T7.png)
3. As you can see, Trainer says that we have to prepare at least one annotation before it will be able to do the training. We have to add at least one **annotations** pack. This will be used to provide training data to the model. This step is partially manual and will require you to do some editing. Annotations are done in batches called "tasks". 
4. YoloEase is able to create batches for yourself, hover on Create task button to see all available settings, we'll get through them later. For now, let's just click on "Create task"
[![Create task](https://i.imgur.com/uTC0uYw.png =x200)](https://i.imgur.com/uTC0uYw.png)
5. YoloEase will create a new task and will open up browser window automatically, which will take you to CVAT Annotations Editor, [check this guide](/en/YoloEase/how-to-annotate-using-cvat) to learn about annotation process
6. After you've completed annotating the task click on "Refresh button in the middle of bottom bar". 
If everything went fine, you'll see that now you have 1 fully annotated task
[![State after annotation](https://i.imgur.com/du4pAv2.png =x30)](https://i.imgur.com/du4pAv2.png)
7. Click on "Start" (if it was not already running) and after some time, you'll get your first (not-really)working model! YoloEase will automatically run predictions using your new model, so you can check how exactly the model is improving over time. 
8. From that point, just repeat steps 4-7 until you'll get a perfect result! 
Keep in mind, that it may take from twenty to hundreds of images to get quality results. At some point, when the model becomes good enough, you can enable "Auto-annotation". This will make "Create task" use latest prediction results to pre-annotate the image. Best-case-scenario - you'll just have to review results, click on "Finish the job" and that is it. Worst-case - you'll have to re-annotate images. All-in-all, you will be gradually moving from manual annotation to fully automatic annotation.
