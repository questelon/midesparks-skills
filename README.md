# midesparks-skills

Six skills for Claude Code, built while running a live production app as a
one-person company. Each one exists because something went wrong and needed a
rule that would survive being forgotten.

## Install

```
/plugin marketplace add Midesparks/midesparks-skills
/plugin install midesparks-skills@midesparks-skills
```

## What's in here

### `project-memory`
Durable memory that survives compaction and session end. Write the decision, the
correction, the constraint at the moment it happens — not when the task feels
finished, by which point the moment has passed. Ships three hooks: a checkpoint
at the two moments knowledge is destroyed, a session-start brief that prints
where things stand before the first reply, and a generated memory tree that maps
every memory into branches and reports its own gaps.

### `check-first`
Read the artefact that defines a mechanism before explaining how it works or
handing someone a procedure. Written after three corrections in one session,
each caused by asserting when a one-second check was available.

### `auto-model`
Score a task across reasoning depth, stakes and complexity, route it to the
right Claude model, run it there, and show a routing card so the logic is
visible.

### `merge`
Run several skills together as one unified execution rather than one after
another, so they reinforce each other instead of taking turns.

### `release-audit`
Check that a release actually contains what you think it contains, before it
reaches users. Written after shipping a build whose fix had never reached a
single device.

### `layman-explain`
Explain technical, legal and financial things in plain language by default —
not as a mode to switch into when asked for "layman's terms". Simplifying the
words must never mean softening a real risk, dropping a real number or date, or
hiding a recommendation.

## Why publish these

They were built for my own problems, but the problems are not unusual:
an assistant that guesses and corrects itself, a release that ships without the fix, and an explanation that hides the risk behind jargon.

## Licence

MIT — see [LICENSE](LICENSE).
