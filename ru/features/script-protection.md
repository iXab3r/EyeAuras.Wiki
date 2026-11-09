---
title: 🔒 Защита C# скриптов
description: Предотвращает вмешательство в работу ваших скриптов и защищает вашу интеллектуальную собственность
published: true
date: 2025-03-12T22:11:21.972Z
tags: 
editor: markdown
dateCreated: 2025-03-12T00:43:32.176Z
---
# Подготовить пак без открытого текста скриптов

Если вы распространяете свою программу и хотите усложнить изучение её реализации, отдельно выберите способ хранения скрипта и режим защиты. Предварительная компиляция сама по себе не делает код недоступным для декомпилятора. Защита скрипта также не заменяет разрешения на запуск, лицензию или проверку данных на вашем сервере.

Для защищённой публикации нужны собственный исходный проект, доступ автора к публикации и разрешённая функция защиты. Сервер проверяет вошедшего пользователя и доступ альфа-тестера; наличие пункта в редакторе ещё не даёт это право. Возможности и доступ уточняйте через [контакты](/ru/contacts), не по старой цене или виду кнопки.

## Сравнить свою обычную и защищённую сборку

1. Подготовьте маленькую собственную папку с одной аурой **Тест**: **Fixed Value → Is Active**, в **On Enter** — **C# Script**. Для проверки достаточно одной строки верхнеуровневого Script.csx:

```csharp
Log.Info("Проба упаковки");
```

2. Выполните **Run** в редакторе и найдите сообщение в журнале ауры. Сохраните исходный проект отдельно: из Binaries Only нельзя восстановить ваши исходники кнопкой разблокировки редактора.
3. Откройте **Share/Export → Pack Options**. Выберите **Script Compilation Mode → Binaries Only**, затем **Script Protection Mode → Performance-first**. Подготовьте свою публикацию через **Publish** или **Update** по [руководству экспорта](/ru/features/export-import).
4. Получите новый **Download pack** своей публикации и откройте его в отдельном каталоге. Проверьте ту же ауру и запись в журнале. Сравнивайте новый комплект, а не уже скачанную старую ревизию. Включение защиты в редакторе не меняет готовые копии задним числом.
5. Если результат отличается, сначала сравните с той же сборкой без защиты, затем с другим защищённым режимом. Сохраните версию, режим, описание и [отчёт](/ru/report-a-problem) для разбора.

Результат этой проверки — работа своего малого примера после подготовки бинарной сборки. Это не доказательство, что любой крупный проект, отражение типов или внешний модуль совместим с тем же преобразованием.

На снимке прежнего редактора видно, что хранение и защита — разные группы параметров. Текущие подписи перечислены ниже.

![Параметры компиляции и защиты](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_jfOmqT7V4x4xqgqS.png =x400)

| Script Compilation Mode | Что попадёт в подготовленную версию |
| --- | --- |
| Script Only | Текст проекта; компиляция по необходимости на машине пользователя. |
| Script w/ Binaries | Исходные файлы вместе с подготовленной сборкой. Защищать бинарную копию при передаче того же исходного текста недостаточно для скрытия реализации. |
| Binaries Only | Подготовленная сборка без C#/Razor-исходников в выдаваемом проекте. Дополнительные файлы ресурсов могут оставаться; это не удаление всех данных набора. |

| Script Protection Mode | Как выбирать |
| --- | --- |
| None | Без дополнительного преобразования защиты. В сочетании с Binaries Only это всё ещё скомпилированный код, а не открытый Script.csx. |
| Performance-first | Защищённый профиль с заявленным приоритетом производительности; начните сравнение на своей небольшой сборке. |
| Security-first | В текущей конфигурации сборщика использует тот же набор преобразований, что Performance-first. Название не означает дополнительное шифрование всех методов. |

Переключатель защиты доступен при Binaries Only. Набор преобразований определяется сборщиком и его правилами: обфускация имён и потока выполнения, преобразование строк и чисел, другие выбранные способы. По названию профиля нельзя заключить, что включены виртуализация всех методов, шифрование модуля или проверка целостности. Не выбирайте режим по обещанию неуязвимости или незаметности.

## Исходники, ресурсы и права

Обработка работает с подготовленными скриптовыми проектами пака, а не делает обычные триггеры и узлы секретными. Единого переключателя защиты только одного произвольного файла в этой форме нет. Ресурсы, строки запросов и данные, которые программа выдаёт наружу, требуют отдельного проектирования: скрытая реализация не делает их недоступными получателю.

