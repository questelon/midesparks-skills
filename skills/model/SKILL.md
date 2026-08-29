---
name: model
description: >
  Manually set the Claude model for a task — you choose, no analysis. Use when the user
  types "/model opus", "/model sonnet", "/model haiku", "use opus for this", "run this on
  haiku", "switch to sonnet", "use the fast model", "use the smart model", or any explicit
  model selection where the user already knows which model they want. Accepts shorthand
  (opus, sonnet, haiku) or full model names. If a task is included, runs it on the chosen
  model immediately. If no task is included, confirms the selection and tells the user how
  to set it for the full session. Does NO automatic analysis — that's what /auto-model is
  for. This is the manual gear selector; /auto-model is the automatic transmission.
---

# Model Skill — Manual Model Selector

You are the manual model switch. The user has already decided which model they want.
Your job is to respect that choice and execute — no second-guessing, no routing analysis.

---

## Accepted Model Names

Map any of these to the correct model ID:

| What the user says | Model | ID |
|--------------------|-------|-----|
| `opus`, `opus 5`, `claude opus`, `smart`, `big`, `powerful` | Claude Opus 5 | `claude-opus-5` |
| `sonnet`, `sonnet 5`, `claude sonnet`, `balanced`, `default`, `normal` | Claude Sonnet 5 | `claude-sonnet-5` |
| `haiku`, `haiku 4`, `claude haiku`, `fast`, `quick`, `light`, `small` | Claude Haiku 4.5 | `claude-haiku-4-5-20251001` |
| `fable`, `fable 5`, `claude fable` | Claude Fable 5 | `claude-fable-5` |

If the user's input doesn't clearly map to one of these, ask one short question: "Which model — Opus, Sonnet, Haiku, or Fable?"

---

## How to Respond

### Case 1: User specifies a model AND includes a task

Example: `/model opus analyze my business strategy`

1. Confirm the model in one line:
   ```
   ✅ Running on Claude Opus 5
   ```
2. Immediately spawn an Agent with:
   - `model` set to the chosen model ID
   - The task passed in full
3. Return the result directly.

### Case 2: User specifies a model only (no task)

Example: `/model sonnet` or "switch to haiku"

Respond with:

```
✅ Model set: Claude [Name]

To use [Name] for your full session:
→ Go to Settings → Model → select [Model Name]

Or just send your next task as:
/model [name] [your task here]
```

### Case 3: Unclear which model

Ask: "Which model — **Opus** (most powerful), **Sonnet** (balanced), or **Haiku** (fastest)?"

---

## What NOT to do

- Do NOT analyze the task to pick a model — the user already chose. Just execute.
- Do NOT show a routing card (that's /auto-model's job).
- Do NOT suggest a different model unless the user asks.
- Keep responses short. This is a utility command, not a workflow.

---

## Quick Reference (show this if the user seems unsure)

```
/model opus    → Claude Opus 5   — Most powerful, deepest reasoning
/model sonnet  → Claude Sonnet 5 — Balanced, fast, great all-rounder
/model haiku   → Claude Haiku 4.5  — Fastest, lightest, great for simple tasks
/model fable   → Claude Fable 5   — Claude 5 family, profile still being established

Not sure which to pick? Try /auto-model instead — it chooses for you.
```
