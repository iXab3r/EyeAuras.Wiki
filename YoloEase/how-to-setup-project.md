---
title: How to setup a project
description: 
published: true
date: 2023-11-12T14:28:35.197Z
tags: 
editor: markdown
dateCreated: 2023-10-29T18:37:51.063Z
---

# How to register CVAT account
For annotations, YoloEase is able to use any server that is running CVAT. It could be [official website](https://www.cvat.ai/), [local instance](https://opencv.github.io/cvat/docs/administration/basics/installation/) or you can use [EyeAuras CVAT instance](https://cvat.eyeauras.net/). For this guide I'll assume that you will be using the latter.
1. Register on [EyeAuras CVAT Server](https://cvat.eyeauras.net/auth/login), note - you do not have to use the same credentials as on your main [EyeAuras](https://eyeauras.net/https://eyeauras.net/) account
2. [Login](https://cvat.eyeauras.net/auth/login) and make sure that CVAT is showing you the list of your projects and allows you to create one. If not - [contact me](https://wiki.eyeauras.net/en/contacts).
3. Go to Projects tab in the top left corner of CVAT
4. Follow the guide "How to create a new project in CVAT" below and create your first project

# How to create a new project in CVAT
1. [Login](https://cvat.eyeauras.net/auth/login) and make sure that CVAT is showing you the list of your projects and allows you to create one. If not - [contact me](https://wiki.eyeauras.net/en/contacts).
2. Create new project by clicking on small plus icon at the top of projects list 
[![Projects](https://i.imgur.com/cDokIQE.png =x100)](https://i.imgur.com/cDokIQE.png)
3. In a form that will open, put in project name, then click on "Add Label" button
4. Add one or more labels, which are basically objects, that you will be tracking using the model
[![Create project](https://i.imgur.com/PnQROWo.png =x200)](https://i.imgur.com/PnQROWo.png)
> Do not forget to click "Continue" to save the label!
{.is-warning}

5. Click on **Submit & Open** when you're done with configuration
6. That is is for CVAT, project setup is done here. YoloEase will take care of the rest.


# How to configure YoloEase project
1. [Start the tool](/en/YoloEase/how-to-launch)
2. Enter CVAT credentials. You can change CVAT server at this stage
3. Click on "Login" button, wait for the system to log you in
4. This is how an empty project may look like (screenshot is from early alpha, but just to give you an idea)
[![Login form](https://i.imgur.com/kZPrqkD.png =x150)](https://i.imgur.com/kZPrqkD.png)
5. Prepare your first dataset using, [click here](/en/YoloEase/how-to-prepare-dataset) for more details
6. Click on "Add folder" and add one or more folders with your screenshots/photos/etc
[![Add folder form](https://i.imgur.com/hIVnERf.png =x75)](https://i.imgur.com/hIVnERf.png)
7. That is it, you're good to go, you can now start the training process, [click here](/en/YoloEase/how-to-use-automatic-trainer) for more details