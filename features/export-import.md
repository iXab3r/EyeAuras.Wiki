---
title: Export and Import
description: How to save, publish, or import a pack in EyeAuras
published: true
date: 2026-04-11T12:00:00.000Z
tags: ауры, экспорт, импорт, обмен, резервное копирование, ai-translated, паки
editor: markdown
dateCreated: 2023-06-18T18:28:27.203Z
---
# Save your aura set and open an independent copy

Export saves a selected aura, tree or folder to JSON. Before changing a set, you can export it, import a separate copy and compare the two. You do not need to publish anything online.

Start with your own small folder named `Transfer test`, containing one disabled aura. You need permission to export its contents; a private pack may restrict this.

1. Select the folder and open **Share/Export** using the export button or **Ctrl+S**. In **Content**, check that the folder and its contents are included.
2. If **Missing linked objects detected** appears, inspect the dependencies. **Add linked objects** adds linked objects missing from the set. Check **Content** again afterwards.
3. Choose **Destination → Local export → Save to file…** and save the JSON in your own directory. **Open in Explorer** locates the result. Close the export dialog.
4. Click **Import**, choose **Source → Import from file → Open…**, and select that file. Check the contents and paths in **Preview**.
5. The original objects still exist, so choose **Copy** in **Import Options**. This keeps them and gives the imported objects separate IDs. Do not use **Replace** for this exercise.
6. Find the copy in the tree and rename its aura. The original aura should keep its name. Leave both disabled until you have checked their settings and external dependencies.

Ordinary import uses the paths stored in the file. Selecting a folder before opening the dialog does not make it the destination. Check **Preview**: this form has no separate picker for an arbitrary destination folder.

The source screen lets you inspect a file or link before changing the working tree.

![Choosing a publication link or local file](https://s3.eyeauras.net/media/2026/04/EyeAuras_1QpMi38ffV.png =x600)

## Choose what to transfer

| Option | What it transfers |
| --- | --- |
| Selected aura or tree | The selected item's settings. Neighbouring items are not automatically included. |
| Folder | The folder and its nested folders, auras and trees. Use this for a related set. |
| Save to file… / Copy JSON | Local JSON for that selection; Copy JSON writes it to the clipboard. Neither copies the whole installation or its history. |
| Publish | Uploads the set and produces a publication link. |
| Portable pack | A separate bundle of EyeAuras and configuration for launching the set; see [Packs](/en/features/packs). |

Embedded resources are prepared with the exported data. External file paths, window names, installed drivers and service access still need checking on the receiving PC. Known internal links can be remapped when copying the set; arbitrary strings in code and references to objects outside it are not automatically repaired. Compatibility across different application versions also needs checking.

Export does not scrub secrets from your settings. Before sharing, review tokens, passwords, addresses and embedded resources. Store personal copies appropriately too.

## Import a publication and choose how it updates

1. Paste its link into **Source**. Check the name, description and owner.
2. Click **Download** to retrieve the contents and open **Preview**. Read **Overview** and **Pack Options** before importing.
3. Choose **Import Options**, then **Import** or the appropriate conflict-resolution button. Import applies the downloaded set, rather than a single highlighted preview item.

![Publication details before import](https://s3.eyeauras.net/media/2026/04/EyeAuras_RsqOrNqzmX.png =x600)

| Import option | When to use it |
| --- | --- |
| Prefer packed version | Requests the author's prepared contents when available. It does not download a portable ZIP. Packed Only policy can force this choice. |
| Subscribe to updates | Links the local folder to the publication for later updates and applies its current version immediately. Ordinary JSON without a publication has no such subscription. |
| Clone locally | Available with a subscription. Creates distinct local IDs while keeping the source link, allowing multiple copies of one pack. Older text calls this Local Clone. |
| No subscription | Makes a one-time import. A later author revision does not automatically replace this copy. |

![Import options](https://s3.eyeauras.net/media/2026/04/EyeAuras_lVrq3hdYQj.png =x600)

| Conflict choice | Result |
| --- | --- |
| Replace | Replaces conflicting existing items. It does not merge individual settings. |
| Copy | Keeps existing items and adds copies with distinct IDs and adjusted paths. |
| Ignore Conflicts | Skips conflicting incoming items and imports the rest. |

An ordinary import can ask **Ignore / Replace / Copy** for each conflict, with **… All** choices. Subscriptions use folder synchronization instead of independent one-time copying. A local clone is not intended for ordinary republication as the original.

The source form also accepts a prepared installation file or JSON from the clipboard. Choose by the file's contents; an arbitrary file is not a full application configuration.

<details>
<summary>Publish a new set or update your publication</summary>

1. Leave the URL in **Destination** empty for a new publication. Set its name and description in **Overview**; the description supports Markdown. Check **Content** and **Pack Options**.
2. Click **Publish**. A successful upload produces a link. Unlike Save to file…, this uploads to the server.
3. To publish a revision, paste the existing publication's URL into **Destination**, review its details and choose **Update**.

![Publication name and description](https://s3.eyeauras.net/media/2026/04/EyeAuras_0eqyEd4cQl.png =x600)
![Pack options before publication](https://s3.eyeauras.net/media/2026/04/EyeAuras_6Ib89kDGV9.png =x600)
![Destination and publication owner](https://s3.eyeauras.net/media/2026/04/EyeAuras_2ayTMoUOpH.png =x600)

The desktop export dialog checks ownership against the signed-in account and can block updating someone else's publication. Server Editor and Manager permissions are broader than this particular check; website access does not guarantee that this dialog supports the same update. An ownerless publication does not become yours when you paste its URL.

A share link and a public library listing are separate. An unlisted or unfamiliar URL is not an access check: content restrictions and publication permissions are configured separately.

</details>
