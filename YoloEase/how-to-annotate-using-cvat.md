---
title: How to do annotations using CVAT
description: 
published: true
date: 2023-11-12T14:27:23.197Z
tags: 
editor: markdown
dateCreated: 2023-10-29T18:39:08.492Z
---

Annotation is a process of marking objects of interest in an image. You basically tell the future model what things are and how they look like. For now, we will be using CVAT to do the job as it has quite a good editor. 
1. Click "N" or select "Draw new rectangle" at the left side of editor
2. Select object of interest, put a correct label on it (if there are multiple labels)
3. Rinse and repeat
4. Here is how results may look like in the end, I've marked 3 spheres of different sizes: https://i.imgur.com/AFwAOaj.jpeg
5. As soon as you've done with annotations, click on "Menu => Finish the job"
[![Finish the job](https://i.imgur.com/uTC0uYw.png =x200)](https://i.imgur.com/uTC0uYw.png)
> Do not forget to do that, otherwise YoloEase will not consider this task as a valid source of annotations!
{.is-warning}