---
title: Aura Library
description: A shared collection of EyeAuras packs, available for users to discover, import, and use
published: true
date: 2024-05-14T11:16:47.540Z
tags: 
editor: markdown
dateCreated: 2023-06-18T18:30:15.359Z
---

# Find a suitable pack in Aura Library

Open [Aura Library](https://eyeauras.net/library) on the [EyeAuras website](https://eyeauras.net/) to find a community pack, then read its description before importing it. A public listing, access to its contents and permission to edit them are separate things.

## Find and review a publication

A browser is enough to browse. Importing requires EyeAuras, a compatible version and access to the selected contents.

1. Open the [library](https://eyeauras.net/library). For learning materials, enter **Tutorial** under **by Tags** and click **Apply**.
2. Use **Search** for words from the name or description, **by User** for an author, or **by Application/Game** for an application tag. **Reset** clears filters.
3. Open a pack's title. Check the author, revision, EyeAuras version and requirements for windows, resolution, language, resources and optional components. Review accessible scripts and resources before applying unfamiliar behavior. A listing does not guarantee review or safety, and protected contents may not expose source code.
4. Choose a way to obtain it only if its requirements fit. You can stop at the description: browsing it does not run the author's program.

The result is a specific publication with understood prerequisites, rather than a tag that merely matches a game name.

| Library control | Purpose |
| --- | --- |
| Search | Searches the name, summary and description |
| by Application/Game / by Tags / by User | Filters application tags, pack tags or author; multiple selected tags narrow the result |
| Date DESC / Date ASC, Page size | Changes ordering and the number of results |
| Pack title | Opens the publication and its available actions |
| Import | Uses an `eyeauras:` link to open the installed application; the browser may ask permission |
| Download pack | Opens the prepared-pack download route; contents and access depend on the publication |

## Inspect the import before applying it

1. Copy the normal publication link and paste it into **Import → Source** in EyeAuras, or use the site's **Import** link. If opening the app fails, use the manual link route.
2. Click **Download**, then inspect **Preview**, **Overview** and **Pack Options** before **Import**. For exported JSON already on disk, use **Source → Import from file → Open...**; copied JSON can also be pasted into Source. A local file without a publication is not an update subscription.
3. Choose update behavior in **Import Options** and resolve conflicts deliberately with **Copy**, **Replace** or a conflict-skipping choice. See [Export and Import](/en/features/export-import) for their exact scope.
4. Check your own target windows, paths, permissions and dependencies before using the imported behavior. Download access does not make its settings correct for your PC or grant editing rights to closed contents.

| Update choice | Result |
| --- | --- |
| One-time import | Keeps the downloaded version; later author revisions do not automatically replace it |
| Subscribe to updates | Connects the local folder to its source through [synchronization](/en/features/export-import) |
| Clone locally with a subscription | Gives the copy separate local IDs while retaining its source connection |

A pack may require other auras, embedded resources, external files, a model or a separate license. An external path does not install its resource. Run, edit and redistribution permissions are separate; see [Permissions](/en/features/permission-model) and [Packs](/en/features/packs).

<details>
<summary>List your own pack publicly</summary>

First [publish your pack](/en/features/export-import) with a useful title, description and tags. State the required version, preparation, resolution and other conditions. Review secrets and embedded content before sharing.

1. Open your publication with an account permitted to manage it.
2. Under **Danger Zone → Change visibility in Library**, choose **Change visibility to Public**.
3. Check the public listing by author or title. Use **Change visibility to Unlisted** to reverse the listing choice.

| Visibility | Meaning |
| --- | --- |
| Public | Discoverable through the public library |
| Unlisted | Omitted from public browsing; direct links still work for people allowed to view it. This is not a password or source-protection setting |

The library shows the active revision of an updated publication. That does not automatically replace every imported copy. Listing visibility and content access remain separate.

Avoid duplicate uploads of the same work. Respect other authors' permissions and credit work you build on. Check the limits shown by the current publication dialog and service.

</details>
