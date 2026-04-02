---
title: ↩ Export / ↪ Import
description: Transfer, share, or back up EyeAuras packages between different users or devices
published: true
date: 2025-03-12T23:37:31.169Z
tags: ауры, экспорт, импорт, обмен, резервное копирование, ai-translated
editor: markdown
dateCreated: 2023-06-18T18:28:27.203Z
---
# Exporting and Importing Auras in EyeAuras

**EyeAuras** provides a convenient way to share auras with other users through **Export** and **Import**. This lets you:

- Upload your auras to the EyeAuras server and share them by link.
- Import auras from a link or from a JSON file.

This guide explains how it works step by step.

---

## Exporting auras

To export an aura:

1. Select the aura in the **AuraTree**.
2. Click **"Share"** in the top-right corner of the EyeAuras window, or use the **Ctrl + S** hotkey.
3. The **"Export Aura"** window will open.

In this window, you can:

- Upload the aura to the EyeAuras server.
- Get a unique sharing link. For example: [This link](https://eyeauras.net/share/S20230604122817NvnkCMZ1X2qJ).

**Important:** The link is public, so avoid exporting sensitive data such as passwords.

> If you want to update an existing aura, you can specify its ID during export. This will replace the old version with the new one.

![Export UI](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_LBifIfafcoLZOGKi.gif)

---

## Importing auras

To import an aura:

1. Click the **"Import"** button on the toolbar on the left side of the **EyeAuras** window.
2. In the window that opens, the app will automatically try to parse the contents of your clipboard.
3. You can also paste JSON or an aura link manually.

> EyeAuras will automatically detect the data format and offer the appropriate import option.

---

## Managing aura IDs

Each aura has its own **unique identifier** (ID). If an ID conflict is detected during import, for example if you already have an aura with the same ID, the app will offer two options:

- **Replace:** The new aura will replace the old one.
- **Change identifier:** The app will assign a new ID to the imported aura and automatically update all internal references so everything continues working correctly.

---

## FAQ

**How many auras can I export in one package?**
- Unregistered users can upload up to **5 MB** of data, while registered users can upload up to **100 MB**.

**Can I protect my package with a password?**
- Yes. The "Private Auras" feature lets you restrict access with a password. However, the safest option is to use scripts, since they have [their own protection](/features/script-protection) at a much higher level than regular auras.

**What happens if I update an aura with the same identifier?**
- The old version will be replaced with the new one.

**Will changing the identifier affect whether the aura works?**
- No. EyeAuras will automatically update all internal references in the imported auras. References in existing auras will remain unchanged.

**Can I preview an aura before importing it?**
- Yes. The "Import Aura" window lets you preview the contents before adding them to your project.

**Can I transfer auras without uploading them to the server?**
- Yes. You can select an aura, press **Ctrl + C**, and send the JSON file in any way you like, for example through a messenger app. Another user can then paste that JSON into the import window.

**Can I import individual auras from a shared package?**
- At the moment, only the entire package can be imported.

**How is the folder structure preserved during export and import?**
- Folders are preserved together with their paths, similar to how it works in Windows File Explorer.

**Can I export or import individual aura components?**
- Yes. Click **"Copy"** in the header of the item, for example a trigger or action. The app will copy that item's JSON definition, which can then be pasted into another aura or shared with another user.