---
title: AI Search
description: uses machine learning to recognize and track objects in the specified game window, providing flexible and powerful game interaction options.
published: true
date: 2024-05-14T11:17:45.665Z
tags: 
editor: markdown
dateCreated: 2023-06-18T13:58:48.187Z
---

The AI Search Trigger in EyeAuras utilizes machine learning (AI) to detect and identify objects in captured images from a specified window. The trigger uses a pre-trained machine learning model to recognize the objects and can be tuned to activate under specific conditions based on the recognized objects.

#### Capture Options

Capture options for the AI Search Trigger are the same as for other Image Capture Triggers. They control how and when EyeAuras captures the image to process. For detailed information on how these options work, refer to the [_Image Capture Triggers page_](https://wiki.eyeauras.net/en/triggers/images/imagecapturetriggers).

#### ML Model

The AI Search Trigger supports YOLOv3+ models in ONNX format for object detection, segmentation, and classification. Detailed documentation for creating and using these models can be found [_here_](https://docs.ultralytics.com/).

#### ML Class

Users can specify the class of objects that the trigger should identify. If your model contains metadata for class names, you can select a specific class for EyeAuras to look for. By default, the trigger will consider "any class".

#### Match Threshold

All matches with a confidence score below this threshold will be discarded. The trigger activates when there is at least one match above the specified threshold.

#### IoU Threshold

Intersection over Union (IoU) is an evaluation metric used to measure the accuracy of an object detector on a particular dataset. More about this [_here_](https://www.pyimagesearch.com/2016/11/07/intersection-over-union-iou-for-object-detection/).

#### Calculation Threads / InterOp Threads

The number of CPU threads EyeAuras will use to get the results. More threads will yield faster results, but place a higher load on the system.

### **Application in Gaming**

Here are some examples of how the AI Search Trigger might be used in games:

-   **Object Detection in Complex Games**: ML Search can be used to detect complex objects in games, where static image recognition would not suffice. For instance, locating a specific type of enemy or NPC in an MMO.
-   **Dynamic Environment Interaction**: ML Search can detect changes in the environment, triggering specific actions. For example, navigating a changing maze or avoiding dynamic obstacles.
-   **Image Classification for Strategy**: In strategy games, ML Search can classify different types of units or buildings, allowing for strategic decisions based on the current game state.
-   **Game State Recognition**: ML Search can be used to recognize different game states (like menu screens, gameplay, cutscenes, etc.) and trigger appropriate actions.
-   **Inventory Management**: ML Search can be used to recognize and manage items in an inventory, useful in RPGs or survival games with complex inventory systems.
-   **Character Health Monitoring**: In games where health bars might change visually or are artistically designed, ML Search can accurately detect the status of the health bar and trigger actions when health drops below a certain threshold.
-   **Enemy Recognition**: ML Search can recognize specific enemy types and trigger different strategies for dealing with each type.
-   **Automated Exploration**: ML Search can help navigate unknown or procedurally generated environments by identifying landmarks or path indicators.
-   **Interaction Detection**: ML Search can detect when certain in-game interactions occur, such as receiving a friend request or being attacked, and react accordingly.
-   **Behavior-Based Actions**: ML Search can detect behaviors or patterns in a game that may not have a distinct visual marker but might be recognizable through ML, such as detecting player movements or patterns in enemy behavior.

For more information about training a model for use with the AI Search Trigger, refer to Yolo [_Model Training Guide_](https://docs.ultralytics.com/tasks/detect/#train).