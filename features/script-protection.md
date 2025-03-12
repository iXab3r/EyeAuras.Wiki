---
title: Protection of C# Scripts
description: Prevents interference in your scripts' functioning and protects your intellectual property
published: true
date: 2025-03-12T00:52:15.414Z
tags: C#,  script protection,  intellectual property,  software security,  code obfuscation,  script compilation
editor: markdown
dateCreated: 2025-03-12T00:43:32.176Z
---
---
```
# 🔒 Script Protection in EyeAuras

## **Important:** Script protection is an optional feature intended for pack authors who want to hide the implementation details of their scripts. By default, scripts are stored in text form and compiled as needed.

> During the alpha test, access is limited. To gain access to the functionality, **[contact me](/en/contacts)**.
{.is-info}

EyeAuras allows users to write their own C# scripts, which are stored in text form by default as part of the user configuration and are only compiled when needed. This is convenient for development but poses risks: someone may peek at your code or even change it without your knowledge.

### 📦 Packing and Pre-compilation
When Packing, you have the option to enable pre-compilation of scripts—this functionality pre-compiles scripts into a binary format and adds them to the finished pack along with the program. In this form, the script text is absent—only executable modules remain. This improves performance and is worth enabling even if you are not particularly concerned about protection.

**For an experienced programmer, compilation is not a barrier to studying the code!**  
There are many tools that allow performing the reverse process (decompilation) and obtaining the source program in almost identical form. Therefore, EyeAuras offers protection mechanisms for already compiled code.

> Important! After changing the packing settings, do not forget to perform an `Upload`—your settings affect only the **NEXT** revision of the pack!
{.is-info}

![Packaging options](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_jfOmqT7V4x4xqgqS.png)

### 🛡️ Script Protection Options
EyeAuras offers three levels of protection for your code:

- **⬜ None** — No protection. Scripts are stored and compiled as-is, without changes.
- **🚀 Performance First** — Performance priority. The code is protected and is still not understandable without special skills, but the focus is on stability and speed. In this mode, obfuscation and data encryption are applied.
- **🧱 Security First** — Security priority. Maximum protection is applied in this mode: obfuscation, data encryption, code encryption, partial virtualization, integrity check mechanism.

### 🛠️ Protection Methods
EyeAuras uses powerful tools to protect scripts:

- **🌀 Obfuscation** — the code is tangled to make it harder to understand. Clear and simple names are turned into unreadable ones, the structure of the code itself is altered to complicate understanding (but without changing functionality!), and string and numeric values are encrypted, making data extraction a rather laborious process.
- **🔁 Virtualization** — parts of the code are turned into special bytecode executed inside a virtual machine. This significantly complicates hacking.
- **🔐 Encryption** — the finished module is additionally encrypted, further complicating study.

### 🤔 Why is this important?
1. **🛡️ Security of your code** — protection prevents attackers from stealing your unique algorithm or logic.
2. **💰 Protection of commercial solutions** — if your script is part of a paid feature or product, protection will help prevent its illegal distribution.
3. **✅ Licensing** — if you use the [Sublicenses](/features/sublicenses) mechanism, which allows you to issue **you** (the user) licenses for packs, code protection is especially important since part of the license verification is located in the code.

The choice of protection level depends on your goals: if maximum speed is important, choose **🚀 Performance First**; if security is more important, choose **🧱 Security First**. In the future, when receiving the first feedback, this will still be adjustable.

### Tips
- The obfuscator never breaks a public contract. If you have a `public` class declared, then all `public` methods, properties, and fields of this class will not be renamed. If you want to achieve the highest degree of protection, always declare classes as `internal` so the obfuscator understands it can do anything with them.
- If you have some part of the code, especially critical to performance, you can use the [Obfuscate](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.obfuscationattribute?view=net-9.0) attribute to indicate to the obfuscator that this code should not be touched.

# FAQ

**Q: What happens if I forget to enable protection during packing?**  
- A: In this case, your scripts will be packed in the standard form (just compiled without additional protection). They are still harder to study than text versions, but this does not provide a high level of protection.

**Q: If I don't have scripts in the pack, will Protection help?**  
- A: No, this functionality works only with scripts and does not interact with ordinary actions/triggers and nodes.

**Q: Does protection affect performance?**  
- A: Yes, but in the overwhelming majority of cases, it will be barely noticeable, if noticeable at all.

**Q: Does protection guarantee complete safety?**  
- A: No. Nothing is absolute in nature, however, the amount of effort a hacker will need to apply is greatly increased, we are talking about the difference between "getting the source code in half an hour" and "not getting the source code ever, possibly getting something remotely similar to it someday." Even for very experienced developers, this task is usually not straightforward—a very specific set of skills is needed to even start solving it.

**Q: Do I need to think about protection myself or will EyeAuras take care of it?**  
- A: Thinking is still necessary. The protection system is applied to **your** source code and tries to turn it into a black box that _does something_ but is very difficult to understand how exactly. However, if you do not approach the input and output data carefully, you can still be hacked. For example, it's not worth transmitting ultra-secret data in clear form over HTTP that you store on your server—they can still be caught and read.

**Q: What to do if my protected pack suddenly stops working?**  
- A: If the problem occurred after enabling protection:
  - Make sure you are not using hard-coded names of classes, methods, and properties—they will be changed during obfuscation. In the vast majority of situations, the obfuscator can understand the context of usage and will change strings, but in some cases, analysis is powerless (for example, string concatenation).
  - If you are using the **Security First** mode, try **Performance First** and check how the behavior changes. In any case, [contact me](/en/contacts) and we will figure it out.

**Q: Can I verify how protected my pack is?**  
- A: There is no direct tool for testing protection in EyeAuras, but you can try using popular decompilers (like dnSpy or dotPeek) to evaluate for yourself how difficult it is to restore your code.

**Q: Can I enable protection only for certain scripts?**  
- A: No, protection is applied to all scripts in the pack. This functionality may be added in the future.

**Q: Can I specify which methods or classes should be protected?**  
- A: You can use the [Obfuscate](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.obfuscationattribute?view=net-9.0) attribute to specify methods, classes, and properties that should NOT be protected.

# Example of Path of Exile 2 Helper Pack - Auto HP/MP
https://eyeauras.net/share/S20241213181401RaWLZLE430e6

Take the same method `EnsureWindowIsInsideScreenBounds`—it is quite simple and ensures that if, for some reason, the bot window is out of screen bounds, it is positioned in the center.

Here is how it looks in its original text form.
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

Here's how it looks in decompiled form (`Script Protection` = `None`)—slightly less readable but insignificantly:
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

And now, apply obfuscation to it (`Performance First`):
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
			defaultInterpolatedStringHandler.AppendLiteral(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEEDC.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BA(10217));
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
					defaultInterpolatedStringHandler.AppendLiteral(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEEDC.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BA(10065));
					defaultInterpolatedStringHandler.AppendFormatted<Rectangle>(rectangle);
					defaultInterpolatedStringHandler.AppendLiteral(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEEDC.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BA(10006));
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
		defaultInterpolatedStringHandler.AppendLiteral(\uF744\uE158\uE9D5\uF663\uE9B4\uE5B0\uE89D\uE381\uF018\uE2BD\uEEDC.\uE057\uED84\uE170\uF871\uEA8E\uE42A\uECDD\uF1D7\uF489\uEC92\uE642\uF2BA(10009));
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

And here is the same method (presumably...) in `Security First` mode. The code is not only obfuscated, as in the previous version but also encrypted.
```csharp
// Token: 0x06000086 RID: 134 RVA: 0x000049C4 File Offset: 0x00002BC4
private void \uF5D1\uF8EB\uF0A0\uF126\uE1AD\uE6ED\uE599\uE94C\uE27D\uF25B\uE418\uECFF()
{
	\uE536\uEA7D\uE611\uEE66\uF5F5\uEDF9\uF549\uE4FC\uF1E9\uEEBD\uEC8C\uF5EE.\uF3ED\uE329\uF180\uF009\uF045\uEFE8\uF38D\uF0F9\uF700\uE210\uE95F\uE40E(1833101, null, this, null);
}
```