---
title: Обход ограничений ввода на удалённых рабочих столах
description: Как работает обход ввода в сеансах удалённого рабочего стола.
published: true
date: 2026-03-31T22:44:42.870Z
tags: ai-translated
editor: markdown
dateCreated: 2024-03-15T03:34:12.220Z
---
# Обход Remote Desktop для Lineage 2

Чтобы начать, выполните несколько простых шагов.

## 1. Скачайте EyeAuras

Сначала скачайте приложение EyeAuras с нашего сайта: [EyeAuras Download](https://eu.eyeauras.net/download)

## 2. Зарегистрируйтесь и приобретите лицензию

- Создайте аккаунт и при необходимости купите лицензию, чтобы открыть все возможности. Начать можно здесь: [EyeAuras Login](https://eu.eyeauras.net/login)

## 3. Настройте Input Redirects

- Скачайте этот бесплатный драйвер для совместимости: [Download Driver](https://s3.eyeauras.net/media/2024/10/HVDK%20Standard%202.1.exe)

- После установки перейдите в `C:\Program Files (x86)\ControlMyJoystick 5.5.78.50\Driver\Joystick` и запустите bat-файл удаления от имени администратора.

## 4. Конфигурация

Откройте EyeAuras, перейдите в настройки и измените `Input Redirect Simulation` на `TetherScript Driver`.

![screenshot_43.png](/screenshot_43.png)

После применения изменений в нижней панели появятся кнопки redirects для включения и отключения перенаправления.

![screenshot_42.png](/screenshot_42.png)

## 5. Устранение неполадок

Если вы столкнулись с багом, из-за которого камера постоянно вращается, откройте настройки игры (L2 settings) и отключите `Enable Controller` в разделе `Settings -> Configuration`.

## 6. Рекомендуемое ПО для удаленного доступа — Parsec

- Скачать можно здесь: [Download Parsec](https://parsec.app/downloads)
- Подробнее: [here](https://wiki.eyeauras.net/en/Lineage/parsec)

## 7. Видеоинструкция

Если вам удобнее воспринимать информацию визуально, мы подготовили подробный видеогайд по настройке и использованию.