Храните редактируемую авторскую копию. Если в подготовленном редакторе есть Unlock the script for editing, это не обратная обфускация и не восстановление удалённого текста. Чтобы изменить программу, вернитесь к своему исходному проекту и создайте новую ревизию.

Права на просмотр, изменение и распространение описаны в [модели разрешений](/ru/features/permission-model). Для платного запуска [саблицензия](/ru/features/sublicenses) и её аренда имеют собственный срок жизни; защита не создаёт их автоматически.

<details>
<summary>Что проверить в более сложном проекте</summary>

| Место | Почему важно |
| --- | --- |
| Reflection, сериализация и имена в строках | Жёстко заданное имя может перестать совпадать после преобразования. Конкатенация строк и внешние файлы правил не становятся безопасными автоматически. |
| Public и internal | Видимость участвует в правилах обработки, но не является универсальным обещанием сохранить любой контракт. Не меняйте весь проект на internal без проверки Razor, сериализации и внешних потребителей. |
| ObfuscationAttribute | Атрибут System.Reflection задаёт указания обработчику. Например, Exclude относится к исключению из преобразований; его поддержка и Feature зависят от используемого инструмента. Это не атрибут с именем Obfuscate. |
| Критичный участок | Сравните его поведение и время на одинаковых входных данных. Незаметное влияние на один пример не обещает нулевую стоимость всей программе. |
| Сбой только после защиты | Сравните None и оба защищённых режима, проверьте имена и передайте воспроизводимый малый пример поддержке. |

Справка об атрибуте: [ObfuscationAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.obfuscationattribute?view=net-9.0). Готового измерителя «надёжности защиты» в этой настройке нет. dnSpy или dotPeek позволяют увидеть декомпилированную форму своей сборки, но её вид не доказывает невозможность анализа.

</details>

<details>
<summary>Архивное сравнение исходного и преобразованного метода</summary>

