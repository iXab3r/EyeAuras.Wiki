---
title: Export and Import
description: How to save, publish, or import a pack in EyeAuras
published: true
date: 2026-04-11T12:00:00.000Z
tags: ауры, экспорт, импорт, обмен, резервное копирование, ai-translated, паки
editor: markdown
dateCreated: 2023-06-18T18:28:27.203Z
---
# Export and Import in EyeAuras

In simple terms:

- `Export` is used to save your pack locally or publish it with a shareable link.
- `Import` is used to load a pack from a link or from a file.

This is useful for three common tasks:

- sharing auras with another person;
- moving them to another PC;
- creating a backup.

> Important: a link to a published pack is usually public. Do not include passwords, tokens, or any other secrets in it.

## Export

To open the export window, select an aura or folder in the tree and click `Share` in the top-right corner of EyeAuras. Quick shortcut: `Ctrl + S`.

### Publish a new pack

If the link field is empty, EyeAuras will create a new pack.

On the `Overview` tab, you can set:

- the pack name;
- the description;
- the description in Markdown format.

![Editing the pack name and description](https://s3.eyeauras.net/media/2026/04/EyeAuras_0eqyEd4cQl.png =x600)

The `Pack Options` tab contains settings for the pack itself: compatibility, distribution policy, script packaging mode, and other parameters. A more detailed explanation of these settings is available in the [Packs](/features/packs) article.

![Editing pack settings during export](https://s3.eyeauras.net/media/2026/04/EyeAuras_6Ib89kDGV9.png =x600)

After publishing, EyeAuras will give you a link that you can send to someone else.

### Update an already published pack

If you paste a link to an existing pack into the `Destination` field, EyeAuras switches to update mode.

In this mode, the app:

- loads information about the pack;
- shows its owner;
- lets you update the pack with a new revision.

Only the owner can update a pack. If the pack belongs to another user, EyeAuras will show that and will not let you change metadata or click `Update`.

![Updating an existing pack and checking ownership](https://s3.eyeauras.net/media/2026/04/EyeAuras_2ayTMoUOpH.png =x600)

### Save without publishing

If you do not want to upload the pack to the website, use `Local export`.

- `Save to file...` saves a local JSON file.
- `Copy JSON` copies the same JSON to the clipboard.

This is convenient for backups, sending through a messenger, or moving data between your own devices.

## Import

To open the import window, click `Import` in the left panel of EyeAuras.

You can use any of these as the source:

- a link to a published pack;
- a local export file;
- an install script, if the pack was prepared in that format.

![Import window](https://s3.eyeauras.net/media/2026/04/EyeAuras_1QpMi38ffV.png =x600)

### Import from a link

Paste the link into the `Source` field. EyeAuras will then be able to fetch information about the pack. After that, click `Download` to load its contents and open the preview.

In the preview, you can check in advance:

- which auras and folders will be imported;
- the pack name;
- the description;
- the author's pack options.

![Pack preview after pasting a link](https://s3.eyeauras.net/media/2026/04/EyeAuras_RsqOrNqzmX.png =x600)

### What the Import Options do

The screenshot below shows the import options window.

![Import options](https://s3.eyeauras.net/media/2026/04/EyeAuras_lVrq3hdYQj.png =x600)

- `Prefer packed version` tells EyeAuras to load the `packed` version of the pack if the author prepared one. In code, this is a separate variant of the pack contents (`packedContent`). It is usually used for a prepacked, prebuilt, or less open version of the pack. If the pack policy requires this mode, EyeAuras enables it automatically.
- `Subscribe to Updates` does more than just copy the pack once. It links your local folder to the source pack by URL. The current version is downloaded immediately, and later the same pack can be updated from the same source. This is closely tied to how packs work, see [Packs](/features/packs) for details.
- `Local Clone` appears only together with update subscriptions. EyeAuras creates a local clone with separate internal IDs, so you can keep several copies of the same pack side by side. This clone stays linked to the update source, but it is treated as a local copy and is not suitable for normal republishing.

### If EyeAuras finds conflicts

If you already have similar auras, EyeAuras will ask what you want to do:

- `Replace` replaces existing auras with the imported ones;
- `Copy` keeps the old auras and adds new copies;
- `Ignore Conflicts` skips conflicting items and imports everything else.

## Which option should you choose

- If you just need a one-time copy of a pack, import it without a subscription.
- If you want to receive new versions from the same source, enable `Subscribe to Updates`.
- If you want to keep several copies of the same pack side by side, enable `Subscribe to Updates` and `Local Clone`.
- If you do not want to use the website, export to JSON and import from a file.

## Quick answers

**Can I import a pack without using the website?**  
Yes. You can open a local JSON file or paste JSON manually.

**Can I update someone else’s pack?**  
No. In the current EyeAuras logic, only the owner can update a pack.

**Can I preview the contents before importing?**  
Yes. That is what `Preview`, `Overview`, and `Pack Options` are for.

**Can I import only part of a pack?**  
At the moment, the entire pack is imported as a whole.