---
title: Защита C# скриптов
description: Предотвращает вмешательство в работу ваших скриптов и защищает вашу интеллектуальную собственность
published: true
date: 2025-03-12T00:43:32.176Z
tags: 
editor: markdown
dateCreated: 2025-03-12T00:43:32.176Z
---

# 🔒 Защита скриптов в EyeAuras

## **Важно:** Защита скриптов — это опциональная функция, предназначенная для авторов паков, которые хотят скрыть детали реализации своих скриптов. По умолчанию скрипты хранятся в текстовом виде и компилируются по необходимости.

EyeAuras позволяет пользователям писать свои C# скрипты, которые по умолчанию хранятся в текстовом виде как часть пользовательского конфига и компилируются только когда это нужно. Это удобно для разработки, но создает риски: кто-то может подсмотреть ваш код или даже изменить его без вашего ведома.

### 📦 Пакование (Packing) и пред-компиляция
При Паковании, у вас есть возможность включить предварительную компиляцию скриптов - этот функционал заранее компилирует скрипты в бинарный формат и добавит их в готовый пак вместе с программой. В таком виде текст скриптов отсутствует — остаются только исполняемые модули. Это улучшает производительность и стоит включать даже если вы не особо беспокоитесь о защите. Для опытного программиста просто компиляция не является преградой для изучения кода! Есть масса инструментов, которые позволяют произвести обратный процесс (декомпиляцию) и получить исходную программу практически в идентичном виде. Именно поэтому EyeAuras предлагает механизмы защиты уже скомпилированного кода.

### 🛡️ Варианты защиты скриптов
EyeAuras предлагает три уровня защиты для вашего кода:

- **⬜ None** — Без защиты. Скрипты хранятся и компилируются as-is, без изменений.
- **🚀 Performance First** — Приоритет производительности. Код защищен и все еще недоступен для понимания без особых навыков, но фокус идет в сторону стабильности и скорости. В этом режиме применяются: обфускация, шифрование данных.
- **🧱 Security First** — Приоритет безопасности. В этом режиме применяется максимальная защита: обфускация, шифрование данных, шифрование кода, частичная виртуализация, механизм проверки целостности

### 🛠️ Методы защиты
EyeAuras использует мощные инструменты для защиты скриптов:

- **🌀 Обфускация** — код запутывается, чтобы его было сложнее понять. Понятные и простые имена превращаются в нечитаемые, структура самого кода видоизменяется для усложнения понимания (но без изменения функционала!), строковые и числовые значения шифруются, делая извлечение данных весьма трудоемким процессом.
- **🔁 Виртуализация** — части кода превращаются в специальный байт-код, который исполняется внутри виртуальной машины. Это существенно затрудняет взлом.
- **🔐 Шифрование** — готовый модуль дополнительно шифруется, что еще больше усложняет изучение

### 🤔 Почему это важно?
1. **🛡️ Безопасность вашего кода** — защита мешает злоумышленникам украсть ваш уникальный алгоритм или логику.
2. **💰 Защита коммерческих решений** — если ваш скрипт — часть платной функции или продукта, защита поможет предотвратить его нелегальное распространение.
3. **✅ Лицензирование** — если вы используете механизм [Sublicenses](/features/sublicenses), который позволяет выпускать **вам** (пользователю) лицензии на паки, защита кода это особенно важно, так как часть с проверкой лицензий находится как раз в коде

Выбор уровня защиты зависит от ваших целей: если важна максимальная скорость — выбирайте **🚀 Performance First**; если безопасность важнее — выбирайте **🧱 Security First**. В дальнейшем, при получении первых отзывов это все еще будет настраиваться.

### Советы
- Обфускатор никогда не ломает публичный контракт. Если у вас объявлен `public` класс, то все `public` методы, свойства и поля этого класса переименовываться не будут. Если вы хотите получить максимальную степень защищенности, объявляйте классы всегда как `internal` - так обфускатор поймет, что с ними можно делать что угодно
- Если у вас есть какая-то часть кода, особенно критичная к производительности, вы можете использовать аттрибут [Obfuscate](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.obfuscationattribute?view=net-9.0) для того, чтобы указать обфускатору, что не следует трогать данный код

# FAQ 

