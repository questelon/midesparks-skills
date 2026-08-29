# midesparks-skills

Four skills for Claude Code, built while running a live production app as a
one-person company. Each one exists because something went wrong and needed a
rule that would survive being forgotten.

## Install

```
/plugin marketplace add Midesparks/midesparks-skills
/plugin install midesparks-skills@midesparks-skills
```

## What's in here

### `check-first`
Read the artefact that defines a mechanism before explaining how it works or
handing someone a procedure. Written after three corrections in one session,
each caused by asserting when a one-second check was available. Includes a table
of what settles what, and the question that catches advice drifting away from
the goal it was meant to serve.

### `deep-check`
Audit an entire existing project line by line. Auditing a whole codebase is a
different job from reviewing a diff — there is no diff to anchor on, and the
real risk is **false completeness**: skimming a directory listing, reading a few
interesting files, and reporting as if everything had been read. This partitions
along real module boundaries, fans out, verifies findings adversarially, and
states plainly what was excluded.

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
an assistant that guesses and corrects itself, an audit that quietly skips half
the code, a release that ships without the fix, and an explanation that hides the risk behind jargon.

## Licence

MIT — see [LICENSE](LICENSE).
