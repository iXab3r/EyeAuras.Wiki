---
title: Создание собственного Usb2Kbd
description: 
published: true
date: 2025-06-26T23:05:46.103Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-26T22:51:54.882Z
---

# Ввод через Usb2Kbd

Если у вас есть совместимое физическое Usb2Kbd, EyeAuras может передать ему команду клавиатуры или мыши. Для первой проверки достаточно ввести цифру **7** в пустое тестовое поле: результат виден сразу и не требует отправки формы или работы с игровыми данными.

Нужен именно поддерживаемый USB-вариант с совместимой прошивкой. Этот provider обращается к HID-устройству напрямую, без комплектной DLL. Описанные на [сайте Usb2Kbd](https://usb2kbd.ru/) модели LAN/COM принимают команды по другому транспорту; одно общее имя продукта не делает их совместимыми с этим USB-provider EyeAuras.

![Два USBASP на ATmega8 из примера сборки](https://s3.eyeauras.net/media/2025/06/IMG_3699.jpg =x400)

## Подключить готовое устройство

Перед шагами нужен уже прошитый совместимый USB-контроллер, подключённый к компьютеру с EyeAuras. Знайте его **VID/PID** и **Serial number**. Для варианта из архива ниже используются **VID_0245&PID_D342** и **1232**. Для другого устройства берите его реальные значения, а не эти числа наугад.

1. Создайте тестовую ауру с **Send Sequence**. Через **Keyboard** добавьте 7 из основного цифрового ряда. Сохраните созданные события **Key down → задержка → Key up**.
2. Раскройте **Advanced input settings** и выберите **Input Simulator = Usb2Kbd device**.

   Старый снимок показывает provider в списке и предупреждение о ненастроенном устройстве:

   ![Выбор Usb2Kbd device](https://s3.eyeauras.net/media/2025/06/EyeAuras_u05n6CbeSHjASUB3.png =x600)

3. Нажмите **Install...**, чтобы открыть **Usb2Kbd settings**. Эта команда настраивает подключение EyeAuras; она не прошивает микроконтроллер.
4. Для устройства с прошивкой из архива нажмите **Detect automatically** и проверьте значения. Эта кнопка подставляет и сохраняет конкретный профиль **VID_0245&PID_D342 / 1232**, а не перебирает любые подключённые устройства. Для своего варианта вручную заполните Device и Serial number.
5. Оставьте **Post-operation delay = 5 ms**, нажмите **Ok**. Настройка устройства глобальная для provider.

   ![Device, Serial number и Post-operation delay](https://s3.eyeauras.net/media/2025/06/ShareX_dfe3exVzay6OP5YN.png =x200)

6. В Send Sequence выберите **Target Window** тестового приложения, оставьте **Block User input = None** и включите **Key/Button State**. Установите фокус в пустом поле и нажмите **Execute**. В нём должна появиться одна цифра 7.
7. Если цифры нет, проверьте подключение, VID/PID, serial и фокус. Строка с идентификатором или исчезнувший значок предупреждения подтверждают настройку, но не получение ввода приложением.

![Сохранённые параметры provider в прежнем интерфейсе](https://s3.eyeauras.net/media/2025/06/EyeAuras_jFqVNV0vHSnfn5dJ.png)

| Параметр | Что задаёт |
|---|---|
| Device | Часть идентификатора HID-устройства, например VID_0245&PID_D342. Реализация ищет управляющую HID-коллекцию этого устройства |
| Serial number | Номер, передаваемый устройству в командном пакете. Он должен соответствовать прошивке |
| Post-operation delay | Минимальный интервал между командами; текущая реализация не опускает его ниже 5 ms, даже если в поле введено меньше |
| Detect automatically | Готовый профиль для описанного варианта; сохраняется сразу при нажатии |
| Reset | Сбрасывает параметры в окне настройки; Ok сохраняет выбранные значения |
| Target Window | Окно-получатель обычного ввода. Устройство использует общий фокус/курсор, а не отдельный фоновый канал приложения |

На уровне протокола этот вариант использует HID-команды клавиш, кнопок, колеса и движения, с серийным номером в пакете. Это не произвольная Arduino-клавиатура: прошивка должна понимать именно этот формат. Для движения дополнительно учитывается DPI; после смены монитора или масштаба проверьте [координаты](/ru/features/coordinate-system).

## Назначить provider папке

Если устройство должно использоваться группой аур, включите **Folder Properties → Triggers/Actions/Overlays Defaults → Input Simulator = Usb2Kbd device**. У существующих действий проверьте привязки или осознанно примените **Apply to All**. Глобальные Device/Serial не заменяют выбор provider у компонента.

![Usb2Kbd device в настройках по умолчанию папки](https://s3.eyeauras.net/media/2025/06/EyeAuras_X3t0uKQGRPWRfFLN.png)

<details>
<summary>Собрать вариант из двух USBASP на ATmega8</summary>

Это отдельная подготовка оборудования по исходной инструкции. Нужны **два USBASP на ATmega8**, соединительный шлейф, перемычка для **JP2** и [архив с прошивкой и утилитами](https://s3.eyeauras.net/media/2025/06/usb2kbd.zip). Один USBASP станет Target, второй останется Programmer. Не переносите этот порядок на другую плату или микроконтроллер без её документации.

В архиве находятся `main.hex`, установщик драйвера USBASP и `Khazama AVR Programmer.msi`. Ссылки на платы из исходного примера: [Amazon](https://www.amazon.com/Ferwooh-Downloader-Programmer-Microcontroller-Adapter/dp/B08DTRPT1Z/) и [Robot-kit](https://robot-kit.ru/3370/). Совместимость определяется платой и микроконтроллером, а не ценой или названием магазина.

1. Пока платы отключены от компьютера, выберите **Target (1)** и замкните на нём **JP2**. Перемычка должна соединять нужные контакты и не касаться остальных.

   ![JP2 на целевом USBASP](https://s3.eyeauras.net/media/2025/06/IMG_3698.jpg =x400)

2. Соедините Target (1) и **Programmer (2)** шлейфом с правильной ориентацией разъёмов. JP2 замкнут только на Target.

   ![Target и Programmer соединены шлейфом](https://s3.eyeauras.net/media/2025/06/Photos_qt6wFLu8IX5vnwJi.jpg =x500)

3. Подключите к USB **Programmer (2)**. Target пока соединён с ним шлейфом.

   ![В USB подключён Programmer](https://s3.eyeauras.net/media/2025/06/Photos_vWVE1omRVkxzb9cU.jpg =x500)

4. Установите драйвер программатора через `driver/InstallDriver.exe`, затем Khazama через `Khazama AVR Programmer.msi`. Это инструменты этапа прошивки, а не обязательная установка на каждом компьютере для готового HID-устройства.

   ![Установщик драйвера USBASP](https://s3.eyeauras.net/media/2025/06/explorer_x6YMxIwuDtx2HV4r.png =x400)

   ![Установщик Khazama](https://s3.eyeauras.net/media/2025/06/explorer_VGFKmZaWKioZokGt.png =x400)

5. Откройте Khazama и выберите **ATMEGA8**.

   ![Выбор ATMEGA8 в Khazama](https://s3.eyeauras.net/media/2025/06/Khazama_AVR_Programmer_hEAnG7Z8zxvdC2It.png)

6. В **Command → Fuses and Lock Bits...** нажмите **Read All**, чтобы проверить чтение контроллера. Не меняйте fuse bits по внешнему сходству с картинкой; при ошибке чтения сначала проверьте плату, шлейф и перемычку.

   ![Команда чтения Fuses and Lock Bits](https://s3.eyeauras.net/media/2025/06/msedge_vceQvSiBBDqVxB5r.png)

   ![Read All в окне настроек контроллера](https://s3.eyeauras.net/media/2025/06/Khazama_AVR_Programmer_jM5G6HgYIiMsMVhP.png)

7. Через **File → Load FLASH file to Buffer** выберите `main.hex` из архива. Проверьте путь к выбранному файлу.

   ![Загрузка FLASH в буфер](https://s3.eyeauras.net/media/2025/06/msedge_9wdOK2WkAob19fpS.png)

   ![main.hex выбран для прошивки](https://s3.eyeauras.net/media/2025/06/msedge_wSXfntALbLMrrst4.png)

8. Нажмите **Auto Program** и дождитесь успешного завершения. Прошивается именно Target с перемычкой.

   ![Команда Auto Program](https://s3.eyeauras.net/media/2025/06/Code_VJUOeYEfoezd2yXk.gif)

9. Отключите питание, отсоедините шлейф и снимите JP2 с Target. Programmer можно убрать. Подключите прошитый Target непосредственно в USB и переходите к настройке EyeAuras выше. Готовое совместимое HID-устройство использует системный HID-драйвер Windows.

   ![Готовое устройство без перемычки](https://s3.eyeauras.net/media/2025/06/IMG_3701.jpg =x400)

</details>

## Примеры прежнего интерфейса

Первый GIF показывает отправку из Send Sequence, второй — из узла макроса. Это разные редакторы, использующие один настроенный provider. Их внешний вид не заменяет проверку вашего устройства и целевого приложения.

![Пример Send Sequence через Usb2Kbd](https://s3.eyeauras.net/media/2025/06/EyeAuras_JDZlg740lGwiPBED.gif =x400)

![Пример узла макроса через Usb2Kbd](https://s3.eyeauras.net/media/2025/06/EyeAuras_ErWZbRhxLmhdb47W.gif =x500)

Аппаратный способ не гарантирует совместимость с любой программой. Если устройства нет, выбор имени Usb2Kbd device не создаст его программную замену. Для обычного системного ввода или виртуального драйвера выберите другой [provider](/ru/actions/sendinput/options).
