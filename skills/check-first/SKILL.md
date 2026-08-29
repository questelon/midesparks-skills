---
name: check-first
description: Read the thing that defines a mechanism before describing how it works or telling the user what to do. Use before giving any procedure, setup instruction, auth flow, CLI incantation, or "how X works" explanation - and before recommending for or against a tool. Triggers on any answer that would begin "you need to", "it works by", "the steps are", "that uses", or any recommendation to enable, disable, install, revoke or replace something.
---

# Check First

## Why this exists

An assistant that guesses at a mechanism, states it confidently, and corrects
itself three minutes later has not saved anyone time. It has spent the user's
time twice: once acting on the wrong instruction, once undoing it.

Three real failures, all the same shape:

1. **"That connector signs in by OAuth, nothing is stored in a file."** Wrong.
   The connector's own `.mcp.json` was 200 bytes and read
   `Bearer ${SOME_ACCESS_TOKEN}`. One read would have shown it. The user acted
   on the wrong version.
2. **"That credential isn't being used - no tools from it are loaded."** Wrong.
   Concluded from one session's tool list instead of opening the config files.
   Three copies of the credential existed; one was in a file never scanned.
3. **"The copy failed."** A script treated any `robocopy` exit code >= 8 as
   fatal without checking what those codes mean. Codes 8-15 mean *some file*
   failed; the only failure was a broken shortcut. The copy was fine. It
   "failed" three times.

Same root cause every time: **a cheap check existed and was skipped in favour of
an assertion.**

## The rule

**Before describing how something works, or telling the user what to do, open
the artefact that defines it.**

Not "recall how these usually work." Open the file.

| Claim about | Artefact that settles it |
|---|---|
| An MCP server or connector | its `.mcp.json` or plugin manifest |
| How a CLI behaves, exit codes | `--help`, or the documented code table |
| Whether something is installed | the filesystem, not one symptom |
| Whether something is running | the process list, not a tool list |
| An API, a model, a price | fetch the docs; never answer from memory |
| What a file contains | read it |
| What a script will do | read it line by line, including its error paths |
| Who wrote something you plan to redistribute | its manifest, licence, sponsor links |

## Three questions before any procedure

**1. What single file or command settles this, and have I opened it?**
If the answer is "I'm fairly sure" - stop. Open it. It is nearly always one call.

**2. Does this advice serve the goal the user actually stated?**
Restate the goal in one line first. In the incident above, the goal was *publish
some skills to a git host*; the advice drifted into *skip that host entirely*,
which argued against the thing the user wanted. Drift is invisible without the
restatement.

**3. Am I handing back a decision I could have resolved myself?**
"Choose the permissions you need" is research the assistant should absorb, not
homework to return. Work out the answer, then present a recommendation. If the
choice is genuinely the user's - money, legal exposure, taste - say so, and give
a recommended option rather than a neutral menu.

## When a correction happens

One correction is not a patch. It is a signal that the chain was built on
guesswork. **Stop and re-verify the whole chain**, not just the broken link.

If a correction changes what the user should do, say so before anything else, in
one sentence, and say plainly what they acted on that was wrong.

## Say what you checked

Name the file or command. "I read the connector's `.mcp.json`" can be checked.
"This uses OAuth" cannot. Naming the artefact makes a skipped check visible - to
the user and to you.

## What this is not

Not a licence to research forever. The checks here are seconds long: read one
file, run one `--help`, list one directory. The waste being prevented is the
multi-round correction cycle, which costs far more than the check ever does.

If a check genuinely is expensive, say what you did not verify and how confident
you are - before the user acts, not after.
