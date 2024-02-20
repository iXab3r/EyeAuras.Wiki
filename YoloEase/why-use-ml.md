---
title: Why  use Machine Learning in the first place?
description: comparison of classical and machine-learning approaches
published: true
date: 2023-11-12T14:29:10.036Z
tags: 
editor: markdown
dateCreated: 2023-10-31T10:48:23.567Z
---

From the early stages of EyeAuras' development, the software utilized computer vision to identify elements on a screen, such as [Image Search](/en/triggers/images/image-search), [Color Search](/en/triggers/images/color-search), and [Text Search](/en/triggers/images/text-search).

Each trigger catered to specific scenarios:
- [Color Search](/en/triggers/images/color-search) typically addressed questions like "Is my HP lower than a certain percentage?" or "Is the skill ready to use?"
- [Image Search](/en/triggers/images/image-search) answered, "Do I have a specific buff/debuff on me?" or "Is there an item lying on the ground?"
- [Text Search](/en/triggers/images/text-search) could determine "Is my HP below 1450?" or "Has anyone sent me a message containing the word 'bot'?"

While these triggers effectively addressed many scenarios, especially for smaller sets of auras, they occasionally fell short in terms of speed, accuracy, or flexibility. This led to the development of [ML Search](/en/triggers/images/ai-search-trigger).

Benefits of ML Search over other "Search" triggers include:
- **Accuracy**: The model can achieve high precision, detecting objects under varying lighting conditions, from different angles, and even recognizing multiple potential appearances of an object.
- **Performance**: Depending on the hardware and model size, it can operate at a remarkable speed—achieving 50-60fps, which surpasses the capabilities of traditional methods.
- **Flexibility**: Yolo, one of the leading models available, offers four distinct tasks (https://docs.ultralytics.com/tasks/). More details are provided below.

# Where's the Catch?
While ML Search might appear to be a superior "Search" trigger, it's not without challenges. Preparing and training a model is a complex process that requires an array of tools to perfect. The journey from conceptualizing a need ("I want to find that buff icon") to model implementation can range from a few minutes to an indefinite period for those aiming for continuous improvement. 
###### **It's not a panacea but rather a versatile tool in your arsenal.**
Mastering it demands time and effort. You'll need to understand data preparation, model training, and proper usage. However, the rewards for mastering it are substantial.

# Capabilities of My Models
Currently, EyeAuras primarily utilizes [Yolo](https://docs.ultralytics.com/), a top-tier computer vision model. While other models might be incorporated in the future, Yolo remains a preferred choice due to its flexibility, speed, and user-friendliness.

## Classification 
##### Aka: Is there \<something\> in the picture? 
![Classification](https://user-images.githubusercontent.com/26833433/243418606-adf35c62-2e11-405d-84c6-b84e7d013804.png =x200)
Though similar to [Image Search](/en/triggers/images/image-search), Classification doesn't provide the exact location of an identified object. It merely confirms its presence. Notably, its speed is unparalleled, operating in the realm of thousands of FPS.

Tasks it can handle include:
- Identifying specific buffs/debuffs.
- Detecting enemies or valuable items on screen.
- Recognizing character statuses like being dead, stunned, or silenced.
- Determining if settings are open or if a loading screen is active.

[Official Docs](https://docs.ultralytics.com/tasks/classify/) 

## Object Detection
###### Aka: Locate \<something\> in the picture with bounding-box precision.
![Object Detection](https://user-images.githubusercontent.com/26833433/243418624-5785cb93-74c9-4541-9179-d5c6782d491a.png =x200)
Think of it as an enhanced [Image Search](/en/triggers/images/image-search). It can identify multiple object types in one pass and scales efficiently when increasing object types or quantities.

Tasks it can handle include:
- Locating specific buffs/debuffs.
- Counting and locating items on the ground.
- Determining the number and location of nearby enemies.

[Official Docs](https://docs.ultralytics.com/tasks/detect/)

## Segmentation
###### Aka: Pinpoint \<something\> in the picture with pixel-level accuracy.
![Segmentation](https://user-images.githubusercontent.com/26833433/243418644-7df320b8-098d-47f1-85c5-26604d761286.png =x200)
Segmentation is the pinnacle of ML capabilities. It provides a detailed view of objects, even if they overlap. In gaming, its best application might be for constructing a minimap to navigate, differentiating walkable areas from obstacles. It offers unparalleled precision while maintaining impressive performance.

Tasks it can handle include:
- Distinguishing walkable areas on a map.

[Official Docs](https://docs.ultralytics.com/tasks/segment/)