---
name: merge
description: >
  Combine two or more skills and run them together simultaneously. Use whenever the user
  types "/merge [skill1] [skill2] [task]", "combine goal and auto-model", "use goal with
  auto-model", "merge these skills", "run goal and compact together", or describes wanting
  multiple skill behaviors active at once. The merge skill reads each named skill's
  instructions, synthesizes them into a unified execution plan, and runs the task with all
  behaviors active — so skills reinforce each other rather than conflicting. The most
  powerful combination is goal + auto-model: persistent autonomous work with intelligent
  model switching at every cycle. Also supports goal + compact (long runs with context
  management), and any other combination the user requests. Always show a merge card before
  executing so the user sees exactly what's being combined and how.
---

# Merge Skill — Multi-Skill Composer

You combine multiple skills into a single, unified execution. Your job is to read the
instructions of each requested skill, synthesize their behaviors intelligently, and execute
with all of them active at once — not switching between them, but running them together.

---

## Step 1: Parse the Request

Extract from the user's input:
- **Skills to merge** (e.g., `goal`, `auto-model`, `compact`)
- **The task** (everything after the skill names)

Common formats:
- `/merge goal auto-model [task]`
- `/merge goal compact [task]`
- "combine goal and auto-model to [task]"
- "use goal with auto-model for [task]"

---

## Step 2: Load Each Skill's Instructions

For each named skill, read its SKILL.md from:
```
~/.claude/skills/[skill-name]/SKILL.md
```

Use the Read tool. If a skill file isn't found, use the built-in behavior summaries below
as a fallback.

### Built-in Skill Behavior Summaries (fallback)

**goal** — Persistent autonomous loop. Plan → Execute → Check condition → Loop until met.
Never stops after one attempt. Keeps working until the success condition is satisfied.

**auto-model** — Intelligent model routing. Scores task on reasoning depth, stakes, domain
complexity, and response depth. Picks Opus / Sonnet / Haiku. Shows routing card. Executes
on the chosen model via subagent.

**compact** — Context compression. Summarizes the conversation into a structured handoff
(Goal, Accomplished, Files, Decisions, Current State, Next Steps). Frees up context window.

**model** — Manual model selector. User specifies the model explicitly. No analysis.

---

## Step 3: Show the Merge Card

Before executing anything, display:

```
╔═══════════════════════════════════════════════════╗
║  🔀 SKILL MERGE                                  ║
╠═══════════════════════════════════════════════════╣
║  Combining:  [skill1] + [skill2] (+ [skill3]...) ║
║  Task:       [brief task description]            ║
╠═══════════════════════════════════════════════════╣
║  Synthesized Behavior:                           ║
║  [2-3 lines describing how the skills interact]  ║
╚═══════════════════════════════════════════════════╝
```

---

## Step 4: Synthesize the Behaviors

Don't just run skill1, then skill2. Blend them into a unified execution loop.

### Synthesis Rules for Known Combinations

#### goal + auto-model (Power Mode)
The most potent combination. Each cycle of the goal loop becomes model-aware:

```
Loop:
  1. Assess what needs to be done this cycle
  2. → auto-model: Score this specific step and pick the best model
  3. → goal: Execute this step on the chosen model (via subagent if self-contained)
  4. → goal: Check — is the condition met?
     - YES → Report completion with model usage summary
     - NO  → Diagnose what failed, loop back to step 1
             (the next cycle may route to a different model if the approach changes)
```

Status updates per cycle should include the model used:
"Cycle 2 [Sonnet]: Revised the structure — condition not yet met. Trying deeper analysis next."
"Cycle 3 [Opus]: Running deeper strategic analysis now..."

#### goal + compact
For very long autonomous runs where context may fill up:

```
Loop:
  1. → goal: Execute next step toward the condition
  2. After every 3-4 cycles OR when context feels heavy:
     → compact: Summarize what's been done so far into a handoff block
     Keep the compact summary in working memory for continuity
  3. → goal: Check condition → loop or complete
```

#### goal + auto-model + compact (Full Autonomous Mode)
All three together — persistent work, smart routing, context management:

```
Loop:
  1. → auto-model: Route this cycle's step to the best model
  2. → goal: Execute on that model
  3. Every 3-4 cycles → compact: Compress context
  4. → goal: Check condition → loop or complete
```

#### auto-model + compact
Route the summarization task itself to the right model, then compact:
- Use Haiku for short sessions (fast, cheap)
- Use Sonnet for complex sessions with many files and decisions

#### Other combinations
For any unlisted pairing, synthesize by:
1. Identifying the "primary" skill (the one controlling the execution loop)
2. Identifying "modifier" skills (ones that enhance how the primary executes)
3. Inject modifier behaviors at each step of the primary's loop

---

## Step 5: Execute

Run the synthesized loop. Apply all skill behaviors at each relevant step — don't alternate,
blend. The user should feel like they're using one powerful unified mode, not two skills
taking turns.

---

## Step 6: Report Completion

When the goal is met (or the task is done), summarize:
- What was accomplished
- Which models were used across cycles (for goal + auto-model runs)
- How many cycles it took
- Any follow-up the user should know about

---

## What makes Merge powerful

Skills alone are strong. Skills combined are multiplicative:
- **goal alone**: keeps trying, but always on the same model
- **auto-model alone**: picks the right model, but only runs once
- **goal + auto-model**: keeps trying AND uses the smartest model for each attempt

The whole point of merge is that the synthesis is greater than the sum of parts.
