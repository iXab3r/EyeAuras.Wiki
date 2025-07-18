---
title: 2. BlazorWindows и WebView2
description: 
published: true
date: 2025-05-11T13:40:00.430Z
tags: 
editor: markdown
dateCreated: 2025-05-11T00:47:25.172Z
---

# Что такое Blazor Windows и как они вообще работают?
Во [вводной части цикла](/scripting/blazor-windows/getting-started) я рассказывал про Blazor, HTML и CSS. Однако для того, чтобы всю эту красоту отобразить на экране нам нужен какой-то инструмент, который превратит наш набор скриптов и кода в кнопки, формы и все остальное. И вот здесь на помощь приходит [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2) - встраиваемый браузер от компании Microsoft. 

![WebView2](https://s3.eyeauras.net/media/2025/05/WebView2.drawio%20%281%29.png)
Можно думать о `WebView2` как о части приложения, которая отвечает за отрисовку наших компонентов. 

`BlazorWindows` это фреймворк, который объединяет все - WebView, HTML, C#, CSS - в единое целое и позволяет создавать интерактивные окна. Именно эта технология лежит в основе оверлеев, да и многих частей EyeAuras.

# В чем вообще отличие окон от оверлеев?
Оверлеи это разновидность окон - по сути это точно такое же окно как и другие, но с другими настройками отображения. К примеру, обычно оверлей отрисовывается поверх других окон.

В EyeAuras есть несколько разновидностей оверлеев
![Overlays](https://s3.eyeauras.net/media/2025/05/mIYLrG2yj2.png)

# C# Overlay
Это один из основных способов быстро набросать какой-то интерфейс с помощью EyeAuras. 
Идея проста:
- у нас есть сконфигурированное окно-оверлей, у которого есть позиция, название, условие отображения. О содержимом - ниже.
- у нас есть скрипт, написанный в EyeAuras, который описывает интерфейс с помощью Razor/HTML/CSS
- EyeAuras компилирует этот скрипт и на выходе мы получаем **библиотеку**, с помощью которой мы можем сконструировать пользовательский интерфейс, который и будет отрисован в оверлее с помощью **WebView2**

## Настройки оверлея
У любого оверлея есть: 
- позиция и размеры, а так же то, заблокирован ли оверлей для перемещения пользователем (`IsLocked`)
![Overlay position](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_O2I6OKwmjq.png)

- настройки визуального стиля - прозрачность, толщина бордюра и его цвет и т.п.
![Overlay visual style](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_VfFC6J8Kgd.png)

- настройки окна 
![Overlay window style](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_ohz05OLVxV.png)
В настройках окна самый важный переключатель это тип окна - Overlay или Window. 
- Window - практически обыкновенное окно, с тем лишь отличием, что нет кнопки закрытия. Однако у него есть иконка, название, его можно перетаскивать за заголовок и т.п.
- Overlay - окно без бордюра, областея для перетаскивания и каких-либо системных кнопок. 
![Window](https://s3.eyeauras.net/media/2025/05/Njy7t9XEg2.png)
![Overlay](https://s3.eyeauras.net/media/2025/05/R432QeysKh.png)

## C# Overlay v3 
Текущая версия оверлея, использующая скриптовый движок V3. В целом вам доступно абсолютно все то же самое, что доступно в скриптах - создание кастомных Razor-контролов, NuGet интеграция, интеграция с сервисами EyeAuras и все-все-все. Каждый C# оверлей - маленькая программа. 

![v3](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_TqJxUFKYNe.png)

## C# Overlay v2 (устаревший)
Упомяну лишь вскользь, так как использовать данный оверлей более не рекомендую. Он будет удален в одной из ближайших версий. На данный момент он остается только для сохранения обратной совместимости и не имеет явных плюсов перед более современным V3.

![v2](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_DKdQydbTcq.png)
Визуально оверлей выглядит вот так. 
![Window](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_AvrTCKw3p6.png) ![Overlay](https://s3.eyeauras.net/media/2025/05/n02buCY4RI.png)

