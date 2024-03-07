---
title: Until Success
description: 
published: true
date: 2024-03-07T23:41:51.969Z
tags: 
editor: markdown
dateCreated: 2024-03-07T23:41:51.969Z
---

Нода Until Success является декоратором, который продолжает выполнение своей дочерней ноды до тех пор, пока она не вернет состояние Success. Пока дочерняя нода возвращает Running, Until Success также возвращает Running, продолжая выполнение. Как только дочерняя нода вернет Success, Until Success тоже вернет Success.
