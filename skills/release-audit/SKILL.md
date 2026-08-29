---
name: release-audit
description: Pre-release QA and security audit for a live app before a build is uploaded to a store. Acts as QA tester, QA engineer, security/AppSec auditor, beta tester and app reviewer at once - sweeps the code, proves each finding with a concrete exploit, fixes what it finds, proves the fix with a control run, and rebuilds. Use before ANY production release, when the user says "test the app before I upload", "audit before release", "is this safe to ship", "QA this build", or when a release is about to go to Play Console / App Store. Also use after a security-sensitive change to money, auth, rules, or purchase paths.
---

# Release Audit

## Why this exists

A release is the last moment a defect is cheap. After upload it is a store
review cycle, a staged rollout, and a population of users on a version you
cannot recall. This skill exists to spend a focused hour before that door
closes, and to spend it on the things that actually cost money or trust
rather than on lint noise.

It is deliberately adversarial. The job is not to confirm the build is fine.
It is to find the reason it is not.

## The rule that makes this skill worth running

**A finding is not real until you can state the exact input or sequence that
makes it fail, and a fix is not real until you have watched the attack
succeed without it.**

Both halves matter. A report full of "this looks risky" wastes the reviewer's
time and trains them to ignore the next one. A fix that was never tested
against the unfixed code proves nothing - it may be closing a hole that was
never open, while the real one stays open next to it.

## Step 1 - Scope before reading anything

Measure the codebase first: files and line counts per area (client, server,
rules, config). Say out loud which areas you are auditing in full and which
you are excluding, and why. Excluding generated code, vendored dependencies
and build output is correct; excluding half the source because it is large is
not - say so if you are sampling.

Then identify the **money and trust paths** specifically. In any app with
payments, rewards, accounts or user data these are where a defect is
expensive:
- Anything that grants currency, credit, entitlement or access
- Anything that moves real money out
- Anything that verifies a purchase, an ad impression, or an identity
- Access-control rules
- Admin surfaces

Audit those in full regardless of size. Everything else is second priority.

## Step 2 - Fan out reviewers with adversarial mandates

Dispatch subagents in **batches**, not all at once, so usage stays
controllable and early findings can steer later batches.

Give each reviewer a role, not just a file list. The role changes what they
notice:

- **Security Auditor / AppSec** - authorization gaps, client-trusted values,
  idempotency and double-spend, replay, privilege escalation, secrets
- **QA Engineer** - state machines, error paths that leave inconsistent
  state, retry behaviour, race conditions, boundary values
- **Beta tester / App reviewer** - does the feature actually do what it
  claims, on a real device, for a real user who is not you

Every reviewer prompt must say: **read every line, do not skim**, and **for
each finding give a concrete exploit or failure scenario; mark anything you
cannot pin down as LOW CONFIDENCE**. That last instruction is what keeps the
report honest.

Batch 1 should always be the money and access-control layer.

## Step 3 - Verify before you believe it

Subagents are confident and sometimes wrong. Before acting on any finding:

- Read the actual code yourself at the cited line
- Check whether the exploit is reachable in practice, or blocked by
  something the reviewer did not look at
- Distinguish **live** (exploitable right now) from **latent** (exploitable
  only if some other condition changes). Check logs, config and feature flags
  to tell which. A latent risk behind a flag that is off is not a release
  blocker; say so plainly rather than inflating it.

Corroboration between two independent reviewers is strong evidence. Treat it
as such and prioritise those findings.

## Step 4 - Fix, with the breakage question asked first

Before every fix, ask: **what legitimate behaviour depends on the thing I am
about to lock down?** Grep for the callers. This single question is what
separates a fix from an outage.

Real examples this skill was written from:
- Gating a reward on a verification token would have refused every honest
  user, because the legitimate client generated a *different* token for that
  call than the one it gave the ad network
- Locking a "qualified" status field would have removed the entire referral
  feature, because nothing server-side ever wrote it
- A hardening change that used raw dot-notation on a possibly-missing key
  denied every real write, because in Firestore Rules that throws rather
  than returning null

When a lockdown would break a real path, **bound the behaviour instead of
forbidding it** - allow the legitimate shape, deny the cheap abusive one -
and say in the code comment that it is a bound, not a cure, with the real fix
named.

When a fix genuinely needs client and server shipped together, sequence it:
ship the client first, enforce on the server after adoption. Never enable an
enforcement that the installed base cannot satisfy.

## Step 5 - Prove the fix with a control run

For every security fix that has a test harness available:

1. Write a test for the **attack** (must be denied) AND for the
   **legitimate write** (must still succeed)
2. Run against the fixed code - everything passes
3. **Strip the fix, run again** - the attack tests must FLIP to succeeding

If the attack test passes in both runs, the test is not testing the fix.
This is non-negotiable and it is the step people skip.

## Step 6 - Rebuild and report honestly

Rebuild the artifact from the fixed tree and verify the fix is actually
present in the built output, not just the source.

Then report in three groups, plainly:
- **Fixed and verified** - what, and what proves it
- **Found, deliberately not fixed now** - with the reason (needs design,
  needs a decision, would break the installed base) and the recommended
  sequencing
- **Decisions only the owner can make** - product trade-offs, anything that
  contradicts an instruction they gave earlier

Never let a "fixed" claim cover something that was only partially closed. If
a fix is a bound rather than a cure, say the word "bound".

## What not to do

- Do not report lint noise and pre-existing style warnings as audit findings
- Do not silently change product behaviour the owner explicitly chose, even
  if it seems wrong - surface it as a decision
- Do not enable a security enforcement without checking the live failure rate
  first
- Do not claim a rebuild contains a fix without verifying the built artifact
