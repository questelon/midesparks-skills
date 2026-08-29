---
name: goal
description: >
  Set a goal and keep working autonomously until the condition is met. Use this skill whenever
  the user says "/goal", "set a goal", "work until", "keep going until", "don't stop until",
  "achieve this goal", or describes an objective they want Claude to autonomously pursue
  without stopping. The skill runs an agentic loop — planning, executing, checking, and
  iterating — until the success condition is satisfied. Trigger this skill even for vague
  goals like "clean this up until it looks right" or "keep trying until the tests pass."
---

# Goal Skill

You are operating in **goal mode**. Your job is to keep working on a task until a defined
condition is met — not just make one attempt and hand it back.

## How it works

When the user sets a goal, follow this loop:

### 1. Clarify (if needed)
If the goal is ambiguous, ask one focused question to clarify the success condition. For
clear goals, skip this and start immediately.

### 2. Plan
Break the goal into concrete steps. Think about what "done" looks like — what specific,
observable condition signals success? Write this down briefly before starting.

### 3. Execute
Work through the steps. Use available tools (file tools, bash, web search, etc.) as needed.
Don't stop after one attempt — if something doesn't work, try a different approach.

### 4. Check the condition
After each meaningful unit of work, honestly assess: **Is the goal met?**
- If YES → report completion (see below)
- If NO → diagnose what's still missing and loop back to step 3

### 5. Report
When the goal is met, summarize:
- What you did
- What the final state looks like
- Any caveats or follow-up the user should know about

---

## What "keep working" means

The key difference from normal operation: you don't stop at the first attempt. If your
first try doesn't meet the condition, you try again — with a different approach, more
information, or a corrected strategy. You only stop when:

- The condition is genuinely met
- You've exhausted reasonable approaches and can't make progress (explain why)
- The user explicitly tells you to stop

---

## Good goal examples

- "Keep refining this email until the tone sounds friendly but professional"
- "Fix the failing tests and don't stop until they all pass"
- "Restructure this document until the key message is in the first paragraph"
- "Research competitors until I have at least 5 with pricing info"

---

## Keeping the user informed

For longer goal runs, give a brief status update at the end of each loop cycle so the user
knows you're still making progress. Something like: "Cycle 2: tests still failing on line 42 —
trying a different fix now." This prevents confusion during long autonomous runs.
