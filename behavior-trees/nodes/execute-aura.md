---
title: Execute Aura
description: 
published: true
date: 2024-03-08T09:40:04.580Z
tags: Aura, Actions, Behavior Trees
editor: markdown
dateCreated: 2024-03-07T23:58:44.862Z
---

# Run Aura — invoke actions you have already configured

Add `Run Aura` to reuse existing aura actions from a behavior tree. The earlier editor called this node `Execute Aura`. It invokes the linked auras' action lists without using their trigger state as an admission condition. Add [Aura Is Active](/en/behavior-trees/nodes/aura-is-active) separately when you need that check.

## Run two delays from one inactive aura

Create your own loaded aura named `Reusable pause`. Give it a [Fixed Value](/en/triggers/fixed-value) set to `Is NOT Active`, so normal activation does not run the prepared actions in parallel. Use no input, sound or other external actions in this example.

1. Add a [Delay](/en/actions/delay) to `On Enter`: `Delay, ms = 1000`, randomization off. Add another Delay of `2000` ms to `On Exit`; leave `While Active` empty. The aura must contain exactly these two actions.
2. Create a separate tree with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`. Through `Add new Node`, add `Run Aura` and connect it to the entry.
3. Open the node's `General → Auras → Links`, select only `Reusable pause` and confirm. Its link row should show two actions rather than `NO ACTIONS`.
4. Choose `General → Strategy → run 1-by-1 in order of addition`. Click the upper `Tick BT Once` and await its completion.

Run Aura calls the On Enter Delay, then the On Exit Delay. Expect roughly three seconds plus execution overhead, visible in the editor's last-tick duration, followed by `Success`. The aura can remain inactive throughout: invoking collections does not simulate aura activation and deactivation.

Look for `Run Aura` in current templates and `Auras → Links` in its editor:

| Setting or source | Effect |
| --- | --- |
| Auras → Links | Actions from one or more ordinary linked auras; no fresh trigger evaluation or tree/macro target |
| Strategy — run 1-by-1 in order of addition | Await each collected action sequentially; this mode does not run them in parallel |
| Strategy — run one random action | Invoke one action from the pooled actions, not every action of a random aura |
| On Enter → While Active → On Exit | Collection order inside each aura; While Active is called once per pass, not repeatedly until deactivation |
| Action count / NO ACTIONS | Check whether the linked aura actually supplies work |

For a required order across several auras, use separate Run Aura nodes in a [Sequence](/en/behavior-trees/nodes/sequence). Do not rely on the enumeration order of several links inside one node.

<details>
<summary>Context, completion and continuation</summary>

These are the original aura action instances with their own context and settings. The tree does not automatically replace their target window, variables or input backend. Configure actual action targets in the source aura. A disabled action can fail the invocation rather than being silently skipped. C# actions still require their normal script host and dependencies; ordinary helper classes do not gain script globals from this node.

The node passes cancellation to actions and awaits their calls under each action's contract. Errors are not failed condition checks, and completed side effects are not rolled back. Success means the calls completed, not independent confirmation of an effect in another application.

An empty action list can succeed without work in sequential mode; random mode needs a nonempty pool. Unresolved aura models contribute no actions. Verify the count of two for the example. If Run Aura has a child, successful action calls admit that continuation; its Running, Failure or Success becomes the overall result. A retained Running child resumes on the next tick without repeating the action lists first.

This is a bridge to supported actions you already use, such as Send Sequence or Play Sound when deliberately configured for their own targets. It does not depend on future equivalents appearing as tree nodes.

</details>
