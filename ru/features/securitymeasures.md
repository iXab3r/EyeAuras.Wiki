---
title: Обход обнаружения
description: 
published: true
date: 2024-05-14T11:16:55.906Z
tags: безопасность, защита, программирование
editor: markdown
dateCreated: 2022-12-20T17:27:54.469Z
---
Учитывая тот факт, что программа может подвергаться блокировке некоторыми системами античита (например, для Lineage 2 это Active Anticheat), существуют встроенные инструменты для избежания обнаружения.

**ВАЖНО! EyeAuras должен быть запущен ПЕРЕД запуском вашей игры.**

## Без инъекций!

Все, что делает приложение, оно делает без изменения игры или ее файлов. Это гарантирует, что любой активный вид защиты, который периодически проверяет установленные хуки и подобное, не покажет ничего. Единственный способ обнаружить приложение - найти его в системе, и противодействие ему постоянно улучшается.

## Шифрование контейнера - первый уровень защиты

Приложение упаковано в один зашифрованный исполняемый файл, не имеющий никаких подписей, и все файлы, необходимые для работы приложения, упакованы непосредственно в само приложение.

## Шифрование модулей - второй уровень защиты

Каждая операция, которую может выполнять приложение, представлена в виде отдельного "модуля" - компьютерное зрение, имитация ввода, связь, все они упакованы в отдельные библиотеки, каждая из которых имеет уникальную подпись для каждой новой версии.

## Опция "Меры безопасности"

Эта опция находится в настройках приложения и включает несколько дополнительных шагов, которые пытаются защитить программу от обнаружения. Время запуска приложения увеличится, в некоторых случаях это может занять до 1 дополнительной минуты.

## Дополнительные советы

-   Самый безопасный способ использования бота - использование нескольких ПК и стриминга. Таким образом, EyeAuras никогда не работает на том же ПК, где находится игра, что делает обнаружение практически невозможным, особенно если вы выполните дополнительные шаги, такие как выбор эмулятора аппаратного ввода (KMBox или Usb2Kbd).
-   По возможности предпочтительнее использовать [упакованную](https://wiki.eyeauras.net/en/changelogs/6736) версию скриптов. Это новое развитие, которое находится на ранних стадиях, но упаковывая ауры и скрипты, мы можем сделать обнаружение чрезвычайно сложным.