Ниже сохранены четыре листинга из [примера Path of Exile 2 Helper](https://eyeauras.net/share/S20241213181401RaWLZLE430e6). Это историческая иллюстрация различия текстовой и декомпилированной формы, не самостоятельная программа для вставки в Script.csx и не результат нынешней сборки.

Методу нужны члены Window и Log его исходного класса, типы и расширения того проекта. По нему не следует копировать универсальный алгоритм размещения на нескольких мониторах: координаты рабочей области и конкретный контракт окна нужно рассматривать отдельно. Декомпилированные листинги могут содержать синтаксис, который не является обычным компилируемым C#.

Исходная текстовая форма:

```csharp
private void EnsureWindowIsInsideScreenBounds()
{
    var windowRect = new Rectangle(Window.Left, Window.Top, Window.Width, Window.Height);
    var screenSize = System.Windows.Forms.Screen.PrimaryScreen!.WorkingArea;

    // Calculate the minimum visible area required (50% of window size)
    var minVisibleWidth = Window.Width / 2;
    var minVisibleHeight = Window.Height / 2;

    // Check if the visible portion of the window is less than 50%
    var isOutOfBounds =
        (windowRect.Left + minVisibleWidth < 0) || // Too far left
        (windowRect.Top + minVisibleHeight < 0) || // Too far up
        (windowRect.Right - minVisibleWidth > screenSize.Width) || // Too far right
        (windowRect.Bottom - minVisibleHeight > screenSize.Height); // Too far down
    if (isOutOfBounds)
    {
        Log.Warn($"Window is considered out of screen bounds, window position: {windowRect}, screen: {screenSize}");
    }

    var positionNotSet = Window.Left == 0 && Window.Top == 0;
    if (isOutOfBounds)
    {
        Log.Warn($"Window position is not set, resetting, screen: {screenSize}");
    }
    
    if (positionNotSet || isOutOfBounds)
    {
        var centered = windowRect.Size.CenterInsideBounds(screenSize);
        Log.Info($"Setting window position to {centered}");
        Window.SetWindowRect(centered);
    }
}
```

Декомпилированная форма без дополнительной защиты:

```csharp
// Token: 0x06000084 RID: 132 RVA: 0x00005C68 File Offset: 0x00003E68
private void EnsureWindowIsInsideScreenBounds()
{
	Rectangle rectangle;
	rectangle..ctor(this.Window.Left, this.Window.Top, this.Window.Width, this.Window.Height);
	Rectangle workingArea = Screen.PrimaryScreen.WorkingArea;
	int num = this.Window.Width / 2;
	int num2 = this.Window.Height / 2;
	bool flag = rectangle.Left + num < 0 || rectangle.Top + num2 < 0 || rectangle.Right - num > workingArea.Width || rectangle.Bottom - num2 > workingArea.Height;
	bool flag2 = flag;
	DefaultInterpolatedStringHandler defaultInterpolatedStringHandler;
	if (flag2)
	{
		IFluentLog log = this.Log;
		defaultInterpolatedStringHandler..ctor(70, 2);
		defaultInterpolatedStringHandler.AppendLiteral("Window is considered out of screen bounds, window position: ");
		defaultInterpolatedStringHandler.AppendFormatted<Rectangle>(rectangle);
		defaultInterpolatedStringHandler.AppendLiteral(", screen: ");
		defaultInterpolatedStringHandler.AppendFormatted<Rectangle>(workingArea);
		log.Warn(defaultInterpolatedStringHandler.ToStringAndClear());
	}
	bool flag3 = this.Window.Left == 0 && this.Window.Top == 0;
	bool flag4 = flag;
	if (flag4)
	{
		IFluentLog log2 = this.Log;
		defaultInterpolatedStringHandler..ctor(47, 1);
		defaultInterpolatedStringHandler.AppendLiteral("Window position is not set, resetting, screen: ");
		defaultInterpolatedStringHandler.AppendFormatted<Rectangle>(workingArea);
		log2.Warn(defaultInterpolatedStringHandler.ToStringAndClear());
	}
	bool flag5 = flag3 || flag;
	if (flag5)
	{
		Rectangle rectangle2 = GeometryExtensions.CenterInsideBounds(rectangle.Size, workingArea);
		IFluentLog log3 = this.Log;
		defaultInterpolatedStringHandler..ctor(27, 1);
		defaultInterpolatedStringHandler.AppendLiteral("Setting window position to ");
		defaultInterpolatedStringHandler.AppendFormatted<Rectangle>(rectangle2);
		log3.Info(defaultInterpolatedStringHandler.ToStringAndClear());
		this.Window.SetWindowRect(rectangle2);
	}
}
```

Прежний пример Performance First:

```csharp
// Token: 0x06000086 RID: 134 RVA: 0x00008424 File Offset: 0x00006624
private void \uF71C\uE8CB\uF729\uF528\uF733\uECFF\uED61\uE8DD\uE3B9\uEBEC\uEF0D\uEF13()
{
	Rectangle rectangle;
	int num3;
	Rectangle workingArea;
	for (;;)
	{
		int num = GameStates.\uED1A\uF315\uE180\uEF00\uE442\uF137\uE320\uE6DD\uE44A\uE69E\uE6E6\uF02B(21);
		for (;;)
		{
			num ^= \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(132);
			if (-21 <= -45)
			{
				goto Block_13;
			}
			switch (num + 60)
			{
			case 0:
			{
				int num2;
				if (rectangle.Left + num2 < \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(0))
				{
					goto IL_149;
				}
				if (-6 >= 122)
				{
					goto IL_36D;
				}
				num = -2;
				continue;
			}
			case 1:
				if (rectangle.Top + num3 >= \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(0))
				{
					num = PoeHelperConfig.\uE49B\uE532\uE4AA\uE8C7\uF28E\uF11C\uF019\uF17B\uF13E\uECC2\uF3DC\uF21A(30);
					continue;
				}
				goto IL_149;
			case 2:
				num3 = this.Window.Height / \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(4);
				num = -1;
				continue;
			case 3:
				workingArea = Screen.PrimaryScreen.WorkingArea;
				num = -13;
				continue;
			case 4:
			{
				int num2 = this.Window.Width / \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(4);
				num = -3;
				continue;
			}
			case 5:
			{
				int num2;
				if (rectangle.Right - num2 <= workingArea.Width)
				{
					num = -16;
					continue;
				}
				goto IL_149;
			}
			case 6:
				rectangle..ctor(this.Window.Left, this.Window.Top, this.Window.Width, this.Window.Height);
				num = -4;
				continue;
			case 7:
				goto IL_135;
			}
			break;
		}
		if (-44 <= -49)
		{
			goto Block_14;
		}
	}
	int num4;
	DefaultInterpolatedStringHandler defaultInterpolatedStringHandler;
	Rectangle rectangle2;
	for (;;)
	{
		IL_2A3:
		num4 ^= \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(51);
		switch (num4 + 59)
		{
		case 0:
		{
			IFluentLog log = this.Log;
			defaultInterpolatedStringHandler..ctor(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(30), \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(1));
			defaultInterpolatedStringHandler.AppendLiteral(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDC.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BA(10217));
			defaultInterpolatedStringHandler.AppendFormatted<Rectangle>(rectangle2);
			log.Info(defaultInterpolatedStringHandler.ToStringAndClear());
			num4 = -6;
			continue;
		}
		case 1:
			this.Window.SetWindowRect(rectangle2);
			num4 = -5;
			continue;
		case 2:
			goto IL_33D;
		case 3:
			num4 = -7;
			continue;
		case 4:
			num4 = -11;
			continue;
		case 5:
			goto IL_38F;
		}
		goto IL_2D1;
	}
	IL_33D:
	rectangle2 = GeometryExtensions.CenterInsideBounds(rectangle.Size, workingArea);
	goto IL_36D;
	IL_38F:
	return;
	IL_135:
	bool flag = rectangle.Bottom - num3 > workingArea.Height;
	goto IL_14F;
	IL_149:
	flag = (\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(1) != 0);
	IL_14F:
	bool flag2 = flag;
	bool flag3 = flag2;
	if (flag3)
	{
		for (;;)
		{
			int num5 = GameStates.\uED1A\uF315\uE180\uEF00\uE442\uF137\uE320\uE6DD\uE44A\uE69E\uE6E6\uF02B(28);
			for (;;)
			{
				num5 ^= \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(48);
				switch (num5 + 53)
				{
				case 0:
				{
					IFluentLog log2 = this.Log;
					defaultInterpolatedStringHandler..ctor(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(60), \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(4));
					defaultInterpolatedStringHandler.AppendLiteral(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDC.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BA(10065));
					defaultInterpolatedStringHandler.AppendFormatted<Rectangle>(rectangle);
					defaultInterpolatedStringHandler.AppendLiteral(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDC.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BA(10006));
					defaultInterpolatedStringHandler.AppendFormatted<Rectangle>(workingArea);
					log2.Warn(defaultInterpolatedStringHandler.ToStringAndClear());
					num5 = -4;
					continue;
				}
				case 1:
					num5 = -3;
					continue;
				case 2:
					goto IL_203;
				}
				break;
			}
		}
		IL_203:;
	}
	bool flag4 = ((this.Window.Left != 0) ? \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(0) : ((this.Window.Top == \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(0)) ? 1 : 0)) != 0;
	bool flag5 = flag2;
	if (flag5)
	{
		IFluentLog log3 = this.Log;
		defaultInterpolatedStringHandler..ctor(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(47), \uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDD.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BE(1));
		defaultInterpolatedStringHandler.AppendLiteral(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEB29\uEEDC.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BA(10009));
		defaultInterpolatedStringHandler.AppendFormatted<Rectangle>(workingArea);
		log3.Warn(defaultInterpolatedStringHandler.ToStringAndClear());
	}
	bool flag6 = flag4 || flag2;
	if (!flag6)
	{
		return;
	}
	IL_2D1:
	num4 = PoeEyeComponent.\uE237\uF4ED\uF88E\uED18\uECFD\uE0BD\uF228\uF776\uE7C2\uF10D\uF78D\uF79B(42);
	goto IL_2A3;
	Block_13:
	Block_14:
	IL_36D:
	num4 = PoeHelperConfig.\uE49B\uE532\uE4AA\uE8C7\uF28E\uF11C\uF019\uF17B\uF13E\uECC2\uF3DC\uF21A(27);
	goto IL_2A3;
}
```

Прежний пример Security First:

```csharp
// Token: 0x06000086 RID: 134 RVA: 0x000049C4 File Offset: 0x00002BC4
private void \uF5D1\uF8EB\uF0A0\uF126\uE1AD\uE6ED\uE599\uE94C\uE27D\uF25B\uE418\uECFF()
{
	\uE536\uEA7D\uE611\uEE66\uF5F5\uEDF9\uF549\uE4FC\uF1E9\uEEBD\uEC8C\uF5EE.\uF3ED\uE329\uF180\uF009\uF045\uEFE8\uF38D\uF0F9\uF700\uE210\uE95F\uE40E(1833101, null, this, null);
}
```

Эти листинги показывают конкретную старую обработку. Они не определяют преобразования всех следующих поставок и не обещают результат восстановления исходников.

</details>
