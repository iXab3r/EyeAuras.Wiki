---
title: Comment
description: 
published: true
date: 2024-03-07T23:27:21.079Z
tags: behavior tree, documentation, developer notes
editor: markdown
dateCreated: 2024-03-07T23:27:21.079Z
---

# Comment — explain a part of your tree

Add `Comment` beside a branch to record why it exists. It is a separate note card: it sends no input, checks no condition and does not execute child work.

## Label a practice delay

In the graph editor, prepare a separate tree with `Activation → Is Loaded`, `Execution → When Activated → Do nothing` and one `Wait` connected to the entry, with `General → Delay = 1500 ms`, randomization off.

1. Through `Add new Node`, add `Comment` and place it beside Wait. Do not connect it to the branch; the card has no input or output connector.
2. In `General → Format`, choose `Markdown`. Enter this in `Comment`:

```text
**Practice delay**
The first tick starts the timer; a later tick after the delay completes Wait.
```

3. The card shows the note with a bold first line. Switch to `Format → Text` to display the asterisks literally, useful for documenting exact expressions.
4. Click the upper `Tick BT Once`: Wait returns Running. After two seconds, tick again for Success. The note has not changed the branch's delay or route.

The current content and format fields are under General:

| Setting | Display |
| --- | --- |
| Comment | Note text saved with the tree |
| Format — Markdown | Supported Markdown formatting, such as emphasis, links and lists |
| Format — Text | Plain text; HTML characters are encoded instead of becoming markup |
| Format — HTML | Content rendered as HTML; Markdown or Text is enough for ordinary notes |
| Empty text | No comments |

Comment is available in BT and Macro. Placing it beside a node neither connects it nor defines execution order. Connected graph traversal does not pass through this card. If you manually tick Comment itself, its result is `Success` without automation work; this does not validate the note's meaning. Unlike ordinary action and condition nodes, it has no child continuation. Use it for explanations, branch intent and maintenance notes without treating the text as an executable instruction.
