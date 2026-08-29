---
name: project-memory
description: Capture decisions, findings, corrections and constraints to durable memory the moment they happen, rather than at the end of a task. Use at every memory checkpoint, before compaction, at session end, and whenever a decision is made, a belief turns out to be wrong, a fix reaches production, or a constraint is discovered. Triggers on "remember this", "you forgot again", "write it down", memory checkpoint notices, and any moment where losing a fact would cost time later.
---

# Project Memory

## Why this exists

Two things erase working knowledge:

1. **Compaction.** A long session is summarised, and detail goes with it. What
   survives is whatever was written to a file before the summary happened.
2. **Session end.** Everything not in a file is gone.

The failure is rarely a lack of intention. It is *timing* — saying "I'll write
that to memory" at the point where a task feels finished, by which time three
other things have happened and the moment has passed.

So the rule is not "remember to write memory". It is **write it at the moment it
happens, before doing the next thing.**

## What's in here

| File | What it does |
|---|---|
| `SKILL.md` | the rules below |
| `memory-checkpoint.js` | `PreCompact` + `SessionEnd` hook — forces a checkpoint at the two moments knowledge is destroyed |
| `session-brief.js` | `SessionStart` hook — prints where things stand *before* the first reply |
| `build-memory-tree.js` | generates `MEMORY-TREE.md`, a branch map of every memory |

Register the hooks in `settings.json`:

```json
{
  "hooks": {
    "PreCompact":   [{ "hooks": [{ "type": "command", "command": "node ~/.claude/skills/project-memory/memory-checkpoint.js" }] }],
    "SessionEnd":   [{ "hooks": [{ "type": "command", "command": "node ~/.claude/skills/project-memory/memory-checkpoint.js" }] }],
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "node ~/.claude/skills/project-memory/session-brief.js" }] }]
  }
}
```

## Where memory lives

The folder is keyed to the directory the session started from. The scripts work
this out themselves, so nothing needs editing — override with
`CLAUDE_MEMORY_DIR` if you want it somewhere else, and `CLAUDE_HANDOFF_DIR` for
where session handoffs are kept.

**Start sessions from the same directory every time.** Opening from a different
one produces a second, separate store, and which half loads becomes a matter of
how the app happened to be launched.

One fact per file. `MEMORY.md` is the index loaded at the start of every
session — one line per memory, never content.

```markdown
---
name: <short-kebab-case-slug>
description: <one line, used to decide relevance during recall>
metadata:
  type: user | feedback | project | reference
---

<the fact, in plain language. For feedback/project, follow with **Why:** and
**How to apply:** lines. Link related memories with [[their-name]].>
```

Then one line in `MEMORY.md`: `- [Title](file.md) — hook`

## Write immediately when any of these happen

Do not batch these. Do not wait for the task to end.

**A decision is made** — including a decision to *defer*. Record what was
decided, what it reverses, and why. Deferred decisions are the kind most often
lost.

**Something you believed turns out to be wrong.** Correct the existing file the
same minute. A confidently wrong memory is worse than none — it gets quoted back
as fact. Say in the file that it was corrected, and when.

**A fix reaches production.** What changed, what it fixed, what proved it.
Include the number that proved it.

**A constraint is discovered.** A rule that blocks an action, an API that cannot
do the obvious thing, a setting that cannot be changed. The highest-value
memories, because they stop a future attempt walking into the same wall — and
they are invisible in the code.

**A credential or access fact is learned.** Where it lives and what it is for.
**Never the value.**

**The user gives feedback on how you work** — especially criticism. Record the
why, not just the instruction.

**A number is measured.** Put the date on it. A number without a date becomes a
lie over time.

## What not to write

- Anything the repository already records: code structure, git history, what a
  function does. If reading the file answers it, do not store it.
- Anything that only matters inside the current conversation.
- Secrets of any kind, in any form.

## Recall: never start from a blank slate

Writing memory is only half of it. The other half is starting a session with
none of it loaded and then working from assumption.

`session-brief.js` runs at `SessionStart` and prints the memory count, every
memory whose description reads as still-open (with resolved ones filtered out),
what changed most recently, the open threads from the newest handoff file, and
a regenerated memory tree.

**Be honest about what this does.** A hook cannot force anything to be
remembered; it only puts the state on screen. What it removes is the excuse.

Before the first substantive reply, say where things stand — including anything
half-done. **If the brief did not appear, say so** rather than proceeding as if
there is no history. A silent hook is a broken hook, not an empty project.

## The memory tree

`MEMORY.md` is a flat list. Past about fifty entries it stops being readable and
the thing you needed sits unread in the middle of it. `MEMORY-TREE.md` groups
everything into branches and marks what is still open.

**Generated, never hand-written** — a hand-maintained tree goes stale on the
next memory written and then lies, which is the failure this system exists to
stop. `session-brief.js` rebuilds it every session start.

Rebuild by hand: `node ~/.claude/skills/project-memory/build-memory-tree.js`

Read its Health section, not just its contents. It reports three gaps that are
findings in their own right: memories no branch rule matched, `[[links]]`
pointing at a memory that was never written, and isolated memories nothing links
to. Edit the `BRANCHES` array to fit your own project — first rule that matches
wins, so specific subjects go above general ones.

## Checkpoint routine

When a checkpoint fires, work through this and say what you wrote:

1. What was **decided** since the last checkpoint? Written?
2. What turned out to be **wrong**? Has the old file been corrected?
3. What **reached production**? Recorded with its proof?
4. What **constraint** was hit? Recorded so it is not hit again?
5. What did the user **say about how you work**? Recorded with the why?
6. Does `MEMORY.md` have a line for every file?

If all six are genuinely clear, say "memory current" and move on. Do not invent
an entry to look diligent — a folder full of noise is how a memory system stops
being read.

## Before writing, check for an existing file

Search the folder first. Updating the file that already covers a topic beats
creating a near-duplicate, and a near-duplicate is how two contradictory
memories end up in context at once.

## Honesty rule

Never write "I will remember this" unless the file is already written. Write
first, then say what was written.
