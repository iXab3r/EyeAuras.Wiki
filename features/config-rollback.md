---
title: Changelog
description: Release notes and version history
published: true
date: 2025-03-12T23:00:53.963Z
tags: version control, Git, configuration management, rollbacks, ai-translated
editor: markdown
dateCreated: 2024-10-30T17:29:03.641Z
---
#  Configuration Version History and Rollbacks

EyeAuras uses [Git](https://git-scm.com/) to automatically save your program configuration. In practice, this means the app creates snapshots of your current settings that you can review or roll back to when needed. These snapshots are called **commits**.

## What is a commit?

A commit is a saved state of your files. Each commit records changes. For example, if you change a setting, the program creates a new commit that stores that change. Commits make it easy to return to older versions of your configuration, because you can select a specific commit and restore the files to that point in time.

EyeAuras creates commits automatically:

- Periodically (automatic saves are marked as `Periodic save`)
- When you exit the program

All commits are kept indefinitely, so you can return to any previous version of your configuration at any time.

## Where is the configuration stored?

The program configuration is stored as a Git repository inside the `config` folder. The path depends on your EyeAuras version:

- **Standalone version**: `%appdata%\EyeAuras\release\config`
- **Portable and Packed versions**: `data\release\config`

This folder contains both the change history and the current configuration files used by the program.

## Using "Version history"

![Version history](https://s3.eyeauras.net/media/2024/10/Code_6kH4xNd9ioGMtjIK.png)
![Version history](https://s3.eyeauras.net/media/2024/10/EyeAuras_Y3P3cw9Pi1E0WkMc.png)

"Version history" lets you:

1. **Browse commit history** — see all saved changes with dates and descriptions.
2. **Choose a time range** — filter commits to only show the last day, week, month, and so on.
3. **Roll back your configuration** — two rollback types are available: soft and hard.

## Two rollback types: Soft Reset and Hard Reset

### Soft Reset

**What it does**  
A **Soft Reset** updates only the files in the `config` folder so they match the selected commit, **without changing commit history**. The full history stays intact, so if you later want to return to the current version, you still can.

**How Soft Reset works**

1. The program takes the files from the selected commit and overwrites the current files in `config`.
2. The change history is left untouched — all later commits remain in Git.
3. Use this if you want to temporarily return to an earlier version without losing recent history.

**Pros**

- **History is preserved**: all commits stay available and can be restored later.
- **Flexible**: you can roll back temporarily while still keeping the option to go back to your current configuration.

**Cons**

- **History can become harder to read**: with many commits, it may be more difficult to understand what changed.
- **Extra files are not removed**: if new files were added after the selected commit, they will remain in the `config` folder.

### Hard Reset

**What it does**  
A **Hard Reset** rolls back the `config` folder to the exact state of the selected commit **and removes all commits made after it**. In other words, the history is rewound as if the later changes never happened.

**How Hard Reset works**

1. The program takes the files from the selected commit and replaces the current files in `config`.
2. All commits made after the selected one are removed from history.
3. Any files added after the selected commit are also deleted.

**Pros**

- **Clean history**: only the commits you want to keep remain.
- **Exact restoration**: the `config` folder becomes an exact copy of the selected commit.

**Cons**

- **Cannot be undone**: all later commits are permanently removed and cannot be recovered.
- **Risk of data loss**: any important changes made after the selected commit will be lost.

## How to roll back

### Soft Reset

![Soft Reset](https://s3.eyeauras.net/media/2024/10/EyeAuras_3fDx8YnlGoQL6K16.png)

1. Open "Version history"
2. Select the commit you want from the list
3. Click **"Reset to Selected Commit"**
4. Confirm the action. Your configuration files will be rolled back to the selected commit, while commit history stays unchanged

### Hard Reset

![Hard Reset](https://s3.eyeauras.net/media/2024/10/EyeAuras_2kw8xktqIXGgOkYG.png)

1. Open "Version history"
2. Select the commit you want to roll back to
3. Click **"Hard Reset"**
4. Confirm the action. The program will remove all commits after the selected one and fully restore the `config` folder to that commit's state

After the rollback, the program will restart to apply the changes.