**Q: Что произойдет, если я забуду включить защиту при паковании?**  
- A: В таком случае ваши скрипты будут запакованы в стандартном виде (просто скомпилированные без дополнительной защиты). Их все равно сложнее изучить, чем текстовые версии, но это не обеспечит высокий уровень защиты.

**Q: Если у меня в паке нет скриптов, поможет ли Защита?**
-   A: Нет, этот функционал работает только со скриптами и никак не взаимодействует с обычными действиями/триггерами и нодами.

**Q: Влияет ли защита на производительность?**
- A: Да, но в подавляющем большинстве случаев это будет малозаметно, если вообще заметно. 

**Q: Защита гарантирует полную безопасность?**
- A: Нет. Ничего абсолютного в природе не существует, однако количество усилий, которые взломщику нужно будет применить для получения результатов возрастает кратно, мы говорим о разнице между "получить исходный код за полчаса" и "не получить исходный код никогда, возможно, когда-нибудь, получить что-то отдаленно похожее на него". Даже для очень опытных программистов эта задача обычно не решается в лоб - нужен очень специфический набор навыков, чтобы даже просто начать решать ее. 

**Q: Нужно ли мне самому думать о защите или EyeAuras все возьмет на себя?**
- A: Думать все еще нужно. Система защиты накладывается на **ваш** исходный код и старается максимально превратить его в черный ящик, который _что-то_ делает, но очень сложно понять как именно. Однако если вы не будете подходить аккуратно к работе с входными и выходными данными - вас все еще могут взломать. К примеру, не стоит передавать по HTTP в чистом виде сверх-секретные данные, которые вы храните у себя на сервере - их все еще можно выловить и прочитать. 

**Q: Что делать, если мой защищенный пак внезапно перестал работать?**  
- A: Если проблема возникла после включения защиты:
  - Убедитесь, что вы не используете захардкоженные названия классов, методов и свойств - они будут изменены при обфускации. В подавляющем большинстве ситуаций, обфускатор сможет понять контекст использования и изменит строки, однако в каких-то случаях анализ бессилен (к примеру, контатенация строк).
  - Если вы используете режим **Security First**, попробуйте **Performance First** и проверьте как изменится поведение. В любом случае [свяжитесь со мной](/en/contacts) - будем разбираться
  
**Q: Могу ли я проверить, насколько защищен мой пак?**  
- A: Прямого инструмента для тестирования защиты в EyeAuras нет, но вы можете попробовать использовать популярные декомпиляторы (например, dnSpy или dotPeek), чтобы самостоятельно оценить, насколько сложно восстановить ваш код.

**Q: Можно ли включить защиту только для части скриптов?**  
- A: Нет, защита применяется ко всем скриптам в паке. Эта функциональность может быть добавлена в будущем.

**Q: Могу ли я указать, какие именно методы или классы следует защищать?**  
- A: Вы можете использовать аттрибут [Obfuscate](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.obfuscationattribute?view=net-9.0) для указания методов, классов и свойств, которые НЕ нужно защищать.

# На примере пака Path of Exile 2 Helper - Auto HP/MP
https://eyeauras.net/share/S20241213181401RaWLZLE430e6

Возьмем один и тот же метод `EnsureWindowIsInsideScreenBounds` - он довольно простой и отвечает за то, чтобы если вдруг по какой-то причине окно бота оказалось за пределами экрана, оно спозиционировалось в центр.

Вот так он выглядит в исходной, текстовой форме.
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

Вот так - в декомпилированном виде(`Script Protection` = `None`) - чуть менее читабельно, но незначительно:
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

А теперь накидываем на него обфускацию(`Performance First`):
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

А вот - этот же метод(предположительно...) в режиме `Security First`. Код не только обфусцирован, как в предыдущем варианте, но еще и зашифрован.
```csharp
// Token: 0x06000086 RID: 134 RVA: 0x000049C4 File Offset: 0x00002BC4
private void \uF5D1\uF8EB\uF0A0\uF126\uE1AD\uE6ED\uE599\uE94C\uE27D\uF25B\uE418\uECFF()
{
	\uE536\uEA7D\uE611\uEE66\uF5F5\uEDF9\uF549\uE4FC\uF1E9\uEEBD\uEC8C\uF5EE.\uF3ED\uE329\uF180\uF009\uF045\uEFE8\uF38D\uF0F9\uF700\uE210\uE95F\uE40E(1833101, null, this, null);
}
```
