---
title: Обход ограничений ввода в удалённом рабочем столе
description: Как работает обход ограничений ввода в сеансах удалённого рабочего стола.
published: true
date: 2026-04-01T01:07:05.162Z
tags: ai-translated
editor: markdown
dateCreated: 2024-03-15T03:34:12.220Z
---
# Обход ограничений Remote Desktop для Lineage 2

Ниже — короткая инструкция по настройке.

## 1. Скачайте EyeAuras

Сначала скачайте приложение EyeAuras с нашего сайта: [EyeAuras Download](https://eu.eyeauras.net/download)

## 2. Зарегистрируйтесь и при необходимости купите лицензию

- Создайте аккаунт и, если нужно, приобретите лицензию, чтобы открыть все возможности. Начать можно здесь: [EyeAuras Login](https://eu.eyeauras.net/login)

## 3. Настройте Input Redirects

- Скачайте этот бесплатный драйвер для совместимости: [Download Driver](https://s3.eyeauras.net/media/2024/10/HVDK%20Standard%202.1.exe)

- После установки перейдите в `C:\Program Files (x86)\ControlMyJoystick 5.5.78.50\Driver\Joystick` и запустите `.bat`-файл удаления от имени администратора.

## 4. Настройте EyeAuras

Откройте EyeAuras, перейдите в Settings и измените `Input Redirect Simulation` на `TetherScript Driver`.

![screenshot_43.png](/screenshot_43.png)

После применения изменений в нижней панели появятся кнопки переключения redirect, с помощью которых можно включать и отключать перенаправление.

![screenshot_42.png](/screenshot_42.png)

## 5. Решение проблем

Если возникнет баг, при котором камера постоянно крутится, откройте настройки игры (L2 settings) и отключите `Enable Controller` в разделе `Settings -> Configuration`.

## 6. Рекомендуемая программа для удалённого доступа: Parsec

- Скачать: [Download Parsec](https://parsec.app/downloads)
- Подробнее: [here](https://wiki.eyeauras.net/en/Lineage/parsec)

## 7. Видеогайд

Если вам удобнее настраивать всё по видео, у нас есть подробный видеогайд по установке и использованию.