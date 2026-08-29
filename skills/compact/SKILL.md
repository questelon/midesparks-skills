---
name: compact
description: >
  Free up context by summarizing the conversation so far. Use this skill whenever the user
  types "/compact", "compact the conversation", "summarize so far", "free up context",
  "compress context", "summarize our session", "what have we done", or when the conversation
  is getting long and the user wants a condensed recap before continuing or starting fresh.
  Also trigger this when the user seems to be losing track of the thread, wants a status
  check, or is about to start a new session and wants a handoff summary. Produce a tight,
  structured summary the user can immediately understand or paste into a new session.
---

# Compact Skill

Your job is to read the conversation so far and distill it into a compact, structured summary
that captures everything important — so nothing is lost when context is cleared or a new
session begins.

## Step 1: Read the transcript

Use the `mcp__session_info__read_transcript` tool if it is available — it gives you the full
session history. If it isn't available, reconstruct from your current context window.

## Step 2: Extract what matters

Read through the conversation and pull out:

- **What the user came to do** — their original goal or problem
- **What was accomplished** — completed tasks, resolved issues, produced outputs
- **Files & artifacts created or modified** — names, paths, what they contain
- **Key decisions made** — choices, configurations, approaches agreed upon
- **Current state** — where things stand right now (what's working, what's open)
- **Next steps** — anything pending, planned, or left to do

Be thorough here. Missing a file path or a key decision means the user loses that context
permanently. When in doubt, include it.

## Step 3: Write the summary

Format the summary using this structure:

---

## Session Compact

**Goal:** [One sentence — what the user came to accomplish]

**Accomplished:**
- [Bullet per completed item — be specific]

**Files & Artifacts:**
- `[filename or path]` — [what it is / what it does]

**Key Decisions:**
- [Bullet per important choice, config, or approach agreed upon]

**Current State:**
[2–4 sentences describing exactly where things stand. What's working. What's open.]

**Next Steps:**
- [Bullet per pending item or planned action]

---

## Step 4: Save it (optional but recommended)

After presenting the summary in chat, offer to save it as a `.md` file in the working
folder — useful for pasting into a new session or sharing with someone picking up the work.

## What makes a good compact

- **Dense, not vague.** "Created goal.skill in outputs folder" beats "made some files".
- **Preserves paths and names.** Exact file paths matter for continuity.
- **Captures intent, not just actions.** Why a decision was made is as important as what was decided.
- **Short enough to scan.** The user should be able to read it in under a minute.
- **Complete enough to hand off.** Someone starting fresh from this summary should be fully oriented.

## Note on context limits

If the user is running `/compact` because the session is nearly full, tell them: "Here's your
compact summary — you can paste this at the start of a new session to pick up exactly where
we left off."
