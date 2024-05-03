---
title: Image Effects
description: post-processing - color removal, blue, filtering
published: true
date: 2024-05-03T09:24:24.272Z
tags: image capture effects
editor: markdown
dateCreated: 2024-05-03T09:24:24.272Z
---

# Captured image post-processing
Sometimes, captured image is not good enough to do image/color/ml search straight away - it could be too noisy or contain too much similar colors and objects to make analysis effects.
In this case, post-processing via one of available effects is a way to go. You can:
- remove or replace colors similar to specified hue
- grayscale/negate the image, to make it easier to recognize text
- sharpen edges to make it easier for ML to detect paths
- erode and dilate the image to amplify some color
- resize to letterbox to make ML-processing easier
- and much more!

# Performance
All effects are highly optimized and are expected to be applied in real-time to captured images. Some of them, such as color removal, operate at 500+ fps, meaning that you can apply multiple of them without noticing major difference in processing times.
If you'll notice that effect greatly affects performance - please report, as this is probable a bug.

# Available effects
Let's take a look at what effects can do. Here is an initial image:
![](https://i.imgur.com/F3FpciG.jpeg =x300)

## Color Removal
Can remove(replace with black) colors similar to specified one using HSV-scale.
For example, you can easily remove ground and leave only characters and monsters - this will make training target-picking ML-model a breeze
![](https://i.imgur.com/rwHBBQJ.png =x300)

## Color Replacement
Works almost exactly like Color Removal, with the one exception that it allows you to specify any color which will be used as replacement.
Also it can replace everything which is NOT similar to specified color. 
For example, by applying terrain replacement effect where passable terrain is in white and non-passable is in black, you can build a movement system around it.
P.S. Note that any effect could be applied to part of the captured image

![](https://i.imgur.com/UiaAQQN.jpeg =x300)


## Crop
It is a simple effect which allows to crop the image to desired region. 
![](https://i.imgur.com/DF8ZF04.png =x200)

## Denoise
Before:
![](https://i.imgur.com/pEBYVXm.png =x200)
After:
![](https://i.imgur.com/mTXX1Ru.png =x200)

## Dilate
Dilations increase the size of foreground objects and are especially useful for joining broken parts of an image together.
![](https://i.imgur.com/VC0uzRv.png =x300)

## Erode 
Just like water rushing along a river bank erodes the soil, an erosion in an image “erodes” the foreground object and makes it smaller. Simply put, pixels near the boundary of an object in an image will be discarded, “eroding” it away.
![](https://i.imgur.com/9PD7Caj.png =x300)

## Gaussian Blur
Blurs part of the image, could be useful to remove smaller elements such as text, to make further post-processing and/or analysis more effective
![](https://i.imgur.com/cw8h21J.png =x300)

## Grayscale
Turns people black and white. Plain and simple. In some cases it is more effective to get rid of coloring to avoid having to remove undesired elements
![](https://i.imgur.com/WJYt9Ak.jpeg =x300)

## Negate
Negates ALL colors of an image. Black turns white and vice versa. The most useful application of this is to turn white text or text of any other color into black as Text recognition works the best when there are Black letters on White canvas.
![](https://i.imgur.com/2HhXCNE.png =x400)

## Rescale, %
Could be used to reduce size of a captured image to reduce computation power required to process the image. For example, image of size `1920x1080` contains `2,073,600` pixels. Resize it to **50%** and you'll get `960x540` which is only `518,400` pixels! This is less important for ML, but for classical algorithms which are used in Image Search and Color Search this could give them a great boost

## Resize, in pixels
Allows to resize image to specified size. This is especially useful when you're working with machine-learning models, which are trained on a specific set of images. By applying letterboxing, you can keep dimensions intact and make models work better. 
![](https://i.imgur.com/O0ffYCH.png =x400)
