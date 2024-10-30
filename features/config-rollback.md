---
title: Change History
description: 
published: true
date: 2024-10-30T17:29:03.641Z
tags: version control, Git, configuration management, rollbacks
editor: markdown
dateCreated: 2024-10-30T17:29:03.641Z
---
# Configuration Version History and Rollbacks

EyeAuras uses [Git](https://git-scm.com/) for automatic program configuration saving. This means that the program creates "snapshots" of current settings that can be viewed or rolled back if needed. These "snapshots" are called **commits**.

## What is a Commit?

A commit is a save of the current state of files. Each commit records changes: for example, if you modify a setting, the program creates a new commit to save this change. Commits simplify reverting to old configuration versions, as you can select the desired commit and restore the file state to that moment.

EyeAuras creates commits automatically:
- Periodically (automatic saves are marked as `Periodic save`)
- When exiting the program

All commits are stored without time limitations, allowing you to revert to any past configuration version.

## Where is the Configuration Stored?

The program configuration is saved as a Git repository in the `config` folder. The path depends on the EyeAuras version:
- **Standalone version**: `%appdata%\EyeAuras\release\config`
- **Portable and Packed versions**: `data\release\config`

This folder contains the change history as well as the current configuration files used by the program.

## How to Use "Version History"

![Version history](https://s3.eyeauras.net/media/2024/10/Code_6kH4xNd9ioGMtjIK.png)
![Version history](https://s3.eyeauras.net/media/2024/10/EyeAuras_Y3P3cw9Pi1E0WkMc.png)

"Version history" allows you to:
1. **View commit history**: you can see all changes with dates and descriptions.
2. **Select a period**: time filtering allows displaying only commits from the last day, week, month, etc.
3. **Roll back configuration**: two types of rollbacks are available — soft and hard resets.

### Two Types of Rollback: Soft Reset and Hard Reset

#### Soft Reset (Soft File Rollback)

**What It Is**:  
**Soft Reset** allows changing only files in the `config` folder to match the state of the selected commit, **without altering the commit history**. The entire change log remains intact, so if you want to return to the current version, you can always do so.

**How Soft Reset Works**:
1. The program takes files from the selected commit and overwrites the current files in `config`.
2. The change history remains untouched — all subsequent commits are saved in Git.
3. This rollback can be used to temporarily revert to a previous version without losing recent changes.

**Pros**:
- **History safety**: All commits remain in place and can be restored at any time.
- **Flexibility**: You can temporarily revert to a specific version while retaining the option to revert to the current configuration.

**Cons**:
- **Complex history**: Due to a large number of commits, understanding changes may be challenging.
- **Does not remove extra files**: If new files were added after the selected commit, they will remain in the `config` folder.

#### Hard Reset (Hard Rollback with History Deletion)

**What It Is**:  
**Hard Reset** is a rollback that **deletes all commits after the selected one** and completely reverts the `config` folder to the state at the selected commit. This means that the entire change log will be "rewound," as if there were no subsequent changes.

**How Hard Reset Works**:
1. The program takes files from the selected commit and replaces the current files in `config` with them.
2. All commits made after the selected one will be removed from the history.
3. Additionally, all files added after the selected commit will be deleted.

**Pros**:
- **Clean history**: Only necessary commits remain in the history, without extra data.
- **Complete state restoration**: The `config` folder will be an exact copy of the selected commit.

**Cons**:
- **Irreversible**: All subsequent commits will be permanently deleted, and they cannot be restored.
- **Data loss risk**: If important changes were made after the selected commit, they will be lost.

## How to Roll Back
### Soft Reset
![Soft Reset](https://s3.eyeauras.net/media/2024/10/EyeAuras_3fDx8YnlGoQL6K16.png)
1. Open "Version history"
2. Select the desired commit from the list
3. Click **"Reset to Selected Commit"**
4. Confirm the action. Configuration files will be rolled back to the state of the selected commit, while the commit history remains unchanged.

### Hard Reset
![Hard Reset](https://s3.eyeauras.net/media/2024/10/EyeAuras_2kw8xktqIXGgOkYG.png)
1. Open "Version history"
2. Select the commit to which you want to roll back
3. Click **"Hard Reset"**
4. Confirm the action. The program will delete all commits after the selected one and completely revert the `config` folder to the state of the selected commit.

After the rollback, the program will restart to apply the changes.