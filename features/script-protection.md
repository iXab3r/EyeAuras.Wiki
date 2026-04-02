---
title: C# Script Protection
description: Prevents tampering with your scripts and protects your intellectual property
published: true
date: 2025-03-12T22:11:21.972Z
tags: c#, script protection, intellectual property, software security, code obfuscation, script compilation, ai-translated
editor: markdown
dateCreated: 2025-03-12T01:36:07.305Z
---
#  Script Protection in EyeAuras

## Important

Script protection is an optional feature for pack authors who want to hide their script implementation details. By default, scripts are stored as plain text and compiled only when needed.

> Alpha testing is still in progress, so access is currently limited. To get access to this functionality, **[contact me](/en/contacts)**.
{.is-info}

EyeAuras lets users write custom C# scripts. By default, those scripts are stored as plain text as part of the user config and compiled only when necessary. That is convenient during development, but it also creates risks: someone may inspect your code or even modify it without your knowledge.

##  Packing and precompilation

When using Packing, you can enable script precompilation. This compiles your scripts into binary format ahead of time and includes them in the finished pack together with the app. In that form, the script text is no longer present — only executable modules remain. This improves performance, so it is worth enabling even if protection is not your main concern.

**For an experienced programmer, compilation is not a real barrier to understanding code.**  
There are plenty of tools that can reverse the process (decompilation) and recover source code in an almost identical form. That is why EyeAuras also provides protection mechanisms for already compiled code.

> Important! After changing Packing settings, do not forget to click `Upload` — your changes only affect the **NEXT** pack revision.
{.is-info}

![Packaging options](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_jfOmqT7V4x4xqgqS.png =x400)

##  Script protection modes

EyeAuras offers three levels of protection for your code:

- **⬜ None** — No protection. Scripts are stored and compiled as-is, without modification.
- ** Performance First** — Prioritizes performance. The code is protected and still not easy to understand without specific skills, but the focus is on stability and speed. This mode applies obfuscation and data encryption.
- ** Security First** — Prioritizes security. This mode applies maximum protection: obfuscation, data encryption, code encryption, partial virtualization, and an integrity-check mechanism.

##  Protection methods

EyeAuras uses several powerful techniques to protect scripts:

- ** Obfuscation** — the code is transformed to make it much harder to understand. Clear, readable names become unreadable, the structure of the code is reshaped to make analysis harder (without changing functionality), and string and numeric values are encrypted, making data extraction much more difficult.
- ** Virtualization** — parts of the code are converted into a special bytecode executed inside a virtual machine. This makes reverse engineering significantly harder.
- ** Encryption** — the final module is additionally encrypted, making it even more difficult to inspect.

##  Why this matters

1. ** Protecting your code** — protection makes it much harder for attackers to steal your unique logic or algorithms.
2. ** Protecting commercial solutions** — if your script is part of a paid feature or product, protection helps prevent unauthorized redistribution.
3. ** Licensing** — if you use the [Sublicenses](/features/sublicenses) mechanism, which allows **you** (the user) to issue licenses for packs, code protection becomes especially important because part of the license validation logic lives in code.

Choose the protection level based on your priorities: if maximum speed matters most, use ** Performance First**; if security matters more, use ** Security First**. This may still be adjusted further as early feedback comes in.

## Tips

- The obfuscator never breaks the public contract. If you declare a `public` class, then all `public` methods, properties, and fields in that class will keep their names. If you want the highest possible level of protection, declare classes as `internal` whenever you can — that tells the obfuscator it is free to transform them aggressively.
- If part of your code is especially performance-sensitive, you can use the [Obfuscate](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.obfuscationattribute?view=net-9.0) attribute to tell the obfuscator not to touch that code.

## FAQ

**Q: What happens if I forget to enable protection during packing?**  
- A: In that case, your scripts will be packed in the standard form: compiled, but without additional protection. They will still be harder to inspect than plain-text versions, but this will not provide a high level of protection.

**Q: If my pack has no scripts, will protection help?**  
- A: No. This feature only works with scripts and does not affect regular actions, triggers, or nodes.

**Q: Does protection affect performance?**  
- A: Yes, but in the overwhelming majority of cases it will be barely noticeable, if noticeable at all.

**Q: Does protection guarantee complete security?**  
- A: No. Nothing in the real world is absolute. However, it increases the amount of effort required to break it by a large margin. We are talking about the difference between “getting the source code in half an hour” and “never getting the source code at all, and maybe someday recovering something only vaguely similar.” Even for very experienced programmers, this is usually not something they can solve directly — it requires a very specific skill set just to begin working on it.

**Q: Do I need to think about security myself, or will EyeAuras handle everything for me?**  
- A: You still need to think about it. The protection system is applied on top of **your** source code and tries to turn it into a black box that _does something_, but is very hard to understand internally. However, if you do not handle input and output data carefully, you can still be compromised. For example, you should not send extremely sensitive data over HTTP in plain text if that data is stored on your server — it can still be intercepted and read.

**Q: What should I do if my protected pack suddenly stops working?**  
- A: If the problem started after enabling protection:
  - Make sure you are not using hardcoded class, method, or property names — they may change during obfuscation. In most situations, the obfuscator can understand the usage context and update strings too, but in some cases static analysis is not enough (for example, string concatenation).
  - If you are using **Security First**, try **Performance First** and see how the behavior changes. In any case, [contact me](/en/contacts) and we will investigate.

**Q: Can I test how well my pack is protected?**  
- A: EyeAuras does not currently include a direct protection testing tool, but you can try popular decompilers such as dnSpy or dotPeek to evaluate for yourself how difficult it is to reconstruct your code.

**Q: Can I enable protection only for some scripts?**  
- A: No, protection is applied to all scripts in the pack. This may be added in the future.

**Q: Can I specify which methods or classes should be protected?**  
- A: You can use the [Obfuscate](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.obfuscationattribute?view=net-9.0) attribute to specify methods, classes, and properties that should **NOT** be protected.

## Example: Path of Exile 2 Helper - Auto HP/MP pack

https://eyeauras.net/share/S20241213181401RaWLZLE430e6

Let’s take the same method, `EnsureWindowIsInsideScreenBounds`. It is fairly simple: if the bot window ends up outside the screen for some reason, the method moves it back to the center.

Here is the original plain-text version:

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

Here is the decompiled version (`Script Protection` = `None`) — slightly less readable, but not by much:

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

Now let’s apply obfuscation (`Performance First`):

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

And here is the same method (presumably...) in `Security First` mode. In this case, the code is not only obfuscated as in the previous example, but also encrypted.

```csharp
// Token: 0x06000086 RID: 134 RVA: 0x000049C4 File Offset: 0x00002BC4
private void \uF5D1\uF8EB\uF0A0\uF126\uE1AD\uE6ED\uE599\uE94C\uE27D\uF25B\uE418\uECFF()
{
	\uE536\uEA7D\uE611\uEE66\uF5F5\uEDF9\uF549\uE4FC\uF1E9\uEEBD\uEC8C\uF5EE.\uF3ED\uE329\uF180\uF009\uF045\uEFE8\uF38D\uF0F9\uF700\uE210\uE95F\uE40E(1833101, null, this, null);
}
```