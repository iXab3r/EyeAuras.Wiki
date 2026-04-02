---
title: Как настроить проект
description: Краткое руководство по настройке проекта
published: true
date: 2023-11-12T14:28:35.197Z
tags: ai-translated
editor: markdown
dateCreated: 2023-10-29T18:37:51.063Z
---
# Как зарегистрировать аккаунт CVAT

Для разметки YoloEase может использовать любой сервер с запущенным CVAT. Это может быть [официальный сайт](https://www.cvat.ai/), [локальный инстанс](https://opencv.github.io/cvat/docs/administration/basics/installation/) или [инстанс CVAT от EyeAuras](https://cvat.eyeauras.net/). В этом руководстве предполагается, что вы будете использовать именно его.

1. Зарегистрируйтесь на [сервере EyeAuras CVAT](https://cvat.eyeauras.net/auth/login). Обратите внимание: необязательно использовать те же учетные данные, что и для основного аккаунта [EyeAuras](https://eyeauras.net/https://eyeauras.net/).
2. [Войдите в систему](https://cvat.eyeauras.net/auth/login) и убедитесь, что CVAT показывает список ваших проектов и позволяет создать новый. Если нет — [свяжитесь со мной](https://wiki.eyeauras.net/ru/contacts).
3. В левом верхнем углу CVAT откройте вкладку **Projects**.
4. Следуйте инструкции ниже — **«Как создать новый проект в CVAT»** — и создайте свой первый проект.

# Как создать новый проект в CVAT

1. [Войдите в систему](https://cvat.eyeauras.net/auth/login) и убедитесь, что CVAT показывает список ваших проектов и позволяет создать новый. Если нет — [свяжитесь со мной](https://wiki.eyeauras.net/ru/contacts).
2. Создайте новый проект, нажав на маленькую иконку плюса в верхней части списка проектов.  
[![Projects](https://i.imgur.com/cDokIQE.png =x100)](https://i.imgur.com/cDokIQE.png)
3. В открывшейся форме укажите название проекта, затем нажмите кнопку **Add Label**.
4. Добавьте один или несколько labels — это, по сути, объекты, которые модель будет отслеживать.  
[![Create project](https://i.imgur.com/PnQROWo.png =x200)](https://i.imgur.com/PnQROWo.png)

> Не забудьте нажать **Continue**, чтобы сохранить label!
{.is-warning}

5. Когда закончите настройку, нажмите **Submit & Open**.
6. На этом настройка проекта в CVAT завершена. Всё остальное сделает YoloEase.

# Как настроить проект YoloEase

1. [Запустите инструмент](/ru/YoloEase/how-to-launch)
2. Введите учетные данные CVAT. На этом этапе при необходимости можно изменить CVAT server.
3. Нажмите кнопку **Login** и дождитесь входа в систему.
4. Так может выглядеть пустой проект (скриншот из ранней alpha-версии, просто для понимания интерфейса).  
[![Login form](https://i.imgur.com/kZPrqkD.png =x150)](https://i.imgur.com/kZPrqkD.png)
5. Подготовьте первый датасет: [подробнее здесь](/ru/YoloEase/how-to-prepare-dataset)
6. Нажмите **Add folder** и добавьте одну или несколько папок со своими скриншотами, фотографиями и т. д.  
[![Add folder form](https://i.imgur.com/hIVnERf.png =x75)](https://i.imgur.com/hIVnERf.png)
7. Готово — теперь можно запускать процесс обучения. [Подробнее здесь](/ru/YoloEase/how-to-use-automatic-trainer)