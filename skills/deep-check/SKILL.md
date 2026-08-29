---
name: deep-check
description: >
  Thoroughly sweeps an ENTIRE existing project or codebase — every file, not just
  recent changes — looking for bugs, security holes, stale/inconsistent code, dead
  code, and drifted docs, then reports every finding ranked worst-first for the user
  to fix. This is NOT the same as reviewing a diff or a pull request: use this whenever
  the user wants a full audit of a project that already exists, e.g. "go through this
  project line by line", "audit the whole codebase", "check the entire app for
  anything wrong", "find everything broken in this repo", "is there anything I'm
  missing across the whole project", or when a project has been growing for a while
  and nobody has looked at it end-to-end. Also use this when several files or copies
  of the same thing (config, website pages, docs) may have quietly drifted apart from
  each other, even if the user doesn't use the word "audit." Make sure to consider
  this skill any time the user asks for a broad, no-stone-unturned look at an existing
  project, as opposed to reviewing a specific change.
---

# Deep-Check

## Why this exists, and how it differs from reviewing a diff

Reviewing a pull request is easy to trigger and easy to scope — the diff tells you
exactly what to look at. Auditing an *entire existing project* is a different problem:
there's no diff to anchor on, the codebase may be large enough that no single reading
pass can hold all of it, and the interesting bugs are often not in what changed
recently but in something that's been quietly wrong for months (a stale copy of a
file, a fixed-but-not-everywhere bug, a security check that only covers half the
code paths). Treat this as a distinct job from code review, not a bigger version of it.

The real risk with a task like this is **false completeness** — skimming a directory
listing, reading a few interesting-looking files, and reporting back as if the whole
project had been read. A human asking for a line-by-line audit is explicitly asking
you not to do that. The point of this skill is to make "I read every line" true, not
just claimed.

## Step 1 — Scope the project before touching any code

Before reading anything, get a real picture of what you're auditing:

- Identify the project root and its real boundaries. Exclude what shouldn't be
  read line-by-line: `node_modules`, `build/`, `dist/`, vendored dependencies,
  generated code, lockfiles, binary assets. Note what you excluded and why — silent
  exclusion is the same false-completeness problem as skimming.
- Get a file and line count per top-level area (by directory or by language) so you
  know the actual scale of the job. A 2,000-line CLI tool and a 200,000-line monorepo
  need very different strategies, and you should say out loud which one you're facing.
- If the user said "thoroughly" or "no stone unturned" without qualification, scope
  the audit to the whole project. If they named a subfolder or module, respect that
  scope — don't silently expand it, and don't silently shrink it either.

## Step 2 — Partition into chunks that respect real boundaries

Split the project into chunks a single reviewer can genuinely read in full — not skim.
As a rough guide, a chunk that a reviewer can actually read line-by-line (not
speed-read) is on the order of a few thousand lines; scale down for dense/critical
code (auth, payments, data handling) and up for boilerplate-heavy code.

Partition along real module boundaries, not arbitrary line counts:
- Keep a single file whole — never split one file across two reviewers, since a bug
  is often only visible when you can see a function's full context.
- Keep tightly-coupled files together (a component and its test, a service and the
  types it defines) so a reviewer isn't guessing about a type or contract defined
  somewhere else in a different chunk.
- If the project has multiple genuinely separate copies of similar things (e.g. this
  a project carrying `site_deploy/`, `site_pages/` and `site_pages/legacy/` — three
  near-duplicate copies of one site, which in a real audit had silently drifted
  apart), treat cross-copy consistency as
  its own explicit check, not something you hope a single-file reviewer stumbles onto.

## Step 3 — Fan out reviewers, one per chunk, in parallel

Dispatch one subagent per chunk to actually read it end to end. Each reviewer should
be told plainly: read every line of every file in your chunk, not just the parts that
look interesting — the value of this audit is that nothing gets skipped. Give each
reviewer the full scope decided in Step 1 (what's in bounds, what's excluded and why)
so findings stay consistent across chunks.

Ask each reviewer to look across all the angles the user asked for, not just the
obvious one:
- **Correctness bugs**: logic errors, wrong assumptions, off-by-one, unhandled edge
  cases, race conditions, dead/unreachable code, state that can't actually happen the
  way a comment claims.
- **Security**: injection risk, unsafe credential/secret handling, missing
  authorization checks, trust boundary violations.
- **Consistency/drift**: duplicated logic or duplicated files that no longer agree
  with each other, a fix applied in one place but not its sibling, stale references to
  old names/branding/config that should have been renamed everywhere.
- **Docs/comments**: comments or docs that describe behavior the code no longer has —
  these are real bugs in the sense that they will actively mislead the next reader.

Each reviewer reports back raw findings (file, line, what's wrong, why it fails in
practice) rather than a prose summary — you'll aggregate and rank next, and raw
findings survive that better than a paragraph does.

## Step 4 — Verify before reporting

Not every "this looks wrong" survives a second look. Before anything reaches the
user, put every correctness/security finding through a skeptical second pass — a
different reviewer (or the same reviewer prompted to argue against their own finding)
trying to construct the concrete input or state that would make it actually fail. A
finding that can't be pinned to a real failure scenario gets dropped or downgraded,
not reported as fact. Style/docs/consistency findings are usually clear-cut enough
not to need this, use judgment.

## Step 5 — Aggregate, dedupe, and report

Merge every surviving finding into one ranked list, most severe first. A live
production bug or an actual security hole outranks a stale comment. Dedupe findings
that are really the same root cause showing up in multiple files (e.g. the same
copy-paste bug repeated in five near-identical functions) — report it once, but name
every location it appears.

If the `ReportFindings` tool is available, use it — it renders the ranked list
consistently with how code review already surfaces findings in this environment, so
the user isn't learning two different formats for "here's what's wrong." If it isn't
available, output the same structure as plain markdown: file, line, one-sentence
summary of the defect, and the concrete scenario where it actually breaks.

Always state what was excluded from the sweep (Step 1) alongside the findings — a
report that silently skipped `node_modules` and a report that silently skipped half
the actual source tree look identical unless you say which one happened.

## What this skill does not do

It doesn't fix anything by default — it reports, so the user decides what to act on
and in what order. If the user explicitly wants fixes applied too, say so up front and
apply them after reporting, not instead of reporting; the audit's value is partly the
paper trail of what was found.
