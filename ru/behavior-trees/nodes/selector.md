---
title: Selector
description: 
published: true
date: 2024-03-07T15:10:44.356Z
tags: 
editor: markdown
dateCreated: 2024-03-07T14:54:10.206Z
---

## Что делает ?
Обходит сверху-вниз/слева-направо все дочерние ноды до тех пор, пока какая-то из них не вернет **Success**, т.е. не выполнится успешно. При этом не важно действие это или условие - и то, и другое что-то вернет.

Вернет **Failure** только если все дочерние ноды выполнились со статусом **Failure**. 

Одна из самых-самых часто использующихся нод, она позволяет выстроить последовательность приоритетов (или 1 или 2 или 3). Почти всегда где-то во главе вашего дерева будет именно **Selector**, который будет определять, что же именно персонажу сделать на этот тик - похилиться, выбрать таргет, скастовать скилл или что-то еще. Как только какое-то из этих действий будет выбрано, делать другие уже не имеет смысла (на этот "ход") и это идеально ложится в логику селектора.

Именно эта нода и [Sequence](/ru/behavior-trees/nodes/sequence) будут вашими самыми верными друзьями при построении логики. 

> ВАЖНО! **Sequence** останавливается на первой же ноде, которая вернула **Failure**, а **Selector** останавливается на первой ноде, которая вернула **Success**.  
{.is-info}

![](https://i.imgur.com/pgaOalh.png)