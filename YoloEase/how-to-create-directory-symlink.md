---
title: How to create Directory Symbolic Link
description: i.e. redirect one directory to another (even on another logical disk)
published: true
date: 2023-11-13T00:28:04.322Z
tags: 
editor: markdown
dateCreated: 2023-11-13T00:04:23.563Z
---

This guide provides step-by-step instructions on how to create a directory symbolic link from the `%appdata%\CVATAAT` folder to another folder located on a different disk. This could be useful if you do not have enough disk space in `%appdata%` which is located on system drive

# Prerequisites
- Administrative privileges on your Windows system.
- The path to the destination folder where you want to redirect the contents of `%appdata%\CVATAAT`.

## Step 1: Navigate to the AppData Directory
In `Exporer`, type the following path into address bar and press Enter:

```
%appdata%
```

## Step 2: Prepare CVATAAT Directory 
- Check if the `CVATAAT` directory exists in `%appdata%`. 
- If it **doesn't**, **create** it.
- If it **exists**, **move** it to desired destination path (e.g. to `D:\CVATAAT`)

## Step 3: Open Command Prompt as Administrator
Press `Win + S` to open the search bar. Type `cmd` or `Command Prompt`. Right-click on `Command Prompt` and select `Run as administrator`.

## Step 4: Create the Symbolic Link
Use the `mklink` command to create a symbolic link. Replace `D:\CVATAAT` with your desired destination path. Run the following command:
```
mklink /D "%appdata%\CVATAAT" "D:\CVATAAT"
```
`/D` creates a directory symbolic link.
`%appdata%\CVATAAT` is the name of the link and where it will be created.
`D:\CVATAAT` is the path to the directory where you want the link to point.

Output of this command should be something like this: `symbolic link created for CVATAAT <<===>> D:\CVATAAT`

# Conclusion
Now, any data written to `%appdata%\CVATAAT` will be redirected to `D:\CVATAAT` (or your specified destination). This setup is generally compatible with most software, but it's always good to test with specific applications you plan to use.

---

Remember, symbolic links are powerful tools but should be used cautiously, as incorrect usage can lead to data loss or system instability. Always ensure you have backups before modifying system directories and links.