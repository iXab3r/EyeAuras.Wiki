---
title: C# Script Protection
description: Choose script storage and protection for prepared EyeAuras packs
published: true
date: 2025-03-12T22:11:21.972Z
tags: c#, script protection, intellectual property, software security, code obfuscation, script compilation, ai-translated
editor: markdown
dateCreated: 2025-03-12T01:36:07.305Z
---

# Prepare a pack without editable script source

Choose how scripts are stored separately from how their compiled representation is protected. Precompilation alone does not prevent decompilation. Script protection also does not replace run permissions, licensing or validation of data handled by your own services.

You need your own source project, author access to the publication and permission to use protection. The server checks the signed-in user and alpha-tester entitlement; seeing a control in the editor does not grant access. Ask through [Contacts](/en/contacts) about availability for your account.

## Compare an ordinary and protected copy

1. Prepare your own small folder containing an aura **Test**, **Fixed Value → Is Active**, and an **On Enter → C# Script** action. This top-level `Script.csx` line is enough for the comparison:

```csharp
Log.Info("Protection test");
```

2. Use **Run** and find the message in the aura's log. Keep your editable source separately: Binaries Only cannot reconstruct it through an unlock button.
3. Open **Share/Export → Pack Options**. Choose **Script Compilation Mode → Binaries Only** and **Script Protection Mode → Performance-first**. Prepare your own publication with **Publish** or **Update** as described in [Export and Import](/en/features/export-import).
4. Obtain a new **Download pack** and open it in a separate directory. Check the same aura and log message. Changing a setting does not transform copies downloaded before the new revision was prepared.
5. If behavior differs, compare the same build with **None**, then the protected profiles. Preserve the version, mode and a small reproducer for [support](/en/report-a-problem).

The reader's comparison checks that one small program still behaves as intended after preparation. It does not establish compatibility of every reflection path, large project or external module.

![Earlier compilation and protection settings](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_jfOmqT7V4x4xqgqS.png =x400)

| Script Compilation Mode | Prepared contents |
| --- | --- |
| Script Only | Project text, compiled on demand on the receiving machine |
| Script w/ Binaries | Source files and the prepared assembly. Protecting the assembly does not hide source delivered alongside it |
| Binaries Only | The prepared assembly without C#/Razor source files in the delivered project. Other resource files can remain |

| Script Protection Mode | Meaning |
| --- | --- |
| None | No additional protection transform. With Binaries Only, this still distributes compiled code |
| Performance-first | A protected profile; begin with a small behavior comparison |
| Security-first | The supplied builder configures the same transformations as Performance-first. Its name does not establish extra encryption of every method |

Protection selection is enabled for Binaries Only. Builder rules determine the transformations, including name/control-flow changes and string or numeric transformations. Do not infer whole-module encryption, virtualization of every method or integrity checks from a profile name. There is no absolute reverse-engineering, invisibility or security guarantee, and no universal performance estimate.

## Keep source, resources and permissions separate

Processing applies to prepared script projects in the pack. It does not make ordinary triggers, actions and nodes secret. This form has no general switch for protecting only one arbitrary source file. Compiled archives and remaining assets are representations to distribute, not a secure store for credentials or every value the program exposes.

Keep the author's editable copy. **Unlock the script for editing**, where available, is not reverse obfuscation and does not restore removed source. Make changes in your original project and prepare a new revision.

[Permissions](/en/features/permission-model) govern viewing, editing and redistribution. A [sublicense](/en/features/sublicenses) and its lease have their own lifetime; protecting code does not grant either. Your own input/output handling, service authorization and confidential data still need appropriate design.

<details>
<summary>Check a larger project</summary>

| Area | What to check |
| --- | --- |
| Reflection, serialization and string-based names | A hardcoded name can stop matching after transformation; concatenated strings or external rules are not automatically repaired |
| Public and internal types | Visibility participates in transformation rules. Do not change every type to internal without checking Razor, serialization and external consumers; visibility alone is not a universal contract-preservation promise |
| ObfuscationAttribute | `System.Reflection.ObfuscationAttribute` supplies instructions such as Exclude. Supported features depend on the tool; the attribute is not named Obfuscate |
| Performance-sensitive work | Compare behavior and timing on the same inputs rather than extrapolating from one example |
| Failure only after protection | Compare None and protected settings, check names and provide a small reproducible example to support |

See Microsoft's [ObfuscationAttribute reference](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.obfuscationattribute?view=net-9.0). This setting has no built-in measure of resistance to reverse engineering. A decompiler such as dnSpy or dotPeek can show a representation of your assembly, but its appearance does not prove that analysis is impossible.

</details>

<details>
<summary>Historical source and decompiler comparison</summary>

The following four listings come from the [Path of Exile 2 Helper example](https://eyeauras.net/share/S20241213181401RaWLZLE430e6). They illustrate historical source and transformed representations, not output from a current build or a complete program to paste into Script.csx.

The method needs its original class's Window and Log members, types and extensions. It is not a universal multi-monitor positioning recipe. Decompiled listings can contain syntax that is not compilable C#.

Original source fragment:

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

Historical decompilation with no additional protection:

```text
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

Historical Performance First example:

```text
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

Historical Security First example:

```text
// Token: 0x06000086 RID: 134 RVA: 0x000049C4 File Offset: 0x00002BC4
private void \uF5D1\uF8EB\uF0A0\uF126\uE1AD\uE6ED\uE599\uE94C\uE27D\uF25B\uE418\uECFF()
{
	\uE536\uEA7D\uE611\uEE66\uF5F5\uEDF9\uF549\uE4FC\uF1E9\uEEBD\uEC8C\uF5EE.\uF3ED\uE329\uF180\uF009\uF045\uEFE8\uF38D\uF0F9\uF700\uE210\uE95F\uE40E(1833101, null, this, null);
}
```

These listings preserve one old comparison. They do not specify every later builder's transforms or promise recoverability of source.

</details>
