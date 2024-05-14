---
title: Export / Import Auras
description: transfer, share, or backup EyeAuras packs across different users or devices
published: true
date: 2024-05-14T11:16:08.721Z
tags: 
editor: markdown
dateCreated: 2023-06-18T18:28:27.203Z
---

EyeAuras provides an effective mechanism to share auras among its users through the process of Exporting and Importing auras. Users can bundle multiple auras together, upload them to a central server, and then share the link for others to import. This guide provides a detailed explanation of how to Export and Import auras.

### **Exporting Auras**

To export an aura, you need to select the aura in the AuraTree. After selection, click on the 'Share' button in the top-right corner of the EyeAuras window, or press 'Ctrl + S'. This opens up the 'Export Aura' window.

In the 'Export Aura' window, you have the option to upload your aura to the EyeAuras server. Once uploaded, you will be given a URL (for example, follow [this link](https://eyeauras.net/share/S20230604122817NvnkCMZ1X2qJ)). You can share this URL with anyone, and they can use it to import your aura.

If you want to update an existing shared aura, you can specify the existing share ID, and the server will overwrite the existing aura with the one you're exporting.

Remember, the link is publicly accessible. Therefore, avoid exporting sensitive data like passwords.

### **Importing Auras**

To import auras, click on the 'Import' link in the toolbar at the left side of the EyeAuras window, or press 'Ctrl + V' when the Aura Tree is in focus. This opens up the 'Import Aura' window.

The program automatically attempts to parse the content of your clipboard. You can either paste the JSON content of the aura pack or the link to the Share page. Either way, you can import auras that have been previously exported.

### **Managing Aura IDs**

Every aura has a global unique identifier, which is unique among all auras worldwide. When you import an aura, and there's a clash between IDs, EyeAuras provides two methods to resolve it:

-   **Replace:** The imported aura replaces the existing one.
-   **Change ID:** The ID of the imported aura is changed, and the links in the imported auras are rewritten to keep them valid.

## **Q&A**

**Q: Is there any limit to the number of auras I can include in a single share/export pack?** 

-   A: There is a size limit of 5MB for non-registered users and 100MB for registered users.

**Q: Can I password protect my shared aura pack so that only people I give the password to can access it?** 

-   A: This functionality is still in testing, but yes, there is a functionality called Private auras which allows to set permissions to your aura pack.

**Q: If I update a shared aura pack using the existing ID, will it overwrite the old pack or keep both versions available?** 

-   A: Updating a shared aura pack with the existing ID will overwrite the old pack.

**Q: If there is a clash in aura IDs during import, does changing the ID of the imported aura affect its functionality or linkage to other auras in any way?** 

-   A: If an ID is changed in an imported pack, all links inside this pack are rewritten and updated to keep them valid. Links in existing auras are never touched.

**Q: Can I preview the content of an aura pack before importing it?** 

-   A: Yes, you can preview auras in the Import window.

**Q: Is there a way to share/export auras without uploading them to the central EyeAuras server, like via direct file transfer?** 

-   A: Yes, if you select the folder and click Control+C or Copy, JSON describing the selected folder/aura will be copied to a clipboard. You can transfer this JSON to another user via any means and they will be able to Import/Paste it into their instance of EyeAuras.

**Q: Can I import auras one by one from a shared pack, or do I have to import the whole pack at once?** 

-   A: As of 2023 June, you can only import the whole pack.

**Q: How are folder structures maintained when exporting and importing aura packs?** 

-   A: Folders are imported by keeping their paths in a similar way to Explorer in Windows.

**Q: Is there an option to back up all my auras to a local file for safety?** 

-   A: All your auras are already being periodically saved and preserved in the Backups folder located here: %appdata%\\EyeAuras\\release\\backups. The last 2 days are usually preserved.

**Q: Can I export or import individual components of an aura, like its triggers or actions, separately?** 

-   A: Yes, you can export settings of each action/trigger/overlay separately by clicking on the "Copy" button in the header of a corresponding item. After that, the program copies JSON describing the Trigger/Overlay/Action and you can paste them into another aura or preserve it/share it with someone else.