---
title: Documentation roles
description: Internal role entry points for Wiki contributors
published: false
date: 2026-11-06T00:00:00.000Z
tags: internal, roles
editor: markdown
dateCreated: 2026-11-06T00:00:00.000Z
---

# Documentation roles

Roles are shared Markdown instructions for humans and coding agents. They work in
a standalone Wiki checkout or a submodule and inherit [repository instructions](../../AGENTS.md).

| Role | When to use it | Guide |
| --- | --- | --- |
| api-docs-author | Author, update or audit scripting and SDK API documentation | [API documentation author](api-docs-author.md) |

Invoke with `Use api-docs-author for <domain and bounded task>`. The guide routes
to the durable practice and domain maps. It does not require a separate agent,
select a model, change permissions or authorize publication and paid evaluations.

Keep role guides here and reusable authoring rules in `docs/practices/`.
Do not duplicate them in harness-specific instruction files. Add a native adapter
only when actual model or tool controls are needed.
